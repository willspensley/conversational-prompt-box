
import { PromptInputWithActions } from "@/components/PromptInputDemo";
import { WordFadeIn } from "@/components/ui/word-fade-in";
import { ReportDemo } from "@/components/ReportDemo";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gray-50 pt-8">
      <div className="w-full max-w-md px-4 flex flex-col items-center gap-4">
        <WordFadeIn 
          words="Perfect Report Creation..." 
          delay={0.3}
          className="text-3xl md:text-5xl text-center font-bold text-primary mb-2"
        />
        
        <div className="w-full flex justify-center">
          <PromptInputWithActions />
        </div>
      </div>
      
      <ReportDemo />
    </div>
  );
};

export default Index;
