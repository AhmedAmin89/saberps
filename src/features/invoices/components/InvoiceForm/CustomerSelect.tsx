import { Customer } from '@/types';

interface CustomerSelectProps {
  customers: Customer[];
  selectedCustomerId: string;
  onChange: (customerId: string) => void;
}

export function CustomerSelect({ customers, selectedCustomerId, onChange }: CustomerSelectProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">Customer</label>
      <select
        value={selectedCustomerId}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        required
      >
        <option value="">Select customer</option>
        {customers.map((customer) => (
          <option key={customer.id} value={customer.id}>
            {customer.name}
          </option>
        ))}
      </select>
    </div>
  );
}