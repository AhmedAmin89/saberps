export interface User {
  id: number;
  username: string;
  role: 'admin' | 'user';
  created_at: string;
}

export interface Item {
  id: number;
  name: string;
  item_price: number;
  created_at: string;
}

export interface Customer {
  id: number;
  name: string;
  mobile: string;
  address: string;
  created_at: string;
}

export interface Warehouse {
  id: number;
  name: string;
  user_id: number;
  user?: User;
  created_at: string;
}

export interface Vendor {
  id: number;
  name: string;
  address: string;
  mobile_number: string;
  created_at: string;
}

export interface ImportOrderItem {
  id?: number;
  item_id: number;
  quantity: number;
  unit_price: number;
  item?: Item;
}

export interface ImportOrder {
  id: number;
  warehouse_id: number;
  vendor_id: number;
  order_date: string;
  total_cost: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  warehouse?: Warehouse;
  vendor?: Vendor;
  items?: ImportOrderItem[];
}

export interface WarehouseStock {
  id: number;
  warehouse_id: number;
  item_id: number;
  quantity_in_stock: number;
  created_at: string;
  updated_at: string;
  warehouse?: Warehouse;
  item?: Item;
  item_name?: string;
  item_price?: number;
}

export interface TransferRequestItem {
  id?: number;
  item_id: number;
  quantity: number;
  item?: Item;
  item_name?: string;
  item_price?: number;
}

export interface TransferRequest {
  id: number;
  from_warehouse_id: number;
  to_warehouse_id: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_by: number;
  created_at: string;
  updated_at: string;
  from_warehouse_name?: string;
  to_warehouse_name?: string;
  created_by_username?: string;
  items?: TransferRequestItem[];
}

export interface InvoiceLine {
  id?: number;
  invoice_id?: number;
  item_id: number;
  quantity: number;
  unit_price: number;
  line_total: number;
  item_name?: string;
}

export interface Collection {
  id: number;
  invoice_id: number;
  amount: number;
  collection_date: string;
  created_by: number;
  created_at: string;
  created_by_username?: string;
}

export interface Invoice {
  id: number;
  warehouse_id: number;
  customer_id: number;
  invoice_date: string;
  payment_method: 'cash' | 'deferred';
  subtotal: number;
  discount: number;
  total: number;
  status: 'draft' | 'pending_payment' | 'partially_settled' | 'settled' | 'completed';
  created_by: number;
  created_at: string;
  updated_at: string;
  warehouse_name?: string;
  customer_name?: string;
  created_by_username?: string;
  lines?: InvoiceLine[];
  collections?: Collection[];
}