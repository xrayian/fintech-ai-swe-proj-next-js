# NEXUS Design System

## Visual Identity: Dark Glassmorphism

### Palette (U)
- **Backgrounds:**
  - `bg`: `#0a0a0f`
  - `bgDeep`: `#050508`
- **Glass Elements:**
  - `glass`: `rgba(255,255,255,0.04)`
  - `glassHi`: `rgba(255,255,255,0.07)`
  - `glassLo`: `rgba(255,255,255,0.025)`
- **Borders:**
  - `border`: `rgba(255,255,255,0.08)`
  - `borderHi`: `rgba(255,255,255,0.14)`
- **Text:**
  - `text`: `#ffffff`
  - `textDim`: `rgba(255,255,255,0.62)`
  - `textMute`: `rgba(255,255,255,0.38)`
  - `textFaint`: `rgba(255,255,255,0.20)`
- **Accents:**
  - `cyan`: `#22d3ee`
  - `violet`: `#a78bfa`
  - `emerald/up`: `#34d399`
  - `amber`: `#fbbf24`
  - `rose/down`: `#fb7185`

### Typography
- **Primary:** `Inter`, `DM Sans`, sans-serif
- **Mono:** `JetBrains Mono`, `SF Mono`, monospace

### Components
- **Glass Card:**
  ```css
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(24px) saturate(150%);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  ```

## UI Elements
- **Buttons:** primary (solid white), glass (blurred), cyan (soft blue).
- **Chips:** Rounded 999px, subtle borders, high-quality transitions.
- **KPI Cards:** Top-accented, large mono values, trend indicators.

## Animation
- **Ticker:** Infinite scroll for market tape.
- **Pulse:** Active dot for live status.
- **Float:** Floating brand icon.
- **FadeIn:** Smooth Y-axis entry for new components.
