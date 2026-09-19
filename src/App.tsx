import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Header } from './components/common/Header.tsx';
import { NotificationsDrawer } from './components/common/NotificationsDrawer.tsx';
import { LoginModal } from './components/auth/LoginModal.tsx';
import { CustomerApp } from './components/customer/CustomerApp.tsx';
import { AdminApp } from './components/admin/AdminApp.tsx';
import { ShieldCheck, Lock } from 'lucide-react';

const MainContent: React.FC = () => {
  const { user, activePortal, notifications } = useAuth();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginModalTab, setLoginModalTab] = useState<'CUSTOMER' | 'ADMIN'>('CUSTOMER');

  const handleOpenLogin = (tab: 'CUSTOMER' | 'ADMIN' = activePortal) => {
    setLoginModalTab(tab);
    setIsLoginModalOpen(true);
  };

  // If in ADMIN portal but not logged in as ADMIN or MANAGER
  if (activePortal === 'ADMIN' && (!user || user.role === 'CUSTOMER')) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white flex flex-col justify-between">
        <Header
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenLoginModal={() => handleOpenLogin('ADMIN')}
        />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-zinc-800/90 border border-zinc-700 rounded-3xl p-6 sm:p-8 text-center shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
              <Lock className="w-8 h-8" />
            </div>

            <span className="inline-block px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-bold rounded-full uppercase tracking-wider mb-2 border border-amber-500/20">
              Authorized Personnel Only
            </span>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Dealer Management Portal
            </h2>

            <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
              {user?.role === 'CUSTOMER'
                ? 'Your current account is signed in as a Retail Customer. Please switch to or sign in with an Authorized Dealer/Manager account.'
                : 'Please sign in with your dealer credentials to access wholesale pricing, customer orders, inventory stock, and invoice generation.'}
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <button
                id="btn-admin-login-prompt"
                onClick={() => handleOpenLogin('ADMIN')}
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Sign In to Dealer Portal</span>
              </button>
            </div>
          </div>
        </div>

        <NotificationsDrawer
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          notifications={notifications}
        />
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          defaultTab={loginModalTab}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenLoginModal={() => handleOpenLogin(activePortal)}
      />
      <div className="flex-1">
        {activePortal === 'CUSTOMER' ? <CustomerApp /> : <AdminApp />}
      </div>
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
      />
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        defaultTab={loginModalTab}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-zinc-50 text-zinc-900 selection:bg-amber-100 selection:text-amber-900 font-sans">
        <MainContent />
      </div>
    </AuthProvider>
  );
}
