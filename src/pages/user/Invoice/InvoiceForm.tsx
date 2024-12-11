import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoices, warehouses, customers, items } from '../../../lib/api';
import { useAuth } from '../../../lib/auth';
import { Button } from '../../../components/ui/Button';
import { ItemLookup } from '../../../components/ui/ItemLookup';
import { AlertCircle } from 'lucide-react';
import { InvoiceLine } from '../../../types';

export default function InvoiceForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    warehouse_id: '',
    customer_id: '',
    payment_method: 'cash' as 'cash' | 'deferred',
    invoice_date: new Date().toISOString().split('T')[0],
    discount: 0,
    lines: [] as InvoiceLine[],
  });

  // Fetch user's warehouses
  const { data: warehousesData = [] } = useQuery({
    queryKey: ['warehouses'],
    queryFn: warehouses.getAll,
    select: (data) => data.filter(w => w.user_id === user?.id),
  });

  const { data: customersData = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: customers.getAll,
  });

  // Get stock data for selected warehouse
  const { data: stockData = [] } = useQuery({
    queryKey: ['warehouse-stock', formData.warehouse_id],
    queryFn: () => formData.warehouse_id ? warehouses.getStock(Number(formData.warehouse_id)) : Promise.resolve([]),
    enabled: Boolean(formData.warehouse_id),
  });

  const mutation = useMutation({
    mutationFn: invoices.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      navigate('/invoice');
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'An error occurred while creating the invoice');
    },
  });

  const calculateSubtotal = () => {
    return formData.lines.reduce((sum, line) => sum + (line.line_total || 0), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() - (formData.discount || 0);
  };

  const handleItemSelect = (item: any) => {
    if (formData.lines.some(line => line.item_id === item.id)) {
      setError(`Item "${item.name}" is already in the invoice`);
      return;
    }
    
    const stockItem = stockData.find(s => s.item_id === item.id);
    if (!stockItem || stockItem.quantity_in_stock <= 0) {
      setError(`Item "${item.name}" is out of stock`);
      return;
    }

    setError(null);
    const quantity = 1;
    const unit_price = Number(item.item_price) || 0;
    setFormData(prev => ({
      ...prev,
      lines: [...prev.lines, {
        item_id: item.id,
        quantity,
        unit_price,
        line_total: quantity * unit_price,
        item_name: item.name,
      }],
    }));
  };

  const updateLine = (index: number, field: keyof InvoiceLine, value: number) => {
    setFormData(prev => ({
      ...prev,
      lines: prev.lines.map((line, i) => {
        if (i === index) {
          const updatedLine = { ...line, [field]: value };
          // Recalculate line_total whenever quantity or unit_price changes
          if (field === 'quantity' || field === 'unit_price') {
            const quantity = field === 'quantity' ? value : line.quantity;
            const unit_price = field === 'unit_price' ? value : line.unit_price;
            updatedLine.line_total = quantity * unit_price;
          }
          return updatedLine;
        }
        return line;
      }),
    }));
  };

  const removeLine = (index: number) => {
    setFormData(prev => ({
      ...prev,
      lines: prev.lines.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.lines.length === 0) {
      setError('Please add at least one item to the invoice');
      return;
    }

    try {
      const payload = {
        ...formData,
        warehouse_id: Number(formData.warehouse_id),
        customer_id: Number(formData.customer_id),
        discount: Number(formData.discount) || 0,
        lines: formData.lines.map(line => ({
          ...line,
          quantity: Number(line.quantity),
          unit_price: Number(line.unit_price),
          line_total: Number(line.line_total),
        })),
      };
      await mutation.mutateAsync(payload);
    } catch (error) {
      console.error('Invoice creation failed:', error);
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create Invoice</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Warehouse</label>
            <select
              value={formData.warehouse_id}
              onChange={e => setFormData(prev => ({ ...prev, warehouse_id: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            >
              <option value="">Select warehouse</option>
              {warehousesData.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Customer</label>
            <select
              value={formData.customer_id}
              onChange={e => setFormData(prev => ({ ...prev, customer_id: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            >
              <option value="">Select customer</option>
              {customersData.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Payment Method</label>
            <select
              value={formData.payment_method}
              onChange={e => setFormData(prev => ({ 
                ...prev, 
                payment_method: e.target.value as 'cash' | 'deferred'
              }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            >
              <option value="cash">Cash</option>
              <option value="deferred">Deferred</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Invoice Date</label>
            <input
              type="date"
              value={formData.invoice_date}
              onChange={e => setFormData(prev => ({ ...prev, invoice_date: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Invoice Lines</h2>
          </div>

          {formData.warehouse_id && (
            <div className="relative">
              <ItemLookup
                items={stockData.map(stock => ({
                  id: stock.item_id,
                  name: stock.item_name || '',
                  item_price: stock.item_price || 0,
                }))}
                selectedItems={formData.lines.map(line => line.item_id)}
                onSelect={handleItemSelect}
              />
            </div>
          )}

          <div className="space-y-4">
            {formData.lines.map((line, index) => {
              const stockItem = stockData.find(s => s.item_id === line.item_id);
              return (
                <div key={index} className="flex gap-4 items-start p-4 bg-gray-50 rounded-lg">
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
                      onChange={e => updateLine(index, 'quantity', Number(e.target.value))}
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
                      onChange={e => updateLine(index, 'unit_price', Number(e.target.value))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div className="w-32">
                    <label className="block text-sm font-medium text-gray-700">Total</label>
                    <div className="mt-3 text-sm font-medium">
                      {formatPrice(line.line_total || 0)}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-6 text-red-600"
                    onClick={() => removeLine(index)}
                  >
                    Remove
                  </Button>
                </div>
              );
            })}
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-end items-center">
              <span className="text-sm font-medium text-gray-500 mr-4">Subtotal:</span>
              <span className="text-lg font-medium">{formatPrice(calculateSubtotal())}</span>
            </div>
            <div className="flex justify-end items-center">
              <span className="text-sm font-medium text-gray-500 mr-4">Discount:</span>
              <input
                type="number"
                step="0.01"
                min="0"
                max={calculateSubtotal()}
                value={formData.discount}
                onChange={e => setFormData(prev => ({ 
                  ...prev, 
                  discount: Number(e.target.value)
                }))}
                className="w-32 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div className="flex justify-end items-center">
              <span className="text-sm font-medium text-gray-500 mr-4">Total:</span>
              <span className="text-xl font-bold">{formatPrice(calculateTotal())}</span>
            </div>
          </div>
        </div>

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