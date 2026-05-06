'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { AmbientBg } from '@/components/layout/ambient-bg';
import { TickerTape } from '@/components/layout/ticker-tape';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const isCopilot = pathname === '/copilot';

  return (
    <html lang="en">
      <body>
        <AmbientBg />
        <div style={{ display: "flex", height: "100vh", position: "relative", zIndex: 1, overflow: "hidden" }}>
          <Sidebar open={sidebarOpen} />
          
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
            <TickerTape />
            <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <main style={{ 
              flex: 1, 
              overflowY: isCopilot ? "hidden" : "auto", 
              padding: isCopilot ? 0 : 22, 
              background: "rgba(5,5,8,0.3)",
              position: "relative"
            }}>
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
