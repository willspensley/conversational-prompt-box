
import { PromptInputWithActions } from "@/components/PromptInputDemo";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md px-4">
        <h1 className="text-3xl font-bold text-center mb-2">Conversational Prompt Box</h1>
        <p className="text-gray-500 text-center mb-8">Ask questions or attach files</p>
        
        <div className="w-full flex justify-center">
          <PromptInputWithActions />
        </div>
      </div>
    </div>
  );
};

export default Index;
