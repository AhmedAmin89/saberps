import { InvoiceLine } from '@/types';

export function calculateLineTotal(quantity: number, unitPrice: number): number {
  return quantity * unitPrice;
}

export function calculateSubtotal(lines: InvoiceLine[]): number {
  return lines.reduce((sum, line) => sum + (line.line_total || 0), 0);
}

export function calculateTotal(subtotal: number, discount: number): number {
  return subtotal - (discount || 0);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}