'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, TrendingUp, Bot, BarChart2, Globe, Search, Settings, Bell
} from "lucide-react";
import { U } from '@/lib/constants';
import { useMarketStatus } from '@/hooks/use-market-status';
import { useNotifications } from '@/components/shared/notification-provider';


export const NAV = [
  { id: "dashboard", label: "Overview", mobileLabel: "Overview", icon: LayoutDashboard, href: "/dashboard" },
  { id: "technical", label: "Technical Analysis", mobileLabel: "Technical", icon: TrendingUp, href: "/technical" },
  { id: "copilot", label: "AI Copilot", mobileLabel: "Copilot", icon: Bot, href: "/copilot" },
  { id: "compare", label: "Compare Assets", mobileLabel: "Compare", icon: BarChart2, href: "/compare" },
  { id: "news", label: "News Sentiment", mobileLabel: "News", icon: Globe, href: "/news" },
  { id: "search", label: "Search", mobileLabel: "Search", icon: Search, href: "/search" },
  { id: "notifications", label: "Notifications", mobileLabel: "Alerts", icon: Bell, href: "/notifications" },
  { id: "settings", label: "Settings", mobileLabel: "Settings", icon: Settings, href: "/settings" },
];

interface SidebarProps {
  open: boolean;
  mobile?: boolean;
  onClose?: () => void;
}

export function Sidebar({ open, mobile, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { online, marketOpen, timestamp } = useMarketStatus();
  const { unreadCount } = useNotifications();
  const openW = open ? 'var(--sidebar-w)' : '0px';

  return (
    <>
      {mobile && open && (
        <div onClick={onClose} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          zIndex: 20, animation: "fi .15s ease",
        }} />
      )}
      <div style={{
        width: mobile ? (open ? 218 : 0) : (openW as any),
        minWidth: mobile ? (open ? 218 : 0) : (openW as any),
        overflow: "hidden", flexShrink: 0,
        transition: "width .22s ease,min-width .22s ease",
        position: mobile ? "fixed" : "relative",
        left: mobile ? 0 : undefined, top: mobile ? 0 : undefined,
        bottom: mobile ? 0 : undefined,
        zIndex: mobile ? 21 : 10,
        background: mobile ? U.navBg : undefined,
      }}>
        <div style={{
          width: 218, height: "100%", display: "flex", flexDirection: "column",
          background: U.navBg,
          backdropFilter: "blur(30px) saturate(160%)",
          WebkitBackdropFilter: "blur(30px) saturate(160%)",
          borderRight: `1px solid ${U.border}`
        }}>

        {/* Brand */}
        <div style={{ padding: "22px 20px 18px", borderBottom: `1px solid ${U.border}`, position: "relative" }}>
          <div style={{
            fontSize: 17, fontWeight: 800, color: U.text,
            letterSpacing: "-0.03em", lineHeight: 1, display: "flex", alignItems: "center", gap: 8
          }}>
            <img src="/nexus.png" alt="Nexus" style={{ width: 26, height: 26, borderRadius: 6, flexShrink: 0 }} />
            NEXUS
          </div>
          <div style={{
            fontSize: 9, fontWeight: 600, color: U.textFaint,
            marginTop: 5, letterSpacing: "0.16em"
          }}>MARKET INTELLIGENCE</div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "10px 10px" }}>
          {NAV.map(({ id, label, icon: Icon, href }) => {
            const act = pathname === href || (pathname === '/' && id === 'dashboard');
            return (
              <Link key={id} href={href} style={{ textDecoration: 'none' }}>
                <div
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "10px 12px",
                    borderRadius: 10, border: `1px solid ${act ? U.borderHi : "transparent"}`,
                    background: act ? U.glass : "transparent",
                    color: act ? U.text : U.textMute, cursor: "pointer", marginBottom: 3,
                    fontSize: 12.5, fontWeight: act ? 600 : 400, textAlign: "left",
                    transition: "all .15s", whiteSpace: "nowrap",
                    backdropFilter: act ? "blur(10px)" : "none"
                  }}
                >
                  <Icon size={14} color={act ? U.cyan : undefined} />
                  <span style={{ flex: 1 }}>{label}</span>
                  {id === "copilot" && <span style={{
                    width: 5, height: 5, borderRadius: "50%", background: U.emerald,
                    flexShrink: 0, boxShadow: `0 0 6px ${U.emerald}`, animation: "pulse-dot 2.5s ease infinite"
                  }} />}
                  {id === "notifications" && unreadCount > 0 && (
                    <span style={{
                      background: U.rose,
                      color: "#ffffff",
                      fontSize: 10,
                      fontWeight: 700,
                      borderRadius: 8,
                      padding: "1px 6px",
                      minWidth: 16,
                      height: 16,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: `0 0 8px ${U.rose}`,
                      animation: "pulse-dot 2.5s ease infinite",
                      flexShrink: 0
                    }}>
                      {unreadCount}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Market status */}
        <div style={{ padding: "14px 18px", borderTop: `1px solid ${U.border}` }}>
          <div style={{
            fontSize: 9, fontWeight: 600, color: U.textFaint, textTransform: "uppercase",
            letterSpacing: "0.14em", marginBottom: 8
          }}>Market Status</div>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{
              width: 7, height: 7, borderRadius: "50%",
              background: online ? (marketOpen ? U.emerald : U.amber) : U.rose,
              boxShadow: online && marketOpen ? `0 0 8px ${U.emerald}` : 'none',
              animation: online && marketOpen ? "pulse-dot 2.5s ease infinite" : "none"
            }} />
            <span style={{
              fontSize: 12, fontWeight: 600,
              color: online ? (marketOpen ? U.emerald : U.amber) : U.rose
            }}>
              {online ? (marketOpen ? 'NYSE Open' : 'Market Closed') : 'Offline'}
            </span>
          </div>
          <div style={{ fontSize: 10, color: U.textFaint, marginTop: 4, fontFamily: 'JetBrains Mono' }}>
            {timestamp || '—'}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
