import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  Layers,
  ClipboardList,
  Users,
  ShieldCheck,
  BarChart3,
  Settings,
  ChevronRight,
  Menu,
  X,
  Store,
  Share2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import type { Order, User } from '../../types.ts';
import { AdminDashboard } from './AdminDashboard.tsx';
import { AdminOrders } from './AdminOrders.tsx';
import { AdminProducts } from './AdminProducts.tsx';
import { AdminCategories } from './AdminCategories.tsx';
import { AdminCustomers } from './AdminCustomers.tsx';
import { AdminManagers } from './AdminManagers.tsx';
import { AdminReports } from './AdminReports.tsx';
import { AdminSettings } from './AdminSettings.tsx';

export const AdminApp: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<Order | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders & Dispatch', icon: ClipboardList },
    { id: 'products', label: 'Snack SKUs & Stock', icon: Package },
    { id: 'categories', label: 'Categories', icon: Layers },
    { id: 'customers', label: 'Retail Accounts', icon: Users },
    { id: 'managers', label: 'Staff & Managers', icon: ShieldCheck },
    { id: 'reports', label: 'Financial Reports', icon: BarChart3 },
    { id: 'settings', label: 'Dealer Settings', icon: Settings },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-100 flex flex-col md:flex-row">
      {/* Mobile Sidebar Toggle Button */}
      <div className="md:hidden bg-white border-b border-zinc-200 px-4 py-2.5 flex items-center justify-between">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="flex items-center gap-2 text-xs font-bold text-zinc-800"
        >
          <Menu className="w-4 h-4" />
          <span>Admin Menu</span>
        </button>
        <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
          {navItems.find((i) => i.id === activeTab)?.label}
        </span>
      </div>

      {/* Admin Sidebar (SRS #40) */}
      <aside
        className={`${
          isSidebarOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 bg-zinc-900 text-zinc-300 shrink-0 border-r border-zinc-800 z-30`}
      >
        <div className="p-4 border-b border-zinc-800">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-500">
            Dealer Administration
          </div>
          <div className="font-bold text-white text-sm mt-0.5 truncate">
            {user?.shop_name || 'Shree Ganesh Snacks'}
          </div>
          <div className="text-[11px] text-zinc-400">
            Signed in as: <span className="text-zinc-200 font-medium">{user?.username}</span> ({user?.role})
          </div>
        </div>

        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`admin-nav-${item.id}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-amber-600 text-white font-bold shadow-xs'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Dealer WhatsApp Dispatch Quick Helper */}
        <div className="p-4 m-3 mt-6 bg-zinc-800/70 border border-zinc-700 rounded-2xl text-xs text-zinc-400 space-y-2">
          <div className="flex items-center gap-2 text-white font-semibold">
            <Share2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>WhatsApp Billing</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Direct 1-click WhatsApp bill distribution is active for all generated invoices.
          </p>
        </div>
      </aside>

      {/* Main Admin Content Canvas */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
        {activeTab === 'dashboard' && (
          <AdminDashboard
            onNavigateTab={(tab) => setActiveTab(tab)}
            onSelectOrder={(order) => {
              setSelectedOrderForDetail(order);
              setActiveTab('orders');
            }}
          />
        )}

        {activeTab === 'orders' && (
          <AdminOrders initialSelectedOrder={selectedOrderForDetail} />
        )}

        {activeTab === 'products' && <AdminProducts />}

        {activeTab === 'categories' && <AdminCategories />}

        {activeTab === 'customers' && (
          <AdminCustomers
            onViewOrdersForCustomer={(customer) => {
              setActiveTab('orders');
            }}
          />
        )}

        {activeTab === 'managers' && <AdminManagers />}

        {activeTab === 'reports' && <AdminReports />}

        {activeTab === 'settings' && <AdminSettings />}
      </main>
    </div>
  );
};
