import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, CustomerProduct, CartItem, AppNotification } from '../types.ts';
import { api } from '../services/api.ts';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  activePortal: 'CUSTOMER' | 'ADMIN';
  setActivePortal: (portal: 'CUSTOMER' | 'ADMIN') => void;
  login: (identifier: string, pass: string, roleHint?: string) => Promise<User>;
  demoLogin: (role: 'SUPER_ADMIN' | 'MANAGER' | 'CUSTOMER') => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (updated: User) => void;
  // Shopping Cart state
  cart: CartItem[];
  addToCart: (product: CustomerProduct, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartTotalItems: number;
  cartTotalUnits: number;
  // Notifications
  notifications: AppNotification[];
  unreadNotifCount: number;
  refreshNotifications: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(api.getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activePortal, setActivePortal] = useState<'CUSTOMER' | 'ADMIN'>('CUSTOMER');
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('dealersnack_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState<number>(0);

  // Sync cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem('dealersnack_cart', JSON.stringify(cart));
    } catch {
      // Ignore
    }
  }, [cart]);

  // Initial user fetch
  useEffect(() => {
    async function loadUser() {
      const storedToken = api.getToken();
      if (!storedToken) {
        // Auto-initialize demo customer for immediate out-of-the-box readiness
        try {
          const res = await api.demoLogin('CUSTOMER');
          setUser(res.user);
          setToken(res.token);
          setActivePortal('CUSTOMER');
        } catch {
          // Ignore
        }
        setIsLoading(false);
        return;
      }

      try {
        const { user: fetchedUser } = await api.getMe();
        setUser(fetchedUser);
        if (fetchedUser.role === 'SUPER_ADMIN' || fetchedUser.role === 'ADMIN' || fetchedUser.role === 'MANAGER') {
          setActivePortal('ADMIN');
        } else {
          setActivePortal('CUSTOMER');
        }
      } catch {
        api.removeToken();
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  // Refresh notifications periodically
  const refreshNotifications = async () => {
    if (!user) return;
    try {
      let list: AppNotification[] = [];
      if (activePortal === 'ADMIN' && (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' || user.role === 'MANAGER')) {
        list = await api.getAdminNotifications();
      } else {
        list = await api.getCustomerNotifications();
      }
      setNotifications(list);
      setUnreadNotifCount(list.filter((n) => !n.read).length);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    refreshNotifications();
    const interval = setInterval(refreshNotifications, 15000);
    return () => clearInterval(interval);
  }, [user, activePortal]);

  const login = async (identifier: string, pass: string, roleHint?: string): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.login(identifier, pass, roleHint);
      setUser(res.user);
      setToken(res.token);
      if (res.user.role === 'CUSTOMER') {
        setActivePortal('CUSTOMER');
      } else {
        setActivePortal('ADMIN');
      }
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async (role: 'SUPER_ADMIN' | 'MANAGER' | 'CUSTOMER'): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.demoLogin(role);
      setUser(res.user);
      setToken(res.token);
      if (role === 'CUSTOMER') {
        setActivePortal('CUSTOMER');
      } else {
        setActivePortal('ADMIN');
      }
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.logout();
      setUser(null);
      setToken(null);
      setCart([]);
      setActivePortal('CUSTOMER');
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (updated: User) => {
    setUser(updated);
  };

  // Cart operations
  const addToCart = (product: CustomerProduct, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotalItems = cart.length;
  const cartTotalUnits = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        activePortal,
        setActivePortal,
        login,
        demoLogin,
        logout,
        updateUser,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartTotalItems,
        cartTotalUnits,
        notifications,
        unreadNotifCount,
        refreshNotifications,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
