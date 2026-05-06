import { Bell } from 'lucide-react';
import { GlassCard } from '@/components/shared/glass-card';
import { U } from '@/lib/constants';

export default function NotificationsPage() {
  return (
    <div style={{ animation: "fi .4s ease" }}>
      <GlassCard style={{ padding: "24px", textAlign: "center" }}>
        <Bell size={48} color={U.textMute} style={{ marginBottom: "16px" }} />
        <h2 style={{ color: U.text, marginBottom: "8px" }}>Notifications</h2>
        <p style={{ color: U.textDim }}>Real-time alerts and market event notifications.</p>
      </GlassCard>
    </div>
  );
}
