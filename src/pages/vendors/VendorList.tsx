import { useQuery } from '@tanstack/react-query';
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
} from '@tanstack/react-table';
import { useState } from 'react';
import { Vendor } from '../../types';
import { vendors } from '../../lib/api';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Search } from '../../components/ui/Search';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const columnHelper = createColumnHelper<Vendor>();

export default function VendorList() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data = [] } = useQuery({
    queryKey: ['vendors'],
    queryFn: vendors.getAll,
  });

  const columns = [
    columnHelper.accessor('name', {
      header: 'Name',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('mobile_number', {
      header: 'Mobile',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('address', {
      header: 'Address',
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
          <Link to={`/vendors/${info.row.original.id}/edit`}>
            <Button variant="ghost" size="sm">
              <Pencil className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600"
            onClick={() => vendors.delete(info.row.original.id)}
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
      globalFilter: searchQuery,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const value = row.getValue(columnId);
      return value?.toString().toLowerCase().includes(filterValue.toLowerCase());
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Vendors</h1>
        <Link to="/vendors/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Vendor
          </Button>
        </Link>
      </div>
      <div className="max-w-sm">
        <Search
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search vendors..."
        />
      </div>
      <Table table={table} />
    </div>
  );
}