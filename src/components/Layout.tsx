import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, ClipboardList, ArrowLeftRight, FileText, Wallet, Package, Users, Warehouse, Truck, FileInput, BarChart2 } from 'lucide-react';
import { auth, transferRequests } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useQuery } from '@tanstack/react-query';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const { data: transferRequestsData = [] } = useQuery({
    queryKey: ['transfer-requests'],
    queryFn: transferRequests.getAll,
    enabled: user?.role === 'admin'
  });

  const pendingTransfers = transferRequestsData.filter(tr => tr.status === 'pending').length;
  
  const handleLogout = () => {
    auth.logout();
    navigate('/login');
  };

  const adminNavItems = [
    { path: '/import-orders', icon: FileInput, label: 'Import Orders' },
    { path: '/warehouse-stock', icon: BarChart2, label: 'Stock Overview' },
    { 
      path: '/admin/transfer-requests', 
      icon: ArrowLeftRight, 
      label: 'Transfer Requests',
      badge: pendingTransfers > 0 ? pendingTransfers : undefined
    },
    { path: '/users', icon: Users, label: 'Users' },
    { path: '/items', icon: Package, label: 'Items' },
    { path: '/customers', icon: Users, label: 'Customers' },
    { path: '/warehouses', icon: Warehouse, label: 'Warehouses' },
    { path: '/vendors', icon: Truck, label: 'Vendors' },
  ];

  const userNavItems = [
    { path: '/stock-check', icon: ClipboardList, label: 'Stock Check' },
    { path: '/transfer-request', icon: ArrowLeftRight, label: 'Transfer Request' },
    { path: '/invoice', icon: FileText, label: 'Invoice' },
    { path: '/collection', icon: Wallet, label: 'Collection' },
  ];

  const navItems = user?.role === 'admin' ? adminNavItems : userNavItems;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-800">Invoice System</h1>
        </div>
        <nav className="mt-4">
          {navItems.map(({ path, icon: Icon, label, badge }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 ${
                location.pathname.startsWith(path) ? 'bg-gray-100' : ''
              }`}
            >
              <Icon className="w-5 h-5 mr-2" />
              <span className="flex-1">{label}</span>
              {badge !== undefined && (
                <span className="px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-600 rounded-full">
                  {badge}
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 w-64 p-4">
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 w-full"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;