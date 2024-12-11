import { Warehouse } from '../../types';

interface WarehouseDetailsProps {
  warehouse: Warehouse;
}

export function WarehouseDetails({ warehouse }: WarehouseDetailsProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Warehouse Details</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Name</p>
          <p className="text-base text-gray-900">{warehouse.name}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Assigned User</p>
          <p className="text-base text-gray-900">{warehouse.user?.username || 'Not assigned'}</p>
        </div>
      </div>
    </div>
  );
}