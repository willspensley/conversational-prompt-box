
import { useState } from "react";
import { ReportData, createDefaultReport } from "@/lib/pdf-utils";
import { analyzeImagesWithGemini, enhanceReportWithAIAnalysis } from "@/lib/gemini-api";
import { useToast } from "@/hooks/use-toast";

export function useReport() {
  const [currentReport, setCurrentReport] = useState<ReportData | null>(null);
  const [savedReports, setSavedReports] = useState<ReportData[]>([]);
  const [showReportEditor, setShowReportEditor] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const generateReport = async (prompt: string, images: { id: string; dataUrl: string }[]) => {
    try {
      setIsAnalyzing(true);
      
      // First create the basic report structure
      const newReport = createDefaultReport(prompt, images);
      
      // Show a toast to indicate AI analysis is in progress
      toast({
        title: "AI Analysis",
        description: "Analyzing images with Gemini AI...",
      });

      // Get AI analysis for each image
      const aiAnalysisResults = await analyzeImagesWithGemini(prompt, images);
      
      // Enhance the report with AI analysis
      const enhancedItems = enhanceReportWithAIAnalysis(newReport.items, aiAnalysisResults);
      
      // Update the report with enhanced items
      const finalReport = {
        ...newReport,
        items: enhancedItems
      };
      
      setCurrentReport(finalReport);
      setShowReportEditor(true);
      
      toast({
        title: "Analysis Complete",
        description: "AI analysis has been added to your report.",
      });
      
      return finalReport;
    } catch (error) {
      console.error("Error generating AI report:", error);
      
      toast({
        title: "AI Analysis Failed",
        description: "Could not complete AI analysis. Creating basic report instead.",
        variant: "destructive"
      });
      
      // Fallback to basic report without AI analysis
      const basicReport = createDefaultReport(prompt, images);
      setCurrentReport(basicReport);
      setShowReportEditor(true);
      return basicReport;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveReport = (report: ReportData) => {
    setSavedReports(prev => {
      // Check if report already exists and update it
      const existingIndex = prev.findIndex(r => 
        r.title === report.title && r.date === report.date
      );
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = report;
        return updated;
      }
      
      // Otherwise add as new report
      return [...prev, report];
    });
    
    setCurrentReport(report);
  };

  return {
    currentReport,
    setCurrentReport,
    savedReports,
    generateReport,
    saveReport,
    showReportEditor,
    setShowReportEditor,
    isAnalyzing
  };
}
