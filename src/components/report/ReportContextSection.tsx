
import { Textarea } from "@/components/ui/textarea";

interface ReportContextSectionProps {
  prompt: string;
  onUpdate: (value: string) => void;
}

export function ReportContextSection({ prompt, onUpdate }: ReportContextSectionProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Report Context</h3>
      <Textarea 
        value={prompt} 
        onChange={e => onUpdate(e.target.value)}
        className="h-20"
      />
    </div>
  );
}
