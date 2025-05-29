
import { useState } from "react";
import { ReportData, ReportItem } from "@/lib/pdf-utils";
import { analyzeImages } from "@/lib/gemini-api";
import { useToast } from "@/hooks/use-toast";
import { useReportLibrary } from "./use-report-library";
import { useDraftStorage } from "./use-draft-storage";
import { ReportTemplate } from "@/lib/report-templates";

export const useReport = () => {
  const [currentReport, setCurrentReport] = useState<ReportData | null>(null);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [showReportEditor, setShowReportEditor] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const reportLibrary = useReportLibrary();
  const draftStorage = useDraftStorage();

  const generateReportFromTemplate = (template: ReportTemplate) => {
    const report: ReportData = {
      title: template.fields.title,
      date: new Date().toISOString(),
      property: {
        address: "Property Address",
        type: template.fields.propertyType,
        imageResponsePairs: []
      },
      items: template.fields.defaultItems.map((item, index) => ({
        id: `item-${Date.now()}-${index}`,
        description: item.description,
        condition: item.condition,
        notes: item.notes,
        aiAnalysis: "",
        images: []
      }))
    };

    setCurrentReport(report);
    setShowReportEditor(true);
    
    // Save as draft immediately
    const draftId = draftStorage.saveDraft(report);
    setCurrentDraftId(draftId);

    toast({
      title: "Template Applied",
      description: `Created report using "${template.name}" template.`
    });
  };

  const generateReport = async (
    prompt: string, 
    images: { id: string; dataUrl: string; file: File }[]
  ) => {
    if (!prompt && images.length === 0) {
      // Show template selector instead of error
      setShowTemplateSelector(true);
      return;
    }

    setIsAnalyzing(true);

    try {
      // Create inventory items from images with AI analysis
      const items: ReportItem[] = [];
      
      if (images.length > 0) {
        const analysisResults = await analyzeImages(prompt, images);
        
        images.forEach((image, index) => {
          const analysis = analysisResults[image.id] || "No analysis available";
          items.push({
            id: `item-${Date.now()}-${index}`,
            description: `Item ${index + 1}`,
            condition: "Good" as const,
            notes: "",
            aiAnalysis: analysis,
            images: [image.dataUrl]
          });
        });
      }

      if (items.length === 0) {
        items.push({
          id: `item-${Date.now()}`,
          description: "Sample Item",
          condition: "Good" as const,
          notes: "Generated from prompt analysis",
          aiAnalysis: "",
          images: []
        });
      }

      const report: ReportData = {
        title: "Property Inventory Report",
        date: new Date().toISOString(),
        property: {
          address: "Property Address",
          type: "Residential",
          imageResponsePairs: []
        },
        items,
        prompt: prompt || undefined
      };

      setCurrentReport(report);
      setShowReportEditor(true);

      // Save as draft immediately
      const draftId = draftStorage.saveDraft(report);
      setCurrentDraftId(draftId);

      toast({
        title: "Report Generated",
        description: `Created report with ${items.length} item${items.length !== 1 ? 's' : ''}.`
      });

    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        title: "Generation Failed",
        description: "There was an error generating the report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveReport = (report: ReportData) => {
    setCurrentReport(report);
    reportLibrary.addReport(report);
    
    // Clear the draft since it's now saved
    if (currentDraftId) {
      draftStorage.deleteDraft(currentDraftId);
      setCurrentDraftId(null);
    }
  };

  const saveDraft = (report: ReportData) => {
    const draftId = draftStorage.saveDraft(report, currentDraftId);
    setCurrentDraftId(draftId);
  };

  const editReport = (report: any) => {
    setCurrentReport(report);
    setShowReportEditor(true);
  };

  const startNewReport = () => {
    setShowTemplateSelector(true);
  };

  return {
    currentReport,
    currentDraftId,
    generateReport,
    generateReportFromTemplate,
    saveReport,
    saveDraft,
    editReport,
    startNewReport,
    showReportEditor,
    setShowReportEditor,
    showTemplateSelector,
    setShowTemplateSelector,
    isAnalyzing,
    drafts: draftStorage.drafts,
    // Expose library functionality
    ...reportLibrary
  };
};
