import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { warehouses, users } from '../../lib/api';
import { Button } from '../../components/ui/Button';

export default function WarehouseForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    user_id: '',
  });

  const { data: warehouse } = useQuery({
    queryKey: ['warehouses', id],
    queryFn: () => warehouses.getAll().then(warehouses => warehouses.find(w => w.id === Number(id))),
    enabled: isEditing
  });

  const { data: usersData = [] } = useQuery({
    queryKey: ['users'],
    queryFn: users.getAll,
  });

  useEffect(() => {
    if (warehouse) {
      setFormData({
        name: warehouse.name,
        user_id: warehouse.user_id?.toString() || '',
      });
    }
  }, [warehouse]);

  const mutation = useMutation({
    mutationFn: (data: typeof formData) => {
      const payload = {
        ...data,
        user_id: Number(data.user_id),
      };
      return isEditing
        ? warehouses.update(Number(id), payload)
        : warehouses.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      navigate('/warehouses');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {isEditing ? 'Edit Warehouse' : 'Create Warehouse'}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Assigned User</label>
          <select
            value={formData.user_id}
            onChange={e => setFormData(prev => ({ ...prev, user_id: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          >
            <option value="">Select a user</option>
            {usersData.map((user) => (
              <option key={user.id} value={user.id}>
                {user.username}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/warehouses')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </div>
  );
}