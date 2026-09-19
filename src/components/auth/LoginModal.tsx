import React, { useState } from 'react';
import { X, Lock, User as UserIcon, ShieldAlert, Sparkles, Store, KeyRound, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'CUSTOMER' | 'ADMIN';
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'CUSTOMER',
}) => {
  const { login, demoLogin } = useAuth();
  const [activeTab, setActiveTab] = useState<'CUSTOMER' | 'ADMIN'>(defaultTab);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setError('Please provide both username/email/mobile and password.');
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      await login(identifier, password, activeTab);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async (role: 'SUPER_ADMIN' | 'MANAGER' | 'CUSTOMER') => {
    setError(null);
    setIsLoading(true);
    try {
      await demoLogin(role);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="login-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        id="login-modal-dialog"
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-linear-to-r from-amber-600 to-orange-600 p-5 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight">DealerSnack</span>
              <span className="px-1.5 py-0.5 text-[10px] bg-white/20 rounded font-semibold tracking-wider uppercase">
                B2B Portal
              </span>
            </div>
            <p className="text-xs text-amber-100 mt-1">Wholesale Ordering & Distribution Network</p>
          </div>
          <button
            id="btn-close-login"
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-zinc-200 bg-zinc-50">
          <button
            id="tab-customer-login"
            type="button"
            onClick={() => {
              setActiveTab('CUSTOMER');
              setError(null);
              setIdentifier('customer@example.com');
              setPassword('Customer@123');
            }}
            className={`flex-1 py-3 px-4 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === 'CUSTOMER'
                ? 'border-amber-600 text-amber-700 bg-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Customer Ordering Login</span>
          </button>
          <button
            id="tab-admin-login"
            type="button"
            onClick={() => {
              setActiveTab('ADMIN');
              setError(null);
              setIdentifier('admin@example.com');
              setPassword('Admin@123');
            }}
            className={`flex-1 py-3 px-4 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === 'ADMIN'
                ? 'border-purple-600 text-purple-700 bg-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Admin / Manager Login</span>
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                {activeTab === 'CUSTOMER' ? 'Mobile Number / Email / Username' : 'Admin Email or Username'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  id="input-login-identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={
                    activeTab === 'CUSTOMER' ? 'e.g. 9876543210 or customer@example.com' : 'admin@example.com'
                  }
                  className="w-full pl-9 pr-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-zinc-700">Password</label>
                <button
                  type="button"
                  onClick={() => alert('For demo purposes, default passwords are: Admin@123, Manager@123, Customer@123')}
                  className="text-[11px] text-amber-700 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="input-login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter account password"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
                />
              </div>
            </div>

            <button
              id="btn-submit-login"
              type="submit"
              disabled={isLoading}
              className={`w-full py-2.5 rounded-lg text-white font-semibold text-sm shadow-xs transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'ADMIN'
                  ? 'bg-purple-700 hover:bg-purple-800'
                  : 'bg-amber-600 hover:bg-amber-700'
              } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <KeyRound className="w-4 h-4" />
              {isLoading ? 'Signing in...' : `Log In to ${activeTab === 'ADMIN' ? 'Admin Portal' : 'Ordering App'}`}
            </button>
          </form>

          {/* Quick Demo Credentials Autofill */}
          <div className="mt-6 pt-5 border-t border-zinc-200">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Instant Demo Logins</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {activeTab === 'ADMIN' ? (
                <>
                  <button
                    id="btn-quick-admin"
                    type="button"
                    onClick={() => handleQuickDemo('SUPER_ADMIN')}
                    className="p-2.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl text-left transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-xs text-purple-900">👑 Super Admin Access</div>
                      <div className="text-[11px] text-purple-700">admin@example.com (Password: Admin@123)</div>
                    </div>
                    <span className="text-[10px] font-semibold bg-purple-200/80 text-purple-800 px-2 py-0.5 rounded">
                      Full Access
                    </span>
                  </button>

                  <button
                    id="btn-quick-manager"
                    type="button"
                    onClick={() => handleQuickDemo('MANAGER')}
                    className="p-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-left transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-xs text-blue-900">👔 Depot Manager</div>
                      <div className="text-[11px] text-blue-700">manager@example.com (Password: Manager@123)</div>
                    </div>
                    <span className="text-[10px] font-semibold bg-blue-200/80 text-blue-800 px-2 py-0.5 rounded">
                      Operations
                    </span>
                  </button>
                </>
              ) : (
                <button
                  id="btn-quick-customer"
                  type="button"
                  onClick={() => handleQuickDemo('CUSTOMER')}
                  className="p-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-left transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-xs text-amber-900">🛒 Retail Kirana Customer</div>
                    <div className="text-[11px] text-amber-700">customer@example.com (Password: Customer@123)</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">Sharma Kirana Store • Surat</div>
                  </div>
                  <span className="text-[10px] font-semibold bg-amber-200/80 text-amber-800 px-2 py-0.5 rounded">
                    Zero Prices
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-zinc-50 px-6 py-3 border-t border-zinc-200 text-center">
          <p className="text-[11px] text-zinc-500">
            Need a B2B Snack dealership trade account?{' '}
            <span className="text-amber-700 font-semibold cursor-pointer hover:underline">
              Request Dealer Onboarding
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
