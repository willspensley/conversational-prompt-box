import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  ReportData,
  ReportItem,
  ImageResponsePair,
  generatePDF, 
  blobToDataUrl, 
  savePDF, 
  printPDF 
} from "@/lib/pdf-utils";
import { 
  FileText, 
  Pencil, 
  Save, 
  Printer, 
  Plus, 
  Trash2, 
  ArrowRight, 
  ImagePlus,
  MessageSquare,
  Maximize,
  X
} from "lucide-react";
import { ZoomableImage } from "./ZoomableImage";
import { ImageResponsePairEditor } from "./ImageResponsePairEditor";

interface PDFReportEditorProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: ReportData;
  onSave?: (updatedReport: ReportData) => void;
}

export function PDFReportEditor({ 
  isOpen, 
  onClose, 
  reportData, 
  onSave 
}: PDFReportEditorProps) {
  const [report, setReport] = useState<ReportData>(reportData);
  const [activeTab, setActiveTab] = useState<string>("edit");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [enlargedImage, setEnlargedImage] = useState<{src: string; alt: string} | null>(null);
  const { toast } = useToast();

  const handleSaveReport = () => {
    onSave?.(report);
    toast({
      title: "Report Saved",
      description: "Your report has been saved successfully."
    });
  };

  const handleDownloadPDF = async () => {
    try {
      const pdfBlob = await generatePDF(report);
      const filename = `${report.title.replace(/\s+/g, '_')}_${report.date}.pdf`;
      savePDF(pdfBlob, filename);
      
      toast({
        title: "PDF Downloaded",
        description: "Your PDF report has been downloaded successfully."
      });
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast({
        title: "Download Failed",
        description: "There was an error downloading the PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handlePrintPDF = async () => {
    try {
      const pdfBlob = await generatePDF(report);
      const dataUrl = await blobToDataUrl(pdfBlob);
      printPDF(dataUrl);
    } catch (error) {
      console.error("Error printing PDF:", error);
      toast({
        title: "Print Failed",
        description: "There was an error printing the PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  const updateReportField = (field: string, value: string) => {
    setReport(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updatePropertyField = (field: string, value: string) => {
    setReport(prev => ({
      ...prev,
      property: {
        ...prev.property,
        [field]: value
      }
    }));
  };

  const updateImageResponsePairs = (pairs: ImageResponsePair[]) => {
    setReport(prev => ({
      ...prev,
      property: {
        ...prev.property,
        imageResponsePairs: pairs
      }
    }));
  };

  const updateItem = (index: number, field: string, value: any) => {
    setReport(prev => {
      const updatedItems = [...prev.items];
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value
      };
      return {
        ...prev,
        items: updatedItems
      };
    });
  };

  const addNewItem = () => {
    setReport(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: `item-${Date.now()}`,
          description: `New Item ${prev.items.length + 1}`,
          condition: "Good" as const,
          notes: "",
          aiAnalysis: "",
          images: []
        }
      ]
    }));
  };

  const removeItem = (index: number) => {
    setReport(prev => {
      const updatedItems = prev.items.filter((_, i) => i !== index);
      return {
        ...prev,
        items: updatedItems
      };
    });
  };

  const addItemImagesAsPairs = () => {
    if (report.items.length === 0 || !report.items[0].images.length) {
      toast({
        title: "No Images Available",
        description: "Please add items with images first before generating image-response pairs.",
      });
      return;
    }

    const newPairs: ImageResponsePair[] = [];
    
    for (const item of report.items) {
      if (item.images.length && item.aiAnalysis) {
        newPairs.push({
          id: `pair-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          imageUrl: item.images[0],
          response: item.aiAnalysis || "No AI analysis available for this image."
        });
        
        if (newPairs.length >= 3) break;
      }
    }

    if (newPairs.length > 0) {
      setReport(prev => ({
        ...prev,
        property: {
          ...prev.property,
          imageResponsePairs: [...(prev.property.imageResponsePairs || []), ...newPairs]
        }
      }));
      
      toast({
        title: "Demo Pairs Added",
        description: `Added ${newPairs.length} image-response pairs from your item images.`
      });
    } else {
      toast({
        title: "No Valid Images",
        description: "Could not find items with both images and AI analysis.",
      });
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <span>PDF Report Generator</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Removed Tabs and TabsContent, keeping only the edit view */}
            <div className="flex-1 overflow-auto">
              {/* Keep existing edit section content */}
              <div className="space-y-6 p-2">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Report Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Report Title</label>
                      <Input 
                        value={report.title} 
                        onChange={e => updateReportField("title", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Report Date</label>
                      <Input 
                        type="date" 
                        value={report.date} 
                        onChange={e => updateReportField("date", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Property Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Property Address</label>
                      <Input 
                        value={report.property.address} 
                        onChange={e => updatePropertyField("address", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Property Type</label>
                      <Input 
                        value={report.property.type} 
                        onChange={e => updatePropertyField("type", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <ImageResponsePairEditor 
                      pairs={report.property.imageResponsePairs || []}
                      onChange={updateImageResponsePairs}
                    />
                    
                    {(report.property.imageResponsePairs || []).length === 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addItemImagesAsPairs}
                        className="mt-2 flex items-center gap-1"
                      >
                        <Plus className="h-4 w-4" /> Add Demo Pairs from Item Images
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Report Context</h3>
                  <Textarea 
                    value={report.prompt} 
                    onChange={e => updateReportField("prompt", e.target.value)}
                    className="h-20"
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Inventory Items</h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={addNewItem}
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-4 w-4" /> Add Item
                    </Button>
                  </div>
                  
                  {report.items.map((item, index) => (
                    <div key={item.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Item {index + 1}</h4>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeItem(index)}
                          className="h-8 w-8 p-0 text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-medium">Description</label>
                          <Input 
                            value={item.description} 
                            onChange={e => updateItem(index, "description", e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium">Condition</label>
                          <select
                            className="w-full px-3 py-2 border rounded-md text-sm"
                            value={item.condition}
                            onChange={e => updateItem(index, "condition", e.target.value as "Good" | "Fair" | "Poor")}
                          >
                            <option value="Good">Good</option>
                            <option value="Fair">Fair</option>
                            <option value="Poor">Poor</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-xs font-medium">Notes</label>
                        <Textarea 
                          value={item.notes} 
                          onChange={e => updateItem(index, "notes", e.target.value)}
                          className="h-16"
                        />
                      </div>
                      
                      {item.aiAnalysis !== undefined && (
                        <div className="space-y-1">
                          <label className="text-xs font-medium flex items-center gap-1 text-primary">
                            <MessageSquare className="h-3 w-3" />
                            AI Analysis (editable)
                          </label>
                          <Textarea
                            value={item.aiAnalysis || ""}
                            onChange={e => updateItem(index, "aiAnalysis", e.target.value)}
                            className="min-h-24 text-sm border border-primary/20"
                            placeholder="AI analysis will appear here after processing images"
                          />
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <label className="text-xs font-medium">Images ({item.images.length})</label>
                        <div className="flex flex-wrap gap-2">
                          {item.images.map((img, imgIndex) => (
                            <div key={imgIndex} className="relative group">
                              <div className="w-20 h-20 rounded-md overflow-hidden border">
                                <ZoomableImage 
                                  src={img} 
                                  alt={`Item ${index + 1} image ${imgIndex + 1}`}
                                  className="w-full h-full"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  updateItem(
                                    index, 
                                    "images", 
                                    item.images.filter((_, i) => i !== imgIndex)
                                  );
                                }}
                                className="absolute top-1 right-1 bg-black bg-opacity-60 p-1 rounded-full hidden group-hover:block"
                              >
                                <Trash2 className="w-3 h-3 text-white" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEnlargedImage({
                                  src: img,
                                  alt: `Item ${index + 1} image ${imgIndex + 1}`
                                })}
                                className="absolute bottom-1 right-1 bg-black bg-opacity-60 p-1 rounded-full hidden group-hover:block"
                              >
                                <Maximize className="w-3 h-3 text-white" />
                              </button>
                            </div>
                          ))}
                          <button
                            className="w-20 h-20 flex items-center justify-center border border-dashed rounded-md hover:bg-muted transition-colors"
                            onClick={() => {
                              toast({
                                title: "Image Upload",
                                description: "This functionality would be added in a future update.",
                              });
                            }}
                          >
                            <ImagePlus className="w-5 h-5 text-muted-foreground" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex sm:justify-between">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handlePrintPDF}
                className="flex items-center gap-1"
              >
                <Printer className="h-4 w-4" /> Print
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDownloadPDF}
                className="flex items-center gap-1"
              >
                <Save className="h-4 w-4" /> Save PDF
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="secondary" 
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button 
                variant="default"
                  onClick={handleSaveReport}
                className="flex items-center gap-1"
              >
                <Save className="h-4 w-4" /> Save Report
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {enlargedImage && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setEnlargedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2 z-10 bg-black/50 text-white hover:bg-black/70"
              onClick={() => setEnlargedImage(null)}
            >
              <X className="h-5 w-5" />
            </Button>
            <ZoomableImage 
              src={enlargedImage.src} 
              alt={enlargedImage.alt}
              className="w-full h-full rounded-lg overflow-hidden"
            />
          </div>
        </div>
      )}
    </>
  );
}
