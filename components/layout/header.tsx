'use client';

import { Menu, X, Search, Bell, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { U } from '@/lib/constants';
import { Btn } from '@/components/shared/btn';
import { NAV } from './sidebar';

export const SUBS: Record<string, string> = {
  "/dashboard": "Live market intelligence dashboard",
  "/technical": "OHLC candlestick analysis with 30s live polling",
  "/copilot": "AI-powered investment coaching with live fundamentals",
  "/compare": "Side-by-side multivariate asset comparison via radar analysis",
  "/news": "Global news feed with AI-assigned Fear/Greed sentiment scores",
  "/settings": "API connections and display preferences",
  "/notifications": "Price alerts, news alerts, and AI signals",
  "/search": "Search across 8 tracked symbols",
};

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export function Header({ sidebarOpen, setSidebarOpen }: HeaderProps) {
  const pathname = usePathname();
  const activeNav = NAV.find(n => n.href === pathname) || NAV[0];
  const sub = SUBS[pathname] || SUBS["/dashboard"];

  return (
    <div style={{
      background: "rgba(5,5,8,0.6)", borderBottom: `1px solid ${U.border}`,
      backdropFilter: "blur(20px)", flexShrink: 0, padding: "0 22px", position: "relative", zIndex: 5
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 14, paddingBottom: 12 }}>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            width: 34, height: 34, borderRadius: 10,
            background: U.glass,
            backdropFilter: "blur(24px) saturate(150%)",
            border: `1px solid ${U.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", flexShrink: 0
          }}
        >
          {sidebarOpen ? <X size={13} color={U.textDim} /> : <Menu size={13} color={U.textDim} />}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{
            margin: 0, fontSize: "var(--header-title-s)" as any, fontWeight: 700, color: U.text,
            letterSpacing: "-0.025em", lineHeight: 1.2
          }}>{activeNav.label}</h1>
          <div style={{
            fontSize: 11, color: U.textMute, marginTop: 2,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            visibility: "var(--header-sub-vis)" as any,
          }}>{sub}</div>
        </div>
        <div style={{ display: "flex", gap: 7, flexShrink: 0 }}>
          <Link href="/search"><Btn variant="glass" size="sm"><Search size={11} /> Search</Btn></Link>
          <Link href="/notifications">
            <button style={{
              width: 34, height: 34, borderRadius: 10,
              background: U.glass,
              backdropFilter: "blur(24px) saturate(150%)",
              border: `1px solid ${U.border}`,
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
            }}>
              <Bell size={13} color={U.textDim} />
            </button>
          </Link>
          <Link href="/settings">
            <button style={{
              width: 34, height: 34, borderRadius: 10,
              background: U.glass,
              backdropFilter: "blur(24px) saturate(150%)",
              border: `1px solid ${U.border}`,
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
            }}>
              <Settings size={13} color={U.textDim} />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
