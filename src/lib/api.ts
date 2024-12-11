import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  login: async (username: string, password: string) => {
    const { data } = await api.post('/auth/login', { username, password });
    localStorage.setItem('token', data.token);
    return data;
  },
  logout: () => {
    localStorage.removeItem('token');
  },
};

export const users = {
  getAll: () => api.get('/users').then((res) => res.data),
  create: (userData: any) => api.post('/users', userData).then((res) => res.data),
  update: (id: number, userData: any) => api.put(`/users/${id}`, userData).then((res) => res.data),
  delete: (id: number) => api.delete(`/users/${id}`).then((res) => res.data),
};

export const items = {
  getAll: () => api.get('/items').then((res) => res.data),
  create: (itemData: any) => api.post('/items', itemData).then((res) => res.data),
  update: (id: number, itemData: any) => api.put(`/items/${id}`, itemData).then((res) => res.data),
  delete: (id: number) => api.delete(`/items/${id}`).then((res) => res.data),
};

export const customers = {
  getAll: () => api.get('/customers').then((res) => res.data),
  create: (data: any) => api.post('/customers', data).then((res) => res.data),
  update: (id: number, data: any) => api.put(`/customers/${id}`, data).then((res) => res.data),
  delete: (id: number) => api.delete(`/customers/${id}`).then((res) => res.data),
};

export const warehouses = {
  getAll: () => api.get('/warehouses').then((res) => res.data),
  create: (data: any) => api.post('/warehouses', data).then((res) => res.data),
  update: (id: number, data: any) => api.put(`/warehouses/${id}`, data).then((res) => res.data),
  delete: (id: number) => api.delete(`/warehouses/${id}`).then((res) => res.data),
  getStock: (id: number) => api.get(`/warehouses/${id}/stock`).then((res) => res.data),
};

export const vendors = {
  getAll: () => api.get('/vendors').then((res) => res.data),
  create: (data: any) => api.post('/vendors', data).then((res) => res.data),
  update: (id: number, data: any) => api.put(`/vendors/${id}`, data).then((res) => res.data),
  delete: (id: number) => api.delete(`/vendors/${id}`).then((res) => res.data),
};

export const importOrders = {
  getAll: () => api.get('/import-orders').then((res) => res.data),
  getById: (id: number) => api.get(`/import-orders/${id}`).then((res) => res.data),
  create: (data: any) => api.post('/import-orders', data).then((res) => res.data),
  update: (id: number, data: any) => api.put(`/import-orders/${id}`, data).then((res) => res.data),
  delete: (id: number) => api.delete(`/import-orders/${id}`).then((res) => res.data),
  complete: (id: number) => api.post(`/import-orders/${id}/complete`).then((res) => res.data),
  cancel: (id: number) => api.post(`/import-orders/${id}/cancel`).then((res) => res.data),
};

export const transferRequests = {
  getAll: () => api.get('/transfer-requests').then((res) => res.data),
  getById: (id: number) => api.get(`/transfer-requests/${id}`).then((res) => res.data),
  create: (data: any) => api.post('/transfer-requests', data).then((res) => res.data),
  complete: (id: number) => api.post(`/transfer-requests/${id}/complete`).then((res) => res.data),
  cancel: (id: number) => api.post(`/transfer-requests/${id}/cancel`).then((res) => res.data),
};

export const invoices = {
  getAll: () => api.get('/invoices').then((res) => res.data),
  getById: (id: number) => api.get(`/invoices/${id}`).then((res) => res.data),
  create: (data: any) => api.post('/invoices', data).then((res) => res.data),
};

export const collections = {
  getAll: () => api.get('/collections').then((res) => res.data),
  create: (data: any) => api.post('/collections', data).then((res) => res.data),
};

export default api;