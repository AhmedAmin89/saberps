import { useQuery } from '@tanstack/react-query';
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table';
import { useState } from 'react';
import { Invoice } from '../../../types';
import { invoices } from '../../../lib/api';
import { Table } from '../../../components/ui/Table';
import { Button } from '../../../components/ui/Button';
import { Plus, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const columnHelper = createColumnHelper<Invoice>();

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

export default function InvoiceList() {
  const [sorting, setSorting] = useState<SortingState>([]);
  
  const { data = [] } = useQuery({
    queryKey: ['invoices'],
    queryFn: invoices.getAll,
  });

  const columns = [
    columnHelper.accessor('warehouse_name', {
      header: 'Warehouse',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('customer_name', {
      header: 'Customer',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('invoice_date', {
      header: 'Date',
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    }),
    columnHelper.accessor('payment_method', {
      header: 'Payment Method',
      cell: (info) => info.getValue().charAt(0).toUpperCase() + info.getValue().slice(1),
    }),
    columnHelper.accessor('total', {
      header: 'Total',
      cell: (info) => formatPrice(info.getValue()),
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => (
        <span className={`capitalize ${
          info.getValue() === 'settled' ? 'text-green-600' :
          info.getValue() === 'partially_settled' ? 'text-yellow-600' :
          info.getValue() === 'pending_payment' ? 'text-red-600' :
          'text-gray-600'
        }`}>
          {info.getValue().replace('_', ' ')}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      cell: (info) => (
        <div className="flex gap-2">
          <Link to={`/invoice/${info.row.original.id}`}>
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <Link to="/invoice/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        </Link>
      </div>

      <Table table={table} />
    </div>
  );
}