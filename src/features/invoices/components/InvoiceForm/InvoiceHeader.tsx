import { CustomerSelect } from './CustomerSelect';
import { PaymentMethodSelect } from './PaymentMethodSelect';
import { WarehouseSelect } from '@/components/ui/WarehouseSelect';
import { Customer, Warehouse } from '@/types';

interface InvoiceHeaderProps {
  warehouses: Warehouse[];
  customers: Customer[];
  formData: {
    warehouse_id: string;
    customer_id: string;
    payment_method: 'cash' | 'deferred';
    invoice_date: string;
  };
  onChange: (field: string, value: string) => void;
}

export function InvoiceHeader({ warehouses, customers, formData, onChange }: InvoiceHeaderProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <WarehouseSelect
        warehouses={warehouses}
        selectedWarehouseId={formData.warehouse_id}
        onChange={(value) => onChange('warehouse_id', value)}
      />
      
      <CustomerSelect
        customers={customers}
        selectedCustomerId={formData.customer_id}
        onChange={(value) => onChange('customer_id', value)}
      />
      
      <PaymentMethodSelect
        selectedMethod={formData.payment_method}
        onChange={(value) => onChange('payment_method', value)}
      />
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Invoice Date</label>
        <input
          type="date"
          value={formData.invoice_date}
          onChange={(e) => onChange('invoice_date', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>
    </div>
  );
}