import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Eye,
  FileText,
  Share2,
  CheckCircle2,
  Truck,
  X,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  Building,
  DollarSign,
  ChevronDown,
} from 'lucide-react';
import type { Order, OrderStatus, Invoice } from '../../types.ts';
import { api } from '../../services/api.ts';
import { AdminInvoiceModal } from './AdminInvoiceModal.tsx';

interface AdminOrdersProps {
  initialSelectedOrder?: Order | null;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({ initialSelectedOrder }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(initialSelectedOrder || null);
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  const [statusNote, setStatusNote] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadOrders = async () => {
    try {
      const list = await api.getAdminOrders({
        status: statusFilter,
        search: searchQuery,
      });
      setOrders(list);
    } catch (err) {
      console.error('Error loading admin orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadOrders();
  };

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const updated = await api.updateOrderStatus(orderId, newStatus, statusNote);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updated);
      }
      setStatusUpdating(null);
      setStatusNote('');
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleOpenInvoice = async (order: Order) => {
    try {
      const inv = await api.generateInvoice(order.id);
      setActiveInvoice(inv);
    } catch (err) {
      console.error('Error generating invoice:', err);
    }
  };

  const handleSendWhatsApp = async (order: Order) => {
    try {
      const inv = await api.generateInvoice(order.id);
      const res = await api.shareInvoiceWhatsApp(inv.id);
      window.open(res.whatsapp_url, '_blank');
    } catch (err) {
      console.error('Error sharing WhatsApp:', err);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'OUT_FOR_DELIVERY':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'READY_FOR_DISPATCH':
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CONFIRMED':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
            Order Management & Billing
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Process wholesale retail orders, update dispatch timelines, generate GST invoices, and share via WhatsApp
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs space-y-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              id="input-admin-search-orders"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID (ORD-...), Shop Name, or Customer..."
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-900 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            'ALL',
            'PENDING',
            'CONFIRMED',
            'PROCESSING',
            'READY_FOR_DISPATCH',
            'OUT_FOR_DELIVERY',
            'DELIVERED',
            'CANCELLED',
          ].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
                statusFilter === st
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {st === 'ALL' ? 'All Orders' : st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-100 border-b border-zinc-200 text-zinc-600 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Shop</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-center">Items & Units</th>
                <th className="py-3 px-4 text-right">Grand Total (₹)</th>
                <th className="py-3 px-4 text-right">Margin (₹)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-zinc-400">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    No orders matching this filter
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-900">{o.order_number}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-zinc-900">{o.customer_name}</div>
                      <div className="text-[11px] text-zinc-400">{o.customer_phone}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-zinc-800">{o.shop_name}</td>
                    <td className="py-3.5 px-4 text-zinc-500">
                      {new Date(o.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-bold text-zinc-900">{o.total_units}</span>
                      <span className="text-zinc-500 text-[10px] ml-1">({o.total_products_count} SKUs)</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-zinc-900">
                      ₹{(o.grand_total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">
                      ₹{(o.dealer_margin || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase border ${getStatusBadge(o.status)}`}>
                        {o.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        id={`btn-admin-view-order-${o.id}`}
                        onClick={() => setSelectedOrder(o)}
                        className="p-1.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200 rounded-lg transition-colors inline-block"
                        title="View Full Financial Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        id={`btn-admin-invoice-${o.id}`}
                        onClick={() => handleOpenInvoice(o)}
                        className="p-1.5 text-purple-700 hover:bg-purple-50 rounded-lg transition-colors inline-block"
                        title="Generate Tax Invoice"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button
                        id={`btn-admin-whatsapp-${o.id}`}
                        onClick={() => handleSendWhatsApp(o)}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors inline-block"
                        title="Send Bill via WhatsApp"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Order Details Modal (FULL FINANCIAL INFORMATION - SRS #22) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[95vh]">
            <div className="p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-zinc-900">{selectedOrder.order_number}</h2>
                  <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase border ${getStatusBadge(selectedOrder.status)}`}>
                    {selectedOrder.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Dealer B2B Financial & Fulfillment Breakdown
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Customer & Shop Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                <div>
                  <span className="text-zinc-400">Customer Name:</span>
                  <div className="font-bold text-zinc-900">{selectedOrder.customer_name}</div>
                </div>
                <div>
                  <span className="text-zinc-400">Retail Shop:</span>
                  <div className="font-bold text-zinc-900">{selectedOrder.shop_name}</div>
                </div>
                <div>
                  <span className="text-zinc-400">Contact Number:</span>
                  <div className="font-bold text-zinc-900">{selectedOrder.customer_phone}</div>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-zinc-400">Delivery Address:</span>
                  <div className="text-zinc-800">{selectedOrder.delivery_address}</div>
                </div>
                <div>
                  <span className="text-zinc-400">Order Placed:</span>
                  <div className="text-zinc-800">{new Date(selectedOrder.created_at).toLocaleString('en-IN')}</div>
                </div>
              </div>

              {/* Status Workflow Action Selector (SRS #49) */}
              <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                    Workflow Status Control
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    Changes automatically push notifications to customer
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(
                    [
                      'PENDING',
                      'CONFIRMED',
                      'PROCESSING',
                      'READY_FOR_DISPATCH',
                      'OUT_FOR_DELIVERY',
                      'DELIVERED',
                      'CANCELLED',
                    ] as OrderStatus[]
                  ).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateStatus(selectedOrder.id, st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                        selectedOrder.status === st
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-100'
                      }`}
                    >
                      {st.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Line Items with Full Financial Pricing (SRS #22) */}
              <div>
                <h3 className="text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
                  Itemized Product Pricing & Margins
                </h3>
                <div className="border border-zinc-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-zinc-100 border-b border-zinc-200 text-zinc-600 font-bold uppercase text-[10px]">
                        <th className="py-2.5 px-3">Product</th>
                        <th className="py-2.5 px-3 text-center">Pack / Unit</th>
                        <th className="py-2.5 px-3 text-center">Qty</th>
                        <th className="py-2.5 px-3 text-right">Dealer Rate</th>
                        <th className="py-2.5 px-3 text-right">GST %</th>
                        <th className="py-2.5 px-3 text-right">Line Total (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {selectedOrder.items.map((it) => (
                        <tr key={it.id}>
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-zinc-900">{it.product_name}</div>
                            <div className="text-[10px] text-zinc-400 font-mono">{it.sku}</div>
                          </td>
                          <td className="py-2.5 px-3 text-center text-zinc-600">{it.pack_size}</td>
                          <td className="py-2.5 px-3 text-center font-bold text-zinc-900">{it.quantity}</td>
                          <td className="py-2.5 px-3 text-right font-mono">₹{(it.unit_price || 40).toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-right text-zinc-600 font-mono">{it.gst_rate || 12}%</td>
                          <td className="py-2.5 px-3 text-right font-bold font-mono text-zinc-900">
                            ₹{(it.total_price || it.quantity * 45).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Totals Summary */}
              <div className="flex justify-end">
                <div className="w-72 bg-zinc-50 p-4 rounded-xl border border-zinc-200 text-xs space-y-2">
                  <div className="flex justify-between text-zinc-600">
                    <span>Taxable Subtotal:</span>
                    <span className="font-mono">₹{(selectedOrder.subtotal || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-600">
                    <span>GST (Estimated):</span>
                    <span className="font-mono">₹{(selectedOrder.tax_amount || 0).toFixed(2)}</span>
                  </div>
                  <div className="pt-2 border-t border-zinc-200 flex justify-between text-sm font-bold text-zinc-900">
                    <span>Grand Total:</span>
                    <span className="font-mono text-amber-900">
                      ₹{(selectedOrder.grand_total || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="pt-1 flex justify-between text-xs font-semibold text-emerald-700">
                    <span>Dealer Gross Margin:</span>
                    <span className="font-mono">₹{(selectedOrder.dealer_margin || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-xs font-semibold rounded-xl transition-colors"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSendWhatsApp(selectedOrder)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Send Bill on WhatsApp</span>
                </button>
                <button
                  onClick={() => handleOpenInvoice(selectedOrder)}
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>View / Print Invoice</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AdminInvoiceModal invoice={activeInvoice} onClose={() => setActiveInvoice(null)} />
    </div>
  );
};
