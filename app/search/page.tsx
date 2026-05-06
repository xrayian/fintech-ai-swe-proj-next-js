import { Search } from 'lucide-react';
import { GlassCard } from '@/components/shared/glass-card';
import { U } from '@/lib/constants';

export default function SearchPage() {
  return (
    <div style={{ animation: "fi .4s ease" }}>
      <GlassCard style={{ padding: "24px", textAlign: "center" }}>
        <Search size={48} color={U.textMute} style={{ marginBottom: "16px" }} />
        <h2 style={{ color: U.text, marginBottom: "8px" }}>Search</h2>
        <p style={{ color: U.textDim }}>Global search for assets, news, and analysis.</p>
      </GlassCard>
    </div>
  );
}
