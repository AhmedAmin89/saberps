import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { transferRequests } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { CheckCircle, XCircle } from 'lucide-react';

export default function TransferRequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: request } = useQuery({
    queryKey: ['transfer-requests', id],
    queryFn: () => transferRequests.getById(Number(id)),
  });

  const completeMutation = useMutation({
    mutationFn: () => transferRequests.complete(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfer-requests'] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => transferRequests.cancel(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfer-requests'] });
    },
  });

  if (!request) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Transfer Request Details</h1>
        <div className="flex gap-2">
          {request.status === 'pending' && (
            <>
              <Button
                onClick={() => completeMutation.mutate()}
                disabled={completeMutation.isPending}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve Transfer
              </Button>
              <Button
                variant="destructive"
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject Transfer
              </Button>
            </>
          )}
          <Button
            variant="secondary"
            onClick={() => navigate('/admin/transfer-requests')}
          >
            Back to List
          </Button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">From Warehouse</h3>
            <p className="mt-1 text-lg">{request.from_warehouse_name}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">To Warehouse</h3>
            <p className="mt-1 text-lg">{request.to_warehouse_name}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Created By</h3>
            <p className="mt-1 text-lg">{request.created_by_username}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Status</h3>
            <p className={`mt-1 text-lg capitalize ${
              request.status === 'completed' ? 'text-green-600' :
              request.status === 'cancelled' ? 'text-red-600' :
              'text-yellow-600'
            }`}>
              {request.status}
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {request.items?.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.item_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}