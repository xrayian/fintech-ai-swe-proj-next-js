'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';
import { U } from '@/lib/constants';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  compact?: boolean;
}

export function ErrorMessage({ message, onRetry, compact }: ErrorMessageProps) {
  return (
    <div style={{
      display: "flex",
      alignItems: compact ? "center" : "flex-start",
      gap: compact ? 8 : 10,
      padding: compact ? "10px 14px" : "18px 20px",
      background: U.glass,
      border: `1px solid ${U.border}`,
      borderRadius: 14,
      borderLeft: `3px solid ${U.amber}`,
      backdropFilter: "blur(24px) saturate(150%)",
      animation: "fi .3s ease",
    }}>
      <div style={{
        width: compact ? 24 : 32,
        height: compact ? 24 : 32,
        borderRadius: "50%",
        background: U.amberSoft,
        border: `1px solid rgba(251,191,36,0.25)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}>
        <AlertTriangle size={compact ? 11 : 14} color={U.amber} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: compact ? 11 : 12,
          color: U.textDim,
          lineHeight: 1.5,
        }}>{message}</div>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "6px 12px",
            borderRadius: 8,
            border: `1px solid ${U.borderHi}`,
            background: U.glassHi,
            color: U.textMute,
            fontSize: 10,
            fontWeight: 600,
            cursor: "pointer",
            flexShrink: 0,
            transition: "all .15s",
          }}
        >
          <RefreshCw size={11} />
          Retry
        </button>
      )}
    </div>
  );
}
