interface InvoiceSummaryProps {
  subtotal: number;
  discount: number;
  onDiscountChange: (discount: number) => void;
}

export function InvoiceSummary({ subtotal, discount, onDiscountChange }: InvoiceSummaryProps) {
  const total = subtotal - discount;

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="border-t pt-4 space-y-2">
      <div className="flex justify-end items-center">
        <span className="text-sm font-medium text-gray-500 mr-4">Subtotal:</span>
        <span className="text-lg font-medium">{formatPrice(subtotal)}</span>
      </div>
      <div className="flex justify-end items-center">
        <span className="text-sm font-medium text-gray-500 mr-4">Discount:</span>
        <input
          type="number"
          step="0.01"
          min="0"
          max={subtotal}
          value={discount}
          onChange={(e) => onDiscountChange(Number(e.target.value))}
          className="w-32 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div className="flex justify-end items-center">
        <span className="text-sm font-medium text-gray-500 mr-4">Total:</span>
        <span className="text-xl font-bold">{formatPrice(total)}</span>
      </div>
    </div>
  );
}