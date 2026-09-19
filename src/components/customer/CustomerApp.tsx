import React, { useState } from 'react';
import {
  Home,
  Package,
  ShoppingCart,
  ClipboardList,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { CustomerHome } from './CustomerHome.tsx';
import { CustomerProducts } from './CustomerProducts.tsx';
import { CustomerCart } from './CustomerCart.tsx';
import { CustomerOrders } from './CustomerOrders.tsx';
import { CustomerProfile } from './CustomerProfile.tsx';

export const CustomerApp: React.FC = () => {
  const { cartTotalUnits } = useAuth();
  const [activeTab, setActiveTab] = useState<'home' | 'products' | 'cart' | 'orders' | 'profile'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-50 flex flex-col justify-between">
      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1">
        {activeTab === 'home' && (
          <CustomerHome
            onNavigateTab={(tab) => {
              if (tab === 'products') setActiveTab('products');
              if (tab === 'cart') setActiveTab('cart');
              if (tab === 'orders') setActiveTab('orders');
              if (tab === 'profile') setActiveTab('profile');
            }}
            onSelectCategory={(catId) => {
              setSelectedCategory(catId);
              setActiveTab('products');
            }}
          />
        )}

        {activeTab === 'products' && (
          <CustomerProducts initialCategoryId={selectedCategory} />
        )}

        {activeTab === 'cart' && (
          <CustomerCart
            onNavigateTab={(tab) => {
              if (tab === 'products') setActiveTab('products');
              if (tab === 'orders') setActiveTab('orders');
            }}
          />
        )}

        {activeTab === 'orders' && (
          <CustomerOrders
            onNavigateTab={(tab) => {
              if (tab === 'cart') setActiveTab('cart');
              if (tab === 'products') setActiveTab('products');
            }}
          />
        )}

        {activeTab === 'profile' && <CustomerProfile />}
      </main>

      {/* Mobile & Desktop Bottom Navigation Bar (SRS #39) */}
      <nav
        id="customer-bottom-navigation"
        className="sticky bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200 shadow-lg px-2 py-1.5"
      >
        <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
          <button
            id="nav-tab-home"
            onClick={() => setActiveTab('home')}
            className={`py-1.5 px-2 flex flex-col items-center justify-center rounded-xl transition-all ${
              activeTab === 'home'
                ? 'text-amber-700 font-bold bg-amber-50'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Home className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] tracking-tight">Home</span>
          </button>

          <button
            id="nav-tab-products"
            onClick={() => setActiveTab('products')}
            className={`py-1.5 px-2 flex flex-col items-center justify-center rounded-xl transition-all ${
              activeTab === 'products'
                ? 'text-amber-700 font-bold bg-amber-50'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Package className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] tracking-tight">Products</span>
          </button>

          <button
            id="nav-tab-cart"
            onClick={() => setActiveTab('cart')}
            className={`relative py-1.5 px-2 flex flex-col items-center justify-center rounded-xl transition-all ${
              activeTab === 'cart'
                ? 'text-amber-700 font-bold bg-amber-50'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <ShoppingCart className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] tracking-tight">Cart</span>
            {cartTotalUnits > 0 && (
              <span className="absolute top-1 right-2 px-1.5 py-0.2 bg-amber-600 text-white text-[9px] font-bold rounded-full">
                {cartTotalUnits}
              </span>
            )}
          </button>

          <button
            id="nav-tab-orders"
            onClick={() => setActiveTab('orders')}
            className={`py-1.5 px-2 flex flex-col items-center justify-center rounded-xl transition-all ${
              activeTab === 'orders'
                ? 'text-amber-700 font-bold bg-amber-50'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <ClipboardList className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] tracking-tight">My Orders</span>
          </button>

          <button
            id="nav-tab-profile"
            onClick={() => setActiveTab('profile')}
            className={`py-1.5 px-2 flex flex-col items-center justify-center rounded-xl transition-all ${
              activeTab === 'profile'
                ? 'text-amber-700 font-bold bg-amber-50'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <UserIcon className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] tracking-tight">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
