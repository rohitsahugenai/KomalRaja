import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  X,
  AlertTriangle,
  DollarSign,
} from 'lucide-react';
import type { Product, Category } from '../../types.ts';
import { api } from '../../services/api.ts';

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    brand: '',
    category_id: '',
    description: '',
    pack_size: '',
    unit: 'Packet',
    stock_qty: 100,
    min_stock: 20,
    purchase_price: 30,
    selling_price: 45,
    gst_rate: 12,
    image_url: '',
    is_available: true,
  });

  const loadData = async () => {
    try {
      const [prods, cats] = await Promise.all([
        api.getAdminProducts(),
        api.getAdminCategories(),
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      code: `SKU-${Date.now().toString().slice(-4)}`,
      name: '',
      brand: 'Haldirams',
      category_id: categories[0]?.id || 'cat-1',
      description: '',
      pack_size: '200g Packet',
      unit: 'Packet',
      stock_qty: 120,
      min_stock: 20,
      purchase_price: 32,
      selling_price: 48,
      gst_rate: 12,
      image_url: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600&auto=format&fit=crop&q=80',
      is_available: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      code: p.code,
      name: p.name,
      brand: p.brand,
      category_id: p.category_id,
      description: p.description,
      pack_size: p.pack_size,
      unit: p.unit,
      stock_qty: p.stock_qty,
      min_stock: p.min_stock,
      purchase_price: p.purchase_price,
      selling_price: p.selling_price,
      gst_rate: p.gst_rate,
      image_url: p.image_url,
      is_available: p.is_available,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, formData);
      } else {
        await api.createProduct(formData);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Error saving product:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this product from the catalog?')) return;
    try {
      await api.deleteProduct(id);
      await loadData();
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCat === 'ALL' || p.category_id === selectedCat;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
            Snack Product Catalog & Inventory
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Manage SKU codes, pack sizes, wholesale purchase costs, dealer trade margins, and stock levels
          </p>
        </div>

        <button
          id="btn-add-snack-product"
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Snack SKU</span>
        </button>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs space-y-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="input-admin-search-products"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by snack name, SKU code, or brand..."
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCat('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
              selectedCat === 'ALL'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            All Categories ({products.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCat(c.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
                selectedCat === c.id
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-100 border-b border-zinc-200 text-zinc-600 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Snack Product</th>
                <th className="py-3 px-4">Brand & SKU</th>
                <th className="py-3 px-4 text-center">Pack / Unit</th>
                <th className="py-3 px-4 text-right">Cost Price (₹)</th>
                <th className="py-3 px-4 text-right">Selling Price (₹)</th>
                <th className="py-3 px-4 text-right">Margin / Unit</th>
                <th className="py-3 px-4 text-center">Stock</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredProducts.map((p) => {
                const margin = p.selling_price - p.purchase_price;
                const marginPct = ((margin / p.selling_price) * 100).toFixed(1);
                const isLow = p.stock_qty <= p.min_stock;
                const statusLabel = !p.is_available
                  ? 'OUT_OF_STOCK'
                  : isLow
                  ? 'LOW_STOCK'
                  : 'IN_STOCK';

                return (
                  <tr key={p.id} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="w-10 h-10 object-cover rounded-lg bg-zinc-100 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="font-bold text-zinc-900">{p.name}</div>
                          <div className="text-[10px] text-zinc-400 line-clamp-1 max-w-xs">{p.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-zinc-800">{p.brand}</div>
                      <div className="text-[10px] font-mono text-amber-800 bg-amber-50 px-1 py-0.2 rounded inline-block">
                        {p.code}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-medium text-zinc-800">{p.pack_size}</span>
                      <div className="text-[10px] text-zinc-400">{p.unit}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-zinc-600">
                      ₹{p.purchase_price.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-zinc-900">
                      ₹{p.selling_price.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-emerald-700 font-semibold">
                      +₹{margin.toFixed(2)} <span className="text-[10px]">({marginPct}%)</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`font-bold ${
                          isLow ? 'text-amber-700 font-extrabold' : 'text-zinc-900'
                        }`}
                      >
                        {p.stock_qty}
                      </span>
                      {isLow && (
                        <div className="text-[9px] text-amber-600 flex items-center justify-center gap-0.5 mt-0.5">
                          <AlertTriangle className="w-2.5 h-2.5" /> Low
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                          statusLabel === 'IN_STOCK'
                            ? 'bg-emerald-100 text-emerald-800'
                            : statusLabel === 'LOW_STOCK'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {statusLabel.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 text-zinc-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors inline-block"
                        title="Edit Product"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 text-zinc-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors inline-block"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden">
            <div className="p-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
              <h2 className="text-base font-bold text-zinc-900">
                {editingProduct ? 'Edit Snack Product SKU' : 'Add New Snack SKU to Catalog'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Product SKU Code</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Brand Name</label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g. Balaji, Haldirams, Bikaji"
                    className="w-full px-3 py-2 border border-zinc-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-zinc-700 mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Aloo Bhujia Namkeen Wholesale Carton"
                    className="w-full px-3 py-2 border border-zinc-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Snack Category</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Pack Size (e.g. 200g, 400g, 1kg)</label>
                  <input
                    type="text"
                    required
                    value={formData.pack_size}
                    onChange={(e) => setFormData({ ...formData, pack_size: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Packaging Unit</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    <option value="Packet">Packet</option>
                    <option value="Carton">Carton (Box)</option>
                    <option value="Jar">Jar / Can</option>
                    <option value="Bag">Bag (Pouch)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Availability</label>
                  <select
                    value={formData.is_available ? 'YES' : 'NO'}
                    onChange={(e) => setFormData({ ...formData, is_available: e.target.value === 'YES' })}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    <option value="YES">Active / Available</option>
                    <option value="NO">Suspended / Inactive</option>
                  </select>
                </div>

                {/* Confidential Dealer Pricing Fields (SRS #23) */}
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl sm:col-span-2 space-y-3">
                  <div className="font-bold text-amber-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-amber-700" />
                    <span>Dealer Pricing & Financials (CONFIDENTIAL)</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                        Purchase Cost (₹)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={formData.purchase_price}
                        onChange={(e) =>
                          setFormData({ ...formData, purchase_price: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full px-2.5 py-1.5 border border-zinc-300 rounded-lg bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                        Selling Price (₹)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={formData.selling_price}
                        onChange={(e) =>
                          setFormData({ ...formData, selling_price: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full px-2.5 py-1.5 border border-zinc-300 rounded-lg bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                        GST Rate (%)
                      </label>
                      <select
                        value={formData.gst_rate}
                        onChange={(e) =>
                          setFormData({ ...formData, gst_rate: parseFloat(e.target.value) || 12 })
                        }
                        className="w-full px-2.5 py-1.5 border border-zinc-300 rounded-lg bg-white"
                      >
                        <option value={5}>5%</option>
                        <option value={12}>12%</option>
                        <option value={18}>18%</option>
                      </select>
                    </div>
                  </div>

                  <div className="text-[11px] text-amber-800 flex items-center justify-between font-semibold">
                    <span>
                      Unit Trade Margin: +₹{(formData.selling_price - formData.purchase_price).toFixed(2)}
                    </span>
                    <span>Withheld from customer view by backend security filters</span>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Current Stock Quantity</label>
                  <input
                    type="number"
                    value={formData.stock_qty}
                    onChange={(e) =>
                      setFormData({ ...formData, stock_qty: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-full px-3 py-2 border border-zinc-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Low Stock Warning Threshold</label>
                  <input
                    type="number"
                    value={formData.min_stock}
                    onChange={(e) =>
                      setFormData({ ...formData, min_stock: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-full px-3 py-2 border border-zinc-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-zinc-700 mb-1">Product Image URL</label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-zinc-700 mb-1">Description & Ingredients</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs transition-colors"
                >
                  {editingProduct ? 'Save SKU Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
