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
import { collections } from '../../../lib/api';
import { Table } from '../../../components/ui/Table';
import { Search } from '../../../components/ui/Search';
import { Collection } from '../../../types';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

const columnHelper = createColumnHelper<Collection>();

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

export default function CollectionList() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data = [] } = useQuery({
    queryKey: ['collections'],
    queryFn: collections.getAll,
  });

  const columns = [
    columnHelper.accessor('collection_date', {
      header: 'Date',
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    }),
    columnHelper.accessor('customer_name', {
      header: 'Customer',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('amount', {
      header: 'Amount',
      cell: (info) => formatPrice(info.getValue()),
    }),
    columnHelper.accessor('invoice_total', {
      header: 'Invoice Total',
      cell: (info) => formatPrice(info.getValue()),
    }),
    columnHelper.accessor('created_by_username', {
      header: 'Collected By',
      cell: (info) => info.getValue(),
    }),
    columnHelper.display({
      id: 'actions',
      cell: (info) => (
        <div className="flex gap-2">
          <Link to={`/invoice/${info.row.original.invoice_id}`}>
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
        <h1 className="text-2xl font-bold">Collections</h1>
      </div>

      <div className="max-w-sm">
        <Search
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search collections..."
        />
      </div>

      <Table table={table} />
    </div>
  );
}