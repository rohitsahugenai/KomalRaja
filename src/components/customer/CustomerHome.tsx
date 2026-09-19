import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  RotateCcw,
  Clock,
  CheckCircle2,
  Package,
  Truck,
  Plus,
  Minus,
  Lock,
  ChevronRight,
} from 'lucide-react';
import type { CustomerProduct, CustomerOrder, Category } from '../../types.ts';
import { api } from '../../services/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';

interface CustomerHomeProps {
  onNavigateTab: (tab: 'products' | 'cart' | 'orders' | 'profile') => void;
  onSelectCategory: (catId: string) => void;
}

export const CustomerHome: React.FC<CustomerHomeProps> = ({
  onNavigateTab,
  onSelectCategory,
}) => {
  const { user, addToCart } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [popularProducts, setPopularProducts] = useState<CustomerProduct[]>([]);
  const [recentOrders, setRecentOrders] = useState<CustomerOrder[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, prods] = await Promise.all([
          api.getCustomerCategories().catch((err) => {
            console.warn('Error fetching categories:', err);
            return [];
          }),
          api.getCustomerProducts().catch((err) => {
            console.warn('Error fetching products:', err);
            return [];
          }),
        ]);
        setCategories(cats);
        setPopularProducts(prods.slice(0, 6));

        const initQty: Record<string, number> = {};
        prods.forEach((p) => {
          initQty[p.id] = 10; // Standard B2B default batch
        });
        setQuantities(initQty);

        // Fetch customer's own recent orders safely if token/user exists
        try {
          const ords = await api.getCustomerOrders();
          setRecentOrders(Array.isArray(ords) ? ords.slice(0, 2) : []);
        } catch {
          setRecentOrders([]);
        }
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [user]);

  const handleReorder = (order: CustomerOrder) => {
    order.items.forEach((item) => {
      const match = popularProducts.find((p) => p.id === item.product_id);
      if (match) {
        addToCart(match, item.quantity);
      }
    });
    onNavigateTab('cart');
  };

  const adjustQty = (prodId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[prodId] || 10;
      const next = Math.max(1, current + delta);
      return { ...prev, [prodId]: next };
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="bg-linear-to-r from-amber-600 via-orange-600 to-amber-700 rounded-2xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Authorized B2B Dealer Network</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
            Order your favourite snacks easily
          </h1>
          <p className="text-xs sm:text-sm text-amber-100 mt-1.5 leading-relaxed">
            Welcome, <span className="font-semibold">{user?.shop_name || user?.username || 'Retailer'}</span>.
            Browse chips, bhujia, sev, and farsan in wholesale carton packs.
          </p>

          {/* Strict Confidentiality notice */}
          <div className="mt-4 flex items-center gap-2 bg-black/25 backdrop-blur-xs px-3 py-2 rounded-xl text-xs text-amber-100 border border-white/10">
            <Lock className="w-3.5 h-3.5 shrink-0 text-amber-300" />
            <span>
              <strong>B2B Trade Pricing:</strong> Confidential dealer rates & GST applied directly on final bill.
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2.5">
            <button
              id="btn-home-browse-products"
              onClick={() => onNavigateTab('products')}
              className="px-4 py-2 bg-white text-amber-900 hover:bg-amber-50 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span>Explore Snack Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              id="btn-home-view-orders"
              onClick={() => onNavigateTab('orders')}
              className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white font-medium text-xs rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Clock className="w-4 h-4" />
              <span>Track Orders</span>
            </button>
          </div>
        </div>
      </div>

      {/* Latest Order Status Tracker (If there is a recent order) */}
      {recentOrders.length > 0 && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-zinc-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-100 text-amber-800 rounded-lg">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Latest Order Status
                </h3>
                <p className="text-sm font-bold text-zinc-900">{recentOrders[0].order_number}</p>
              </div>
            </div>
            <span
              className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                recentOrders[0].status === 'DELIVERED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : recentOrders[0].status === 'PROCESSING' || recentOrders[0].status === 'CONFIRMED'
                  ? 'bg-blue-100 text-blue-800'
                  : recentOrders[0].status === 'OUT_FOR_DELIVERY'
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {recentOrders[0].status.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="text-xs text-zinc-600 mb-3 flex items-center justify-between bg-zinc-50 p-2.5 rounded-xl">
            <span>
              <strong>{recentOrders[0].total_products_count} Products</strong> ({recentOrders[0].total_units} Total Units)
            </span>
            <button
              id="btn-home-track-detail"
              onClick={() => onNavigateTab('orders')}
              className="text-amber-700 font-semibold hover:underline flex items-center gap-0.5"
            >
              <span>Full Timeline</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Reorder from recent order */}
          <button
            id="btn-quick-reorder-latest"
            onClick={() => handleReorder(recentOrders[0])}
            className="w-full py-2 px-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Quick 1-Tap Reorder Entire List</span>
          </button>
        </div>
      )}

      {/* Categories Horizontal Scroll */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
            Shop by Snack Category
          </h2>
          <button
            onClick={() => onNavigateTab('products')}
            className="text-xs text-amber-700 font-semibold hover:underline"
          >
            View All
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                onSelectCategory(c.id);
                onNavigateTab('products');
              }}
              className="p-3 bg-white hover:bg-amber-50/70 border border-zinc-200 hover:border-amber-300 rounded-xl text-center transition-all group shadow-xs"
            >
              <div className="w-9 h-9 mx-auto rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform mb-1.5">
                <Package className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-zinc-900 group-hover:text-amber-900 truncate">
                {c.name}
              </div>
              <div className="text-[10px] text-zinc-500 mt-0.5">Wholesale Packs</div>
            </button>
          ))}
        </div>
      </div>

      {/* Popular Products Showcase (STRICTLY NO PRICES) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
              High Demand Fast-Selling Snacks
            </h2>
            <p className="text-xs text-zinc-500">Quickly select quantities and add to your order</p>
          </div>
          <button
            onClick={() => onNavigateTab('products')}
            className="text-xs text-amber-700 font-semibold hover:underline"
          >
            All Products
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularProducts.map((p) => {
            const qty = quantities[p.id] || 10;
            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs hover:border-amber-300 transition-all flex flex-col"
              >
                <div className="relative h-44 bg-zinc-100 overflow-hidden">
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[11px] font-semibold rounded-full">
                      {p.pack_size}
                    </span>
                  </div>
                  <div className="absolute top-2.5 right-2.5">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                        p.stock_status === 'IN_STOCK'
                          ? 'bg-emerald-500 text-white'
                          : p.stock_status === 'LOW_STOCK'
                          ? 'bg-amber-500 text-white'
                          : 'bg-red-500 text-white'
                      }`}
                    >
                      {p.stock_status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">
                      {p.brand} • {p.code}
                    </div>
                    <h3 className="font-bold text-sm text-zinc-900 mt-0.5 line-clamp-1">{p.name}</h3>
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{p.description}</p>
                  </div>

                  {/* Quantity Stepper & Add to Order (NO PRICE DISPLAYED) */}
                  <div className="mt-4 pt-3 border-t border-zinc-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-zinc-600">Quantity (Units)</span>
                      <div className="flex items-center border border-zinc-200 rounded-lg bg-zinc-50">
                        <button
                          type="button"
                          onClick={() => adjustQty(p.id, -5)}
                          className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 rounded-l-lg transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          value={qty}
                          onChange={(e) =>
                            setQuantities({ ...quantities, [p.id]: Math.max(1, parseInt(e.target.value, 10) || 1) })
                          }
                          className="w-12 text-center text-xs font-bold bg-transparent focus:outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={() => adjustQty(p.id, 5)}
                          className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 rounded-r-lg transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <button
                      id={`btn-add-popular-${p.id}`}
                      onClick={() => addToCart(p, qty)}
                      className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add {qty} Units to Order</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
