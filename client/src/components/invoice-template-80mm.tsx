import type { CompanyFormData } from "./company-form";
import type { ItemFormData } from "./item-form";

interface InvoiceItem extends ItemFormData {
  total: number;
}

interface InvoiceTemplate80mmProps {
  company: CompanyFormData;
  items: InvoiceItem[];
  invoiceNumber: string;
  currentDate: string;
}

export function InvoiceTemplate80mm({ 
  company, 
  items, 
  invoiceNumber, 
  currentDate
}: InvoiceTemplate80mmProps) {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * (company.taxRate / 100);
  const total = subtotal + tax;

  return (
    <div className="bg-white p-3 font-mono text-sm leading-relaxed print-content" style={{ width: '80mm' }} data-testid="invoice-80mm-template">
      {/* Header */}
      <div className="text-center mb-3">
        <div className="font-bold text-lg">JABERCO®</div>
        <div className="text-xs mt-1">
          {company.address || "2480 Cawthra Rd #16, Mississauga, ON"}
        </div>
        <div className="text-xs">
          Tel: {company.phone || "+1 289 216 6500"}
        </div>
        <div className="text-xs">
          {company.website || "www.jaberco.ca"}
        </div>
      </div>

      <div className="border-t border-dashed border-gray-400 my-3"></div>

      {/* Invoice Info */}
      <div className="mb-3 space-y-1">
        <div className="flex justify-between">
          <span className="font-semibold">Date:</span>
          <span>{currentDate}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Invoice #:</span>
          <span>{invoiceNumber}</span>
        </div>
      </div>

      <div className="border-t border-dashed border-gray-400 my-3"></div>

      {/* Items Header */}
      <div className="mb-2">
        <div className="font-bold text-center">ITEMS</div>
      </div>

      {/* Items */}
      <div className="mb-3">
        {items.map((item, index) => (
          <div key={index} className="mb-2 pb-2 border-b border-dotted border-gray-300">
            <div className="font-semibold mb-1">{item.name}</div>
            <div className="flex justify-between text-xs">
              <span>Qty: {item.quantity}</span>
              <span>Unit: ${item.unitPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total:</span>
              <span>${item.total.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-dashed border-gray-400 my-3"></div>

      {/* Totals */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax ({company.taxRate}%):</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="border-t border-solid border-gray-600 pt-2"></div>
        <div className="flex justify-between font-bold text-lg">
          <span>TOTAL:</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <div className="border-t border-dashed border-gray-400 my-3"></div>

      {/* Footer */}
      <div className="text-center">
        <div className="text-xs mb-2">
          Thank you for shopping with us!
        </div>
        <div className="text-[10px] text-gray-600">
          Powered by Jaberco Invoice System
        </div>
      </div>
    </div>
  );
}