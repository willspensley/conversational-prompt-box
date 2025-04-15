import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { fileToDataUrl } from "./image-upload";

// Declare global types for jspdf-autotable plugin
declare module "jspdf" {
  interface jsPDF {
    autoTable: typeof autoTable;
  }
}

export interface ImageResponsePair {
  id: string;
  imageUrl: string;
  response: string;
}

export interface ReportItem {
  id: string;
  description: string;
  condition: "Good" | "Fair" | "Poor";
  notes: string;
  aiAnalysis?: string;
  images: string[];
}

export interface ReportData {
  title: string;
  date: string;
  property: {
    address: string;
    type: string;
    imageResponsePairs: ImageResponsePair[];
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
    aiAnalysis: "",
    images: [img.dataUrl],
  }));

  return {
    title: "Property Inventory Report",
    date: new Date().toISOString().split("T")[0],
    property: {
      address: "Property Address",
      type: "Residential",
      imageResponsePairs: [],
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

// PDF Layout Constants
const PDF_CONSTANTS = {
  PAGE_SIZE: "a4",
  MARGINS: {
    TOP: 15,
    BOTTOM: 15,
    LEFT: 15,
    RIGHT: 15
  },
  FONT: {
    BODY: { size: 10, style: "normal" },
    SECTION_TITLE: { size: 14, style: "bold" },
    COVER_TITLE: { size: 20, style: "bold" },
    HEADER_FOOTER: { size: 8, style: "normal" },
    COMPANY_HEADER: { size: 12, style: "bold" }
  },
  COMPANY: {
    NAME: "PROPERTY INVENTORY COMPANY",
    ADDRESS: "Unit 9, Spaces Business Centre, Ingate Place, SWB 3NS",
    PHONE: "+44 (0) 2073241802",
    EMAIL: "bookings@propertyinventory.co.uk",
    WEBSITE: "propertyinventory.co.uk",
    REG_NUMBER: "12345678"
  },
  HIGHLIGHTS: [
    "Open 7 days a week, 364 days a year",
    "Over 10,000 inspections completed in our region",
    "Guaranteed 48 hour return of our reports",
    "5% of our profits go to support of local housing charity"
  ],
  IMAGE: {
    INLINE: { width: 75, height: 90 },
    OVERVIEW: { width: 100, height: 120 }
  }
};

// Convert mm to points for jsPDF
const mmToPt = (mm: number) => mm * 2.83465;

// Generate PDF from report data
export const generatePDF = async (report: ReportData): Promise<Blob> => {
  try {
    console.log("Starting PDF generation...");
    
    // Initialize PDF with A4 size and mm unit
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: PDF_CONSTANTS.PAGE_SIZE
    });
    
    // Set basic font
    doc.setFont("helvetica");
    
    // Track current page for table of contents
    const pageTracker: Record<string, number> = {};
    let currentPage = 1;
    
    // Add Cover Page (Page 1)
    addCoverPage(doc, report);
    currentPage++;
    
    // Add Table of Contents (Page 2)
    pageTracker["Contents"] = currentPage;
    addContentsPage(doc, report);
    currentPage++;
    
    // Add Disclaimer Pages (Page 3-4)
    pageTracker["Disclaimers"] = currentPage;
    addDisclaimerPages(doc, report);
    currentPage += 2; // Assuming 2 pages for disclaimers
    
    // Add Property Overview (Page 5)
    pageTracker["Property Overview"] = currentPage;
    addPropertyOverview(doc, report);
    currentPage++;
    
    // Add Report Context (Page 6)
    if (report.prompt) {
      pageTracker["Report Context"] = currentPage;
      addReportContext(doc, report);
      currentPage++;
    }
    
    // Add Inventory Items (Page 7+)
    pageTracker["Inventory Items"] = currentPage;
    const itemPages = addInventoryItems(doc, report);
    currentPage += itemPages;
    
    // Add Image Analysis Pages
    pageTracker["Image Analysis"] = currentPage;
    addImageAnalysisPages(doc, report);
    
    // Update TOC page with actual page numbers
    doc.setPage(1); // Table of contents is on page 2 (index 1 in jsPDF)
    updateTableOfContents(doc, pageTracker);
    
    console.log("PDF generation completed successfully");
    return doc.output("blob");
  } catch (error) {
    console.error("Error in PDF generation:", error);
    throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// Add header to all pages except cover
const addHeader = (doc: jsPDF) => {
  const { COMPANY } = PDF_CONSTANTS;
  const { TOP, LEFT, RIGHT } = PDF_CONSTANTS.MARGINS;
  
  const pageWidth = doc.internal.pageSize.width;
  const headerTop = TOP;
  
  // Company name
  doc.setFontSize(PDF_CONSTANTS.FONT.COMPANY_HEADER.size);
  doc.setFont("helvetica", "bold");
  doc.text(`${COMPANY.NAME} THE PROFESSIONAL INVENTORY COMPANY`, pageWidth / 2, headerTop, { align: "center" });
  
  // Company details
  doc.setFontSize(PDF_CONSTANTS.FONT.HEADER_FOOTER.size);
  doc.setFont("helvetica", "normal");
  doc.text([
    `A ${COMPANY.NAME}, ${COMPANY.ADDRESS}`,
    `T ${COMPANY.PHONE}`,
    `E ${COMPANY.EMAIL}`,
    `W ${COMPANY.WEBSITE}`
  ], LEFT, headerTop + 6);
  
  // Header separator line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(LEFT, headerTop + 13, pageWidth - RIGHT, headerTop + 13);
};

// Add footer to all pages except cover
const addFooter = (doc: jsPDF, report: ReportData, pageNumber: number) => {
  const { COMPANY } = PDF_CONSTANTS;
  const { BOTTOM, LEFT, RIGHT } = PDF_CONSTANTS.MARGINS;
  
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const footerBottom = pageHeight - BOTTOM;
  
  // Footer separator line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(LEFT, footerBottom - 10, pageWidth - RIGHT, footerBottom - 10);
  
  // Footer text
  doc.setFontSize(PDF_CONSTANTS.FONT.HEADER_FOOTER.size);
  doc.setFont("helvetica", "normal");
  
  const footerText = [
    "Inventory & Check In",
    `Date ${formatDate(report.date)}`,
    `Registered office: ${COMPANY.ADDRESS}`,
    `Property: ${report.property.address}`,
    `Registered in England and Wales, Company Number ${COMPANY.REG_NUMBER}`
  ];
  
  doc.text(footerText, pageWidth / 2, footerBottom - 8, { align: "center" });
  
  // Page number (except on Cover page)
  if (pageNumber > 0) {
    doc.text(String(pageNumber), pageWidth - RIGHT, footerBottom - 8, { align: "right" });
  }
};

// Format ISO date string to DD/MM/YYYY
const formatDate = (isoDate: string): string => {
  try {
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-GB");
  } catch (error) {
    return isoDate;
  }
};

// Format timestamp for photos
const formatTimestamp = (isoDate: string): string => {
  try {
    const date = new Date(isoDate);
    const day = date.getDate().toString().padStart(2, '0');
    const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day} ${month} ${year} ${hours}:${minutes}`;
  } catch (error) {
    return isoDate;
  }
};

// Add Cover Page
const addCoverPage = (doc: jsPDF, report: ReportData) => {
  const { COVER_TITLE, BODY } = PDF_CONSTANTS.FONT;
  const { HIGHLIGHTS } = PDF_CONSTANTS;
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Title
  doc.setFontSize(COVER_TITLE.size);
  doc.setFont("helvetica", "bold");
  doc.text("PERFECT REPORT CREATION", pageWidth / 2, 50, { align: "center" });
  
  // Date
  doc.setFontSize(BODY.size + 2);
  doc.setFont("helvetica", "normal");
  doc.text(formatDate(report.date), pageWidth / 2, 80, { align: "center" });
  
  // Property Details
  doc.setFontSize(BODY.size);
  doc.text(`Property: ${report.property.address}`, pageWidth / 2, 90, { align: "center" });
  doc.text(`Property Type: ${report.property.type}`, pageWidth / 2, 95, { align: "center" });
  
  // Highlights
  doc.setFontSize(BODY.size);
  let yPos = 110;
  HIGHLIGHTS.forEach(highlight => {
    doc.text(highlight, pageWidth / 2, yPos, { align: "center" });
    yPos += 7;
  });
  
  // Company Name at Bottom
  doc.setFontSize(PDF_CONSTANTS.FONT.COMPANY_HEADER.size);
  doc.setFont("helvetica", "bold");
  doc.text(PDF_CONSTANTS.COMPANY.NAME, pageWidth / 2, pageHeight - 40, { align: "center" });
  
  // No header/footer on cover page
};

// Add Table of Contents
const addContentsPage = (doc: jsPDF, report: ReportData) => {
  // Add new page
  doc.addPage();
  
  // Add header and footer
  addHeader(doc);
  addFooter(doc, report, 1); // First page after cover
  
  const { SECTION_TITLE, BODY } = PDF_CONSTANTS.FONT;
  const { LEFT, RIGHT } = PDF_CONSTANTS.MARGINS;
  const contentWidth = doc.internal.pageSize.width - LEFT - RIGHT;
  
  // Title
  doc.setFontSize(SECTION_TITLE.size);
  doc.setFont("helvetica", "bold");
  doc.text("CONTENTS", doc.internal.pageSize.width / 2, 30, { align: "center" });
  
  // Table of Contents items (placeholders - will be updated later)
  doc.setFontSize(BODY.size);
  doc.setFont("helvetica", "normal");
  
  const contents = [
    { title: "Contents", page: "1" },
    { title: "Disclaimers", page: "2-3" },
    { title: "Property Overview", page: "4" }
  ];
  
  if (report.prompt) {
    contents.push({ title: "Report Context", page: "5" });
  }
  
  contents.push({ title: "Inventory Items", page: "6" });
  
  if (report.property.imageResponsePairs.length > 0 || report.items.some(item => item.images.length > 0)) {
    contents.push({ title: "Image Analysis", page: "7+" });
  }
  
  // Draw TOC entries (will be updated later with correct page numbers)
  let yPos = 40;
  contents.forEach(item => {
    doc.text(item.title, LEFT + 10, yPos);
    doc.text(item.page, LEFT + contentWidth - 20, yPos);
    yPos += 7;
  });
};

// Update TOC with actual page numbers
const updateTableOfContents = (doc: jsPDF, pageTracker: Record<string, number>) => {
  const { LEFT, RIGHT } = PDF_CONSTANTS.MARGINS;
  const contentWidth = doc.internal.pageSize.width - LEFT - RIGHT;
  
  doc.setFontSize(PDF_CONSTANTS.FONT.BODY.size);
  doc.setFont("helvetica", "normal");
  
  let yPos = 40;
  Object.entries(pageTracker).forEach(([title, page]) => {
    // Skip updating the Contents entry itself
    if (title !== "Contents") {
      doc.text(String(page - 1), LEFT + contentWidth - 20, yPos);
    }
    yPos += 7;
  });
};

// Add Disclaimer Pages
const addDisclaimerPages = (doc: jsPDF, report: ReportData) => {
  // Add new page
  doc.addPage();
  
  // Add header and footer
  addHeader(doc);
  addFooter(doc, report, 2); // Second page after cover
  
  const { SECTION_TITLE, BODY } = PDF_CONSTANTS.FONT;
  const { LEFT } = PDF_CONSTANTS.MARGINS;
  
  // Title
  doc.setFontSize(SECTION_TITLE.size);
  doc.setFont("helvetica", "bold");
  doc.text("DISCLAIMERS", LEFT, 30);
  
  // Disclaimer text
  doc.setFontSize(BODY.size);
  doc.setFont("helvetica", "normal");
  
  const disclaimerText = [
    "1. GENERAL DISCLAIMERS",
    "",
    "1.1 This inventory provides a record of the property's condition and contents at the time of inspection.",
    "1.2 All items are assumed to be in good condition unless otherwise stated.",
    "1.3 Estimates in this report are not to be taken as valuations.",
    "1.4 The inventory company cannot be held responsible for any errors or omissions.",
    "",
    "2. PROPERTY INSPECTION",
    "",
    "2.1 Items are not moved during inspection unless specified.",
    "2.2 Locked areas not accessible during inspection are excluded from this report.",
    "2.3 Lofts, attics, and inaccessible high areas are not inspected."
  ];
  
  // Add text with proper line spacing
  let yPos = 40;
  disclaimerText.forEach(line => {
    doc.text(line, LEFT, yPos);
    yPos += line === "" ? 3 : 6;
  });
  
  // Add second disclaimer page
  doc.addPage();
  addHeader(doc);
  addFooter(doc, report, 3); // Third page after cover
  
  // More disclaimers on second page
  doc.setFontSize(SECTION_TITLE.size);
  doc.setFont("helvetica", "bold");
  doc.text("DISCLAIMERS (CONTINUED)", LEFT, 30);
  
  doc.setFontSize(BODY.size);
  doc.setFont("helvetica", "normal");
  
  const disclaimerText2 = [
    "3. FURNITURE AND FURNISHINGS",
    "",
    "3.1 Fire safety labels are not checked or inspected.",
    "3.2 Sofa beds and similar items are not opened or inspected internally.",
    "3.3 Mattresses are not examined underneath.",
    "",
    "4. UTILITIES",
    "",
    "4.1 Electrical items are not tested.",
    "4.2 Utility meters are not read unless specified.",
    "4.3 Boilers and heating systems are not tested."
  ];
  
  // Add text with proper line spacing
  yPos = 40;
  disclaimerText2.forEach(line => {
    doc.text(line, LEFT, yPos);
    yPos += line === "" ? 3 : 6;
  });
};

// Add Property Overview
const addPropertyOverview = (doc: jsPDF, report: ReportData) => {
  // Add new page
  doc.addPage();
  
  // Add header and footer
  addHeader(doc);
  addFooter(doc, report, 4); // Fourth page after cover
  
  const { SECTION_TITLE, BODY } = PDF_CONSTANTS.FONT;
  const { LEFT } = PDF_CONSTANTS.MARGINS;
  
  // Title
  doc.setFontSize(SECTION_TITLE.size);
  doc.setFont("helvetica", "bold");
  doc.text("PROPERTY OVERVIEW", LEFT, 30);
  
  // Property details
  doc.setFontSize(BODY.size);
  doc.setFont("helvetica", "normal");
  
  let yPos = 40;
  
  doc.text(`Property Address: ${report.property.address}`, LEFT, yPos);
  yPos += 7;
  doc.text(`Property Type: ${report.property.type}`, LEFT, yPos);
  yPos += 7;
  doc.text(`Inspection Date: ${formatDate(report.date)}`, LEFT, yPos);
  yPos += 15;
  
  // Add property image-response pairs if they exist
  if (report.property.imageResponsePairs && report.property.imageResponsePairs.length > 0) {
    doc.setFontSize(BODY.size + 2);
    doc.setFont("helvetica", "bold");
    doc.text("Property Analysis:", LEFT, yPos);
    doc.setFont("helvetica", "normal");
    yPos += 10;
    
    // Display first image-response pair on this page
    const pair = report.property.imageResponsePairs[0];
    addImageWithAnalysis(doc, pair.imageUrl, pair.response, "1.0", yPos, report.date);
    
    // Additional pairs will be shown in the image analysis section
  }
};

// Add Report Context
const addReportContext = (doc: jsPDF, report: ReportData) => {
  // Add new page
  doc.addPage();
  
  // Add header and footer
  addHeader(doc);
  addFooter(doc, report, 5); // Fifth page after cover
  
  const { SECTION_TITLE, BODY } = PDF_CONSTANTS.FONT;
  const { LEFT } = PDF_CONSTANTS.MARGINS;
  
  // Title
  doc.setFontSize(SECTION_TITLE.size);
  doc.setFont("helvetica", "bold");
  doc.text("REPORT CONTEXT", LEFT, 30);
  
  // Context text
  doc.setFontSize(BODY.size);
  doc.setFont("helvetica", "normal");
  
  if (report.prompt) {
    const lines = doc.splitTextToSize(report.prompt, 180);
    doc.text(lines, LEFT, 40);
  } else {
    doc.text("No additional context provided for this report.", LEFT, 40);
  }
};

// Add Inventory Items
const addInventoryItems = (doc: jsPDF, report: ReportData): number => {
  // Add new page
  doc.addPage();
  
  // Add header and footer
  addHeader(doc);
  addFooter(doc, report, 6); // Sixth page after cover
  
  const { SECTION_TITLE } = PDF_CONSTANTS.FONT;
  const { LEFT } = PDF_CONSTANTS.MARGINS;
  
  // Title
  doc.setFontSize(SECTION_TITLE.size);
  doc.setFont("helvetica", "bold");
  doc.text("INVENTORY ITEMS", LEFT, 30);
  
  // Generate inventory table
  const tableData = report.items.map((item, index) => [
    `${index + 1}`,
    item.description,
    item.condition,
    item.notes || "-"
  ]);
  
  // Add table with autoTable
  autoTable(doc, {
    startY: 40,
    head: [["Ref #", "Description", "Condition", "Notes"]],
    body: tableData,
    margin: { top: 15, bottom: 15, left: LEFT, right: 15 },
    styles: { 
      overflow: "linebreak",
      fontSize: 10,
      cellPadding: 2
    },
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: "bold"
    },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 70 },
      2: { cellWidth: 30 },
      3: { cellWidth: 70 }
    }
  });
  
  // Return 1 to indicate we added one page
  return 1;
};

// Add Image with Analysis
const addImageWithAnalysis = (doc: jsPDF, imageUrl: string, analysis: string, refNumber: string, yPos: number, date: string) => {
  const { LEFT } = PDF_CONSTANTS.MARGINS;
  const { INLINE } = PDF_CONSTANTS.IMAGE;
  const pageWidth = doc.internal.pageSize.width;
  
  try {
    // Add image (left side)
    if (imageUrl) {
      try {
        doc.addImage(imageUrl, "JPEG", LEFT, yPos, INLINE.width, INLINE.height, undefined, "FAST");
        
        // Add ref number below image
        doc.setFontSize(PDF_CONSTANTS.FONT.BODY.size);
        doc.text(`Ref #${refNumber}`, LEFT, yPos + INLINE.height + 5);
        
        // Add timestamp
        doc.text(formatTimestamp(date), LEFT, yPos + INLINE.height + 10);
      } catch (imgErr) {
        // Try adding as PNG if JPEG fails
        try {
          doc.addImage(imageUrl, "PNG", LEFT, yPos, INLINE.width, INLINE.height, undefined, "FAST");
          
          // Add ref number below image
          doc.setFontSize(PDF_CONSTANTS.FONT.BODY.size);
          doc.text(`Ref #${refNumber}`, LEFT, yPos + INLINE.height + 5);
          
          // Add timestamp
          doc.text(formatTimestamp(date), LEFT, yPos + INLINE.height + 10);
        } catch (pngErr) {
          console.error("Failed to add image to PDF:", pngErr);
          doc.text("Photo unavailable", LEFT + INLINE.width/2, yPos + INLINE.height/2, { align: "center" });
        }
      }
    } else {
      // No image available
      doc.text("Photo unavailable", LEFT + INLINE.width/2, yPos + INLINE.height/2, { align: "center" });
    }
    
    // Add analysis (right side)
    if (analysis) {
      doc.setFontSize(PDF_CONSTANTS.FONT.BODY.size);
      doc.setFont("helvetica", "bold");
      doc.text("Analysis:", LEFT + INLINE.width + 10, yPos);
      doc.setFont("helvetica", "normal");
      
      const analysisLines = doc.splitTextToSize(analysis, pageWidth - LEFT - INLINE.width - 20);
      doc.text(analysisLines, LEFT + INLINE.width + 10, yPos + 8);
    }
  } catch (error) {
    console.error("Error adding image with analysis:", error);
    doc.text("Error displaying image and analysis", LEFT, yPos + 10);
  }
};

