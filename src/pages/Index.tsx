
import { VercelV0Chat } from "@/components/ui/v0-ai-chat";
import { WordFadeIn } from "@/components/ui/word-fade-in";
import { ReportDemo } from "@/components/ReportDemo";
import { PDFReportEditor } from "@/components/PDFReportEditor";
import { ReportLibrary } from "@/components/ReportLibrary";
import { Button } from "@/components/ui/button";
import { useReport } from "@/hooks/use-report";
import { useState } from "react";
import { FileText } from "lucide-react";

const Index = () => {
  const {
    currentReport,
    generateReport,
    saveReport,
    editReport,
    showReportEditor,
    setShowReportEditor,
    isAnalyzing,
    reports,
    downloadReportPDF
  } = useReport();
  
  const [showLibrary, setShowLibrary] = useState(false);
  
  // State to store the latest prompt and images from the chat
  const [chatState, setChatState] = useState({
    prompt: "",
    images: [] as { id: string; dataUrl: string; file: File }[]
  });

  // Handler for receiving data from the chat component
  const handleChatUpdate = (prompt: string, images: { id: string; dataUrl: string; file: File }[]) => {
    setChatState({ prompt, images });
  };

  // Handler for generating a report from the current chat state
  const handleGenerateReport = async () => {
    if (!chatState.prompt && chatState.images.length === 0) {
      return; // Nothing to generate
    }
    
    await generateReport(chatState.prompt, chatState.images);
  };

  if (showLibrary) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-4">
          <Button 
            variant="outline" 
            onClick={() => setShowLibrary(false)}
            className="mb-4"
          >
            ← Back to Generator
          </Button>
        </div>
        <ReportLibrary
          reports={reports}
          onSelectReport={(report) => {
            setShowLibrary(false);
            editReport(report);
          }}
          onEditReport={(report) => {
            setShowLibrary(false);
            editReport(report);
          }}
          onDownloadReport={downloadReportPDF}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-background text-foreground pt-10">
      <div className="w-full max-w-md px-4 flex flex-col items-center gap-6">
        <WordFadeIn 
          words="Perfect Report Creation..." 
          delay={0.3}
          className="text-3xl md:text-5xl text-center font-bold text-primary mb-2"
        />
        
        {/* Report Library Button */}
        {reports.length > 0 && (
          <Button 
            variant="outline" 
            onClick={() => setShowLibrary(true)}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            My Reports ({reports.length})
          </Button>
        )}
        
        <div className="w-full flex justify-center">
          <VercelV0Chat 
            onStateChange={handleChatUpdate}
            onGenerateReport={handleGenerateReport}
            isAnalyzing={isAnalyzing}
          />
        </div>
      </div>
      
      <ReportDemo />
      
      {/* PDF Report Editor */}
      {currentReport && (
        <PDFReportEditor
          isOpen={showReportEditor}
          onClose={() => setShowReportEditor(false)}
          reportData={currentReport}
          onSave={saveReport}
        />
      )}
    </div>
  );
};

export default Index;
