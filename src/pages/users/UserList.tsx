import { useQuery } from '@tanstack/react-query';
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table';
import { useState } from 'react';
import { User } from '../../types';
import { users } from '../../lib/api';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const columnHelper = createColumnHelper<User>();

export default function UserList() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const { data = [] } = useQuery({
    queryKey: ['users'],
    queryFn: users.getAll,
  });

  const columns = [
    columnHelper.accessor('username', {
      header: 'Username',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('role', {
      header: 'Role',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('created_at', {
      header: 'Created At',
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    }),
    columnHelper.display({
      id: 'actions',
      cell: (info) => (
        <div className="flex gap-2">
          <Link to={`/users/${info.row.original.id}/edit`}>
            <Button variant="ghost" size="sm">
              <Pencil className="h-4 w-4" />
            </Button>
          </Link>
          <Button variant="ghost" size="sm" className="text-red-600">
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
        <h1 className="text-2xl font-bold">Users</h1>
        <Link to="/users/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </Link>
      </div>
      <Table table={table} />
    </div>
  );
}