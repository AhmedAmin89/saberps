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
import { warehouses } from '../../lib/api';
import { Table } from '../../components/ui/Table';
import { Search } from '../../components/ui/Search';
import { WarehouseStock } from '../../types';

const columnHelper = createColumnHelper<WarehouseStock>();

export default function StockOverview() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');

  const { data: warehousesData = [] } = useQuery({
    queryKey: ['warehouses'],
    queryFn: warehouses.getAll,
  });

  const { data: stockData = [], isLoading } = useQuery({
    queryKey: ['warehouse-stock', selectedWarehouse],
    queryFn: () => selectedWarehouse ? warehouses.getStock(Number(selectedWarehouse)) : Promise.resolve([]),
    enabled: Boolean(selectedWarehouse),
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Stock Overview</h1>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Warehouse
          </label>
          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Select a warehouse</option>
            {warehousesData.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </option>
            ))}
          </select>
        </div>
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

      {selectedWarehouse ? (
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