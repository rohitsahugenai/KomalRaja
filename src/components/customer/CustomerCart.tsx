import React, { useState } from 'react';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Lock,
  Calendar,
  FileText,
  MapPin,
  CheckCircle2,
  Package,
  AlertCircle,
} from 'lucide-react';
import type { CustomerOrder } from '../../types.ts';
import { api } from '../../services/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';

interface CustomerCartProps {
  onNavigateTab: (tab: 'products' | 'orders') => void;
  onOrderCreated?: (order: CustomerOrder) => void;
}

export const CustomerCart: React.FC<CustomerCartProps> = ({
  onNavigateTab,
  onOrderCreated,
}) => {
  const {
    user,
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartTotalItems,
    cartTotalUnits,
    refreshNotifications,
  } = useAuth();

  const [notes, setNotes] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<CustomerOrder | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setError(null);
    setIsSubmitting(true);
    try {
      const itemsPayload = cart.map((c) => ({
        productId: c.product.id,
        quantity: c.quantity,
      }));

      const newOrder = await api.placeCustomerOrder({
        items: itemsPayload,
        notes,
        preferred_date: preferredDate,
        delivery_address: deliveryAddress || `${user?.shop_name}, ${user?.city || 'Main Market'}`,
      });

      clearCart();
      setPlacedOrder(newOrder);
      if (onOrderCreated) {
        onOrderCreated(newOrder);
      }
      refreshNotifications();
    } catch (err: any) {
      setError(err.message || 'Failed to submit order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS STATE (SRS #12)
  if (placedOrder) {
    return (
      <div className="max-w-lg mx-auto py-10 px-4 text-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xs">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Order Placed Successfully!</h2>
        <div className="mt-3 p-4 bg-zinc-50 border border-zinc-200 rounded-2xl inline-block text-left w-full">
          <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Order Reference ID:</div>
          <div className="text-lg font-mono font-bold text-amber-800">{placedOrder.order_number}</div>
          <div className="mt-2 text-xs text-zinc-600">
            <strong>{placedOrder.total_products_count} Products</strong> ({placedOrder.total_units} Total Units)
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Current Status: ORDER RECEIVED
          </div>
        </div>

        <p className="text-xs sm:text-sm text-zinc-500 mt-4 leading-relaxed">
          Your order has been routed directly to the dealer dispatch warehouse. The dealer will verify stock,
          calculate trade discounts & GST, and send you the itemized invoice.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            id="btn-view-placed-order"
            onClick={() => onNavigateTab('orders')}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            Track in My Orders
          </button>
          <button
            id="btn-continue-shopping"
            onClick={() => {
              setPlacedOrder(null);
              onNavigateTab('products');
            }}
            className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-semibold text-xs rounded-xl transition-colors"
          >
            Order More Snacks
          </button>
        </div>
      </div>
    );
  }

  // EMPTY CART
  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 bg-zinc-100 text-zinc-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShoppingCart className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-zinc-900">Your Order Cart is Empty</h2>
        <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
          Add potato chips, sev, namkeen, or bhujia wholesale packs from the product catalog.
        </p>
        <button
          id="btn-empty-cart-browse"
          onClick={() => onNavigateTab('products')}
          className="mt-5 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors inline-flex items-center gap-2"
        >
          <Package className="w-4 h-4" />
          <span>Browse Snacks Catalog</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Title & Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Order Cart</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Review product quantities before submitting order to dealer
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear All</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Cart Items List */}
      <div className="bg-white rounded-2xl border border-zinc-200 divide-y divide-zinc-100 shadow-xs overflow-hidden">
        {cart.map(({ product, quantity }) => (
          <div key={product.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-16 h-16 object-cover rounded-xl bg-zinc-100 shrink-0"
                referrerPolicy="no-referrer"
              />
              <div>
                <div className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">
                  {product.brand} • {product.code}
                </div>
                <h3 className="text-sm font-bold text-zinc-900">{product.name}</h3>
                <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                  <span className="px-2 py-0.5 bg-zinc-100 rounded font-medium text-zinc-700">
                    {product.pack_size}
                  </span>
                  <span>Unit: {product.unit}</span>
                </div>
              </div>
            </div>

            {/* Stepper & Remove */}
            <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100">
              <div className="flex items-center border border-zinc-300 rounded-xl bg-zinc-50 shadow-2xs">
                <button
                  type="button"
                  onClick={() => updateCartQuantity(product.id, quantity - 5)}
                  className="p-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200 rounded-l-xl transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => updateCartQuantity(product.id, Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-14 text-center text-sm font-bold text-zinc-900 bg-transparent focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => updateCartQuantity(product.id, quantity + 5)}
                  className="p-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200 rounded-r-xl transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => removeFromCart(product.id)}
                className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                title="Remove product"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Order Details & Summary Form */}
      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Delivery & Notes (2 Cols) */}
        <div className="md:col-span-2 space-y-4 bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
          <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
            Delivery & Retailer Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-zinc-50 p-3.5 rounded-xl border border-zinc-100">
            <div>
              <span className="text-zinc-400">Customer Name:</span>
              <div className="font-semibold text-zinc-800">{user?.username}</div>
            </div>
            <div>
              <span className="text-zinc-400">Shop / Kirana Name:</span>
              <div className="font-semibold text-zinc-800">{user?.shop_name || 'Retailer'}</div>
            </div>
            <div>
              <span className="text-zinc-400">Contact Number:</span>
              <div className="font-semibold text-zinc-800">{user?.phone || 'Not provided'}</div>
            </div>
            <div>
              <span className="text-zinc-400">Registered City:</span>
              <div className="font-semibold text-zinc-800">{user?.city || 'Surat, Gujarat'}</div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-zinc-400" />
              <span>Confirm Delivery Address</span>
            </label>
            <input
              type="text"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="Shop number, street, landmark, city"
              className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                <span>Preferred Delivery Date</span>
              </label>
              <input
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-zinc-400" />
                <span>Delivery Notes / Instructions</span>
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Deliver before 11 AM, double carton packing"
                className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Order Quantity Summary (1 Col) (STRICTLY NO MONETARY TOTALS) */}
        <div className="space-y-4">
          <div className="bg-amber-50/70 border border-amber-200 p-5 rounded-2xl shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              Order Quantities Summary
            </h3>

            <div className="space-y-2 text-xs text-zinc-700">
              <div className="flex justify-between py-1 border-b border-amber-200/60">
                <span>Total Product Types:</span>
                <span className="font-bold text-zinc-900">{cartTotalItems} Products</span>
              </div>
              <div className="flex justify-between py-1 border-b border-amber-200/60">
                <span>Total Dispatch Units:</span>
                <span className="font-bold text-amber-800 text-sm">{cartTotalUnits} Total Units</span>
              </div>
            </div>

            {/* Strict Notice as per SRS #10 & #11 */}
            <div className="p-3 bg-white/80 rounded-xl border border-amber-200 text-[11px] text-amber-950 leading-relaxed flex items-start gap-2">
              <Lock className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
              <span>
                <strong>Prices will be calculated by dealer.</strong> Trade margin, quantity discounts, and GST will
                be reflected on your formal Tax Invoice.
              </span>
            </div>

            <button
              id="btn-place-order"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? 'Transmitting Order...' : 'PLACE ORDER'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
