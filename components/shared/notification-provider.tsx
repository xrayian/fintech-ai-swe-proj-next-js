'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from './toast-provider';
import { useLiveTickers } from '@/hooks/use-live-tickers';

export interface PriceAlert {
  id: string;
  symbol: string;
  type: 'above' | 'below';
  value: number;
  createdAt: string;
  active: boolean;
}

export interface MarketNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  symbol: string;
  type: 'price' | 'news' | 'signal';
}

interface NotificationContextValue {
  alerts: PriceAlert[];
  notifications: MarketNotification[];
  createAlert: (symbol: string, type: 'above' | 'below', value: number) => void;
  deleteAlert: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [notifications, setNotifications] = useState<MarketNotification[]>([]);
  const { toast } = useToast();
  const live = useLiveTickers();

  // 1. Initial Load from localStorage (deferred to bypass SSR mismatch and effect warnings)
  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      try {
        const storedAlerts = localStorage.getItem('nexus-alerts');
        if (storedAlerts) setAlerts(JSON.parse(storedAlerts));

        const storedNotifications = localStorage.getItem('nexus-notifications');
        if (storedNotifications) setNotifications(JSON.parse(storedNotifications));
      } catch {}
    });
    return () => { active = false; };
  }, []);

  // 3. Dynamic Alert checking logic
  useEffect(() => {
    let active = true;
    if (!alerts.length || !Object.keys(live).length) return;

    let triggeredAny = false;
    const triggeredNotifications: MarketNotification[] = [];
    const triggeredAlertIds = new Set<string>();

    for (const alert of alerts) {
      if (!alert.active) continue;

      const liveData = live[alert.symbol];
      if (!liveData || liveData.price === 0) continue;

      const curPrice = liveData.price;
      let isTriggered = false;

      if (alert.type === 'above' && curPrice >= alert.value) {
        isTriggered = true;
      } else if (alert.type === 'below' && curPrice <= alert.value) {
        isTriggered = true;
      }

      if (isTriggered) {
        triggeredAlertIds.add(alert.id);
        triggeredAny = true;

        const notif: MarketNotification = {
          id: crypto.randomUUID(),
          title: `Alert Triggered: ${alert.symbol}`,
          message: `${alert.symbol} is currently $${curPrice.toFixed(2)}, which has crossed your target threshold of $${alert.value.toFixed(2)}.`,
          timestamp: new Date().toISOString(),
          read: false,
          symbol: alert.symbol,
          type: 'price',
        };

        triggeredNotifications.push(notif);
        toast('info', `${alert.symbol} hit target of $${alert.value.toFixed(2)} (Current: $${curPrice.toFixed(2)})`);
      }
    }

    if (triggeredAny) {
      Promise.resolve().then(() => {
        if (!active) return;
        setAlerts(prev => {
          const next = prev.map(a => triggeredAlertIds.has(a.id) ? { ...a, active: false } : a);
          try {
            localStorage.setItem('nexus-alerts', JSON.stringify(next));
          } catch {}
          return next;
        });
        setNotifications(prev => {
          const next = [...triggeredNotifications, ...prev];
          try {
            localStorage.setItem('nexus-notifications', JSON.stringify(next));
          } catch {}
          return next;
        });
      });
    }

    return () => { active = false; };
  }, [live, alerts, toast]);

  const createAlert = useCallback((symbol: string, type: 'above' | 'below', value: number) => {
    const newAlert: PriceAlert = {
      id: crypto.randomUUID(),
      symbol,
      type,
      value,
      createdAt: new Date().toISOString(),
      active: true,
    };
    setAlerts(prev => {
      const next = [newAlert, ...prev];
      try {
        localStorage.setItem('nexus-alerts', JSON.stringify(next));
      } catch {}
      return next;
    });
    toast('success', `Price alert created for ${symbol} at $${value.toFixed(2)}`);
  }, [toast]);

  const deleteAlert = useCallback((id: string) => {
    setAlerts(prev => {
      const next = prev.filter(a => a.id !== id);
      try {
        localStorage.setItem('nexus-alerts', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => {
      const next = prev.map(n => n.id === id ? { ...n, read: true } : n);
      try {
        localStorage.setItem('nexus-notifications', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      const next = prev.map(n => ({ ...n, read: true }));
      try {
        localStorage.setItem('nexus-notifications', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => {
      const next = prev.filter(n => n.id !== id);
      try {
        localStorage.setItem('nexus-notifications', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    try {
      localStorage.setItem('nexus-notifications', JSON.stringify([]));
    } catch {}
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      alerts,
      notifications,
      createAlert,
      deleteAlert,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearAllNotifications,
      unreadCount
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
