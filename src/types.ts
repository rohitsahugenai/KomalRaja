/**
 * DealerSnack Order Management System
 * Core TypeScript definitions & schemas
 */

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'CUSTOMER';

export interface ManagerPermissions {
  view_orders: boolean;
  manage_orders: boolean;
  view_customers: boolean;
  manage_customers: boolean;
  view_products: boolean;
  delete_products: boolean;
  manage_admins: boolean;
  system_settings: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  role: UserRole;
  shop_name?: string;
  business_type?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  gstin?: string;
  permissions?: ManagerPermissions;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
}

export interface Product {
  id: string;
  code: string; // SKU code e.g. DSK-ALOO-200
  name: string;
  brand: string;
  category_id: string;
  description: string;
  pack_size: string; // e.g. "200g", "500g", "1kg"
  unit: string; // e.g. "Packet", "Box", "Pouch", "Jar"
  stock_qty: number;
  min_stock: number;
  image_url: string;
  is_available: boolean;
  created_at: string;
  // FINANCIAL DATA (ADMIN & MANAGER ONLY - NEVER EXPOSED TO CUSTOMERS)
  purchase_price: number;
  selling_price: number;
  gst_rate: number; // in percentage e.g. 5, 12, 18
}

/**
 * STRICT CUSTOMER PRODUCT DTO
 * Guarantees zero leakage of pricing, margin, profit or GST
 */
export interface CustomerProduct {
  id: string;
  code: string;
  name: string;
  brand: string;
  category_id: string;
  description: string;
  pack_size: string;
  unit: string;
  image_url: string;
  is_available: boolean;
  stock_status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'READY_FOR_DISPATCH'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderTimelineEntry {
  status: OrderStatus;
  timestamp: string;
  note: string;
  updated_by?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  sku: string;
  pack_size: string;
  unit: string;
  quantity: number;
  image_url?: string;
  // Financial fields (populated only in Admin API responses)
  unit_price?: number;
  gst_rate?: number;
  gst_amount?: number;
  total_price?: number;
}

export interface CustomerOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  sku: string;
  pack_size: string;
  unit: string;
  quantity: number;
  image_url?: string;
}

export interface Order {
  id: string;
  order_number: string; // e.g. ORD-20260919-000123
  customer_id: string;
  customer_name: string;
  shop_name: string;
  customer_phone: string;
  delivery_address: string;
  delivery_date?: string;
  notes?: string;
  status: OrderStatus;
  total_products_count: number;
  total_units: number;
  timeline: OrderTimelineEntry[];
  created_at: string;
  updated_at: string;
  // Financial fields (ADMIN / MANAGER ONLY)
  subtotal?: number;
  tax_amount?: number;
  discount?: number;
  grand_total?: number;
  dealer_margin?: number;
  invoice_id?: string;
  items: OrderItem[];
}

export interface CustomerOrder {
  id: string;
  order_number: string;
  customer_id: string;
  customer_name: string;
  shop_name: string;
  customer_phone: string;
  delivery_address: string;
  delivery_date?: string;
  notes?: string;
  status: OrderStatus;
  total_products_count: number;
  total_units: number;
  timeline: OrderTimelineEntry[];
  created_at: string;
  updated_at: string;
  items: CustomerOrderItem[];
}

export interface CartItem {
  product: CustomerProduct;
  quantity: number;
}

export interface InvoiceItem {
  product_id: string;
  product_name: string;
  sku: string;
  pack_size: string;
  unit: string;
  quantity: number;
  rate: number;
  amount: number;
  gst_rate: number;
  gst_amount: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  order_id: string;
  order_number: string;
  invoice_date: string;
  due_date: string;
  // Customer details
  customer_id: string;
  customer_name: string;
  shop_name: string;
  customer_phone: string;
  customer_address: string;
  customer_gstin?: string;
  // Dealer details
  dealer_name: string;
  dealer_address: string;
  dealer_phone: string;
  dealer_email: string;
  dealer_gstin: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  taxable_amount: number;
  cgst: number;
  sgst: number;
  igst: number;
  total_gst: number;
  grand_total: number;
  payment_terms: string;
  whatsapp_sent: boolean;
  whatsapp_sent_at?: string;
  created_at: string;
}

export interface AppNotification {
  id: string;
  target_user_id?: string;
  target_role?: string;
  title: string;
  message: string;
  type: 'order_received' | 'order_confirmed' | 'status_update' | 'invoice_ready' | 'broadcast';
  order_id?: string;
  order_number?: string;
  read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  role: string;
  action: string;
  entity: string;
  entity_id: string;
  ip: string;
  timestamp: string;
  details?: string;
}

export interface SystemSettings {
  company_name: string;
  dealer_phone: string;
  dealer_email: string;
  gstin: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  whatsapp_number: string;
  whatsapp_provider: string;
  default_gst_rate: number;
  currency_symbol: string;
  order_prefix: string;
  invoice_prefix: string;
  min_order_units: number;
  notification_enabled: boolean;
}
