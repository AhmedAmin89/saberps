import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table';
import { useState } from 'react';
import { WarehouseStock as WarehouseStockType } from '../../types';
import { warehouses } from '../../lib/api';
import { Table } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const columnHelper = createColumnHelper<WarehouseStockType>();

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

export default function WarehouseStock() {
  const { id } = useParams();
  const [sorting, setSorting] = useState<SortingState>([]);

  const { data: stock = [] } = useQuery({
    queryKey: ['warehouse-stock', id],
    queryFn: () => warehouses.getStock(Number(id)),
  });

  const columns = [
    columnHelper.accessor('item.name', {
      header: 'Item',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('quantity_in_stock', {
      header: 'Quantity',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('item.item_price', {
      header: 'Unit Price',
      cell: (info) => formatPrice(info.getValue() || 0),
    }),
    columnHelper.accessor(row => (row.quantity_in_stock * (row.item?.item_price || 0)), {
      id: 'total_value',
      header: 'Total Value',
      cell: (info) => formatPrice(info.getValue()),
    }),
  ];

  const table = useReactTable({
    data: stock,
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
        <h1 className="text-2xl font-bold">Warehouse Stock</h1>
        <Link to="/warehouses">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Warehouses
          </Button>
        </Link>
      </div>
      <Table table={table} />
    </div>
  );
}