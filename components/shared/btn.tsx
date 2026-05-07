'use client';

import { useState } from 'react';
import { U } from '@/lib/constants';

interface BtnProps {
  children: React.ReactNode;
  variant?: 'primary' | 'glass' | 'cyan';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
}

export function Btn({ children, variant = "primary", size = "md", onClick, disabled }: BtnProps) {
  const [h, sh] = useState(false);
  const pad = { sm: "5px 12px", md: "9px 16px", lg: "12px 22px" }[size];
  const fs = { sm: 11, md: 13, lg: 15 }[size];
  const v = {
    primary: { background: h ? "#f0f0f0" : "rgba(255,255,255,0.92)", color: "#0a0a0f", border: "1px solid rgba(255,255,255,0.15)" },
    glass: { background: h ? U.glassHi : U.glass, color: U.text, border: `1px solid ${h ? U.borderHi : U.border}`, backdropFilter: "blur(12px)" },
    cyan: { background: h ? "rgba(34,211,238,0.22)" : U.cyanSoft, color: U.cyan, border: "1px solid rgba(34,211,238,0.28)" },
  }[variant] || {};

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => sh(true)}
      onMouseLeave={() => sh(false)}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
        padding: pad, borderRadius: 999, cursor: disabled ? "not-allowed" : "pointer",
        fontWeight: 600, fontSize: fs, lineHeight: 1.25,
        transition: "all .15s", outline: "none", opacity: disabled ? .4 : 1, ...v
      }}
    >
      {children}
    </button>
  );
}
