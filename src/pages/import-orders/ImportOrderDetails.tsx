import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { importOrders } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { CheckCircle, XCircle } from 'lucide-react';

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

export default function ImportOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: order } = useQuery({
    queryKey: ['import-orders', id],
    queryFn: () => importOrders.getById(Number(id)),
  });

  const completeMutation = useMutation({
    mutationFn: () => importOrders.complete(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['import-orders'] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => importOrders.cancel(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['import-orders'] });
    },
  });

  if (!order) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Import Order Details</h1>
        <div className="flex gap-2">
          {order.status === 'pending' && (
            <>
              <Button
                onClick={() => completeMutation.mutate()}
                disabled={completeMutation.isPending}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Order
              </Button>
              <Button
                variant="destructive"
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel Order
              </Button>
            </>
          )}
          <Button
            variant="secondary"
            onClick={() => navigate('/import-orders')}
          >
            Back to List
          </Button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Warehouse</h3>
            <p className="mt-1 text-lg">{order.warehouse_name}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Vendor</h3>
            <p className="mt-1 text-lg">{order.vendor_name}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Order Date</h3>
            <p className="mt-1 text-lg">
              {new Date(order.order_date).toLocaleDateString()}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Status</h3>
            <p className={`mt-1 text-lg capitalize ${
              order.status === 'completed' ? 'text-green-600' :
              order.status === 'cancelled' ? 'text-red-600' :
              'text-yellow-600'
            }`}>
              {order.status}
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Items</h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {order.items?.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.item_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatPrice(item.unit_price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatPrice(item.quantity * item.unit_price)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-right font-medium">
                    Total Cost:
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    {formatPrice(order.total_cost)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}