interface PaymentMethodSelectProps {
  selectedMethod: 'cash' | 'deferred';
  onChange: (method: 'cash' | 'deferred') => void;
}

export function PaymentMethodSelect({ selectedMethod, onChange }: PaymentMethodSelectProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">Payment Method</label>
      <select
        value={selectedMethod}
        onChange={(e) => onChange(e.target.value as 'cash' | 'deferred')}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        required
      >
        <option value="cash">Cash</option>
        <option value="deferred">Deferred</option>
      </select>
    </div>
  );
}