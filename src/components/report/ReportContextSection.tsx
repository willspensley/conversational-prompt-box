
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ReportContextSectionProps {
  prompt: string;
  onUpdate: (value: string) => void;
}

export function ReportContextSection({ prompt, onUpdate }: ReportContextSectionProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Report Context</h3>
      <div className="space-y-1">
        <Label htmlFor="reportContext">Enter additional context for your report</Label>
        <Textarea 
          id="reportContext"
          value={prompt} 
          onChange={e => onUpdate(e.target.value)}
          placeholder="Add any additional notes or context for this property report..."
          className="h-20"
        />
      </div>
    </div>
  );
}
