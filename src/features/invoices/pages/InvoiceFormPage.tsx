import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { warehouses, customers } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { InvoiceHeader } from '../components/InvoiceForm/InvoiceHeader';
import { InvoiceLines } from '../components/InvoiceForm/InvoiceLines';
import { InvoiceSummary } from '../components/InvoiceForm/InvoiceSummary';
import { useInvoiceForm } from '../hooks/useInvoiceForm';

export default function InvoiceFormPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    formData,
    error,
    mutation,
    updateFormField,
    addInvoiceLine,
    updateInvoiceLine,
    removeInvoiceLine,
    calculateSubtotal,
    handleSubmit,
  } = useInvoiceForm();

  const { data: warehousesData = [] } = useQuery({
    queryKey: ['warehouses'],
    queryFn: warehouses.getAll,
    select: (data) => data.filter(w => w.user_id === user?.id),
  });

  const { data: customersData = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: customers.getAll,
  });

  const { data: stockData = [] } = useQuery({
    queryKey: ['warehouse-stock', formData.warehouse_id],
    queryFn: () => formData.warehouse_id ? warehouses.getStock(Number(formData.warehouse_id)) : Promise.resolve([]),
    enabled: Boolean(formData.warehouse_id),
  });

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create Invoice</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <InvoiceHeader
          warehouses={warehousesData}
          customers={customersData}
          formData={formData}
          onChange={updateFormField}
        />

        <InvoiceLines
          lines={formData.lines}
          stockData={stockData}
          error={error}
          onAddItem={addInvoiceLine}
          onUpdateLine={updateInvoiceLine}
          onRemoveLine={removeInvoiceLine}
        />

        <InvoiceSummary
          subtotal={calculateSubtotal()}
          discount={formData.discount}
          onDiscountChange={(value) => updateFormField('discount', value)}
        />

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/invoice')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Creating...' : 'Create Invoice'}
          </Button>
        </div>
      </form>
    </div>
  );
}