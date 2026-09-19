import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  Minus,
  Check,
  Package,
  Info,
  X,
  Lock,
} from 'lucide-react';
import type { CustomerProduct, Category } from '../../types.ts';
import { api } from '../../services/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';

interface CustomerProductsProps {
  initialCategoryId?: string;
}

export const CustomerProducts: React.FC<CustomerProductsProps> = ({ initialCategoryId }) => {
  const { addToCart } = useAuth();
  const [products, setProducts] = useState<CustomerProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategoryId || 'ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [addedFeedback, setAddedFeedback] = useState<Record<string, boolean>>({});
  const [selectedProductDetail, setSelectedProductDetail] = useState<CustomerProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [cats, prods] = await Promise.all([
          api.getCustomerCategories(),
          api.getCustomerProducts(),
        ]);
        setCategories(cats);
        setProducts(prods);

        const initQty: Record<string, number> = {};
        prods.forEach((p) => {
          initQty[p.id] = 10;
        });
        setQuantities(initQty);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const adjustQty = (prodId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[prodId] || 10;
      const next = Math.max(1, current + delta);
      return { ...prev, [prodId]: next };
    });
  };

  const handleAdd = (p: CustomerProduct) => {
    const qty = quantities[p.id] || 10;
    addToCart(p, qty);
    setAddedFeedback((prev) => ({ ...prev, [p.id]: true }));
    setTimeout(() => {
      setAddedFeedback((prev) => ({ ...prev, [p.id]: false }));
    }, 1500);
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'ALL' || p.category_id === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.pack_size.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-5 pb-16">
      {/* Top Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs space-y-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="input-product-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search snacks by name (e.g. Bhujia, Chips), brand, or SKU code..."
            className="w-full pl-10 pr-9 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
              selectedCategory === 'ALL'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            All Snacks ({products.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
                selectedCategory === c.id
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Pricing Security Reminder Notice */}
      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900">
        <Lock className="w-4 h-4 text-amber-600 shrink-0" />
        <span>
          <strong>B2B Wholesale Ordering:</strong> Product prices are confidential and withheld from the ordering
          portal. Complete tax invoice with discounted dealer rates is generated upon dealer confirmation.
        </span>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-zinc-200">
          <Package className="w-12 h-12 text-zinc-300 mx-auto mb-2" />
          <h3 className="text-base font-semibold text-zinc-800">No snacks found</h3>
          <p className="text-xs text-zinc-500 mt-1">Try refining your search terms or category selection</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((p) => {
            const qty = quantities[p.id] || 10;
            const isAdded = addedFeedback[p.id];

            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs hover:border-amber-400 transition-all flex flex-col justify-between"
              >
                <div>
                  <div
                    className="relative h-44 bg-zinc-100 cursor-pointer overflow-hidden group"
                    onClick={() => setSelectedProductDetail(p)}
                  >
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2.5 py-0.5 bg-black/65 backdrop-blur-xs text-white text-[11px] font-bold rounded-full">
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

                  <div className="p-4">
                    <div className="flex items-center justify-between text-[11px] text-zinc-500 font-semibold mb-1">
                      <span>{p.brand}</span>
                      <span className="font-mono text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded">{p.code}</span>
                    </div>
                    <h3
                      className="font-bold text-sm text-zinc-900 line-clamp-1 hover:text-amber-700 cursor-pointer transition-colors"
                      onClick={() => setSelectedProductDetail(p)}
                    >
                      {p.name}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed">{p.description}</p>
                    <div className="mt-2 text-[11px] font-medium text-zinc-600">
                      Packing Unit: <span className="font-semibold text-zinc-800">{p.unit}</span>
                    </div>
                  </div>
                </div>

                {/* Stepper & Add to Order Button (NO PRICES SHOWN) */}
                <div className="p-4 pt-0">
                  <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-zinc-600">Order Quantity</span>
                      <div className="flex items-center border border-zinc-300 rounded-lg bg-white shadow-2xs">
                        <button
                          type="button"
                          onClick={() => adjustQty(p.id, -5)}
                          className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-l-lg transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          value={qty}
                          onChange={(e) =>
                            setQuantities({
                              ...quantities,
                              [p.id]: Math.max(1, parseInt(e.target.value, 10) || 1),
                            })
                          }
                          className="w-12 text-center text-xs font-bold text-zinc-900 focus:outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={() => adjustQty(p.id, 5)}
                          className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-r-lg transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Quick batch presets */}
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <span className="text-[10px] text-zinc-400 font-medium">Quick:</span>
                      {[10, 25, 50, 100].map((batch) => (
                        <button
                          key={batch}
                          type="button"
                          onClick={() => setQuantities({ ...quantities, [p.id]: batch })}
                          className={`text-[10px] px-2 py-0.5 rounded font-semibold border transition-colors ${
                            qty === batch
                              ? 'bg-amber-100 border-amber-300 text-amber-900'
                              : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                          }`}
                        >
                          +{batch}
                        </button>
                      ))}
                    </div>

                    <button
                      id={`btn-add-order-${p.id}`}
                      onClick={() => handleAdd(p)}
                      disabled={p.stock_status === 'OUT_OF_STOCK'}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 ${
                        p.stock_status === 'OUT_OF_STOCK'
                          ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                          : isAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-600 hover:bg-amber-700 text-white'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Added {qty} Units!</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>Add to Order ({qty} {p.unit}s)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Product Detail Modal (STRICTLY NO PRICES) */}
      {selectedProductDetail && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden">
            <div className="relative h-60 bg-zinc-100">
              <img
                src={selectedProductDetail.image_url}
                alt={selectedProductDetail.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={() => setSelectedProductDetail(null)}
                className="absolute top-3 right-3 p-2 bg-black/60 text-white hover:bg-black/80 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-3 flex gap-2">
                <span className="px-3 py-1 bg-black/70 backdrop-blur-xs text-white text-xs font-bold rounded-full">
                  {selectedProductDetail.pack_size}
                </span>
                <span
                  className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${
                    selectedProductDetail.stock_status === 'IN_STOCK'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-amber-500 text-white'
                  }`}
                >
                  {selectedProductDetail.stock_status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            <div className="p-5">
              <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                {selectedProductDetail.brand} • SKU: {selectedProductDetail.code}
              </div>
              <h2 className="text-lg font-bold text-zinc-900 mt-1">{selectedProductDetail.name}</h2>
              <p className="text-xs sm:text-sm text-zinc-600 mt-2 leading-relaxed">
                {selectedProductDetail.description}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs bg-zinc-50 p-3 rounded-xl border border-zinc-200">
                <div>
                  <span className="text-zinc-400">Packaging Type:</span>
                  <div className="font-semibold text-zinc-800">{selectedProductDetail.unit}</div>
                </div>
                <div>
                  <span className="text-zinc-400">Net Pack Weight:</span>
                  <div className="font-semibold text-zinc-800">{selectedProductDetail.pack_size}</div>
                </div>
                <div>
                  <span className="text-zinc-400">Distribution Tier:</span>
                  <div className="font-semibold text-zinc-800">Authorized Dealer Pack</div>
                </div>
                <div>
                  <span className="text-zinc-400">Pricing Policy:</span>
                  <div className="font-semibold text-amber-800 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Dealer B2B Rate
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3">
                <button
                  onClick={() => {
                    handleAdd(selectedProductDetail);
                    setSelectedProductDetail(null);
                  }}
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add to Order Cart</span>
                </button>
                <button
                  onClick={() => setSelectedProductDetail(null)}
                  className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
