'use client';

import { useState } from 'react';
import { U } from '@/lib/constants';

interface ChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export function Chip({ label, active, onClick }: ChipProps) {
  const [h, sh] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => sh(true)}
      onMouseLeave={() => sh(false)}
      style={{
        padding: "6px 13px", borderRadius: 999, cursor: "pointer",
        fontSize: 11, fontWeight: 600, lineHeight: 1, transition: "all .15s",
        backdropFilter: "blur(10px)",
        border: `1px solid ${active ? "rgba(255,255,255,0.22)" : U.border}`,
        background: active ? "rgba(255,255,255,0.12)" : (h ? U.glassHi : U.glass),
        color: active ? U.text : U.textDim
      }}
    >
      {label}
    </button>
  );
}
