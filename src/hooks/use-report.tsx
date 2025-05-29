
import { useState } from "react";
import { ReportData, ReportItem } from "@/lib/pdf-utils";
import { analyzeImages } from "@/lib/gemini-api";
import { useToast } from "@/hooks/use-toast";
import { useReportLibrary } from "./use-report-library";

export const useReport = () => {
  const [currentReport, setCurrentReport] = useState<ReportData | null>(null);
  const [showReportEditor, setShowReportEditor] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const reportLibrary = useReportLibrary();

  const generateReport = async (
    prompt: string, 
    images: { id: string; dataUrl: string; file: File }[]
  ) => {
    if (!prompt && images.length === 0) {
      toast({
        title: "No Input Provided",
        description: "Please provide a prompt or upload images to generate a report.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      // Create inventory items from images with AI analysis
      const items: ReportItem[] = [];
      
      if (images.length > 0) {
        const analysisResults = await analyzeImages(images.map(img => img.dataUrl), prompt);
        
        images.forEach((image, index) => {
          const analysis = analysisResults[index] || "No analysis available";
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

      // If no images, create a sample item
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
        id: `report-${Date.now()}`,
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
  };

  const editReport = (report: ReportData) => {
    setCurrentReport(report);
    setShowReportEditor(true);
  };

  return {
    currentReport,
    generateReport,
    saveReport,
    editReport,
    showReportEditor,
    setShowReportEditor,
    isAnalyzing,
    // Expose library functionality
    ...reportLibrary
  };
};
