
import { VercelV0Chat } from "@/components/ui/v0-ai-chat";
import { WordFadeIn } from "@/components/ui/word-fade-in";
import { ReportDemo } from "@/components/ReportDemo";
import { PDFReportEditor } from "@/components/PDFReportEditor";
import { useReport } from "@/hooks/use-report";
import { useState } from "react";

const Index = () => {
  const {
    currentReport,
    generateReport,
    saveReport,
    showReportEditor,
    setShowReportEditor,
    isAnalyzing
  } = useReport();
  
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-background text-foreground pt-10">
      <div className="w-full max-w-md px-4 flex flex-col items-center gap-6">
        <WordFadeIn 
          words="Perfect Report Creation..." 
          delay={0.3}
          className="text-3xl md:text-5xl text-center font-bold text-primary mb-2"
        />
        
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
