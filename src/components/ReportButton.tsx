import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";

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
  const [apiTestResult, setApiTestResult] = useState<{ success: boolean; message: string; details?: any } | null>(null);
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [expandedDetails, setExpandedDetails] = useState(false);

  const handleTestGeminiAPI = async () => {
    try {
      setIsTestingApi(true);
      setApiTestResult(null);
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
          className="px-2 py-1 text-xs flex items-center gap-1"
        >
          <AlertCircle className="w-3 h-3" />
          Test API
        </Button>
      </div>
      
      <Dialog open={showApiTest} onOpenChange={setShowApiTest}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gemini API Test</DialogTitle>
            <DialogDescription>
              Test the Gemini API connection to verify it's working correctly before generating a report.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            {apiTestResult ? (
              <>
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
                
                {apiTestResult.details && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">Response Details</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedDetails(!expandedDetails)}
                        className="text-xs"
                      >
                        {expandedDetails ? "Hide" : "Show"} Details
                      </Button>
                    </div>
                    
                    {expandedDetails && (
                      <Textarea
                        value={JSON.stringify(apiTestResult.details, null, 2)}
                        readOnly
                        className="mt-2 h-60 text-xs font-mono"
                      />
                    )}
                  </div>
                )}
                
                <div className="mt-2 text-sm">
                  <h3 className="font-medium mb-1">Troubleshooting Tips:</h3>
                  <ul className="list-disc pl-5 text-xs space-y-1">
                    <li>Ensure you have an internet connection</li>
                    <li>Verify the API key is correct and has proper permissions</li>
                    <li>Check that your images are in a supported format (JPEG, PNG, WebP)</li>
                    <li>Ensure images are not too large (recommended under 4MB)</li>
                  </ul>
                </div>
              </>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                Click "Run API Test" to check the connection
              </div>
            )}
          </div>
          
          <DialogFooter className="gap-2 flex-wrap">
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
