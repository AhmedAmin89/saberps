import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../lib/auth';
import { warehouses, transferRequests } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { ItemLookup } from '../../components/ui/ItemLookup';
import { WarehouseSelect } from '../../components/ui/WarehouseSelect';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { TransferRequestItem } from '../../types';

export default function TransferRequest() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    from_warehouse_id: '',
    to_warehouse_id: '',
    items: [] as TransferRequestItem[],
  });

  // Fetch all warehouses for source selection
  const { data: allWarehouses = [] } = useQuery({
    queryKey: ['warehouses'],
    queryFn: warehouses.getAll,
  });

  // Fetch warehouses assigned to the user for destination selection
  const { data: userWarehouses = [] } = useQuery({
    queryKey: ['user-warehouses'],
    queryFn: warehouses.getAll,
    select: (data) => data.filter(w => w.user_id === user?.id),
  });

  // Get stock data for the selected source warehouse
  const { data: sourceWarehouseStock = [] } = useQuery({
    queryKey: ['warehouse-stock', formData.from_warehouse_id],
    queryFn: () => formData.from_warehouse_id ? warehouses.getStock(Number(formData.from_warehouse_id)) : Promise.resolve([]),
    enabled: Boolean(formData.from_warehouse_id),
  });

  const mutation = useMutation({
    mutationFn: transferRequests.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfer-requests'] });
      navigate('/transfer-request');
    },
    onError: (error: any) => {
      setValidationError(error.response?.data?.message || 'An error occurred while creating the transfer request');
    }
  });

  const validateTransfer = () => {
    if (!formData.from_warehouse_id || !formData.to_warehouse_id) {
      setValidationError('Please select both source and destination warehouses');
      return false;
    }

    if (formData.from_warehouse_id === formData.to_warehouse_id) {
      setValidationError('Source and destination warehouses must be different');
      return false;
    }

    if (formData.items.length === 0) {
      setValidationError('Please add at least one item to transfer');
      return false;
    }

    // Check if quantities are valid
    for (const item of formData.items) {
      const stockItem = sourceWarehouseStock.find(s => s.item_id === item.item_id);
      if (!stockItem || item.quantity > stockItem.quantity_in_stock) {
        setValidationError(`Insufficient stock for one or more items`);
        return false;
      }
      if (item.quantity <= 0) {
        setValidationError('Quantity must be greater than 0');
        return false;
      }
    }

    setValidationError(null);
    return true;
  };

  const handleItemSelect = (item: any) => {
    if (formData.items.some(i => i.item_id === item.id)) {
      setDuplicateError(`Item "${item.name}" is already in the transfer`);
      return;
    }
    setDuplicateError(null);
    setValidationError(null);
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { item_id: item.id, quantity: 1 }],
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

  const updateItem = (index: number, quantity: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, quantity } : item
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateTransfer()) return;

    try {
      const payload = {
        from_warehouse_id: Number(formData.from_warehouse_id),
        to_warehouse_id: Number(formData.to_warehouse_id),
        items: formData.items.map(item => ({
          item_id: item.item_id,
          quantity: item.quantity
        }))
      };
      
      await mutation.mutateAsync(payload);
    } catch (error) {
      // Error handling is done in mutation's onError callback
      console.error('Transfer request creation failed:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create Transfer Request</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">From Warehouse</label>
            <select
              value={formData.from_warehouse_id}
              onChange={e => setFormData(prev => ({ ...prev, from_warehouse_id: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            >
              <option value="">Select source warehouse</option>
              {allWarehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">To Warehouse</label>
            <select
              value={formData.to_warehouse_id}
              onChange={e => setFormData(prev => ({ ...prev, to_warehouse_id: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            >
              <option value="">Select destination warehouse</option>
              {userWarehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(duplicateError || validationError) && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md">
            <AlertCircle className="h-5 w-5" />
            <span>{duplicateError || validationError}</span>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Items to Transfer</h2>
          </div>

          {formData.from_warehouse_id && (
            <div className="relative">
              <ItemLookup
                items={sourceWarehouseStock.map(stock => ({
                  id: stock.item_id,
                  name: stock.item_name || '',
                  item_price: stock.item_price || 0,
                  quantity_in_stock: stock.quantity_in_stock,
                }))}
                selectedItems={formData.items.map(item => item.item_id)}
                onSelect={handleItemSelect}
              />
            </div>
          )}
          
          <div className="space-y-4">
            {formData.items.map((item, index) => {
              const stockItem = sourceWarehouseStock.find(s => s.item_id === item.item_id);
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
                      value={item.quantity}
                      onChange={e => updateItem(index, Number(e.target.value))}
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
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/transfer-request')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Creating...' : 'Create Transfer Request'}
          </Button>
        </div>
      </form>
    </div>
  );
}