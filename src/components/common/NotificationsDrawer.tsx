import React from 'react';
import { X, Bell, CheckCircle2, Clock, Truck, FileText, AlertCircle } from 'lucide-react';
import type { AppNotification } from '../../types.ts';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onSelectOrder?: (orderId: string) => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onSelectOrder,
}) => {
  if (!isOpen) return null;

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'order_received':
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case 'order_confirmed':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'status_update':
        return <Truck className="w-5 h-5 text-blue-500" />;
      case 'invoice_ready':
        return <FileText className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-zinc-500" />;
    }
  };

  const formatTime = (iso: string) => {
    try {
      const date = new Date(iso);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return '';
    }
  };

  return (
    <div id="notifications-drawer-backdrop" className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
      <div
        id="notifications-drawer-panel"
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300"
      >
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 text-base">Notifications</h3>
              <p className="text-xs text-zinc-500">Real-time order & dispatch updates</p>
            </div>
          </div>
          <button
            id="btn-close-notifications"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-16 text-zinc-400">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="font-medium text-sm">No new notifications</p>
              <p className="text-xs text-zinc-400 mt-1">You will receive alerts here when orders change status</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  if (n.order_id && onSelectOrder) {
                    onSelectOrder(n.order_id);
                    onClose();
                  }
                }}
                className={`p-3.5 rounded-xl border transition-all ${
                  n.read ? 'bg-white border-zinc-200' : 'bg-amber-50/60 border-amber-200 shadow-xs'
                } ${n.order_id ? 'cursor-pointer hover:border-amber-400' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">{getIcon(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-semibold text-zinc-900 truncate">{n.title}</h4>
                      <span className="text-[11px] text-zinc-400 shrink-0">{formatTime(n.created_at)}</span>
                    </div>
                    <p className="text-xs text-zinc-600 mt-1 leading-relaxed">{n.message}</p>
                    {n.order_number && (
                      <div className="mt-2 inline-flex items-center text-[11px] font-medium text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded">
                        Order #{n.order_number}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-3 border-t border-zinc-200 bg-zinc-50 text-center">
          <p className="text-[11px] text-zinc-400">DealerSnack Real-time Push Dispatch System</p>
        </div>
      </div>
    </div>
  );
};
