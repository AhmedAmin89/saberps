import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoices } from '@/lib/api';
import { InvoiceLine } from '@/types';

export function useInvoiceForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    warehouse_id: '',
    customer_id: '',
    payment_method: 'cash' as 'cash' | 'deferred',
    invoice_date: new Date().toISOString().split('T')[0],
    discount: 0,
    lines: [] as InvoiceLine[],
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

  const updateFormField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addInvoiceLine = (item: any) => {
    if (formData.lines.some(line => line.item_id === item.id)) {
      setError(`Item "${item.name}" is already in the invoice`);
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

  const updateInvoiceLine = (index: number, field: keyof InvoiceLine, value: number) => {
    setFormData(prev => ({
      ...prev,
      lines: prev.lines.map((line, i) => {
        if (i === index) {
          const updatedLine = { ...line, [field]: value };
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

  const removeInvoiceLine = (index: number) => {
    setFormData(prev => ({
      ...prev,
      lines: prev.lines.filter((_, i) => i !== index),
    }));
  };

  const calculateSubtotal = () => {
    return formData.lines.reduce((sum, line) => sum + (line.line_total || 0), 0);
  };

  const validateForm = () => {
    if (formData.lines.length === 0) {
      setError('Please add at least one item to the invoice');
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

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

  return {
    formData,
    error,
    mutation,
    updateFormField,
    addInvoiceLine,
    updateInvoiceLine,
    removeInvoiceLine,
    calculateSubtotal,
    handleSubmit,
  };
}