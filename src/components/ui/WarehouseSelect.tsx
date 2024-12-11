import React from 'react';
import { Warehouse } from '../../types';

interface WarehouseSelectProps {
  warehouses: Warehouse[];
  selectedWarehouseId: string;
  onChange: (warehouseId: string) => void;
}

export function WarehouseSelect({ warehouses, selectedWarehouseId, onChange }: WarehouseSelectProps) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Select Warehouse
      </label>
      <select
        value={selectedWarehouseId}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      >
        <option value="">Select a warehouse</option>
        {warehouses.map((warehouse) => (
          <option key={warehouse.id} value={warehouse.id}>
            {warehouse.name}
          </option>
        ))}
      </select>
    </div>
  );
}