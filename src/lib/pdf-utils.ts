
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { fileToDataUrl } from "./image-upload";

// Declare global types for jspdf-autotable plugin
declare module "jspdf" {
  interface jsPDF {
    autoTable: typeof autoTable;
  }
}

export interface ReportItem {
  id: string;
  description: string;
  condition: "Good" | "Fair" | "Poor";
  notes: string;
  aiAnalysis?: string; // Added AI analysis field
  images: string[];
}

export interface ReportData {
  title: string;
  date: string;
  property: {
    address: string;
    type: string;
  };
  prompt: string;
  items: ReportItem[];
}

// Initialize default report data
export const createDefaultReport = (
  prompt: string,
  images: { id: string; dataUrl: string }[]
): ReportData => {
  const defaultItems: ReportItem[] = images.map((img, index) => ({
    id: img.id,
    description: `Item ${index + 1}`,
    condition: "Good",
    notes: "",
    aiAnalysis: "", // Initialize empty AI analysis
    images: [img.dataUrl],
  }));

  return {
    title: "Property Inventory Report",
    date: new Date().toISOString().split("T")[0],
    property: {
      address: "Property Address",
      type: "Residential",
    },
    prompt,
    items: defaultItems.length ? defaultItems : [
      {
        id: "default-item",
        description: "New Item",
        condition: "Good",
        notes: "",
        aiAnalysis: "",
        images: [],
      },
    ],
  };
};

// Generate PDF from report data
export const generatePDF = async (report: ReportData): Promise<Blob> => {
  try {
    console.log("Starting PDF generation...");
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text(report.title, 105, 15, { align: "center" });
    
    // Add date and property info
    doc.setFontSize(12);
    doc.text(`Date: ${report.date}`, 20, 30);
    doc.text(`Property Address: ${report.property.address}`, 20, 40);
    doc.text(`Property Type: ${report.property.type}`, 20, 50);
    
    let yPos = 60;
    
    // Add prompt if exists
    if (report.prompt) {
      doc.text("Report Context:", 20, yPos);
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(report.prompt, 170);
      doc.text(lines, 20, yPos + 10);
      
      // Adjust y-position based on text height
      yPos = yPos + 10 + (lines.length * 5);
    }
    
    // Items table
    doc.setFontSize(12);
    doc.text("Inventory Items:", 20, yPos + 10);
    
    // Generate table data
    const tableData = report.items.map(item => [
      item.description,
      item.condition,
      item.notes || "-"
    ]);
    
    // Add table with autoTable
    autoTable(doc, {
      startY: yPos + 20,
      head: [["Description", "Condition", "Notes"]],
      body: tableData,
      margin: { top: 10 },
      styles: { overflow: "linebreak" },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 30 },
        2: { cellWidth: 80 }
      }
    });
    
    // Add images and AI analysis on new pages
    for (let i = 0; i < report.items.length; i++) {
      const item = report.items[i];
      
      // Skip items without images
      if (item.images.length === 0) continue;
      
      // Process each image with its AI analysis
      for (let imgIndex = 0; imgIndex < item.images.length; imgIndex++) {
        const imgUrl = item.images[imgIndex];
        
        // Add a new page for each image+analysis pair
        doc.addPage();
        
        // Add page header
        doc.setFontSize(14);
        doc.text(`${item.description} - Image ${imgIndex + 1}`, 105, 20, { align: "center" });
        
        try {
          // Add image (left side)
          if (imgUrl) {
            try {
              doc.addImage(imgUrl, "JPEG", 20, 40, 75, 90, undefined, "FAST");
            } catch (imgErr) {
              // Try adding as PNG if JPEG fails
              try {
                doc.addImage(imgUrl, "PNG", 20, 40, 75, 90, undefined, "FAST");
              } catch (pngErr) {
                console.error("Failed to add image to PDF:", pngErr);
                doc.text("Error displaying image", 20, 70);
              }
            }
          }
          
          // Add AI analysis (right side)
          if (item.aiAnalysis) {
            doc.setFontSize(11);
            doc.text("AI Analysis:", 105, 40);
            
            const analysisLines = doc.splitTextToSize(item.aiAnalysis, 80);
            doc.setFontSize(9);
            doc.text(analysisLines, 105, 50);
          }
        } catch (error) {
          console.error("Error adding image to PDF:", error);
          // Add error text instead of failing image
          doc.text("Error displaying image", 20, 70);
        }
      }
    }
    
    console.log("PDF generation completed successfully");
    return doc.output("blob");
  } catch (error) {
    console.error("Error in PDF generation:", error);
    throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// Convert blob to data URL for preview
export const blobToDataUrl = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Save PDF to device
export const savePDF = (pdfBlob: Blob, filename: string = "report.pdf") => {
  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  
  // Clean up
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
};

// Print PDF
export const printPDF = (pdfDataUrl: string) => {
  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  iframe.src = pdfDataUrl;
  
  document.body.appendChild(iframe);
  iframe.onload = () => {
    try {
      iframe.contentWindow?.print();
    } catch (error) {
      console.error("Print error:", error);
    }
    
    // Remove iframe after print dialog is closed
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  };
};
