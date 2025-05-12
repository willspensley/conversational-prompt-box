
import { ReportData, ReportItem, ImageResponsePair } from "@/lib/pdf-utils";

// LaTeX document template
const DOCUMENT_TEMPLATE = `
\\documentclass[a4paper,11pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{lmodern}
\\usepackage{graphicx}
\\usepackage{geometry}
\\usepackage{hyperref}
\\usepackage{array}
\\usepackage{fancyhdr}
\\usepackage{tabularx}
\\usepackage{booktabs}
\\usepackage{caption}
\\usepackage{float}
\\usepackage{enumitem}
\\usepackage{xcolor}
\\usepackage{afterpage}

% Page geometry
\\geometry{a4paper, margin=15mm}

% Hyperlink setup
\\hypersetup{
  colorlinks=true,
  linkcolor=blue,
  filecolor=magenta,      
  urlcolor=blue,
}

% Header and footer setup
\\pagestyle{fancy}
\\fancyhf{}
\\renewcommand{\\headrulewidth}{0.5pt}
\\renewcommand{\\footrulewidth}{0.5pt}

% Define custom commands
\\newcommand{\\companyname}{PROPERTY INVENTORY COMPANY}
\\newcommand{\\companyaddress}{Unit 9, Spaces Business Centre, Ingate Place, SWB 3NS}
\\newcommand{\\companyphone}{+44 (0) 2073241802}
\\newcommand{\\companyemail}{bookings@propertyinventory.co.uk}
\\newcommand{\\companywebsite}{propertyinventory.co.uk}
\\newcommand{\\companyreg}{12345678}

% Title page command
\\newcommand{\\titlepage}[3]{
  \\begin{center}
    {\\LARGE\\bfseries PERFECT REPORT CREATION\\par}
    \\vspace{3cm}
    {\\large #1\\par}
    \\vspace{1cm}
    Property: #2\\par
    Property Type: #3\\par
    \\vspace{2cm}
    {\\normalsize Open 7 days a week, 364 days a year\\par}
    {\\normalsize Over 10,000 inspections completed in our region\\par}
    {\\normalsize Guaranteed 48 hour return of our reports\\par}
    {\\normalsize 5\\% of our profits go to support of local housing charity\\par}
    \\vfill
    {\\large\\bfseries \\companyname\\par}
  \\end{center}
}

% Header setup
\\fancyhead[C]{\\textbf{\\companyname} THE PROFESSIONAL INVENTORY COMPANY}
\\fancyhead[L]{
  A \\companyname, \\companyaddress\\\\
  T \\companyphone\\\\
  E \\companyemail\\\\
  W \\companywebsite
}
\\fancyhead[R]{}

% Footer setup
\\fancyfoot[C]{
  Inventory \\& Check In\\\\
  Date $replaceDate$\\\\
  Registered office: \\companyaddress\\\\
  Property: $replaceProperty$\\\\
  Registered in England and Wales, Company Number \\companyreg
}
\\fancyfoot[R]{\\thepage}

\\begin{document}

% Title page (no headers/footers)
\\thispagestyle{empty}
$replaceTitlePage$

% Table of Contents
\\newpage
\\thispagestyle{fancy}
\\section*{\\centering CONTENTS}
\\begin{center}
\\begin{tabular}{ll}
Contents & 1 \\\\
Disclaimers & 2--3 \\\\
Property Overview & 4 \\\\
$replaceContentsReportContext$
Inventory Items & $replaceContentsInventoryPage$ \\\\
$replaceContentsImageAnalysis$
\\end{tabular}
\\end{center}

% Disclaimers
\\newpage
\\section*{DISCLAIMERS}
\\begin{enumerate}[label=\\arabic*.]
  \\item \\textbf{GENERAL DISCLAIMERS}
  \\begin{enumerate}[label=\\arabic{enumi}.\\arabic*]
    \\item This inventory provides a record of the property's condition and contents at the time of inspection.
    \\item All items are assumed to be in good condition unless otherwise stated.
    \\item Estimates in this report are not to be taken as valuations.
    \\item The inventory company cannot be held responsible for any errors or omissions.
  \\end{enumerate}
  
  \\item \\textbf{PROPERTY INSPECTION}
  \\begin{enumerate}[label=\\arabic{enumi}.\\arabic*]
    \\item Items are not moved during inspection unless specified.
    \\item Locked areas not accessible during inspection are excluded from this report.
    \\item Lofts, attics, and inaccessible high areas are not inspected.
  \\end{enumerate}
\\end{enumerate}

\\newpage
\\section*{DISCLAIMERS (CONTINUED)}
\\begin{enumerate}[label=\\arabic*., start=3]
  \\item \\textbf{FURNITURE AND FURNISHINGS}
  \\begin{enumerate}[label=\\arabic{enumi}.\\arabic*]
    \\item Fire safety labels are not checked or inspected.
    \\item Sofa beds and similar items are not opened or inspected internally.
    \\item Mattresses are not examined underneath.
  \\end{enumerate}
  
  \\item \\textbf{UTILITIES}
  \\begin{enumerate}[label=\\arabic{enumi}.\\arabic*]
    \\item Electrical items are not tested.
    \\item Utility meters are not read unless specified.
    \\item Boilers and heating systems are not tested.
  \\end{enumerate}
\\end{enumerate}

% Property Overview
\\newpage
\\section*{PROPERTY OVERVIEW}
\\begin{tabular}{ll}
Property Address: & $replacePropertyAddress$ \\\\
Property Type: & $replacePropertyType$ \\\\
Inspection Date: & $replaceInspectionDate$ \\\\
\\end{tabular}

$replacePropertyAnalysis$

$replaceReportContext$

% Inventory Items
\\newpage
\\section*{INVENTORY ITEMS}
\\begin{center}
\\begin{tabularx}{\\textwidth}{|c|X|c|X|}
\\hline
\\textbf{Ref \\#} & \\textbf{Description} & \\textbf{Condition} & \\textbf{Notes} \\\\
\\hline
$replaceInventoryItems$
\\hline
\\end{tabularx}
\\end{center}

$replaceImageAnalysis$

\\end{document}
`;

