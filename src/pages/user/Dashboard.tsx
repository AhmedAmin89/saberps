import { useAuth } from '../../lib/auth';
import { ClipboardList, ArrowLeftRight, FileText, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function UserDashboard() {
  const { user } = useAuth();

  const menuItems = [
    { icon: ClipboardList, label: 'Stock Check', path: '/stock-check', description: 'View current stock levels' },
    { icon: ArrowLeftRight, label: 'Transfer Request', path: '/transfer-request', description: 'Request stock transfers' },
    { icon: FileText, label: 'Invoice', path: '/invoice', description: 'Manage invoices' },
    { icon: Wallet, label: 'Collection', path: '/collection', description: 'Handle collections' },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.username}!</h1>
        <p className="mt-2 text-gray-600">Access your dashboard to manage inventory and transactions.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 group"
            >
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-indigo-100 p-3 rounded-lg group-hover:bg-indigo-200 transition-colors duration-200">
                    <Icon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{item.label}</h2>
                    <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}