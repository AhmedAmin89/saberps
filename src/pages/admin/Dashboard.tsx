import { useAuth } from '../../lib/auth';
import { useQuery } from '@tanstack/react-query';
import { Users, Package, Warehouse, Truck, FileInput, BarChart2, ArrowLeftRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { transferRequests } from '../../lib/api';

export default function AdminDashboard() {
  const { user } = useAuth();

  // Fetch transfer requests to get pending count
  const { data: transferRequestsData = [] } = useQuery({
    queryKey: ['transfer-requests'],
    queryFn: transferRequests.getAll,
  });

  const pendingTransfers = transferRequestsData.filter(tr => tr.status === 'pending').length;

  const menuItems = [
    { icon: Users, label: 'Users', path: '/users', description: 'Manage system users' },
    { icon: Package, label: 'Items', path: '/items', description: 'Manage inventory items' },
    { icon: Users, label: 'Customers', path: '/customers', description: 'Manage customers' },
    { icon: Warehouse, label: 'Warehouses', path: '/warehouses', description: 'Manage warehouses' },
    { icon: Truck, label: 'Vendors', path: '/vendors', description: 'Manage vendors' },
    { icon: FileInput, label: 'Import Orders', path: '/import-orders', description: 'Manage import orders' },
    { 
      icon: ArrowLeftRight, 
      label: 'Transfer Requests', 
      path: '/admin/transfer-requests', 
      description: 'Manage transfer requests',
      badge: pendingTransfers > 0 ? pendingTransfers : undefined
    },
    { icon: BarChart2, label: 'Stock Overview', path: '/warehouse-stock', description: 'View stock levels' },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Welcome, {user?.username}!</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-indigo-100 p-3 rounded-lg">
                  <Icon className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-gray-900">{item.label}</h2>
                    {item.badge && (
                      <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-600 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}