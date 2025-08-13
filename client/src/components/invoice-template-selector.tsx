import { useState } from "react";
import { Printer, FileText, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { InvoiceTemplateA4 } from "./invoice-template-a4";
import { InvoiceTemplate58mm } from "./invoice-template-58mm";
import { InvoiceTemplate80mm } from "./invoice-template-80mm";
import type { CompanyFormData } from "./company-form";
import type { ItemFormData } from "./item-form";

interface InvoiceItem extends ItemFormData {
  total: number;
}

type TemplateSize = "A4" | "58mm" | "80mm";

interface InvoiceTemplateSelectorProps {
  company: CompanyFormData;
  items: InvoiceItem[];
  invoiceNumber: string;
  currentDate: string;
  onPrint: (templateSize: TemplateSize) => void;
  onExportPDF: (templateSize: TemplateSize) => void;
  hasItems: boolean;
}

export function InvoiceTemplateSelector({
  company,
  items,
  invoiceNumber,
  currentDate,
  onPrint,
  onExportPDF,
  hasItems
}: InvoiceTemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateSize>("A4");
  const [previewOpen, setPreviewOpen] = useState(false);

  const renderTemplate = (size: TemplateSize, isPrintMode = false) => {
    switch (size) {
      case "A4":
        return (
          <InvoiceTemplateA4
            company={company}
            items={items}
            invoiceNumber={invoiceNumber}
            currentDate={currentDate}
            isPrintMode={isPrintMode}
          />
        );
      case "58mm":
        return (
          <InvoiceTemplate58mm
            company={company}
            items={items}
            invoiceNumber={invoiceNumber}
            currentDate={currentDate}
          />
        );
      case "80mm":
        return (
          <InvoiceTemplate80mm
            company={company}
            items={items}
            invoiceNumber={invoiceNumber}
            currentDate={currentDate}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-jaberco-blue" />
          Print & Export Options
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Template Size Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Invoice Template Size:</label>
          <Select value={selectedTemplate} onValueChange={(value: TemplateSize) => setSelectedTemplate(value)}>
            <SelectTrigger data-testid="select-template-size">
              <SelectValue placeholder="Select template size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A4">A4 Paper (Standard)</SelectItem>
              <SelectItem value="58mm">58mm Receipt (Small)</SelectItem>
              <SelectItem value="80mm">80mm Receipt (Medium)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                disabled={!hasItems}
                className="text-sm"
                data-testid="button-preview-invoice"
              >
                <FileText className="h-4 w-4 mr-1" />
                Preview
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>Invoice Preview - {selectedTemplate}</DialogTitle>
              </DialogHeader>
              <div className="flex justify-center">
                {renderTemplate(selectedTemplate, true)}
              </div>
            </DialogContent>
          </Dialog>
          
          <Button
            onClick={() => onPrint(selectedTemplate)}
            disabled={!hasItems}
            className="bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 text-sm"
            data-testid="button-print-invoice"
          >
            <Printer className="h-4 w-4 mr-1" />
            Print ({selectedTemplate})
          </Button>
          
          <Button
            onClick={() => onExportPDF(selectedTemplate)}
            disabled={!hasItems}
            className="bg-red-600 text-white hover:bg-red-700 transition-colors duration-200 text-sm"
            data-testid="button-export-pdf"
          >
            <FileText className="h-4 w-4 mr-1" />
            Save as PDF
          </Button>
        </div>

        {/* Template Description */}
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          {selectedTemplate === "A4" && (
            <>
              <strong>A4 Standard:</strong> Full-size invoice suitable for regular printing and professional correspondence.
            </>
          )}
          {selectedTemplate === "58mm" && (
            <>
              <strong>58mm Receipt:</strong> Compact format for thermal printers and small receipt printers. Perfect for quick receipts.
            </>
          )}
          {selectedTemplate === "80mm" && (
            <>
              <strong>80mm Receipt:</strong> Medium-sized receipt format with more detail space. Ideal for POS thermal printers.
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}