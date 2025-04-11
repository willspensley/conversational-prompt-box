import { useState } from "react";
import { ReportData, createDefaultReport } from "@/lib/pdf-utils";

export function useReport() {
  const [currentReport, setCurrentReport] = useState<ReportData | null>(null);
  const [savedReports, setSavedReports] = useState<ReportData[]>([]);
  const [showReportEditor, setShowReportEditor] = useState(false);

  const generateReport = (prompt: string, images: { id: string; dataUrl: string }[]) => {
    const newReport = createDefaultReport(prompt, images);
    setCurrentReport(newReport);
    setShowReportEditor(true);
    return newReport;
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
    setShowReportEditor
  };
}
