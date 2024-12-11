import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { importOrders, warehouses, vendors, items } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { ItemLookup } from '../../components/ui/ItemLookup';
import { VendorDetails } from '../../components/ui/VendorDetails';
import { WarehouseDetails } from '../../components/ui/WarehouseDetails';
import { OrderSummary } from '../../components/ui/OrderSummary';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { ImportOrderItem, Item } from '../../types';

export default function ImportOrderForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    warehouse_id: '',
    vendor_id: '',
    order_date: new Date().toISOString().split('T')[0],
    items: [] as ImportOrderItem[],
  });

  const { data: warehousesData = [] } = useQuery({
    queryKey: ['warehouses'],
    queryFn: warehouses.getAll,
  });

  const { data: vendorsData = [] } = useQuery({
    queryKey: ['vendors'],
    queryFn: vendors.getAll,
  });

  const { data: itemsData = [] } = useQuery({
    queryKey: ['items'],
    queryFn: items.getAll,
  });

  const selectedWarehouse = warehousesData.find(w => w.id === Number(formData.warehouse_id));
  const selectedVendor = vendorsData.find(v => v.id === Number(formData.vendor_id));

  const mutation = useMutation({
    mutationFn: importOrders.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['import-orders'] });
      navigate('/import-orders');
    },
  });

  const validateOrder = () => {
    if (formData.items.length === 0) {
      setValidationError('Please add at least one item to the order');
      return false;
    }
    
    for (const item of formData.items) {
      if (item.quantity <= 0) {
        setValidationError('Quantity must be greater than 0');
        return false;
      }
      if (item.unit_price <= 0) {
        setValidationError('Unit price must be greater than 0');
        return false;
      }
    }

    setValidationError(null);
    return true;
  };

  const handleItemSelect = (item: Item) => {
    if (formData.items.some(i => i.item_id === item.id)) {
      setDuplicateError(`Item "${item.name}" is already in the order`);
      return;
    }
    setDuplicateError(null);
    setValidationError(null);
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { item_id: item.id, quantity: 1, unit_price: item.item_price }],
    }));
  };

  const removeItem = (index: number) => {
    setDuplicateError(null);
    setValidationError(null);
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateItem = (index: number, field: keyof ImportOrderItem, value: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateOrder()) return;

    const payload = {
      ...formData,
      warehouse_id: Number(formData.warehouse_id),
      vendor_id: Number(formData.vendor_id),
    };
    mutation.mutate(payload);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create Import Order</h1>

      {selectedVendor && <VendorDetails vendor={selectedVendor} />}
      {selectedWarehouse && <WarehouseDetails warehouse={selectedWarehouse} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Warehouse</label>
            <select
              value={formData.warehouse_id}
              onChange={e => setFormData(prev => ({ ...prev, warehouse_id: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            >
              <option value="">Select a warehouse</option>
              {warehousesData.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Vendor</label>
            <select
              value={formData.vendor_id}
              onChange={e => setFormData(prev => ({ ...prev, vendor_id: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            >
              <option value="">Select a vendor</option>
              {vendorsData.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Order Date</label>
            <input
              type="date"
              value={formData.order_date}
              onChange={e => setFormData(prev => ({ ...prev, order_date: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Items</h2>
          </div>

          {(duplicateError || validationError) && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md">
              <AlertCircle className="h-5 w-5" />
              <span>{duplicateError || validationError}</span>
            </div>
          )}

          <div className="relative">
            <ItemLookup
              items={itemsData}
              selectedItems={formData.items.map(item => item.item_id)}
              onSelect={handleItemSelect}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {formData.items.map((item, index) => {
                const itemDetails = itemsData.find(i => i.id === item.item_id);
                return (
                  <div key={index} className="flex gap-4 items-start p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">Item</label>
                      <div className="mt-1 text-sm">
                        {itemDetails?.name}
                      </div>
                    </div>
                    <div className="w-32">
                      <label className="block text-sm font-medium text-gray-700">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={e => updateItem(index, 'quantity', Number(e.target.value))}
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
                        value={item.unit_price}
                        onChange={e => updateItem(index, 'unit_price', Number(e.target.value))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        required
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mt-6 text-red-600"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
            
            {formData.items.length > 0 && (
              <div className="sticky top-4">
                <OrderSummary items={formData.items} allItems={itemsData} />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/import-orders')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Creating...' : 'Create Order'}
          </Button>
        </div>
      </form>
    </div>
  );
}