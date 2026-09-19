/**
 * DealerSnack API Client
 * Centralized client with authentication header injection
 */

import type {
  User,
  CustomerProduct,
  Category,
  CustomerOrder,
  Order,
  Product,
  Invoice,
  AppNotification,
  AuditLog,
  SystemSettings,
  OrderStatus,
} from '../types.ts';

const TOKEN_KEY = 'dealersnack_token';

export const api = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errMsg = `Request failed: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.error) errMsg = errorData.error;
      } catch {
        // use default errMsg
      }
      throw new Error(errMsg);
    }

    return response.json();
  },

  // -------------------------------------------------------------
  // AUTH
  // -------------------------------------------------------------

  async login(identifier: string, password: string, roleHint?: string): Promise<{ token: string; user: User }> {
    const res = await this.request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password, roleHint }),
    });
    this.setToken(res.token);
    return res;
  },

  async demoLogin(targetRole: string): Promise<{ token: string; user: User }> {
    const res = await this.request<{ token: string; user: User }>('/api/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ targetRole }),
    });
    this.setToken(res.token);
    return res;
  },

  async getMe(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/api/auth/me');
  },

  async logout(): Promise<void> {
    try {
      await this.request('/api/auth/logout', { method: 'POST' });
    } finally {
      this.removeToken();
    }
  },

  // -------------------------------------------------------------
  // CUSTOMER APIS (ZERO PRICE EXPOSURE)
  // -------------------------------------------------------------

  async getCustomerProducts(): Promise<CustomerProduct[]> {
    return this.request<CustomerProduct[]>('/api/customer/products');
  },

  async getCustomerCategories(): Promise<Category[]> {
    return this.request<Category[]>('/api/customer/categories');
  },

  async getCustomerOrders(): Promise<CustomerOrder[]> {
    return this.request<CustomerOrder[]>('/api/customer/orders');
  },

  async getCustomerOrderDetail(orderId: string): Promise<CustomerOrder> {
    return this.request<CustomerOrder>(`/api/customer/orders/${orderId}`);
  },

  async placeCustomerOrder(payload: {
    items: { productId: string; quantity: number }[];
    notes?: string;
    preferred_date?: string;
    delivery_address?: string;
  }): Promise<CustomerOrder> {
    return this.request<CustomerOrder>('/api/customer/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getCustomerProfile(): Promise<User> {
    return this.request<User>('/api/customer/profile');
  },

  async updateCustomerProfile(data: Partial<User>): Promise<User> {
    return this.request<User>('/api/customer/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async getCustomerNotifications(): Promise<AppNotification[]> {
    return this.request<AppNotification[]>('/api/customer/notifications');
  },

  // -------------------------------------------------------------
  // ADMIN & MANAGER APIS (FULL ACCESS & FINANCIALS)
  // -------------------------------------------------------------

  async getAdminDashboardStats(): Promise<{
    counts: {
      today_orders: number;
      pending_orders: number;
      processing_orders: number;
      delivered_orders: number;
      total_orders: number;
      total_customers: number;
      total_products: number;
      low_stock_count: number;
    };
    financials: {
      total_revenue: number;
      total_margin: number;
      average_order_value: number;
    } | null;
    recent_orders: Order[];
  }> {
    return this.request('/api/admin/dashboard-stats');
  },

  async getAdminOrders(params?: { status?: string; customer_id?: string; search?: string }): Promise<Order[]> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.customer_id) query.set('customer_id', params.customer_id);
    if (params?.search) query.set('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<Order[]>(`/api/admin/orders${qs}`);
  },

  async getAdminOrderDetail(orderId: string): Promise<Order> {
    return this.request<Order>(`/api/admin/orders/${orderId}`);
  },

  async updateOrderStatus(orderId: string, status: OrderStatus, note?: string): Promise<Order> {
    return this.request<Order>(`/api/admin/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, note }),
    });
  },

  async generateInvoice(orderId: string, discount?: number): Promise<Invoice> {
    return this.request<Invoice>(`/api/admin/orders/${orderId}/generate-invoice`, {
      method: 'POST',
      body: JSON.stringify({ discount }),
    });
  },

  async getInvoice(invoiceId: string): Promise<Invoice> {
    return this.request<Invoice>(`/api/admin/invoices/${invoiceId}`);
  },

  async shareInvoiceWhatsApp(invoiceId: string): Promise<{ success: boolean; whatsapp_url: string; invoice: Invoice }> {
    return this.request(`/api/admin/invoices/${invoiceId}/whatsapp`, {
      method: 'POST',
    });
  },

  async getAdminProducts(): Promise<Product[]> {
    return this.request<Product[]>('/api/admin/products');
  },

  async createProduct(data: Partial<Product>): Promise<Product> {
    return this.request<Product>('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    return this.request<Product>(`/api/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteProduct(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/admin/products/${id}`, {
      method: 'DELETE',
    });
  },

  async getAdminCategories(): Promise<Category[]> {
    return this.request<Category[]>('/api/admin/categories');
  },

  async createCategory(data: Partial<Category>): Promise<Category> {
    return this.request<Category>('/api/admin/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    return this.request<Category>(`/api/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteCategory(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/admin/categories/${id}`, {
      method: 'DELETE',
    });
  },

  async getAdminCustomers(): Promise<any[]> {
    return this.request<any[]>('/api/admin/customers');
  },

  async getAdminManagers(): Promise<User[]> {
    return this.request<User[]>('/api/admin/managers');
  },

  async createManager(data: {
    username: string;
    email: string;
    phone?: string;
    permissions?: any;
    role?: string;
  }): Promise<User> {
    return this.request<User>('/api/admin/managers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateManager(id: string, data: Partial<User>): Promise<User> {
    return this.request<User>(`/api/admin/managers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async getAdminReports(): Promise<{
    top_products: { name: string; sku: string; units: number; revenue: number }[];
    status_breakdown: Record<string, number>;
    top_customers: { name: string; shop: string; orders: number; units: number }[];
    low_stock: Product[];
  }> {
    return this.request('/api/admin/reports');
  },

  async getAdminNotifications(): Promise<AppNotification[]> {
    return this.request<AppNotification[]>('/api/admin/notifications');
  },

  async broadcastNotification(title: string, message: string): Promise<AppNotification> {
    return this.request<AppNotification>('/api/admin/notifications/broadcast', {
      method: 'POST',
      body: JSON.stringify({ title, message }),
    });
  },

  async getAdminSettings(): Promise<SystemSettings> {
    return this.request<SystemSettings>('/api/admin/settings');
  },

  async updateAdminSettings(data: Partial<SystemSettings>): Promise<SystemSettings> {
    return this.request<SystemSettings>('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    return this.request<AuditLog[]>('/api/admin/audit-logs');
  },
};
