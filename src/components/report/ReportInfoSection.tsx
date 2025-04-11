
import { Input } from "@/components/ui/input";

interface ReportInfoSectionProps {
  title: string;
  date: string;
  onUpdate: (field: string, value: string) => void;
}

export function ReportInfoSection({ title, date, onUpdate }: ReportInfoSectionProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Report Information</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Report Title</label>
          <Input 
            value={title} 
            onChange={e => onUpdate("title", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Report Date</label>
          <Input 
            type="date" 
            value={date} 
            onChange={e => onUpdate("date", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
