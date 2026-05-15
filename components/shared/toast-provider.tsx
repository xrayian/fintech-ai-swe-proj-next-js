'use client';

import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { X, CheckCircle, AlertTriangle, Info, AlertOctagon } from 'lucide-react';
import { U } from '@/lib/constants';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICON_MAP: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: AlertOctagon,
  warning: AlertTriangle,
  info: Info,
};

const COLOR_MAP: Record<ToastType, { accent: string; soft: string; border: string }> = {
  success: { accent: U.emerald, soft: U.emeraldSoft, border: `rgba(52,211,153,0.25)` },
  error: { accent: U.rose, soft: U.roseSoft, border: `rgba(251,113,133,0.25)` },
  warning: { accent: U.amber, soft: U.amberSoft, border: `rgba(251,191,36,0.25)` },
  info: { accent: U.cyan, soft: U.cyanSoft, border: `rgba(34,211,238,0.25)` },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = ++counter.current;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => removeToast(id), 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div style={{
        position: 'fixed', bottom: "var(--toast-bottom)" as any, right: 20, zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: 8,
        maxWidth: 360, width: '100%', pointerEvents: 'none',
      }}>
        {toasts.map(t => {
          const c = COLOR_MAP[t.type];
          const Icon = ICON_MAP[t.type];
          return (
            <div key={t.id} style={{
              pointerEvents: 'auto',
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 14px',
              background: U.navBg,
              backdropFilter: 'blur(24px) saturate(150%)',
              WebkitBackdropFilter: 'blur(24px) saturate(150%)',
              border: `1px solid ${c.border}`,
              borderLeft: `3px solid ${c.accent}`,
              borderRadius: 12,
              boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
              animation: 'toast-in .3s ease',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: c.soft, border: `1px solid ${c.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Icon size={13} color={c.accent} />
              </div>
              <div style={{ flex: 1, fontSize: 12, color: U.textDim, lineHeight: 1.4, minWidth: 0 }}>
                {t.message}
              </div>
              <button onClick={() => removeToast(t.id)} style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: U.textFaint, padding: 2, flexShrink: 0,
              }}>
                <X size={13} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
