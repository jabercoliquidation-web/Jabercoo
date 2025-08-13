import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { File, Phone, Globe } from "lucide-react";
import { CompanyForm, type CompanyFormData } from "@/components/company-form";
import { ItemForm, type ItemFormData } from "@/components/item-form";
import { InvoiceActions } from "@/components/invoice-actions";
import { InvoicePreview } from "@/components/invoice-preview";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

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
    setCurrentDate(today.toLocaleDateString('en-CA'));
    
    // Generate invoice number
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    setInvoiceNumber(`INV-${year}${month}${day}001`);
  }, []);

  // Save invoice mutation
  const saveInvoiceMutation = useMutation({
    mutationFn: async (invoiceData: any) => {
      const response = await apiRequest("POST", "/api/invoices", invoiceData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Invoice saved successfully!",
      });
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

  const handleSaveInvoice = () => {
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

    const invoiceData = {
      invoice: {
        invoiceNumber,
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
    };

    saveInvoiceMutation.mutate(invoiceData);
  };

  const handlePrintInvoice = () => {
    if (items.length === 0) {
      toast({
        title: "No Items",
        description: "Please add at least one item before printing the invoice.",
        variant: "destructive",
      });
      return;
    }
    
    window.print();
  };

  const handleExportPDF = () => {
    if (items.length === 0) {
      toast({
        title: "No Items",
        description: "Please add at least one item before exporting to PDF.",
        variant: "destructive",
      });
      return;
    }

    // For now, we'll use the browser's print to PDF functionality
    // In a production app, you might want to use a library like jsPDF
    toast({
      title: "PDF Export",
      description: "Use your browser's print function and select 'Save as PDF' as the destination.",
    });
    window.print();
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
            <div className="hidden md:flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                +1 (905) 555-0123
              </span>
              <span className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                www.jaberco.ca
              </span>
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
            
            <InvoiceActions
              onSave={handleSaveInvoice}
              onPrint={handlePrintInvoice}
              onExportPDF={handleExportPDF}
              onClear={handleClearAll}
              hasItems={items.length > 0}
            />
          </div>

          {/* Right Column: Live Invoice Preview */}
          <div className="lg:sticky lg:top-8">
            <InvoicePreview
              company={company}
              items={items}
              invoiceNumber={invoiceNumber}
              currentDate={currentDate}
              onRemoveItem={handleRemoveItem}
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
                  +1 (905) 555-0123
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
                  PDF export capability
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
