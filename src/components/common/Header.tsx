import React, { useState } from 'react';
import {
  Store,
  ShieldCheck,
  Bell,
  ShoppingCart,
  LogOut,
  ChevronDown,
  User as UserIcon,
  Sparkles,
  ArrowLeftRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

interface HeaderProps {
  onOpenNotifications: () => void;
  onOpenLoginModal: () => void;
  onNavigateCart?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNotifications,
  onOpenLoginModal,
  onNavigateCart,
}) => {
  const {
    user,
    activePortal,
    setActivePortal,
    logout,
    demoLogin,
    cartTotalUnits,
    unreadNotifCount,
  } = useAuth();
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isAdminOrManager = user && (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' || user.role === 'MANAGER');

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-zinc-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Portal Indicator */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-sm font-bold text-lg">
                DS
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg tracking-tight text-zinc-900">DealerSnack</span>
                  <span className="text-[11px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600">
                    B2B
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 font-medium hidden sm:block">
                  Snacks & Namkeen Wholesale Distribution
                </p>
              </div>
            </div>

            {/* Portal Badge */}
            <div className="ml-2 hidden md:flex items-center gap-1.5">
              <div
                className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${
                  activePortal === 'ADMIN'
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {activePortal === 'ADMIN' ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Admin Dashboard</span>
                  </>
                ) : (
                  <>
                    <Store className="w-3.5 h-3.5" />
                    <span>Customer Ordering</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Portal Switcher (For testing or dual-role users) */}
            <button
              id="btn-switch-portal"
              onClick={() => {
                if (activePortal === 'ADMIN') {
                  setActivePortal('CUSTOMER');
                } else {
                  setActivePortal('ADMIN');
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-zinc-700 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 transition-colors"
              title="Toggle between Customer App and Admin Dashboard"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-zinc-500" />
              <span className="hidden sm:inline">
                {activePortal === 'ADMIN' ? 'Go to Customer App' : 'Go to Admin Portal'}
              </span>
              <span className="sm:hidden">{activePortal === 'ADMIN' ? 'Customer' : 'Admin'}</span>
            </button>

            {/* Quick Demo Switcher Dropdown */}
            <div className="relative">
              <button
                id="btn-demo-accounts"
                onClick={() => setShowDemoMenu(!showDemoMenu)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg text-amber-900 bg-amber-100/70 hover:bg-amber-100 border border-amber-300/60 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">Switch Role</span>
                <ChevronDown className="w-3 h-3 text-amber-600" />
              </button>

              {showDemoMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-zinc-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Quick Demo Accounts
                  </div>
                  <button
                    id="btn-demo-superadmin"
                    onClick={() => {
                      demoLogin('SUPER_ADMIN');
                      setShowDemoMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-purple-50 text-xs flex items-center justify-between text-zinc-800 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-purple-700">👑 Super Admin</div>
                      <div className="text-[11px] text-zinc-500">admin@example.com (Full pricing & control)</div>
                    </div>
                  </button>

                  <button
                    id="btn-demo-manager"
                    onClick={() => {
                      demoLogin('MANAGER');
                      setShowDemoMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 text-xs flex items-center justify-between text-zinc-800 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-blue-700">👔 Branch Manager</div>
                      <div className="text-[11px] text-zinc-500">manager@example.com (Orders & Dispatch)</div>
                    </div>
                  </button>

                  <button
                    id="btn-demo-customer"
                    onClick={() => {
                      demoLogin('CUSTOMER');
                      setShowDemoMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-amber-50 text-xs flex items-center justify-between text-zinc-800 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-amber-700">🛒 Customer (Sharma Kirana)</div>
                      <div className="text-[11px] text-zinc-500">customer@example.com (Strict: Zero prices)</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Notifications Button */}
            <button
              id="btn-header-notifications"
              onClick={onOpenNotifications}
              className="relative p-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                  {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                </span>
              )}
            </button>

            {/* Customer Cart Indicator (when in customer portal) */}
            {activePortal === 'CUSTOMER' && onNavigateCart && (
              <button
                id="btn-header-cart"
                onClick={onNavigateCart}
                className="relative p-2 text-zinc-700 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                title="Order Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartTotalUnits > 0 && (
                  <span className="absolute top-1 right-1 px-1.5 py-0.2 bg-amber-600 text-white text-[10px] font-bold rounded-full ring-2 ring-white">
                    {cartTotalUnits}
                  </span>
                )}
              </button>
            )}

            {/* User Account / Profile button */}
            {user ? (
              <div className="relative">
                <button
                  id="btn-user-profile-menu"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-zinc-800 text-white flex items-center justify-center font-semibold text-xs">
                    {user.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="hidden lg:block text-left text-xs leading-tight">
                    <div className="font-semibold text-zinc-900">{user.username}</div>
                    <div className="text-[11px] text-zinc-500 truncate max-w-[120px]">
                      {user.shop_name || user.role}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400 hidden lg:block" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-zinc-200 p-2 z-50">
                    <div className="px-3 py-2 border-b border-zinc-100 mb-1">
                      <div className="font-semibold text-xs text-zinc-900">{user.username}</div>
                      <div className="text-[11px] text-zinc-500">{user.email}</div>
                      <div className="text-[10px] font-semibold text-amber-700 mt-1 uppercase tracking-wide">
                        Role: {user.role}
                      </div>
                    </div>
                    <button
                      id="btn-menu-logout"
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs text-red-600 hover:bg-red-50 font-medium flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="btn-header-login"
                onClick={onOpenLoginModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                <UserIcon className="w-4 h-4" />
                <span>Log In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
