import { Settings as SettingsIcon } from 'lucide-react';
import { GlassCard } from '@/components/shared/glass-card';
import { U } from '@/lib/constants';

export default function SettingsPage() {
  return (
    <div style={{ animation: "fi .4s ease" }}>
      <GlassCard style={{ padding: "24px", textAlign: "center" }}>
        <SettingsIcon size={48} color={U.textMute} style={{ marginBottom: "16px" }} />
        <h2 style={{ color: U.text, marginBottom: "8px" }}>Settings</h2>
        <p style={{ color: U.textDim }}>System configuration and user preferences module.</p>
      </GlassCard>
    </div>
  );
}
