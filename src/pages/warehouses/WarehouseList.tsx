import { useQuery } from '@tanstack/react-query';
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table';
import { useState } from 'react';
import { Warehouse } from '../../types';
import { warehouses, users } from '../../lib/api';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const columnHelper = createColumnHelper<Warehouse>();

export default function WarehouseList() {
  const [sorting, setSorting] = useState<SortingState>([]);
  
  const { data: warehousesData = [] } = useQuery({
    queryKey: ['warehouses'],
    queryFn: warehouses.getAll,
  });

  const { data: usersData = [] } = useQuery({
    queryKey: ['users'],
    queryFn: users.getAll,
  });

  // Combine warehouse data with user data
  const data = warehousesData.map(warehouse => ({
    ...warehouse,
    user: usersData.find(user => user.id === warehouse.user_id),
  }));

  const columns = [
    columnHelper.accessor('name', {
      header: 'Name',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('user', {
      header: 'Assigned User',
      cell: (info) => info.getValue()?.username || 'Not assigned',
    }),
    columnHelper.accessor('created_at', {
      header: 'Created At',
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    }),
    columnHelper.display({
      id: 'actions',
      cell: (info) => (
        <div className="flex gap-2">
          <Link to={`/warehouses/${info.row.original.id}/edit`}>
            <Button variant="ghost" size="sm">
              <Pencil className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600"
            onClick={() => warehouses.delete(info.row.original.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
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
        <h1 className="text-2xl font-bold">Warehouses</h1>
        <Link to="/warehouses/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Warehouse
          </Button>
        </Link>
      </div>
      <Table table={table} />
    </div>
  );
}