import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  MessageSquare,
  Building2,
  Phone,
  Mail,
  MapPin,
  Clock,
  Eye,
  ShoppingBag,
} from 'lucide-react';
import type { User, Order } from '../../types.ts';
import { api } from '../../services/api.ts';

interface AdminCustomersProps {
  onViewOrdersForCustomer?: (customer: User) => void;
}

export const AdminCustomers: React.FC<AdminCustomersProps> = ({
  onViewOrdersForCustomer,
}) => {
  const [customers, setCustomers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const list = await api.getAdminCustomers();
        setCustomers(list);
      } catch (err) {
        console.error('Error loading customers:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      c.username.toLowerCase().includes(q) ||
      (c.shop_name && c.shop_name.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q)) ||
      (c.city && c.city.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
            Retail Accounts & Kirana Stores
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Registered wholesale retail clients, contact numbers, delivery addresses, and billing history
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="input-admin-search-customers"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by shop name, owner name, city, or mobile number..."
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Customer Grid & Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs hover:border-amber-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
                    {c.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900">{c.shop_name || c.username}</h3>
                    <div className="text-[11px] text-zinc-500">Contact: {c.username}</div>
                  </div>
                </div>

                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-full">
                  ACTIVE
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-zinc-600 bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{c.phone || '+91 98250 12345'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="truncate">{c.email}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{c.address || `${c.city || 'Surat'}, Gujarat`}</span>
                </div>
                {c.gstin && (
                  <div className="pt-1 text-[11px] font-mono text-zinc-500">
                    GSTIN: <span className="font-semibold text-zinc-700">{c.gstin}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center gap-2">
              <a
                href={`https://wa.me/${(c.phone || '919825012345').replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(
                  c.shop_name || c.username
                )}%2C%20greetings%20from%20DealerSnack%20wholesale%20distribution.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp</span>
              </a>

              <button
                onClick={() => {
                  if (onViewOrdersForCustomer) onViewOrdersForCustomer(c);
                }}
                className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
                title="View Order History"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Orders</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
