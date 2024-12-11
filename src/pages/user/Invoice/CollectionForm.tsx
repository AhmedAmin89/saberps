import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { collections } from '../../../lib/api';
import { Button } from '../../../components/ui/Button';
import { AlertCircle } from 'lucide-react';

interface CollectionFormProps {
  invoiceId: number;
  remainingAmount: number;
}

export function CollectionForm({ invoiceId, remainingAmount }: CollectionFormProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    amount: remainingAmount,
    collection_date: new Date().toISOString().split('T')[0],
  });

  const mutation = useMutation({
    mutationFn: collections.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices', invoiceId] });
      setFormData(prev => ({
        ...prev,
        amount: 0,
      }));
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'An error occurred while recording the collection');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount <= 0) {
      setError('Collection amount must be greater than 0');
      return;
    }
    if (formData.amount > remainingAmount) {
      setError('Collection amount cannot exceed remaining balance');
      return;
    }

    try {
      await mutation.mutateAsync({
        invoice_id: invoiceId,
        ...formData,
      });
    } catch (error) {
      console.error('Collection creation failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Amount</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              step="0.01"
              min="0"
              max={remainingAmount}
              value={formData.amount}
              onChange={e => setFormData(prev => ({ 
                ...prev, 
                amount: Number(e.target.value)
              }))}
              className="pl-7 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Remaining balance: ${remainingAmount.toFixed(2)}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Collection Date</label>
          <input
            type="date"
            value={formData.collection_date}
            onChange={e => setFormData(prev => ({ 
              ...prev, 
              collection_date: e.target.value
            }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Recording...' : 'Record Collection'}
        </Button>
      </div>
    </form>
  );
}