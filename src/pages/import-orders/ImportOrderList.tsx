import { useQuery } from '@tanstack/react-query';
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table';
import { useState } from 'react';
import { ImportOrder } from '../../types';
import { importOrders } from '../../lib/api';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Plus, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const columnHelper = createColumnHelper<ImportOrder>();

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

export default function ImportOrderList() {
  const [sorting, setSorting] = useState<SortingState>([]);
  
  const { data = [] } = useQuery({
    queryKey: ['import-orders'],
    queryFn: importOrders.getAll,
  });

  const columns = [
    columnHelper.accessor('warehouse_name', {
      header: 'Warehouse',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('vendor_name', {
      header: 'Vendor',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('order_date', {
      header: 'Order Date',
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    }),
    columnHelper.accessor('total_cost', {
      header: 'Total Cost',
      cell: (info) => formatPrice(info.getValue()),
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => (
        <span className={`capitalize ${
          info.getValue() === 'completed' ? 'text-green-600' :
          info.getValue() === 'cancelled' ? 'text-red-600' :
          'text-yellow-600'
        }`}>
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      cell: (info) => (
        <div className="flex gap-2">
          <Link to={`/import-orders/${info.row.original.id}`}>
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
        <h1 className="text-2xl font-bold">Import Orders</h1>
        <Link to="/import-orders/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Import Order
          </Button>
        </Link>
      </div>

      <Table table={table} />
    </div>
  );
}