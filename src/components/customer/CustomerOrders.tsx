import React, { useState, useEffect } from 'react';
import {
  Search,
  RotateCcw,
  Eye,
  X,
  Clock,
  CheckCircle2,
  Truck,
  Package,
  MapPin,
  FileText,
  Calendar,
  Lock,
} from 'lucide-react';
import type { CustomerOrder, CustomerProduct, OrderStatus } from '../../types.ts';
import { api } from '../../services/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';

interface CustomerOrdersProps {
  onNavigateTab: (tab: 'cart' | 'products') => void;
  selectedOrderId?: string | null;
}

export const CustomerOrders: React.FC<CustomerOrdersProps> = ({
  onNavigateTab,
  selectedOrderId,
}) => {
  const { addToCart } = useAuth();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [allProducts, setAllProducts] = useState<CustomerProduct[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalOrder, setActiveModalOrder] = useState<CustomerOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const prods = await api.getCustomerProducts().catch(() => []);
        setAllProducts(prods);

        let ords: CustomerOrder[] = [];
        try {
          ords = await api.getCustomerOrders();
        } catch {
          ords = [];
        }
        setOrders(Array.isArray(ords) ? ords : []);

        if (selectedOrderId && Array.isArray(ords)) {
          const match = ords.find((o) => o.id === selectedOrderId);
          if (match) setActiveModalOrder(match);
        }
      } catch (err) {
        console.error('Error loading orders:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [selectedOrderId]);

  const handleReorder = (order: CustomerOrder) => {
    order.items.forEach((item) => {
      const p = allProducts.find((prod) => prod.id === item.product_id);
      if (p) {
        addToCart(p, item.quantity);
      }
    });
    onNavigateTab('cart');
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

  const filteredOrders = orders.filter((o) => {
    const matchesFilter =
      activeFilter === 'ALL' ||
      (activeFilter === 'PENDING' && o.status === 'PENDING') ||
      (activeFilter === 'PROCESSING' && (o.status === 'PROCESSING' || o.status === 'CONFIRMED')) ||
      (activeFilter === 'DELIVERED' && o.status === 'DELIVERED') ||
      (activeFilter === 'CANCELLED' && o.status === 'CANCELLED');

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      o.order_number.toLowerCase().includes(q) ||
      o.created_at.includes(q);

    return matchesFilter && matchesSearch;
  });

  const timelineSteps: { status: OrderStatus; label: string }[] = [
    { status: 'PENDING', label: 'Order Received' },
    { status: 'CONFIRMED', label: 'Confirmed' },
    { status: 'PROCESSING', label: 'Processing' },
    { status: 'READY_FOR_DISPATCH', label: 'Ready for Dispatch' },
    { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { status: 'DELIVERED', label: 'Delivered' },
  ];

  const getStepState = (order: CustomerOrder, stepStatus: OrderStatus) => {
    const statusOrder: OrderStatus[] = [
      'PENDING',
      'CONFIRMED',
      'PROCESSING',
      'READY_FOR_DISPATCH',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
    ];

    if (order.status === 'CANCELLED') return 'cancelled';

    const currentIndex = statusOrder.indexOf(order.status);
    const stepIndex = statusOrder.indexOf(stepStatus);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="space-y-5 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 tracking-tight">My Orders</h1>
          <p className="text-xs text-zinc-500">Track dispatch status, review products, and quickly reorder</p>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs space-y-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="input-orders-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID (e.g. ORD-20260918-000101)..."
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {['ALL', 'PENDING', 'PROCESSING', 'DELIVERED', 'CANCELLED'].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
                activeFilter === f
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {f === 'ALL' ? 'All Orders' : f.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-zinc-200">
          <Clock className="w-12 h-12 text-zinc-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-zinc-800">No orders found</h3>
          <p className="text-xs text-zinc-500 mt-1">You haven't placed any orders matching this criteria</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((o) => (
            <div
              key={o.id}
              className="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-5 shadow-xs hover:border-amber-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="font-mono font-bold text-sm text-amber-900">{o.order_number}</span>
                  <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase border ${getStatusBadge(o.status)}`}>
                    {o.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(o.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  <span>•</span>
                  <span>
                    <strong>{o.total_products_count} Products</strong> ({o.total_units} Units)
                  </span>
                  <span>•</span>
                  <span className="text-zinc-600 truncate max-w-xs">{o.delivery_address}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-100">
                <button
                  id={`btn-view-order-${o.id}`}
                  onClick={() => setActiveModalOrder(o)}
                  className="px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </button>

                {/* Quick Reorder */}
                <button
                  id={`btn-reorder-${o.id}`}
                  onClick={() => handleReorder(o)}
                  className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reorder</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Details Modal (STRICTLY NO PRICES - SRS #15) */}
      {activeModalOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-zinc-900">{activeModalOrder.order_number}</h2>
                  <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase border ${getStatusBadge(activeModalOrder.status)}`}>
                    {activeModalOrder.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Ordered on {new Date(activeModalOrder.created_at).toLocaleString('en-IN')}
                </p>
              </div>
              <button
                onClick={() => setActiveModalOrder(null)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-6">
              {/* Visual Order Timeline (SRS #13) */}
              <div>
                <h3 className="text-xs font-bold text-zinc-700 uppercase tracking-wider mb-3">
                  Live Dispatch Timeline
                </h3>
                <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200">
                  <div className="space-y-4">
                    {timelineSteps.map((step, idx) => {
                      const state = getStepState(activeModalOrder, step.status);
                      return (
                        <div key={step.status} className="flex items-start gap-3 text-xs">
                          <div className="mt-0.5 shrink-0">
                            {state === 'completed' ? (
                              <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </div>
                            ) : state === 'current' ? (
                              <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center animate-pulse">
                                <span className="w-2 h-2 rounded-full bg-white"></span>
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-zinc-200 text-zinc-400 flex items-center justify-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <span className={`font-semibold ${state === 'current' ? 'text-amber-800 font-bold' : state === 'completed' ? 'text-zinc-900' : 'text-zinc-400'}`}>
                              {step.label}
                            </span>
                            {/* If there is a note in timeline */}
                            {activeModalOrder.timeline.find((t) => t.status === step.status)?.note && (
                              <p className="text-[11px] text-zinc-500 mt-0.5">
                                {activeModalOrder.timeline.find((t) => t.status === step.status)?.note}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Itemized Snack Products (NO PRICES) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                    Ordered Snack Items ({activeModalOrder.total_products_count})
                  </h3>
                  <span className="text-xs font-bold text-amber-800">
                    {activeModalOrder.total_units} Total Units
                  </span>
                </div>

                <div className="border border-zinc-200 rounded-xl divide-y divide-zinc-100 overflow-hidden">
                  {activeModalOrder.items.map((item) => (
                    <div key={item.id} className="p-3 bg-white flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.product_name}
                            className="w-10 h-10 object-cover rounded-lg bg-zinc-100"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-zinc-900">{item.product_name}</div>
                          <div className="text-[11px] text-zinc-500">
                            Pack: {item.pack_size} • Unit: {item.unit}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-zinc-900 text-sm">{item.quantity}</span>
                        <span className="text-[11px] text-zinc-500 ml-1">{item.unit}s</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                  <div className="flex items-center gap-1.5 font-bold text-zinc-700 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Delivery Location</span>
                  </div>
                  <p className="text-zinc-600 leading-relaxed">{activeModalOrder.delivery_address}</p>
                </div>

                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                  <div className="flex items-center gap-1.5 font-bold text-zinc-700 mb-1">
                    <FileText className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Order Notes & Timing</span>
                  </div>
                  <p className="text-zinc-600 leading-relaxed">
                    {activeModalOrder.notes || 'Standard wholesale carton packaging.'}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>
                  Pricing and invoice totals are calculated and dispatched directly via WhatsApp bill sharing.
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-end gap-2">
              <button
                onClick={() => setActiveModalOrder(null)}
                className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-semibold text-xs rounded-xl transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleReorder(activeModalOrder);
                  setActiveModalOrder(null);
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Quick Reorder</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
