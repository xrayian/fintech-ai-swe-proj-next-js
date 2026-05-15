import { U } from '@/lib/constants';

export function AmbientBg() {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      <div style={{
        position: "absolute", width: 900, height: 600, top: "-15%", left: "-5%", borderRadius: "50%",
        background: `radial-gradient(ellipse, ${U.violetSoft} 0%, transparent 70%)`,
        filter: "blur(40px)"
      }} />
      <div style={{
        position: "absolute", width: 800, height: 500, top: "-5%", right: "-10%", borderRadius: "50%",
        background: `radial-gradient(ellipse, ${U.cyanSoft} 0%, transparent 70%)`,
        filter: "blur(40px)"
      }} />
      <div style={{
        position: "absolute", width: 1000, height: 400, bottom: "-10%", left: "20%", borderRadius: "50%",
        background: `radial-gradient(ellipse, ${U.emeraldSoft} 0%, transparent 70%)`,
        filter: "blur(50px)"
      }} />
    </div>
  );
}
