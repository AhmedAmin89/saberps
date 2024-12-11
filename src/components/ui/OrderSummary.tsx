import { ImportOrderItem, Item } from '../../types';

interface OrderSummaryProps {
  items: ImportOrderItem[];
  allItems: Item[];
}

export function OrderSummary({ items, allItems }: OrderSummaryProps) {
  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * Number(item.unit_price || 0)), 0);
  };

  const formatPrice = (price: number | null | undefined): string => {
    if (typeof price !== 'number') return '$0.00';
    return `$${Number(price).toFixed(2)}`;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
      <div className="space-y-4">
        {items.map((item, index) => {
          const itemDetails = allItems.find(i => i.id === item.item_id);
          const total = item.quantity * Number(item.unit_price || 0);
          
          return (
            <div key={index} className="flex justify-between items-center py-2 border-b">
              <div>
                <p className="font-medium">{itemDetails?.name}</p>
                <p className="text-sm text-gray-500">
                  {item.quantity} × {formatPrice(item.unit_price)}
                </p>
              </div>
              <p className="font-medium">{formatPrice(total)}</p>
            </div>
          );
        })}
        
        <div className="pt-4 flex justify-between items-center font-semibold">
          <p>Total</p>
          <p>{formatPrice(calculateSubtotal())}</p>
        </div>
      </div>
    </div>
  );
}