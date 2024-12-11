import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import './db/init.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import itemRoutes from './routes/items.js';
import customerRoutes from './routes/customers.js';
import warehouseRoutes from './routes/warehouses.js';
import vendorRoutes from './routes/vendors.js';
import importOrderRoutes from './routes/import-orders.js';
import transferRequestRoutes from './routes/transfer-requests.js';
import invoiceRoutes from './routes/invoices.js';
import collectionRoutes from './routes/collections.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/import-orders', importOrderRoutes);
app.use('/api/transfer-requests', transferRequestRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/collections', collectionRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});