import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CompanyFormData } from "./company-form";
import type { ItemFormData } from "./item-form";

interface InvoiceItem extends ItemFormData {
  total: number;
}

interface InvoiceTemplateA4Props {
  company: CompanyFormData;
  items: InvoiceItem[];
  invoiceNumber: string;
  currentDate: string;
  onRemoveItem?: (index: number) => void;
  isPrintMode?: boolean;
}

export function InvoiceTemplateA4({ 
  company, 
  items, 
  invoiceNumber, 
  currentDate,
  onRemoveItem,
  isPrintMode = false
}: InvoiceTemplateA4Props) {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * (company.taxRate / 100);
  const total = subtotal + tax;

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto print-content" data-testid="invoice-a4-template">
      {/* Invoice Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-bold text-jaberco-blue mb-3">
            Jaberco<sup className="text-xl">®</sup>
          </h1>
          <div className="text-sm text-gray-600 space-y-1">
            <p data-testid="text-company-address">
              {company.address || "2480 Cawthra Rd #16, Mississauga, ON"}
            </p>
            <p>
              Tel: <span data-testid="text-company-phone">
                {company.phone || "+1 (905) 555-0123"}
              </span>
            </p>
            <p>
              Visit us: <span data-testid="text-company-website">
                {company.website || "www.jaberco.ca"}
              </span>
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600 mb-1">
            <strong>Date:</strong> <span data-testid="text-invoice-date">{currentDate}</span>
          </p>
          <p className="text-xl font-semibold text-gray-900">
            Invoice #: <span data-testid="text-invoice-number">{invoiceNumber}</span>
          </p>
        </div>
      </div>

      {/* Invoice Items */}
      <div className="mb-8">
        <div className="border-b-2 border-gray-300 pb-4 mb-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Items</h3>
          
          {items.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500" data-testid="empty-items-state">
              <p className="font-medium text-lg">No items added yet</p>
              <p className="text-sm">Add items using the form</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Header */}
              <div className="grid grid-cols-12 gap-4 py-3 border-b-2 border-gray-200 font-semibold text-gray-800 bg-gray-50">
                <div className="col-span-5">Description</div>
                <div className="col-span-2 text-right">Qty</div>
                <div className="col-span-2 text-right">Unit Price</div>
                <div className="col-span-2 text-right">Total</div>
                {!isPrintMode && <div className="col-span-1"></div>}
              </div>
              
              {/* Items */}
              {items.map((item, index) => (
                <div 
                  key={index} 
                  className="grid grid-cols-12 gap-4 py-3 border-b border-gray-100 group"
                  data-testid={`invoice-item-${index}`}
                >
                  <div className="col-span-5 text-gray-900 font-medium">{item.name}</div>
                  <div className="col-span-2 text-gray-600 text-right">{item.quantity}</div>
                  <div className="col-span-2 text-gray-600 text-right">
                    ${item.unitPrice.toFixed(2)}
                  </div>
                  <div className="col-span-2 font-semibold text-gray-900 text-right">
                    ${item.total.toFixed(2)}
                  </div>
                  {!isPrintMode && onRemoveItem && (
                    <div className="col-span-1 flex justify-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveItem(index)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        data-testid={`button-remove-item-${index}`}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Invoice Totals */}
      <div className="border-t-2 border-gray-300 pt-6">
        <div className="flex justify-end">
          <div className="w-80 space-y-3">
            <div className="flex justify-between text-lg">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold" data-testid="text-subtotal">
                ${subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="text-gray-600">
                Tax (<span data-testid="text-tax-rate">{company.taxRate}</span>%)
              </span>
              <span className="font-semibold" data-testid="text-tax-amount">
                ${tax.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-2xl font-bold border-t-2 border-gray-300 pt-3">
              <span>Total</span>
              <span data-testid="text-total">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Thank You Message */}
      <div className="mt-12 pt-8 border-t-2 border-gray-300 text-center">
        <p className="text-gray-600 italic text-lg">Thank you for shopping with us!</p>
      </div>
    </div>
  );
}