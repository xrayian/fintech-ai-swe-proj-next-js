'use client';

import { useState } from 'react';
import { Bell, BellOff, Plus } from 'lucide-react';
import { U } from '@/lib/constants';
import { GlassCard } from '@/components/shared/glass-card';
import { SectionTitle } from '@/components/shared/section-title';
import { Btn } from '@/components/shared/btn';

export default function NotificationsPage() {
  const [alerts] = useState<any[]>([]);

  return (
    <div style={{ animation: "fi .4s ease" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <SectionTitle icon={Bell}>Notifications</SectionTitle>
        <Btn variant="glass" size="sm" onClick={() => alert('Alert creation coming soon.')}>
          <Plus size={11} /> Create Alert
        </Btn>
      </div>

      {alerts.length === 0 ? (
        <GlassCard style={{ padding: "48px 24px", textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: U.glass, border: `1px solid ${U.border}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <BellOff size={22} color={U.textMute} />
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: U.text, marginBottom: 6 }}>No notifications yet</div>
          <div style={{ fontSize: 12, color: U.textMute, lineHeight: 1.6, maxWidth: 340, margin: "0 auto" }}>
            Get notified about price movements, news alerts, and AI-driven signals for your tracked symbols.
          </div>
          <div style={{ marginTop: 20, display: "flex", gap: 10, justifyContent: "center" }}>
            <Btn variant="glass" size="sm" onClick={() => alert('Alert creation coming soon.')}>
              <Plus size={11} /> Create your first alert
            </Btn>
          </div>
          <div style={{ marginTop: 20, display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            {[
              { icon: Bell, label: 'Price alerts', desc: 'Target price thresholds' },
              { icon: Bell, label: 'News alerts', desc: 'Breaking news on symbols' },
              { icon: Bell, label: 'Signal alerts', desc: 'AI score changes' },
            ].map(a => (
              <div key={a.label} style={{ background: U.glassLo, border: `1px solid ${U.border}`, borderRadius: 10, padding: "14px 16px", flex: 1, minWidth: 140, opacity: 0.5 }}>
                <a.icon size={14} color={U.textMute} style={{ marginBottom: 6 }} />
                <div style={{ fontSize: 11, fontWeight: 600, color: U.text }}>{a.label}</div>
                <div style={{ fontSize: 9, color: U.textFaint, marginTop: 2 }}>{a.desc}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      ) : (
        <div>{/* alert list — future */}</div>
      )}
    </div>
  );
}
