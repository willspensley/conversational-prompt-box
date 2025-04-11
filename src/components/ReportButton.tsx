
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { testGeminiAPI } from "@/lib/gemini-api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

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
  const [showApiTest, setShowApiTest] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTestingApi, setIsTestingApi] = useState(false);

  const handleTestGeminiAPI = async () => {
    try {
      setIsTestingApi(true);
      const result = await testGeminiAPI();
      setApiTestResult(result);
      
      // Show toast with result
      if (result.success) {
        toast({
          title: "API Test Successful",
          description: result.message,
        });
      } else {
        toast({
          title: "API Test Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      setApiTestResult({
        success: false,
        message: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`
      });
      toast({
        title: "API Test Error",
        description: "An unexpected error occurred while testing the API.",
        variant: "destructive",
      });
    } finally {
      setIsTestingApi(false);
    }
  };

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
    <>
      <div className="flex items-center gap-2">
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
        
        <Button
          type="button"
          onClick={() => setShowApiTest(true)}
          variant="outline"
          size="sm"
          className="px-2 py-1 text-xs"
        >
          Test API
        </Button>
      </div>
      
      <Dialog open={showApiTest} onOpenChange={setShowApiTest}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Gemini API Test</DialogTitle>
            <DialogDescription>
              Test the Gemini API connection to verify it's working correctly.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {apiTestResult && (
              <Alert variant={apiTestResult.success ? "default" : "destructive"}>
                <AlertTitle className="flex items-center gap-2">
                  {apiTestResult.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  {apiTestResult.success ? "Success" : "Error"}
                </AlertTitle>
                <AlertDescription>{apiTestResult.message}</AlertDescription>
              </Alert>
            )}
          </div>
          
          <DialogFooter className="sm:justify-start">
            <Button 
              type="button" 
              onClick={handleTestGeminiAPI}
              disabled={isTestingApi}
            >
              {isTestingApi ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                "Run API Test"
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowApiTest(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
