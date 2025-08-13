import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export type TemplateSize = "A4" | "58mm" | "80mm";

export const printInvoice = (templateSize: TemplateSize, elementId: string) => {
  // Create a new window for printing
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (!printWindow) {
    alert('Please allow popups for this website to print the invoice.');
    return;
  }

  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found for printing');
    return;
  }

  // Get the HTML content
  const content = element.innerHTML;
  
  // Create CSS based on template size
  let printCSS = '';
  switch (templateSize) {
    case 'A4':
      printCSS = `
        <style>
          @page { 
            size: A4; 
            margin: 0.5in; 
          }
          body { 
            font-family: 'Inter', Arial, sans-serif; 
            font-size: 14px; 
            line-height: 1.4; 
            color: #333;
            margin: 0;
            padding: 0;
          }
          .print-content {
            max-width: 100%;
            margin: 0 auto;
          }
        </style>
      `;
      break;
    case '58mm':
      printCSS = `
        <style>
          @page { 
            size: 58mm auto; 
            margin: 2mm; 
          }
          body { 
            font-family: monospace; 
            font-size: 9px; 
            line-height: 1.2; 
            color: #000;
            margin: 0;
            padding: 0;
            width: 54mm;
          }
          .print-content {
            width: 54mm;
            margin: 0;
          }
        </style>
      `;
      break;
    case '80mm':
      printCSS = `
        <style>
          @page { 
            size: 80mm auto; 
            margin: 3mm; 
          }
          body { 
            font-family: monospace; 
            font-size: 11px; 
            line-height: 1.3; 
            color: #000;
            margin: 0;
            padding: 0;
            width: 74mm;
          }
          .print-content {
            width: 74mm;
            margin: 0;
          }
        </style>
      `;
      break;
  }

  // Write the content to the new window
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice - ${templateSize}</title>
        ${printCSS}
      </head>
      <body>
        <div class="print-content">
          ${content}
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();
  
  // Wait for the content to load, then print
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }, 500);
};

export const exportToPDF = async (templateSize: TemplateSize, elementId: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found for PDF export');
    return;
  }

  try {
    // Configure canvas options based on template size
    let canvasOptions: any = {
      scale: 2,
      useCORS: true,
      allowTaint: true,
    };

    let pdfOptions: any = {};

    switch (templateSize) {
      case 'A4':
        canvasOptions.width = 794; // A4 width in pixels at 96 DPI
        canvasOptions.height = 1123; // A4 height in pixels at 96 DPI
        pdfOptions = { format: 'a4', orientation: 'portrait' };
        break;
      case '58mm':
        canvasOptions.width = 219; // 58mm in pixels at 96 DPI
        canvasOptions.height = 400; // Variable height
        pdfOptions = { format: [58, 'auto'], orientation: 'portrait' };
        break;
      case '80mm':
        canvasOptions.width = 302; // 80mm in pixels at 96 DPI  
        canvasOptions.height = 500; // Variable height
        pdfOptions = { format: [80, 'auto'], orientation: 'portrait' };
        break;
    }

    // Create canvas from element
    const canvas = await html2canvas(element, canvasOptions);
    const imgData = canvas.toDataURL('image/png');

    // Create PDF
    const pdf = new jsPDF(pdfOptions);
    
    // Calculate dimensions
    const imgWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 16).replace(/[:-]/g, '');
    const filename = `invoice_${templateSize}_${timestamp}.pdf`;
    
    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generating PDF. Please try the print option instead.');
  }
};