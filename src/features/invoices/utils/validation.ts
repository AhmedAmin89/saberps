import { InvoiceLine, WarehouseStock } from '@/types';

export function validateStock(line: InvoiceLine, stockItem?: WarehouseStock): boolean {
  if (!stockItem) return false;
  return line.quantity <= stockItem.quantity_in_stock;
}

export function validateInvoiceLines(lines: InvoiceLine[]): boolean {
  return lines.length > 0 && lines.every(line => 
    line.quantity > 0 && line.unit_price > 0
  );
}

export function validateDiscount(discount: number, subtotal: number): boolean {
  return discount >= 0 && discount <= subtotal;
}