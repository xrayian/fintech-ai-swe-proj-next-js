'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, TrendingUp, Bot, BarChart2, Globe } from 'lucide-react';
import { AmbientBg } from '@/components/layout/ambient-bg';
import { TickerTape } from '@/components/layout/ticker-tape';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { ToastProvider } from '@/components/shared/toast-provider';
import { U } from '@/lib/constants';
import { useResponsive } from '@/hooks/use-responsive';
import "./globals.css";

const MOBILE_NAV = [
  { id: "dashboard", label: "Overview", icon: LayoutDashboard, href: "/dashboard" },
  { id: "technical", label: "Technical", icon: TrendingUp, href: "/technical" },
  { id: "copilot", label: "Copilot", icon: Bot, href: "/copilot" },
  { id: "compare", label: "Compare", icon: BarChart2, href: "/compare" },
  { id: "news", label: "News", icon: Globe, href: "/news" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const isCopilot = pathname === '/copilot';
  const { isMobile } = useResponsive();

  return (
    <html lang="en">
      <body>
        <AmbientBg />
        <div style={{ display: "flex", height: "100vh", position: "relative", zIndex: 1, overflow: "hidden" }}>
          <Sidebar open={sidebarOpen} mobile={isMobile} onClose={() => setSidebarOpen(false)} />
          
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
            <TickerTape />
            <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <main style={{ 
              flex: 1, 
              overflowY: isCopilot ? "hidden" : "auto", 
              padding: isCopilot ? 0 : "var(--main-p)" as any, 
              background: "rgba(5,5,8,0.3)",
              position: "relative",
              paddingBottom: isCopilot ? 0 : "calc(var(--main-p) + var(--bottom-nav-h))" as any,
            }}>
              <ToastProvider>{children}</ToastProvider>
            </main>
          </div>

          {isMobile && (
            <div style={{
              position: "fixed", bottom: 0, left: 0, right: 0, height: "var(--bottom-nav-h)" as any,
              background: "rgba(5,5,8,0.92)", backdropFilter: "blur(30px) saturate(160%)",
              WebkitBackdropFilter: "blur(30px) saturate(160%)",
              borderTop: `1px solid ${U.border}`,
              display: "flex", alignItems: "center", justifyContent: "space-around",
              zIndex: 100,
            }}>
              {MOBILE_NAV.map(({ id, label, icon: Icon, href }) => {
                const act = pathname === href || (pathname === '/' && id === 'dashboard');
                return (
                  <Link key={id} href={href} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '6px 0', flex: 1 }}>
                    <Icon size={18} color={act ? U.cyan : U.textMute} />
                    <span style={{ fontSize: 9, fontWeight: act ? 700 : 500, color: act ? U.cyan : U.textMute }}>{label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </body>
    </html>
  );
}
