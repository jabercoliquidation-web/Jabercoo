import { Inbox, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { CompanyFormData } from "./company-form";
import type { ItemFormData } from "./item-form";

interface InvoiceItem extends ItemFormData {
  total: number;
}

interface InvoicePreviewProps {
  company: CompanyFormData;
  items: InvoiceItem[];
  invoiceNumber: string;
  currentDate: string;
  onRemoveItem: (index: number) => void;
}

export function InvoicePreview({ 
  company, 
  items, 
  invoiceNumber, 
  currentDate,
  onRemoveItem 
}: InvoicePreviewProps) {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * (company.taxRate / 100);
  const total = subtotal + tax;

  return (
    <Card className="print:shadow-none print:border-none" data-testid="invoice-preview">
      <div className="p-8">
        {/* Invoice Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-jaberco-blue mb-2">
              Jaberco<sup className="text-lg">®</sup>
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
            <p className="text-lg font-semibold text-gray-900">
              Invoice #: <span data-testid="text-invoice-number">{invoiceNumber}</span>
            </p>
          </div>
        </div>

        {/* Invoice Items */}
        <div className="mb-8">
          <div className="border-b border-gray-200 pb-4 mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Items</h3>
            
            {items.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500" data-testid="empty-items-state">
                <Inbox className="mx-auto h-12 w-12 mb-3 text-gray-400" />
                <p className="font-medium">No items added yet</p>
                <p className="text-sm">Add items using the form</p>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Header */}
                <div className="grid grid-cols-12 gap-4 py-2 border-b border-gray-100 font-medium text-sm text-gray-700">
                  <div className="col-span-5">Description</div>
                  <div className="col-span-2 text-right">Qty</div>
                  <div className="col-span-2 text-right">Unit Price</div>
                  <div className="col-span-2 text-right">Total</div>
                  <div className="col-span-1"></div>
                </div>
                
                {/* Items */}
                {items.map((item, index) => (
                  <div 
                    key={index} 
                    className="grid grid-cols-12 gap-4 py-2 border-b border-gray-100 group"
                    data-testid={`invoice-item-${index}`}
                  >
                    <div className="col-span-5 text-sm text-gray-900">{item.name}</div>
                    <div className="col-span-2 text-sm text-gray-600 text-right">{item.quantity}</div>
                    <div className="col-span-2 text-sm text-gray-600 text-right">
                      ${item.unitPrice.toFixed(2)}
                    </div>
                    <div className="col-span-2 text-sm font-medium text-gray-900 text-right">
                      ${item.total.toFixed(2)}
                    </div>
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
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Invoice Totals */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium" data-testid="text-subtotal">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Tax (<span data-testid="text-tax-rate">{company.taxRate}</span>%)
                </span>
                <span className="font-medium" data-testid="text-tax-amount">
                  ${tax.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                <span>Total</span>
                <span data-testid="text-total">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Thank You Message */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-gray-600 italic">Thank you for shopping with us!</p>
        </div>
      </div>
    </Card>
  );
}
