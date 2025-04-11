
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReportButtonProps {
  disabled?: boolean;
  onGenerateReport: () => void;
  isAnalyzing?: boolean;
}

export function ReportButton({ 
  disabled = false, 
  onGenerateReport,
  isAnalyzing = false
}: ReportButtonProps) {
  const { toast } = useToast();

  const handleClick = () => {
    try {
      onGenerateReport();
      
      // Show generating toast immediately
      if (!isAnalyzing) {
        toast({
          title: "Generating Report",
          description: "Creating your report with AI analysis...",
        });
      }
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
      disabled={disabled || isAnalyzing}
      className="px-3 py-1.5 rounded-lg text-sm transition-colors border border-dashed border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800 flex items-center justify-between gap-1"
      variant="ghost"
    >
      {isAnalyzing ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <FileText className="w-4 h-4" />
      )}
      {isAnalyzing ? "Analyzing..." : "Generate Report"}
    </Button>
  );
}
