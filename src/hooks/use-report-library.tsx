
import { useState, useEffect } from "react";
import { ReportData, generatePDF, savePDF } from "@/lib/pdf-utils";
import { useToast } from "@/hooks/use-toast";

// Extended ReportData with id for library management
interface LibraryReportData extends ReportData {
  id: string;
}

export const useReportLibrary = () => {
  const [reports, setReports] = useState<LibraryReportData[]>([]);
  const { toast } = useToast();

  // Load reports from localStorage on mount
  useEffect(() => {
    const savedReports = localStorage.getItem('report-library');
    if (savedReports) {
      try {
        const parsedReports = JSON.parse(savedReports);
        setReports(parsedReports);
      } catch (error) {
        console.error('Error loading reports from localStorage:', error);
      }
    }
  }, []);

  // Save reports to localStorage whenever reports change
  useEffect(() => {
    localStorage.setItem('report-library', JSON.stringify(reports));
  }, [reports]);

  const addReport = (report: ReportData) => {
    const reportWithId: LibraryReportData = {
      ...report,
      id: `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    setReports(prev => [reportWithId, ...prev]);
    toast({
      title: "Report Saved",
      description: `"${report.title}" has been added to your library.`
    });
  };

  const updateReport = (updatedReport: LibraryReportData) => {
    setReports(prev => prev.map(report => 
      report.id === updatedReport.id ? updatedReport : report
    ));
    toast({
      title: "Report Updated",
      description: `"${updatedReport.title}" has been updated.`
    });
  };

  const deleteReport = (reportId: string) => {
    setReports(prev => prev.filter(report => report.id !== reportId));
    toast({
      title: "Report Deleted",
      description: "Report has been removed from your library."
    });
  };

  const downloadReportPDF = async (report: LibraryReportData) => {
    try {
      const pdfBlob = await generatePDF(report);
      const filename = `${report.title.replace(/\s+/g, '_')}_${report.date}.pdf`;
      savePDF(pdfBlob, filename);
      
      toast({
        title: "PDF Downloaded",
        description: `"${report.title}" has been downloaded successfully.`
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

  return {
    reports,
    addReport,
    updateReport,
    deleteReport,
    downloadReportPDF
  };
};

