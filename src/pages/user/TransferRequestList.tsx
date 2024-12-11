import { useQuery } from '@tanstack/react-query';
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table';
import { useState } from 'react';
import { TransferRequest } from '../../types';
import { transferRequests } from '../../lib/api';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Plus, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const columnHelper = createColumnHelper<TransferRequest>();

export default function TransferRequestList() {
  const [sorting, setSorting] = useState<SortingState>([]);
  
  const { data = [] } = useQuery({
    queryKey: ['transfer-requests'],
    queryFn: transferRequests.getAll,
  });

  const columns = [
    columnHelper.accessor('from_warehouse_name', {
      header: 'From Warehouse',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('to_warehouse_name', {
      header: 'To Warehouse',
      cell: (info) => info.getValue(),
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
    columnHelper.accessor('created_at', {
      header: 'Created At',
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    }),
    columnHelper.display({
      id: 'actions',
      cell: (info) => (
        <div className="flex gap-2">
          <Link to={`/transfer-request/${info.row.original.id}`}>
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
        <h1 className="text-2xl font-bold">Transfer Requests</h1>
        <Link to="/transfer-request/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Transfer Request
          </Button>
        </Link>
      </div>

      <Table table={table} />
    </div>
  );
}