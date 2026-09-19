import React, { useState } from 'react';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  FileCheck,
  Save,
  CheckCircle2,
  MessageSquare,
  CreditCard,
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const [formData, setFormData] = useState({
    dealer_name: 'Shree Ganesh Snack Distributors',
    brand_title: 'DealerSnack Wholesale Network',
    gstin: '24AAECS9876E1Z5',
    phone: '+91 98200 11223',
    email: 'orders@dealersnack.com',
    address: 'Plot 42, GIDC Industrial Estate, Ring Road, Surat - 395002, Gujarat',
    bank_name: 'HDFC Bank, Ring Road Branch',
    account_number: '50200098765432',
    ifsc: 'HDFC0001234',
    upi_id: 'dealersnack@hdfcbank',
    whatsapp_template: 'Hello {customer_name}, your wholesale snack bill {invoice_number} for ₹{amount} is generated.',
  });

  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 text-xs">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
          Dealer Business & Invoicing Settings
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
          Configure distribution entity legal details, GST registration, bank coordinates, and WhatsApp templates
        </p>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Dealer settings and billing profiles saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Entity Card */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-600" />
            <span>Dealer Enterprise Information</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Company Registered Name</label>
              <input
                type="text"
                value={formData.dealer_name}
                onChange={(e) => setFormData({ ...formData, dealer_name: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Trade Brand Name</label>
              <input
                type="text"
                value={formData.brand_title}
                onChange={(e) => setFormData({ ...formData, brand_title: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Dealer GSTIN Number</label>
              <input
                type="text"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 rounded-xl font-mono uppercase"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Dispatch WhatsApp & Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 rounded-xl"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-zinc-700 mb-1">Warehouse & Billing Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Banking & Settlement Card */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-purple-600" />
            <span>Bank Coordinates for Invoice Settlement</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Bank Name & Branch</label>
              <input
                type="text"
                value={formData.bank_name}
                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Current Account Number</label>
              <input
                type="text"
                value={formData.account_number}
                onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">IFSC Code</label>
              <input
                type="text"
                value={formData.ifsc}
                onChange={(e) => setFormData({ ...formData, ifsc: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 rounded-xl font-mono uppercase"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">UPI VPA Handle</label>
              <input
                type="text"
                value={formData.upi_id}
                onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 rounded-xl font-mono"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Dealer Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
