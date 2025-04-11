
import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  ReportData,
  ImageResponsePair, 
  generatePDF, 
  blobToDataUrl, 
  savePDF, 
  printPDF 
} from "@/lib/pdf-utils";
import { FileText, Edit, Eye } from "lucide-react";
import { ImageViewerModal } from "./report/ImageViewerModal";
import { ReportInfoSection } from "./report/ReportInfoSection";
import { PropertyInfoSection } from "./report/PropertyInfoSection";
import { ReportContextSection } from "./report/ReportContextSection";
import { InventoryItemsSection } from "./report/InventoryItemsSection";
import { PDFEditorFooter } from "./report/PDFEditorFooter";

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
  const [enlargedImage, setEnlargedImage] = useState<{src: string; alt: string} | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("edit");
  const { toast } = useToast();

  // Generate PDF preview when switching to preview tab
  useEffect(() => {
    if (activeTab === "preview") {
      handleGeneratePreview();
    }
  }, [activeTab]);

  const handleGeneratePreview = async () => {
    try {
      const pdfBlob = await generatePDF(report);
      const dataUrl = await blobToDataUrl(pdfBlob);
      setPdfPreviewUrl(dataUrl);
    } catch (error) {
      console.error("Error generating PDF preview:", error);
      toast({
        title: "Preview Failed",
        description: "There was an error generating the PDF preview. Please try again.",
        variant: "destructive"
      });
      // Switch back to edit tab on error
      setActiveTab("edit");
    }
  };

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
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="flex flex-col flex-1 overflow-hidden"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="edit" className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Edit
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Preview
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="edit" className="flex-1 overflow-auto">
                <div className="space-y-6 p-2">
                  <ReportInfoSection
                    title={report.title}
                    date={report.date}
                    onUpdate={updateReportField}
                  />
                  
                  <PropertyInfoSection
                    address={report.property.address}
                    type={report.property.type}
                    imageResponsePairs={report.property.imageResponsePairs || []}
                    onUpdateField={updatePropertyField}
                    onUpdatePairs={updateImageResponsePairs}
                    onAddDemoPairs={addItemImagesAsPairs}
                  />
                  
                  <ReportContextSection
                    prompt={report.prompt}
                    onUpdate={(value) => updateReportField("prompt", value)}
                  />
                  
                  <InventoryItemsSection
                    items={report.items}
                    onUpdateItem={updateItem}
                    onAddItem={addNewItem}
                    onRemoveItem={removeItem}
                    onEnlargeImage={(src, alt) => setEnlargedImage({ src, alt })}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="preview" className="flex-1 overflow-hidden p-2 bg-muted/20">
                {pdfPreviewUrl ? (
                  <iframe 
                    src={pdfPreviewUrl}
                    className="w-full h-full border border-border rounded-md"
                    title="PDF Preview"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-muted-foreground">Loading preview...</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
          
          <DialogFooter>
            <PDFEditorFooter
              onPrintPDF={handlePrintPDF}
              onDownloadPDF={handleDownloadPDF}
              onClose={onClose}
              onSave={handleSaveReport}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ImageViewerModal 
        image={enlargedImage} 
        onClose={() => setEnlargedImage(null)} 
      />
    </>
  );
}
