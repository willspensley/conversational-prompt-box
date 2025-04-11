
import { PromptInputWithActions } from "@/components/PromptInputDemo";
import { WordFadeIn } from "@/components/ui/word-fade-in";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md px-4 flex flex-col items-center gap-8">
        <WordFadeIn 
          words="Perfect Report Creation..." 
          delay={0.3}
          className="text-3xl md:text-5xl text-center font-bold text-primary mb-2"
        />
        
        <div className="w-full flex justify-center">
          <PromptInputWithActions />
        </div>
      </div>
    </div>
  );
};

export default Index;
