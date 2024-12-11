import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useAuth } from '../../lib/auth';
import { warehouses } from '../../lib/api';
import { Table } from '../../components/ui/Table';
import { Search } from '../../components/ui/Search';
import { WarehouseSelect } from '../../components/ui/WarehouseSelect';
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
} from '@tanstack/react-table';
import { WarehouseStock } from '../../types';

const columnHelper = createColumnHelper<WarehouseStock>();

const formatPrice = (price: number | null | undefined): string => {
  if (typeof price !== 'number') return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

export default function StockCheck() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('');
  const { user } = useAuth();

  // Fetch warehouses assigned to the user
  const { data: warehousesData = [] } = useQuery({
    queryKey: ['warehouses'],
    queryFn: warehouses.getAll,
    select: (data) => data.filter(w => w.user_id === user?.id),
  });

  const { data: stockData = [], isLoading } = useQuery({
    queryKey: ['warehouse-stock', selectedWarehouseId],
    queryFn: () => selectedWarehouseId ? warehouses.getStock(Number(selectedWarehouseId)) : Promise.resolve([]),
    enabled: Boolean(selectedWarehouseId),
  });

  const columns = [
    columnHelper.accessor('item_name', {
      header: 'Item',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('quantity_in_stock', {
      header: 'Quantity',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('item_price', {
      header: 'Unit Price',
      cell: (info) => formatPrice(info.getValue()),
    }),
    columnHelper.accessor(
      row => (row.quantity_in_stock * (Number(row.item_price) || 0)),
      {
        id: 'total_value',
        header: 'Total Value',
        cell: (info) => formatPrice(info.getValue()),
      }
    ),
  ];

  const table = useReactTable({
    data: stockData,
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

  if (warehousesData.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-8 bg-yellow-50 rounded-lg">
          <h2 className="text-lg font-semibold text-yellow-800">No Warehouse Assigned</h2>
          <p className="mt-2 text-sm text-yellow-600">
            You currently don't have any warehouse assigned to you. Please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Stock Check</h1>
        <p className="mt-2 text-gray-600">
          View stock levels for your assigned warehouses
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <WarehouseSelect
          warehouses={warehousesData}
          selectedWarehouseId={selectedWarehouseId}
          onChange={setSelectedWarehouseId}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search Items
          </label>
          <Search
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search items..."
          />
        </div>
      </div>

      {selectedWarehouseId ? (
        isLoading ? (
          <div className="text-center py-8">Loading stock data...</div>
        ) : stockData.length > 0 ? (
          <Table table={table} />
        ) : (
          <div className="text-center py-8 text-gray-500">
            No stock data available for this warehouse
          </div>
        )
      ) : (
        <div className="text-center py-8 text-gray-500">
          Please select a warehouse to view stock data
        </div>
      )}
    </div>
  );
}