import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  FileSpreadsheet,
  Award,
  DollarSign,
  Package,
} from 'lucide-react';
import { api } from '../../services/api.ts';
import type { Order, Product } from '../../types.ts';

export const AdminReports: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'all'>('month');

  useEffect(() => {
    async function load() {
      try {
        const [oList, pList] = await Promise.all([
          api.getAdminOrders(),
          api.getAdminProducts(),
        ]);
        setOrders(oList);
        setProducts(pList);
      } catch (err) {
        console.error('Error loading reports data:', err);
      }
    }
    load();
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + (o.grand_total || 0), 0);
  const totalMargin = orders.reduce((sum, o) => sum + (o.dealer_margin || 0), 0);
  const totalTax = orders.reduce((sum, o) => sum + (o.tax_amount || 0), 0);
  const totalUnits = orders.reduce((sum, o) => sum + (o.total_units || 0), 0);

  // Top products by units
  const productFrequency: Record<string, { name: string; brand: string; units: number }> = {};
  orders.forEach((o) => {
    o.items.forEach((item) => {
      if (!productFrequency[item.product_name]) {
        productFrequency[item.product_name] = {
          name: item.product_name,
          brand: 'Snack',
          units: 0,
        };
      }
      productFrequency[item.product_name].units += item.quantity;
    });
  });

  const topSellingSnacks = Object.values(productFrequency)
    .sort((a, b) => b.units - a.units)
    .slice(0, 5);

  const exportCSV = () => {
    const headers = ['Order Number', 'Date', 'Customer', 'Shop', 'Units', 'Revenue (INR)', 'Margin (INR)', 'Status'];
    const rows = orders.map((o) => [
      o.order_number,
      o.created_at,
      o.customer_name,
      o.shop_name,
      o.total_units,
      o.grand_total,
      o.dealer_margin,
      o.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dealersnack_sales_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
            Dealer Financial & Analytics Reports
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Realized B2B turnover, GST tax liability, gross margins, and fast-moving snack lines (SRS #33)
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="px-4 py-2.5 bg-zinc-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>Export Sales CSV</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
            Total Trade Revenue
          </div>
          <div className="text-2xl font-black font-mono text-zinc-900">
            ₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-zinc-500 mt-1">Across all confirmed wholesale dispatches</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/30 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
            Total Dealer Margin
          </div>
          <div className="text-2xl font-black font-mono text-emerald-700">
            ₹{totalMargin.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-emerald-600 mt-1">Net gross trade earnings</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
            Total GST Collected
          </div>
          <div className="text-2xl font-black font-mono text-zinc-900">
            ₹{totalTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-zinc-500 mt-1">Output tax liability for filing</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
            Total Units Dispatched
          </div>
          <div className="text-2xl font-black font-mono text-amber-900">
            {totalUnits.toLocaleString('en-IN')} Units
          </div>
          <p className="text-xs text-zinc-500 mt-1">Packets & cartons sold</p>
        </div>
      </div>

      {/* Top Fast-Moving Snacks Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-600" />
              <span>Fast-Selling Snacks Leaderboard</span>
            </h3>
            <span className="text-xs text-zinc-400">By total volume ordered</span>
          </div>

          <div className="divide-y divide-zinc-100">
            {topSellingSnacks.map((s, idx) => (
              <div key={s.name} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                      idx === 0
                        ? 'bg-amber-100 text-amber-800'
                        : idx === 1
                        ? 'bg-zinc-200 text-zinc-700'
                        : 'bg-zinc-100 text-zinc-500'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <div className="font-bold text-zinc-800">{s.name}</div>
                </div>
                <div className="font-mono font-bold text-amber-800">
                  {s.units} Units Sold
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GST Tax Slab Summary */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-purple-600" />
            <span>GST Tax Slab Classification</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 flex justify-between items-center">
              <div>
                <div className="font-bold text-zinc-900">12% GST Slab (Bhujia, Sev & Namkeen)</div>
                <div className="text-zinc-500 text-[11px]">Primary FMCG snack tax category</div>
              </div>
              <div className="font-mono font-bold text-zinc-800">
                ₹{(totalTax * 0.7).toFixed(2)}
              </div>
            </div>

            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 flex justify-between items-center">
              <div>
                <div className="font-bold text-zinc-900">5% GST Slab (Roasted Makhana & Plain Chips)</div>
                <div className="text-zinc-500 text-[11px]">Low tax essential category</div>
              </div>
              <div className="font-mono font-bold text-zinc-800">
                ₹{(totalTax * 0.2).toFixed(2)}
              </div>
            </div>

            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 flex justify-between items-center">
              <div>
                <div className="font-bold text-zinc-900">18% GST Slab (Extruded & Flavoured Chips)</div>
                <div className="text-zinc-500 text-[11px]">Processed snack tax bracket</div>
              </div>
              <div className="font-mono font-bold text-zinc-800">
                ₹{(totalTax * 0.1).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
