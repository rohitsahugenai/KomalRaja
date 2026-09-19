import React, { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  X,
} from 'lucide-react';
import type { User, ManagerPermissions } from '../../types.ts';

export const AdminManagers: React.FC = () => {
  const [managers, setManagers] = useState<User[]>([
    {
      id: 'mgr-1',
      username: 'rajesh_dispatch',
      email: 'rajesh@dealersnack.com',
      role: 'MANAGER',
      phone: '+91 98250 88990',
      is_active: true,
      created_at: '2026-08-01',
      permissions: {
        view_orders: true,
        manage_orders: true,
        view_customers: true,
        manage_customers: false,
        view_products: true,
        delete_products: false,
        manage_admins: false,
        system_settings: false,
      },
    },
    {
      id: 'admin-main',
      username: 'admin',
      email: 'owner@dealersnack.com',
      role: 'ADMIN',
      phone: '+91 98200 11223',
      is_active: true,
      created_at: '2026-06-01',
      permissions: {
        view_orders: true,
        manage_orders: true,
        view_customers: true,
        manage_customers: true,
        view_products: true,
        delete_products: true,
        manage_admins: true,
        system_settings: true,
      },
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'MANAGER' | 'ADMIN'>('MANAGER');
  const [permissions, setPermissions] = useState<ManagerPermissions>({
    view_orders: true,
    manage_orders: true,
    view_customers: true,
    manage_customers: false,
    view_products: true,
    delete_products: false,
    manage_admins: false,
    system_settings: false,
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newMgr: User = {
      id: `mgr-${Date.now()}`,
      username,
      email,
      phone,
      role,
      is_active: true,
      created_at: new Date().toISOString(),
      permissions: role === 'ADMIN' ? {
        view_orders: true,
        manage_orders: true,
        view_customers: true,
        manage_customers: true,
        view_products: true,
        delete_products: true,
        manage_admins: true,
        system_settings: true,
      } : permissions,
    };
    setManagers([...managers, newMgr]);
    setIsModalOpen(false);
  };

  const handleTogglePermission = (key: keyof ManagerPermissions) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
            Manager Access Control & Roles
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Create warehouse dispatchers and assistant managers with restricted permissions (SRS #26)
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Manager</span>
        </button>
      </div>

      {/* Managers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {managers.map((m) => (
          <div
            key={m.id}
            className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                    m.role === 'ADMIN'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-zinc-900">{m.username}</h3>
                    <span
                      className={`px-2 py-0.2 rounded-full text-[10px] font-bold uppercase ${
                        m.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {m.role}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">{m.email} • {m.phone}</p>
                </div>
              </div>
            </div>

            {/* Granular Permissions Badges */}
            <div className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-100">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Active Permissions
              </div>
              <div className="flex flex-wrap gap-1.5">
                {m.permissions?.view_orders && (
                  <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-semibold rounded">
                    ✓ View Orders
                  </span>
                )}
                {m.permissions?.manage_orders && (
                  <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-semibold rounded">
                    ✓ Dispatch & Billing
                  </span>
                )}
                {m.permissions?.view_customers && (
                  <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-semibold rounded">
                    ✓ View Retailers
                  </span>
                )}
                {m.permissions?.view_products && (
                  <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-semibold rounded">
                    ✓ View Catalog
                  </span>
                )}
                {m.permissions?.system_settings && (
                  <span className="px-2 py-0.5 bg-purple-50 border border-purple-200 text-purple-800 text-[10px] font-semibold rounded">
                    ✓ Dealer Settings
                  </span>
                )}
                {m.permissions?.delete_products && (
                  <span className="px-2 py-0.5 bg-red-50 border border-red-200 text-red-800 text-[10px] font-semibold rounded">
                    ✓ Delete Products
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden">
            <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
              <h3 className="text-sm font-bold text-zinc-900">Provision Staff / Manager Account</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-zinc-400 hover:text-zinc-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Username</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. suresh_billing"
                    className="w-full px-3 py-2 border border-zinc-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 border border-zinc-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="staff@dealersnack.com"
                    className="w-full px-3 py-2 border border-zinc-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Mobile</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98250 ..."
                    className="w-full px-3 py-2 border border-zinc-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Assigned Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-xl bg-white"
                >
                  <option value="MANAGER">Manager (Restricted Access)</option>
                  <option value="ADMIN">Super Admin (Unrestricted Full Access)</option>
                </select>
              </div>

              {role === 'MANAGER' && (
                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2">
                  <div className="font-bold text-zinc-700 mb-1">Manager Permissions Checklist:</div>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={permissions.view_orders}
                        onChange={() => handleTogglePermission('view_orders')}
                      />
                      <span>View Orders</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={permissions.manage_orders}
                        onChange={() => handleTogglePermission('manage_orders')}
                      />
                      <span>Manage Orders & Status</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={permissions.view_customers}
                        onChange={() => handleTogglePermission('view_customers')}
                      />
                      <span>View Retailers</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={permissions.view_products}
                        onChange={() => handleTogglePermission('view_products')}
                      />
                      <span>View Products</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={permissions.system_settings}
                        onChange={() => handleTogglePermission('system_settings')}
                      />
                      <span>System Settings</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-zinc-100 text-zinc-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
