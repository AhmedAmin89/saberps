import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import TransferRequests from './pages/admin/TransferRequests';
import TransferRequestDetails from './pages/admin/TransferRequestDetails';
import UserDashboard from './pages/user/Dashboard';
import StockCheck from './pages/user/StockCheck';
import TransferRequest from './pages/user/TransferRequest';
import TransferRequestList from './pages/user/TransferRequestList';
import UserTransferRequestDetails from './pages/user/TransferRequestDetails';
import InvoiceForm from './pages/user/Invoice/InvoiceForm';
import InvoiceList from './pages/user/Invoice/InvoiceList';
import InvoiceDetails from './pages/user/Invoice/InvoiceDetails';
import CollectionList from './pages/user/Collection/CollectionList';
import UserList from './pages/users/UserList';
import UserForm from './pages/users/UserForm';
import ItemList from './pages/items/ItemList';
import ItemForm from './pages/items/ItemForm';
import CustomerList from './pages/customers/CustomerList';
import CustomerForm from './pages/customers/CustomerForm';
import WarehouseList from './pages/warehouses/WarehouseList';
import WarehouseForm from './pages/warehouses/WarehouseForm';
import WarehouseStock from './pages/warehouses/WarehouseStock';
import StockOverview from './pages/warehouses/StockOverview';
import VendorList from './pages/vendors/VendorList';
import VendorForm from './pages/vendors/VendorForm';
import ImportOrderList from './pages/import-orders/ImportOrderList';
import ImportOrderForm from './pages/import-orders/ImportOrderForm';
import ImportOrderDetails from './pages/import-orders/ImportOrderDetails';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

const queryClient = new QueryClient();

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route
                path="admin"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/transfer-requests"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <TransferRequests />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/transfer-requests/:id"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <TransferRequestDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="stock-check"
                element={
                  <ProtectedRoute>
                    <StockCheck />
                  </ProtectedRoute>
                }
              />
              <Route
                path="transfer-request"
                element={
                  <ProtectedRoute requiredRole="user">
                    <TransferRequestList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="transfer-request/new"
                element={
                  <ProtectedRoute requiredRole="user">
                    <TransferRequest />
                  </ProtectedRoute>
                }
              />
              <Route
                path="transfer-request/:id"
                element={
                  <ProtectedRoute requiredRole="user">
                    <UserTransferRequestDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="invoice"
                element={
                  <ProtectedRoute requiredRole="user">
                    <InvoiceList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="invoice/new"
                element={
                  <ProtectedRoute requiredRole="user">
                    <InvoiceForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="invoice/:id"
                element={
                  <ProtectedRoute requiredRole="user">
                    <InvoiceDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="collection"
                element={
                  <ProtectedRoute requiredRole="user">
                    <CollectionList />
                  </ProtectedRoute>
                }
              />
              <Route path="import-orders" element={<ImportOrderList />} />
              <Route path="import-orders/new" element={<ImportOrderForm />} />
              <Route path="import-orders/:id" element={<ImportOrderDetails />} />
              <Route path="warehouse-stock" element={<StockOverview />} />
              <Route path="warehouses/:id/stock" element={<WarehouseStock />} />
              <Route
                path="users"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <UserList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="users/new"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <UserForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="users/:id/edit"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <UserForm />
                  </ProtectedRoute>
                }
              />
              <Route path="items" element={<ItemList />} />
              <Route path="items/new" element={<ItemForm />} />
              <Route path="items/:id/edit" element={<ItemForm />} />
              <Route path="customers" element={<CustomerList />} />
              <Route path="customers/new" element={<CustomerForm />} />
              <Route path="customers/:id/edit" element={<CustomerForm />} />
              <Route path="warehouses" element={<WarehouseList />} />
              <Route path="warehouses/new" element={<WarehouseForm />} />
              <Route path="warehouses/:id/edit" element={<WarehouseForm />} />
              <Route path="vendors" element={<VendorList />} />
              <Route path="vendors/new" element={<VendorForm />} />
              <Route path="vendors/:id/edit" element={<VendorForm />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;