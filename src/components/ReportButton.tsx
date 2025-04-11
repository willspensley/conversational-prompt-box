
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReportButtonProps {
  disabled?: boolean;
  onGenerateReport: () => void;
}

export function ReportButton({ disabled = false, onGenerateReport }: ReportButtonProps) {
  const { toast } = useToast();

  const handleClick = () => {
    try {
      onGenerateReport();
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className="px-3 py-1.5 rounded-lg text-sm transition-colors border border-dashed border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800 flex items-center justify-between gap-1"
      variant="ghost"
    >
      <FileText className="w-4 h-4" />
      Generate Report
    </Button>
  );
}
