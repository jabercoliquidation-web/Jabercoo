import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { File, Phone, Globe, Save, Trash2 } from "lucide-react";
import { CompanyForm, type CompanyFormData } from "@/components/company-form";
import { ItemForm, type ItemFormData } from "@/components/item-form";
import { InvoiceTemplateSelector } from "@/components/invoice-template-selector";
import { InvoiceTemplateA4 } from "@/components/invoice-template-a4";
import { InvoiceTemplate58mm } from "@/components/invoice-template-58mm";
import { InvoiceTemplate80mm } from "@/components/invoice-template-80mm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { printInvoice, exportToPDF, type TemplateSize } from "@/utils/print-utils";


interface InvoiceItem extends ItemFormData {
  total: number;
}

export default function InvoiceGenerator() {
  const { toast } = useToast();
  const [company, setCompany] = useState<CompanyFormData>({
    name: "",
    phone: "",
    address: "",
    website: "",
    taxRate: 13,
  });
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [invoiceNumber, setInvoiceNumber] = useState("INV-000001");
  const [currentDate, setCurrentDate] = useState("");

  // Generate invoice number and set current date on mount
  useEffect(() => {
    const today = new Date();

    // Format date and time for Toronto timezone
    const torontoDateTime = today.toLocaleString('en-US', {
      timeZone: 'America/Toronto',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    setCurrentDate(torontoDateTime);

    // Generate unique invoice number using Toronto timezone with timestamp
    const torontoDate = new Date(today.toLocaleString("en-US", {timeZone: "America/Toronto"}));
    const year = torontoDate.getFullYear();
    const month = String(torontoDate.getMonth() + 1).padStart(2, '0');
    const day = String(torontoDate.getDate()).padStart(2, '0');
    const hours = String(torontoDate.getHours()).padStart(2, '0');
    const minutes = String(torontoDate.getMinutes()).padStart(2, '0');
    const seconds = String(torontoDate.getSeconds()).padStart(2, '0');

    // Create unique invoice number with timestamp
    setInvoiceNumber(`INV-${year}${month}${day}${hours}${minutes}${seconds}`);
  }, []);

  // Save invoice mutation
  const saveInvoiceMutation = useMutation({
    mutationFn: async (invoiceData: any) => {
      const response = await apiRequest("POST", "/api/invoices", invoiceData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `Invoice ${data.invoiceNumber || invoiceNumber} saved successfully!`,
      });

      // Show option to view saved invoices
      setTimeout(() => {
        toast({
          title: "View Invoices",
          description: "Click here to view all saved invoices",
          action: (
            <Button
              size="sm"
              onClick={() => window.location.href = '/invoices'}
              className="bg-jaberco-blue hover:bg-blue-700"
            >
              View All
            </Button>
          ),
        });
      }, 2000);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save invoice. Please try again.",
        variant: "destructive",
      });
      console.error("Save invoice error:", error);
    },
  });

  const handleCompanyChange = (companyData: CompanyFormData) => {
    setCompany(companyData);
  };

  const handleAddItem = (itemData: ItemFormData) => {
    const total = itemData.quantity * itemData.unitPrice;
    const newItem: InvoiceItem = { ...itemData, total };
    setItems([...items, newItem]);

    toast({
      title: "Item Added",
      description: `${itemData.name} has been added to the invoice.`,
    });
  };

  const handleRemoveItem = (index: number) => {
    const removedItem = items[index];
    setItems(items.filter((_, i) => i !== index));

    toast({
      title: "Item Removed",
      description: `${removedItem.name} has been removed from the invoice.`,
    });
  };

  const handleSaveInvoice = async () => {
    if (items.length === 0) {
      toast({
        title: "No Items",
        description: "Please add at least one item before saving the invoice.",
        variant: "destructive",
      });
      return;
    }

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * (company.taxRate / 100);
    const total = subtotal + tax;

    // First create or get the company
    const companyData = {
      name: company.name || "Default Company",
      phone: company.phone || "",
      address: company.address || "",
      website: company.website || "",
      taxRate: company.taxRate.toString(),
    };

    const invoiceData = {
      invoice: {
        invoiceNumber,
        companyId: null, // Will be set after company creation
        subtotal: subtotal.toString(),
        tax: tax.toString(),
        total: total.toString(),
        status: "saved",
      },
      items: items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toString(),
        total: item.total.toString(),
      })),
      company: companyData,
    };

    saveInvoiceMutation.mutate(invoiceData);
  };

  const handlePrintInvoice = (templateSize: TemplateSize) => {
    if (items.length === 0) {
      toast({
        title: "No Items",
        description: "Please add at least one item before printing the invoice.",
        variant: "destructive",
      });
      return;
    }

    const elementId = `invoice-template-${templateSize.toLowerCase()}`;
    printInvoice(templateSize, elementId);
  };

  const handleExportPDF = (templateSize: TemplateSize) => {
    if (items.length === 0) {
      toast({
        title: "No Items",
        description: "Please add at least one item before exporting to PDF.",
        variant: "destructive",
      });
      return;
    }

    const elementId = `invoice-template-${templateSize.toLowerCase()}`;
    exportToPDF(templateSize, elementId);

    toast({
      title: "PDF Export",
      description: `Generating ${templateSize} PDF invoice...`,
    });
  };

  const handleClearAll = () => {
    setCompany({
      name: "",
      phone: "",
      address: "",
      website: "",
      taxRate: 13,
    });
    setItems([]);

    toast({
      title: "Cleared",
      description: "All invoice data has been cleared.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-jaberco-blue rounded-lg flex items-center justify-center">
                <File className="text-white h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Jaberco<sup className="text-sm">®</sup>
                </h1>
                <p className="text-sm text-gray-500">Invoice Generator</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="hidden md:flex items-center space-x-4">
                <span className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  +1 289 216 6500
                </span>
                <span className="flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  www.jaberco.ca
                </span>
              </div>
              <Button
                onClick={() => window.location.href = '/invoices'}
                variant="outline"
                size="sm"
                className="bg-jaberco-blue text-white hover:bg-blue-700 border-jaberco-blue"
                data-testid="button-view-invoices"
              >
                <File className="h-4 w-4 mr-1" />
                View Invoices
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Invoice Generator</h2>
          <p className="text-gray-600">Create professional invoices with automatic tax calculation</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Forms and Actions */}
          <div className="space-y-6">
            <CompanyForm
              onCompanyChange={handleCompanyChange}
              initialData={company}
            />

            <ItemForm onAddItem={handleAddItem} />

            {/* Save and Clear Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Save className="h-5 w-5 text-jaberco-blue" />
                  Invoice Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={handleSaveInvoice}
                    disabled={items.length === 0}
                    className="bg-green-600 text-white hover:bg-green-700 transition-colors duration-200"
                    data-testid="button-save-invoice"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Invoice
                  </Button>

                  <Button
                    onClick={handleClearAll}
                    className="bg-gray-600 text-white hover:bg-gray-700 transition-colors duration-200"
                    data-testid="button-clear-all"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                </div>

                {/* View Invoices Button */}
                <Button
                  onClick={() => window.location.href = '/invoices'}
                  className="w-full bg-jaberco-blue text-white hover:bg-blue-700 transition-colors duration-200"
                  data-testid="button-view-saved-invoices"
                >
                  <File className="h-4 w-4 mr-2" />
                  View Saved Invoices
                </Button>

                <Alert className="bg-blue-50 border-blue-200">
                  <AlertDescription className="text-blue-700">
                    <strong>Tip:</strong> Add items first, then use Print or Save as PDF options below
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Print and Export Options */}
            <InvoiceTemplateSelector
              company={company}
              items={items}
              invoiceNumber={invoiceNumber}
              currentDate={currentDate}
              onPrint={handlePrintInvoice}
              onExportPDF={handleExportPDF}
              hasItems={items.length > 0}
            />
          </div>

          {/* Right Column: Live Invoice Preview */}
          <div className="lg:sticky lg:top-8">
            <Card className="print:shadow-none print:border-none">
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div id="invoice-template-a4">
                  <InvoiceTemplateA4
                    company={company}
                    items={items}
                    invoiceNumber={invoiceNumber}
                    currentDate={currentDate}
                    onRemoveItem={handleRemoveItem}
                    isPrintMode={false}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Hidden Templates for Printing */}
        <div className="hidden">
          <div id="invoice-template-58mm">
            <InvoiceTemplate58mm
              company={company}
              items={items}
              invoiceNumber={invoiceNumber}
              currentDate={currentDate}
            />
          </div>
          <div id="invoice-template-80mm">
            <InvoiceTemplate80mm
              company={company}
              items={items}
              invoiceNumber={invoiceNumber}
              currentDate={currentDate}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">
                Jaberco<sup className="text-sm">®</sup>
              </h4>
              <p className="text-sm text-gray-600">
                Professional invoice generation made simple. Create, manage, and track your invoices with ease.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="flex items-center gap-2">
                  <span>📍</span>
                  2480 Cawthra Rd #16, Mississauga, ON
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  +1 289 216 6500
                </p>
                <p className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  www.jaberco.ca
                </p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Features</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Real-time invoice preview
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Automatic tax calculation
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Multiple print formats (A4, 58mm, 80mm)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Professional templates
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-6 mt-6 text-center text-sm text-gray-500">
            <p>&copy; 2025 Jaberco. All rights reserved. | Professional Invoice Generator</p>
          </div>
        </div>
      </footer>
    </div>
  );
}