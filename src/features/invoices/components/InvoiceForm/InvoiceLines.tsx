import { ItemLookup } from '@/components/ui/ItemLookup';
import { InvoiceLineItem } from './InvoiceLineItem';
import { AlertCircle } from 'lucide-react';
import { InvoiceLine, WarehouseStock } from '@/types';

interface InvoiceLinesProps {
  lines: InvoiceLine[];
  stockData: WarehouseStock[];
  error: string | null;
  onAddItem: (item: any) => void;
  onUpdateLine: (index: number, field: keyof InvoiceLine, value: number) => void;
  onRemoveLine: (index: number) => void;
}

export function InvoiceLines({
  lines,
  stockData,
  error,
  onAddItem,
  onUpdateLine,
  onRemoveLine,
}: InvoiceLinesProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Invoice Lines</h2>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="relative">
        <ItemLookup
          items={stockData.map(stock => ({
            id: stock.item_id,
            name: stock.item_name || '',
            item_price: stock.item_price || 0,
          }))}
          selectedItems={lines.map(line => line.item_id)}
          onSelect={onAddItem}
        />
      </div>

      <div className="space-y-4">
        {lines.map((line, index) => {
          const stockItem = stockData.find(s => s.item_id === line.item_id);
          return (
            <InvoiceLineItem
              key={index}
              line={line}
              stockItem={stockItem}
              onUpdate={(field, value) => onUpdateLine(index, field, value)}
              onRemove={() => onRemoveLine(index)}
            />
          );
        })}
      </div>
    </div>
  );
}