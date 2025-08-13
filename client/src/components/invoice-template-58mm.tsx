import type { CompanyFormData } from "./company-form";
import type { ItemFormData } from "./item-form";

interface InvoiceItem extends ItemFormData {
  total: number;
}

interface InvoiceTemplate58mmProps {
  company: CompanyFormData;
  items: InvoiceItem[];
  invoiceNumber: string;
  currentDate: string;
}

export function InvoiceTemplate58mm({ 
  company, 
  items, 
  invoiceNumber, 
  currentDate
}: InvoiceTemplate58mmProps) {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * (company.taxRate / 100);
  const total = subtotal + tax;

  return (
    <div className="bg-white p-2 font-mono text-xs leading-tight print-content" style={{ width: '58mm' }} data-testid="invoice-58mm-template">
      {/* Header */}
      <div className="text-center mb-2">
        <div className="font-bold text-sm">JABERCO®</div>
        <div className="text-[10px]">
          {company.address || "2480 Cawthra Rd #16, Mississauga, ON"}
        </div>
        <div className="text-[10px]">
          Tel: {company.phone || "+1 (905) 555-0123"}
        </div>
        <div className="text-[10px]">
          {company.website || "www.jaberco.ca"}
        </div>
      </div>

      <div className="border-t border-dashed border-gray-400 my-2"></div>

      {/* Invoice Info */}
      <div className="mb-2">
        <div className="flex justify-between">
          <span>Date:</span>
          <span>{currentDate}</span>
        </div>
        <div className="flex justify-between">
          <span>Invoice:</span>
          <span>{invoiceNumber}</span>
        </div>
      </div>

      <div className="border-t border-dashed border-gray-400 my-2"></div>

      {/* Items */}
      <div className="mb-2">
        {items.map((item, index) => (
          <div key={index} className="mb-1">
            <div className="font-semibold">{item.name}</div>
            <div className="flex justify-between">
              <span>{item.quantity} x ${item.unitPrice.toFixed(2)}</span>
              <span>${item.total.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-dashed border-gray-400 my-2"></div>

      {/* Totals */}
      <div className="space-y-1">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax ({company.taxRate}%):</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold border-t border-solid border-gray-400 pt-1">
          <span>TOTAL:</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <div className="border-t border-dashed border-gray-400 my-2"></div>

      {/* Footer */}
      <div className="text-center text-[10px]">
        Thank you for shopping with us!
      </div>
      
      <div className="text-center text-[8px] mt-2">
        Powered by Jaberco Invoice System
      </div>
    </div>
  );
}