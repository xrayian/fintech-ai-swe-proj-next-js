'use client';

import { Menu, X, Search, Settings, Bell } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { U } from '@/lib/constants';
import { Btn } from '@/components/shared/btn';
import { NAV } from './sidebar';
import { useResponsive } from '@/hooks/use-responsive';
import { useNotifications } from '@/components/shared/notification-provider';

export const SUBS: Record<string, string> = {
  "/dashboard": "Live market intelligence dashboard",
  "/technical": "OHLC candlestick analysis with 30s live polling",
  "/copilot": "AI-powered investment coaching with live fundamentals",
  "/compare": "Side-by-side multivariate asset comparison via radar analysis",
  "/news": "Global news feed with AI-assigned Fear/Greed sentiment scores",
  "/settings": "Watchlist management and display preferences",
  "/notifications": "Price alerts, news alerts, and AI signals",
  "/search": "Search across NYSE stocks",
};

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export function Header({ sidebarOpen, setSidebarOpen }: HeaderProps) {
  const { isMobile } = useResponsive();
  const pathname = usePathname();
  const { unreadCount } = useNotifications();
  const activeNav = NAV.find(n => n.href === pathname) || NAV[0];
  const sub = SUBS[pathname] || SUBS["/dashboard"];

  return (
    <div style={{
      background: U.headerBg, borderBottom: `1px solid ${U.border}`,
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            margin: 0, fontSize: "var(--header-title-s)" as any, fontWeight: 700, color: U.text,
            letterSpacing: "-0.025em", lineHeight: 1.2
          }}>{activeNav.label}</h1>
          <div style={{
            fontSize: 12, color: U.textMute, marginTop: 2,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            visibility: "var(--header-sub-vis)" as any,
          }}>{sub}</div>
        </div>
        <div style={{ display: "flex", gap: 7, flexShrink: 0, alignItems: "center" }}>
          {isMobile ? (
            <Link href="/search">
              <button style={{ width: 36, height: 36, borderRadius: 10, background: U.glass, backdropFilter: "blur(24px) saturate(150%)", border: `1px solid ${U.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <Search size={14} color={U.textDim} />
              </button>
            </Link>
          ) : (
            <Link href="/search"><Btn variant="glass" size="md"><Search size={13} /> Search</Btn></Link>
          )}

          <Link href="/notifications" style={{ position: "relative", display: "inline-block", textDecoration: "none" }}>
            {isMobile ? (
              <button style={{ width: 36, height: 36, borderRadius: 10, background: U.glass, backdropFilter: "blur(24px) saturate(150%)", border: `1px solid ${U.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <Bell size={14} color={pathname === "/notifications" ? U.cyan : U.textDim} />
              </button>
            ) : (
              <Btn variant={pathname === "/notifications" ? "cyan" : "glass"} size="md">
                <Bell size={13} /> Notifications
              </Btn>
            )}
            {unreadCount > 0 && (
              <span style={{
                position: "absolute",
                top: -3,
                right: -3,
                background: U.rose,
                color: "#ffffff",
                fontSize: 8,
                fontWeight: 800,
                borderRadius: "50%",
                width: 15,
                height: 15,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 8px ${U.rose}`,
                border: `1.5px solid #0a0a0f`,
                pointerEvents: "none"
              }}>
                {unreadCount}
              </span>
            )}
          </Link>

          <Link href="/settings">
            <Btn variant={pathname === "/settings" ? "cyan" : "glass"} size="md"><Settings size={13} /> Settings</Btn>
          </Link>
        </div>
      </div>
    </div>
  );
}