// Add Image Analysis Pages
const addImageAnalysisPages = (doc: jsPDF, report: ReportData) => {
  // Create array of all images that need analysis pages
  const allImages: Array<{
    refNumber: string;
    title: string;
    imageUrl: string;
    analysis: string;
  }> = [];
  
  // Add property image pairs (skip first one that's already in overview)
  if (report.property.imageResponsePairs.length > 1) {
    for (let i = 1; i < report.property.imageResponsePairs.length; i++) {
      const pair = report.property.imageResponsePairs[i];
      allImages.push({
        refNumber: `1.${i}`,
        title: "Property Overview",
        imageUrl: pair.imageUrl,
        analysis: pair.response
      });
    }
  }
  
  // Add inventory item images
  report.items.forEach((item, itemIndex) => {
    item.images.forEach((imgUrl, imgIndex) => {
      allImages.push({
        refNumber: `${itemIndex + 2}.${imgIndex + 1}`,
        title: item.description,
        imageUrl: imgUrl,
        analysis: item.aiAnalysis || "No analysis available"
      });
    });
  });
  
  // Skip if no images to analyze
  if (allImages.length === 0) return;
  
  // Create page(s) for the image analyses
  let currentPage = 7; // Start after inventory items
  
  // Process images in groups of 2 per page (full size overview images)
  for (let i = 0; i < allImages.length; i += 2) {
    // Add new page
    doc.addPage();
    
    // Add header and footer
    addHeader(doc);
    addFooter(doc, report, currentPage);
    currentPage++;
    
    const { SECTION_TITLE, BODY } = PDF_CONSTANTS.FONT;
    const { LEFT } = PDF_CONSTANTS.MARGINS;
    
    // Page title
    doc.setFontSize(SECTION_TITLE.size);
    doc.setFont("helvetica", "bold");
    doc.text("IMAGE ANALYSIS", LEFT, 30);
    
    // First image on page
    const img1 = allImages[i];
    doc.setFontSize(BODY.size + 2);
    doc.setFont("helvetica", "bold");
    doc.text(`${img1.title} - Ref #${img1.refNumber}`, LEFT, 40);
    
    addImageWithAnalysis(doc, img1.imageUrl, img1.analysis, img1.refNumber, 50, report.date);
    
    // Second image if available
    if (i + 1 < allImages.length) {
      const img2 = allImages[i + 1];
      doc.setFontSize(BODY.size + 2);
      doc.setFont("helvetica", "bold");
      doc.text(`${img2.title} - Ref #${img2.refNumber}`, LEFT, 160);
      
      addImageWithAnalysis(doc, img2.imageUrl, img2.analysis, img2.refNumber, 170, report.date);
    }
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
