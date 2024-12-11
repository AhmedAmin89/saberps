import { Vendor } from '../../types';

interface VendorDetailsProps {
  vendor: Vendor;
}

export function VendorDetails({ vendor }: VendorDetailsProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Vendor Details</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Name</p>
          <p className="text-base text-gray-900">{vendor.name}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Mobile</p>
          <p className="text-base text-gray-900">{vendor.mobile_number || 'N/A'}</p>
        </div>
        <div className="col-span-2">
          <p className="text-sm font-medium text-gray-500">Address</p>
          <p className="text-base text-gray-900">{vendor.address || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
}