// Format ISO date string to DD/MM/YYYY
const formatDate = (isoDate: string): string => {
  try {
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }).replace(/\//g, '/');
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

// Escape special LaTeX characters
const escapeLatex = (text: string): string => {
  return text
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/&/g, '\\&')
    .replace(/%/g, '\\%')
    .replace(/\$/g, '\\$')
    .replace(/#/g, '\\#')
    .replace(/_/g, '\\_')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}')
    .replace(/</g, '\\textless{}')
    .replace(/>/g, '\\textgreater{}');
};

// Generate LaTeX document from report data
export const generateLatexDocument = async (report: ReportData): Promise<string> => {
  try {
    // Title page
    const titlePage = `\\titlepage{${formatDate(report.date)}}{${escapeLatex(report.property.address)}}{${escapeLatex(report.property.type)}}`;
    
    // Contents entries
    let contentsReportContext = '';
    if (report.prompt) {
      contentsReportContext = `Report Context & 5 \\\\\n`;
    }
    
    const contentsInventoryPage = report.prompt ? '6' : '5';
    
    let contentsImageAnalysis = '';
    if (report.property.imageResponsePairs.length > 0 || report.items.some(item => item.images.length > 0)) {
      contentsImageAnalysis = `Image Analysis & ${parseInt(contentsInventoryPage) + 1}+ \\\\\n`;
    }
    
    // Property analysis
    let propertyAnalysis = '';
    if (report.property.imageResponsePairs && report.property.imageResponsePairs.length > 0) {
      propertyAnalysis = `
\\vspace{1cm}
\\textbf{Property Analysis:}
\\begin{quote}
${escapeLatex(report.property.imageResponsePairs[0].response)}
\\end{quote}
`;
    }
    
    // Report context section
    let reportContext = '';
    if (report.prompt) {
      reportContext = `
\\newpage
\\section*{REPORT CONTEXT}
${escapeLatex(report.prompt)}
`;
    }
    
    // Inventory items
    const inventoryItems = report.items.map((item, index) => {
      return `${index + 1} & ${escapeLatex(item.description)} & ${item.condition} & ${escapeLatex(item.notes || '-')} \\\\ \\hline`;
    }).join('\n');
    
    // Image analysis
    let imageAnalysis = '';
    
    const allImages: Array<{
      refNumber: string;
      title: string;
      imageAnalysis: string;
    }> = [];
    
    // Add property image pairs (skip first one that's already in overview)
    if (report.property.imageResponsePairs.length > 1) {
      for (let i = 1; i < report.property.imageResponsePairs.length; i++) {
        const pair = report.property.imageResponsePairs[i];
        allImages.push({
          refNumber: `1.${i}`,
          title: "Property Overview",
          imageAnalysis: pair.response
        });
      }
    }
    
    // Add inventory item images
    report.items.forEach((item, itemIndex) => {
      item.images.forEach((imgUrl, imgIndex) => {
        allImages.push({
          refNumber: `${itemIndex + 2}.${imgIndex + 1}`,
          title: item.description,
          imageAnalysis: item.aiAnalysis || "No analysis available"
        });
      });
    });
    
    if (allImages.length > 0) {
      imageAnalysis = `
\\newpage
\\section*{IMAGE ANALYSIS}
`;
      
      allImages.forEach((img, index) => {
        if (index > 0 && index % 2 === 0) {
          imageAnalysis += `\\newpage\n`;
        }
        
        imageAnalysis += `
\\subsection*{${escapeLatex(img.title)} - Ref \\#${img.refNumber}}
\\begin{quote}
${escapeLatex(img.imageAnalysis)}
\\end{quote}
\\vspace{0.5cm}
`;
      });
    }
    
    // Replace placeholders
    let latexDoc = DOCUMENT_TEMPLATE
      .replace('$replaceTitlePage$', titlePage)
      .replace('$replaceDate$', formatDate(report.date))
      .replace('$replaceProperty$', escapeLatex(report.property.address))
      .replace('$replaceContentsReportContext$', contentsReportContext)
      .replace('$replaceContentsInventoryPage$', contentsInventoryPage)
      .replace('$replaceContentsImageAnalysis$', contentsImageAnalysis)
      .replace('$replacePropertyAddress$', escapeLatex(report.property.address))
      .replace('$replacePropertyType$', escapeLatex(report.property.type))
      .replace('$replaceInspectionDate$', formatDate(report.date))
      .replace('$replacePropertyAnalysis$', propertyAnalysis)
      .replace('$replaceReportContext$', reportContext)
      .replace('$replaceInventoryItems$', inventoryItems)
      .replace('$replaceImageAnalysis$', imageAnalysis);
    
    return latexDoc;
  } catch (error) {
    console.error("Error generating LaTeX document:", error);
    throw new Error(`LaTeX generation failed: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// Note: In a complete implementation, we would convert LaTeX to PDF here
// Currently using the existing PDF generation as a fallback
