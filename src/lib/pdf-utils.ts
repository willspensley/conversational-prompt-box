
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { fileToDataUrl } from "./image-upload";

// Declare global types for jspdf-autotable plugin
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export interface ReportItem {
  id: string;
  description: string;
  condition: "Good" | "Fair" | "Poor";
  notes: string;
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
        images: [],
      },
    ],
  };
};

// Generate PDF from report data
export const generatePDF = async (report: ReportData): Promise<Blob> => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text(report.title, 105, 15, { align: "center" });
  
  // Add date and property info
  doc.setFontSize(12);
  doc.text(`Date: ${report.date}`, 20, 30);
  doc.text(`Property Address: ${report.property.address}`, 20, 40);
  doc.text(`Property Type: ${report.property.type}`, 20, 50);
  
  // Add prompt if exists
  if (report.prompt) {
    doc.text("Report Context:", 20, 60);
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(report.prompt, 170);
    doc.text(lines, 20, 70);
    
    // Adjust y-position based on text height
    let yPos = 70 + (lines.length * 5);
    
    // Items table
    doc.setFontSize(12);
    doc.text("Inventory Items:", 20, yPos);
    yPos += 10;
    
    // Generate table data
    const tableData = report.items.map(item => [
      item.description,
      item.condition,
      item.notes
    ]);
    
    // Add table
    doc.autoTable({
      startY: yPos,
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
    
    // Add images on new pages
    let currentPage = doc.internal.getNumberOfPages();
    
    // For each item with images
    for (const item of report.items) {
      if (item.images.length > 0) {
        doc.addPage();
        currentPage++;
        
        doc.setPage(currentPage);
        doc.setFontSize(14);
        doc.text(`Images for: ${item.description}`, 105, 20, { align: "center" });
        
        // Add images in a 2x2 grid
        let imgX = 20;
        let imgY = 40;
        let imgCount = 0;
        
        for (const imgUrl of item.images) {
          try {
            // Calculate position
            if (imgCount > 0 && imgCount % 2 === 0) {
              imgY += 110; // Move to next row
              imgX = 20;   // Reset X position
            } else if (imgCount % 2 === 1) {
              imgX = 110;  // Move to right column
            }
            
            // Add image if URL exists
            if (imgUrl) {
              doc.addImage(imgUrl, "JPEG", imgX, imgY, 80, 100, undefined, "FAST");
            }
            
            imgCount++;
            
            // Add new page if we've placed 4 images
            if (imgCount > 0 && imgCount % 4 === 0 && imgCount < item.images.length) {
              doc.addPage();
              currentPage++;
              doc.setPage(currentPage);
              imgX = 20;
              imgY = 40;
            }
          } catch (error) {
            console.error("Error adding image to PDF:", error);
          }
        }
      }
    }
  }
  
  return doc.output("blob");
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
