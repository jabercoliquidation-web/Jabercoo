import { Save, Printer, FileText, Trash2, Settings, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface InvoiceActionsProps {
  onSave: () => void;
  onPrint: () => void;
  onExportPDF: () => void;
  onClear: () => void;
  hasItems: boolean;
}

export function InvoiceActions({ onSave, onPrint, onExportPDF, onClear, hasItems }: InvoiceActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-jaberco-blue" />
          Invoice Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button
            onClick={onSave}
            disabled={!hasItems}
            className="bg-green-600 text-white hover:bg-green-700 transition-colors duration-200 text-sm"
            data-testid="button-save-invoice"
          >
            <Save className="h-4 w-4 mr-1" />
            Save Invoice
          </Button>
          
          <Button
            onClick={onPrint}
            disabled={!hasItems}
            className="bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 text-sm"
            data-testid="button-print-invoice"
          >
            <Printer className="h-4 w-4 mr-1" />
            Print Invoice
          </Button>
          
          <Button
            onClick={onExportPDF}
            disabled={!hasItems}
            className="bg-red-600 text-white hover:bg-red-700 transition-colors duration-200 text-sm"
            data-testid="button-export-pdf"
          >
            <FileText className="h-4 w-4 mr-1" />
            Save as PDF
          </Button>
          
          <Button
            onClick={onClear}
            className="bg-gray-600 text-white hover:bg-gray-700 transition-colors duration-200 text-sm"
            data-testid="button-clear-all"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        </div>
        
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-700" />
          <AlertDescription className="text-blue-700">
            <strong>Tip:</strong> Add items first, then use Print or Save as PDF options
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
