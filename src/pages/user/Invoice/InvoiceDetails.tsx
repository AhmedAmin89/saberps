import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { invoices } from '../../../lib/api';
import { Button } from '../../../components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import { CollectionForm } from './CollectionForm';

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

export default function InvoiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: invoice } = useQuery({
    queryKey: ['invoices', id],
    queryFn: () => invoices.getById(Number(id)),
  });

  if (!invoice) return null;

  const showCollectionForm = invoice.status !== 'settled' && 
                           invoice.status !== 'completed' && 
                           invoice.payment_method === 'deferred';

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Invoice Details</h1>
        <Button
          variant="ghost"
          onClick={() => navigate('/invoice')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Invoices
        </Button>
      </div>

      <div className="bg-white shadow rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Warehouse</h3>
            <p className="mt-1 text-lg">{invoice.warehouse_name}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Customer</h3>
            <p className="mt-1 text-lg">{invoice.customer_name}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Invoice Date</h3>
            <p className="mt-1 text-lg">
              {new Date(invoice.invoice_date).toLocaleDateString()}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Payment Method</h3>
            <p className="mt-1 text-lg capitalize">{invoice.payment_method}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Status</h3>
            <p className={`mt-1 text-lg capitalize ${
              invoice.status === 'settled' ? 'text-green-600' :
              invoice.status === 'partially_settled' ? 'text-yellow-600' :
              invoice.status === 'pending_payment' ? 'text-red-600' :
              'text-gray-600'
            }`}>
              {invoice.status.replace('_', ' ')}
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
                {invoice.lines?.map((line) => (
                  <tr key={line.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {line.item_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {line.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatPrice(line.unit_price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatPrice(line.line_total)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-right font-medium">
                    Subtotal:
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    {formatPrice(invoice.subtotal)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-right font-medium">
                    Discount:
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    {formatPrice(invoice.discount)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-right font-medium">
                    Total:
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    {formatPrice(invoice.total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {invoice.collections && invoice.collections.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-4">Collections</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Collected By
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoice.collections.map((collection) => (
                    <tr key={collection.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(collection.collection_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatPrice(collection.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {collection.created_by_username}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showCollectionForm && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Add Collection</h3>
            <CollectionForm 
              invoiceId={invoice.id} 
              remainingAmount={invoice.total - (invoice.collections?.reduce((sum, c) => sum + c.amount, 0) || 0)}
            />
          </div>
        )}
      </div>
    </div>
  );
}