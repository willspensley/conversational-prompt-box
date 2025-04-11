
import { VercelV0Chat } from "@/components/ui/v0-ai-chat";
import { WordFadeIn } from "@/components/ui/word-fade-in";
import { ReportDemo } from "@/components/ReportDemo";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-background text-foreground pt-10">
      <div className="w-full max-w-md px-4 flex flex-col items-center gap-6">
        <WordFadeIn 
          words="Perfect Report Creation..." 
          delay={0.3}
          className="text-3xl md:text-5xl text-center font-bold text-primary mb-2"
        />
        
        <div className="w-full flex justify-center">
          <VercelV0Chat />
        </div>
      </div>
      
      <ReportDemo />
    </div>
  );
};

export default Index;
