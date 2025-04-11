
import { Button } from "@/components/ui/button";
import { Printer, Save } from "lucide-react";

interface PDFEditorFooterProps {
  onPrintPDF: () => void;
  onDownloadPDF: () => void;
  onClose: () => void;
  onSave: () => void;
}

export function PDFEditorFooter({ 
  onPrintPDF, 
  onDownloadPDF, 
  onClose, 
  onSave 
}: PDFEditorFooterProps) {
  return (
    <div className="flex sm:justify-between">
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onPrintPDF}
          className="flex items-center gap-1"
        >
          <Printer className="h-4 w-4" /> Print
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onDownloadPDF}
          className="flex items-center gap-1"
        >
          <Save className="h-4 w-4" /> Save PDF
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Button 
          variant="secondary" 
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button 
          variant="default"
          onClick={onSave}
          className="flex items-center gap-1"
        >
          <Save className="h-4 w-4" /> Save Report
        </Button>
      </div>
    </div>
  );
}
