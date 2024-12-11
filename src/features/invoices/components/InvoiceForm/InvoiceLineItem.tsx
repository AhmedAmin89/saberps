import { Button } from '@/components/ui/Button';
import { Trash2 } from 'lucide-react';
import { InvoiceLine, WarehouseStock } from '@/types';

interface InvoiceLineItemProps {
  line: InvoiceLine;
  stockItem: WarehouseStock | undefined;
  onUpdate: (field: keyof InvoiceLine, value: number) => void;
  onRemove: () => void;
}

export function InvoiceLineItem({ line, stockItem, onUpdate, onRemove }: InvoiceLineItemProps) {
  return (
    <div className="flex gap-4 items-start p-4 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700">Item</label>
        <div className="mt-1 text-sm">
          {stockItem?.item_name}
          <span className="text-gray-500 ml-2">
            (Available: {stockItem?.quantity_in_stock})
          </span>
        </div>
      </div>
      <div className="w-32">
        <label className="block text-sm font-medium text-gray-700">Quantity</label>
        <input
          type="number"
          min="1"
          max={stockItem?.quantity_in_stock}
          value={line.quantity}
          onChange={(e) => onUpdate('quantity', Number(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>
      <div className="w-32">
        <label className="block text-sm font-medium text-gray-700">Unit Price</label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={line.unit_price}
          onChange={(e) => onUpdate('unit_price', Number(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>
      <div className="w-32">
        <label className="block text-sm font-medium text-gray-700">Total</label>
        <div className="mt-3 text-sm font-medium">
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
          }).format(line.line_total || 0)}
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="mt-6 text-red-600"
        onClick={onRemove}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}