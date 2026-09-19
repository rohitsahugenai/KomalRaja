import React, { useState } from 'react';
import {
  Store,
  User as UserIcon,
  Phone,
  Mail,
  MapPin,
  Building,
  FileCheck,
  Bell,
  MessageSquare,
  LogOut,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';

export const CustomerProfile: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    shop_name: user?.shop_name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    pincode: user?.pincode || '',
    gstin: user?.gstin || '',
  });
  const [successMsg, setSuccessMsg] = useState(false);
  const [notifAlerts, setNotifAlerts] = useState(true);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await api.updateCustomerProfile(formData);
      updateUser(updated);
      setIsEditing(false);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-xl font-bold text-zinc-900 tracking-tight">My Profile & Shop Settings</h1>
        <p className="text-xs text-zinc-500">Manage business information, delivery address, and preferences</p>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Profile details updated successfully!</span>
        </div>
      )}

      {/* Account Info Card */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-base">
              {user?.username.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900">{user?.shop_name || user?.username}</h2>
              <p className="text-xs text-zinc-500">Retail Partner ID: {user?.id}</p>
            </div>
          </div>

          <button
            id="btn-edit-profile"
            onClick={() => setIsEditing(!isEditing)}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-700 transition-colors"
          >
            {isEditing ? 'Cancel' : 'Edit Details'}
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Shop Name</label>
                <input
                  type="text"
                  value={formData.shop_name}
                  onChange={(e) => setFormData({ ...formData, shop_name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Primary Mobile</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Delivery Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Pincode</label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-700 mb-1">GSTIN Number (Optional)</label>
                <input
                  type="text"
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                  placeholder="24AAECS1234F1ZG"
                  className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </form>
        ) : (
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="flex items-start gap-3">
              <Store className="w-4 h-4 text-zinc-400 mt-0.5" />
              <div>
                <span className="text-zinc-400">Shop / Firm Name</span>
                <p className="font-semibold text-zinc-800">{user?.shop_name || 'Not provided'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <UserIcon className="w-4 h-4 text-zinc-400 mt-0.5" />
              <div>
                <span className="text-zinc-400">Account Username</span>
                <p className="font-semibold text-zinc-800">{user?.username}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-zinc-400 mt-0.5" />
              <div>
                <span className="text-zinc-400">Registered Mobile</span>
                <p className="font-semibold text-zinc-800">{user?.phone || 'Not provided'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-zinc-400 mt-0.5" />
              <div>
                <span className="text-zinc-400">Email Address</span>
                <p className="font-semibold text-zinc-800">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 sm:col-span-2">
              <MapPin className="w-4 h-4 text-zinc-400 mt-0.5" />
              <div>
                <span className="text-zinc-400">Primary Delivery Location</span>
                <p className="font-semibold text-zinc-800">
                  {user?.address ? `${user.address}, ${user.city || ''} - ${user.pincode || ''}` : 'Shop 14, Main Market, Station Road, Surat - 395003'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FileCheck className="w-4 h-4 text-zinc-400 mt-0.5" />
              <div>
                <span className="text-zinc-400">Business GSTIN</span>
                <p className="font-mono font-semibold text-zinc-800">{user?.gstin || '24AAECS1234F1ZG'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Building className="w-4 h-4 text-zinc-400 mt-0.5" />
              <div>
                <span className="text-zinc-400">Business Segment</span>
                <p className="font-semibold text-zinc-800">{user?.business_type || 'Retail FMCG / Kirana'}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preferences & Helpdesk Card */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-5 space-y-4 shadow-xs">
        <h3 className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
          Preferences & Communications
        </h3>

        <div className="flex items-center justify-between py-2 border-b border-zinc-100 text-xs">
          <div className="flex items-center gap-2.5">
            <Bell className="w-4 h-4 text-amber-600" />
            <div>
              <span className="font-semibold text-zinc-800">Order Dispatch Notifications</span>
              <p className="text-[11px] text-zinc-400">Receive alerts when order is packed or out for delivery</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={notifAlerts}
            onChange={(e) => setNotifAlerts(e.target.checked)}
            className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
          />
        </div>

        <a
          href="https://wa.me/919820011223?text=Hello%20DealerSnack%20Support%2C%20I%20have%20an%20inquiry%20regarding%20my%20wholesale%20order."
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <MessageSquare className="w-4 h-4 text-emerald-600" />
          <span>Contact Dealer Support on WhatsApp</span>
        </a>

        <button
          id="btn-profile-logout"
          onClick={() => logout()}
          className="w-full py-2.5 px-4 bg-zinc-100 hover:bg-red-50 hover:text-red-700 text-zinc-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out from Device</span>
        </button>
      </div>
    </div>
  );
};
