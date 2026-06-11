'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AmbientBg } from '@/components/layout/ambient-bg';
import { TickerTape } from '@/components/layout/ticker-tape';
import { Sidebar, NAV } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { ToastProvider } from '@/components/shared/toast-provider';
import { ThemeProvider } from '@/components/shared/theme-provider';
import { U } from '@/lib/constants';
import { useResponsive } from '@/hooks/use-responsive';
import { SupportChat } from '@/components/shared/support-chat';
import "./globals.css";
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
        <ThemeProvider>
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
              background: "var(--glass-lo)",
              position: "relative",
              paddingBottom: isCopilot ? 0 : "calc(var(--main-p) + var(--bottom-nav-h))" as any,
            }}>
              <ToastProvider>{children}</ToastProvider>
            </main>
          </div>

          {isMobile && (
            <div style={{
              position: "fixed", bottom: 0, left: 0, right: 0, height: "var(--bottom-nav-h)" as any,
              background: U.navBg, backdropFilter: "blur(30px) saturate(160%)",
              WebkitBackdropFilter: "blur(30px) saturate(160%)",
              borderTop: `1px solid ${U.border}`,
              display: "flex", alignItems: "center", justifyContent: "space-around",
              zIndex: 100,
            }}>
              {NAV.map(({ id, mobileLabel, icon: Icon, href }) => {
                const act = pathname === href || (pathname === '/' && id === 'dashboard');
                return (
                  <Link key={id} href={href} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '6px 0', flex: 1, minWidth: 44 }}>
                    <div style={{ position: "relative" }}>
                      <Icon size={18} color={act ? U.cyan : U.textMute} />
                      {id === "copilot" && <span style={{ position: "absolute", top: -2, right: -2, width: 6, height: 6, borderRadius: "50%", background: U.emerald, boxShadow: `0 0 6px ${U.emerald}`, animation: "pulse-dot 2.5s ease infinite" }} />}
                      {id === "notifications" && <span style={{ position: "absolute", top: -4, right: -6, background: U.cyanSoft, color: U.cyan, fontSize: 8, fontWeight: 800, padding: "0 3px", borderRadius: 999 }}>3</span>}
                    </div>
                    <span style={{ fontSize: 9, fontWeight: act ? 700 : 500, color: act ? U.cyan : U.textMute }}>{mobileLabel}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
        {!isCopilot && <SupportChat />}
        </ThemeProvider>
      </body>
    </html>
  );
}
