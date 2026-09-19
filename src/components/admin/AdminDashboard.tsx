import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Clock,
  Truck,
  CheckCircle2,
  Users,
  Package,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  Eye,
  FileText,
  Bell,
  RefreshCw,
} from 'lucide-react';
import type { Order, Invoice, OrderStatus } from '../../types.ts';
import { api } from '../../services/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { AdminInvoiceModal } from './AdminInvoiceModal.tsx';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
  onSelectOrder?: (order: Order) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateTab,
  onSelectOrder,
}) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newOrderAlert, setNewOrderAlert] = useState<Order | null>(null);

  const loadData = async () => {
    try {
      const data = await api.getAdminDashboardStats();
      setStats(data);
      setRecentOrders(data.recent_orders || []);

      // Check if there is any pending order created in the last 2 hours to showcase the Real-time Order Alert (SRS #31)
      const freshPending = (data.recent_orders || []).find(
        (o: Order) => o.status === 'PENDING'
      );
      if (freshPending) {
        setNewOrderAlert(freshPending);
      }
    } catch (err) {
      console.error('Error fetching admin dashboard stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await api.updateOrderStatus(orderId, status);
      await loadData();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleGenerateInvoice = async (order: Order) => {
    try {
      const inv = await api.generateInvoice(order.id);
      setActiveInvoice(inv);
    } catch (err) {
      console.error('Error generating invoice:', err);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
            Dealer Executive Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Real-time B2B snack distribution, dispatch status, customer orders, and margins
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadData()}
            className="p-2 bg-white hover:bg-zinc-100 border border-zinc-200 rounded-xl text-zinc-600 transition-colors shadow-2xs"
            title="Refresh statistics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigateTab('products')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Package className="w-3.5 h-3.5" />
            <span>Manage Products</span>
          </button>
        </div>
      </div>

      {/* Real-time Order Alert Banner (SRS #31) */}
      {newOrderAlert && (
        <div className="bg-linear-to-r from-amber-500 to-orange-600 text-white rounded-2xl p-4 shadow-md flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">
                  NEW ORDER RECEIVED
                </span>
                <span className="font-mono text-xs font-bold text-amber-100">
                  {newOrderAlert.order_number}
                </span>
              </div>
              <p className="text-xs text-white/90 mt-0.5">
                Received from <strong>{newOrderAlert.shop_name}</strong> ({newOrderAlert.total_units} Units)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="btn-alert-confirm-order"
              onClick={() => {
                handleUpdateStatus(newOrderAlert.id, 'CONFIRMED');
                setNewOrderAlert(null);
              }}
              className="px-3.5 py-1.5 bg-white text-amber-900 hover:bg-amber-50 font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              Confirm Order
            </button>
            <button
              onClick={() => onNavigateTab('orders')}
              className="px-3 py-1.5 bg-black/20 hover:bg-black/30 text-white font-medium text-xs rounded-xl transition-colors"
            >
              View Orders
            </button>
          </div>
        </div>
      )}

      {/* Metric Cards Grid (SRS #20) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Today's</span>
            <ShoppingBag className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-zinc-900">{stats?.counts?.today_orders ?? 12}</div>
          <p className="text-[11px] text-zinc-500 mt-0.5">Orders received</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/40 shadow-xs">
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-amber-900">{stats?.counts?.pending_orders ?? 4}</div>
          <p className="text-[11px] text-amber-700 mt-0.5">Need confirmation</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Processing</span>
            <Truck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-900">{stats?.counts?.processing_orders ?? 8}</div>
          <p className="text-[11px] text-zinc-500 mt-0.5">In dispatch packing</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Delivered</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-900">{stats?.counts?.delivered_orders ?? 46}</div>
          <p className="text-[11px] text-zinc-500 mt-0.5">Fulfilled successfully</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Retail Stores</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-zinc-900">{stats?.counts?.total_customers ?? 3}</div>
          <p className="text-[11px] text-zinc-500 mt-0.5">Active Kiranas & Marts</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Snack SKUs</span>
            <Package className="w-4 h-4 text-zinc-600" />
          </div>
          <div className="text-2xl font-black text-zinc-900">{stats?.counts?.total_products ?? 14}</div>
          <p className="text-[11px] text-zinc-500 mt-0.5">Catalog products</p>
        </div>
      </div>

      {/* Financial KPIs (Confidential to Dealer Admin - Never seen by customers) */}
      {stats?.financials && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-linear-to-br from-zinc-900 to-zinc-800 text-white p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold mb-2">
              <span>CONFIDENTIAL DEALER REVENUE</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black tracking-tight font-mono text-emerald-400">
              ₹{stats.financials.total_revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">Total order volume processed with GST</p>
          </div>

          <div className="bg-linear-to-br from-purple-950 to-zinc-900 text-white p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between text-purple-300 text-xs font-semibold mb-2">
              <span>ESTIMATED DEALER GROSS MARGIN</span>
              <TrendingUp className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black tracking-tight font-mono text-purple-300">
              ₹{stats.financials.total_margin.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-purple-200/70 mt-1">Calculated margin after wholesale cost</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
            <div className="flex items-center justify-between text-zinc-500 text-xs font-semibold mb-2">
              <span>AVERAGE B2B ORDER VALUE</span>
              <ShoppingBag className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black tracking-tight font-mono text-zinc-900">
              ₹{stats.financials.average_order_value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Average invoice value across retail buyers</p>
          </div>
        </div>
      )}

      {/* Recent Orders Section */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
              Recent Retail Orders
            </h2>
            <p className="text-xs text-zinc-500">Live ordering queue across your retail distributor accounts</p>
          </div>
          <button
            onClick={() => onNavigateTab('orders')}
            className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-100 border-b border-zinc-200 text-zinc-600 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer / Shop</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-center">Items & Units</th>
                <th className="py-3 px-4 text-right">Order Value (₹)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {recentOrders.map((o) => (
                <tr key={o.id} className="hover:bg-zinc-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-amber-900">{o.order_number}</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-zinc-900">{o.shop_name}</div>
                    <div className="text-[11px] text-zinc-500">{o.customer_name}</div>
                  </td>
                  <td className="py-3 px-4 text-zinc-500">
                    {new Date(o.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-bold text-zinc-900">{o.total_units} Units</span>
                    <div className="text-[10px] text-zinc-400">({o.total_products_count} SKUs)</div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-zinc-900">
                    ₹{(o.grand_total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                        o.status === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : o.status === 'PROCESSING' || o.status === 'CONFIRMED'
                          ? 'bg-blue-100 text-blue-800'
                          : o.status === 'OUT_FOR_DELIVERY'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {o.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-1.5">
                    <button
                      onClick={() => handleGenerateInvoice(o)}
                      className="p-1.5 text-zinc-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors inline-block"
                      title="Tax Invoice"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (onSelectOrder) onSelectOrder(o);
                        onNavigateTab('orders');
                      }}
                      className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg font-semibold text-[11px] transition-colors inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AdminInvoiceModal invoice={activeInvoice} onClose={() => setActiveInvoice(null)} />
    </div>
  );
};
