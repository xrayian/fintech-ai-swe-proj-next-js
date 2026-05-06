import { LucideIcon } from 'lucide-react';
import { U } from '@/lib/constants';

interface SectionTitleProps {
  icon?: LucideIcon;
  children: React.ReactNode;
  right?: React.ReactNode;
}

export function SectionTitle({ icon: Icon, children, right }: SectionTitleProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
      <div style={{
        fontSize: 10, fontWeight: 600, color: U.textMute, textTransform: "uppercase",
        letterSpacing: "0.14em", display: "flex", alignItems: "center", gap: 6
      }}>
        {Icon && <Icon size={10} />}
        {children}
      </div>
      {right && <div style={{ marginLeft: "auto" }}>{right}</div>}
    </div>
  );
}
