# Brutalist Scroll Portfolio — Design Spec

**Date:** 2026-03-24
**Project:** `G:\Projects\portfolio` (React 19 + Vite 8)
**Owner:** Sahil Lakhani
**Reference prototype:** `reference.html` in project root (authoritative visual truth where spec is silent)

---

## Overview

A full-screen brutalist single-page portfolio with 5 fullscreen sections. Navigation is scroll/keyboard/touch driven. Sections transition via a red wipe overlay animation. No routing library. Framer Motion handles all animations. CSS Modules per component. Space Mono / Bebas Neue / IBM Plex Sans from Google Fonts.

---

## Personalization

| Field | Value |
|---|---|
| Name display | SAHIL / LAKHANI. (red dot on second line) |
| Sub-label | FULL-STACK ENGINEER · SYSTEMS · DISTRIBUTED |
| Location | BASED IN BERLIN / UTC+1 / OPEN TO REMOTE *(placeholder)* |
| Email | Sahillakhani0106@gmail.com |
| GitHub | https://github.com/Sahil-Lakhani |
| LinkedIn | https://www.linkedin.com/in/lakhani-sahil/ |
| Twitter | **Omitted — do not render a Twitter link row** |

---

## File Structure

```
src/
  main.jsx
  App.jsx
  App.module.css
  index.css              # global resets, font imports, CSS variables
  theme.js               # JS color palette constants
  components/
    Cursor.jsx + Cursor.module.css
    NavDots.jsx + NavDots.module.css
    Overlay.jsx + Overlay.module.css
    sections/
      Hero.jsx + Hero.module.css
      About.jsx + About.module.css
      Projects.jsx + Projects.module.css
      Skills.jsx + Skills.module.css
      Contact.jsx + Contact.module.css
  hooks/
    useScroll.js
docs/
  superpowers/specs/
    2026-03-24-brutalist-portfolio-design.md
```

---

## Dependencies

- `framer-motion` — install via `npm install framer-motion`
- All others already present (React 19, Vite 8, ESLint)

---

## Theme / Color System

### `src/theme.js`

Single source of truth for all color values used in JS (e.g., Framer Motion `animate` props that take hex strings directly, not CSS variables).

```js
export const colors = {
  black: '#080808',
  white: '#f0ede6',
  red:   '#ff3c00',
  gray:  '#1a1a1a',
  mid:   '#888',
}
```

CSS modules reference `var(--red)` etc. Any Framer Motion prop that must take a hex value (e.g., background color in Overlay) imports from `theme.js`. Both must be updated together when rethemeing.

### `index.css` palette block

```css
/* ============================================================
   PALETTE — edit here to retheme the entire site.
   Mirror any changes in src/theme.js
   ============================================================ */
:root {
  --black: #080808;
  --white: #f0ede6;
  --red:   #ff3c00;
  --gray:  #1a1a1a;
  --mid:   #888;
}
```

---

## Global CSS (`index.css`)

**Font import** (exact variants):
```css
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:ital,wght@0,400;0,700;1,400&family=IBM+Plex+Sans:wght@300;400;600&display=swap');
```

**Resets:**
```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: auto; }
body {
  background: var(--black);
  color: var(--white);
  font-family: 'Space Mono', monospace;
  overflow: hidden;
  cursor: none;
  height: 100vh;
  width: 100vw;
}
```

**Noise overlay** (fixed, z-200, pointer-events none, opacity 0.03):
```css
.noise {
  position: fixed; inset: 0;
  pointer-events: none;
  z-index: 200;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 256px;
}
```

**Counter** (fixed bottom-right, z-100):
```css
.counter {
  position: fixed;
  bottom: 28px; right: 28px;
  font-size: 10px;
  color: #333;
  letter-spacing: .15em;
  z-index: 100;
  font-family: 'Space Mono', monospace;
}
.counter span { color: var(--white); }  /* active number highlighted white */
```

**Scroll hint** (fixed bottom-center, z-100):
```css
.scrollHint {
  position: fixed;
  bottom: 28px; left: 50%;
  transform: translateX(-50%);
  font-size: 9px;
  color: #333;
  letter-spacing: .2em;
  z-index: 100;
  font-family: 'Space Mono', monospace;
  transition: opacity .5s;
}
```

---

## App.jsx

**State:**
- `currentSection` (number, 0–4)
- `transitioning` (boolean)
- `overlayPhase` (`'idle' | 'in' | 'out'`)
- `scrollHintVisible` (boolean, true initially, set false on first navigation)

**`goTo(next)` logic:**
1. Guard: if `transitioning || next === current || out of bounds` → return
2. Set `transitioning = true`, `overlayPhase = 'in'`, `scrollHintVisible = false`
3. After **420ms**: swap `currentSection = next`, set `overlayPhase = 'out'`
4. After **460ms** more: set `transitioning = false`, `overlayPhase = 'idle'`

*Note: The overlay Framer Motion duration is `0.42s`. The 420ms swap wait matches this exactly. The reference prototype used `0.45s` CSS keyframes — the React version uses `0.42s` so the JS timing and animation duration are precisely aligned.*

**Render structure:**
```jsx
<>
  <div className={styles.noise} />
  <Overlay phase={overlayPhase} />
  <Cursor />
  <NavDots currentSection={currentSection} goTo={goTo} />

  <div className={styles.sections}>
    <Hero     isActive={currentSection === 0} />
    <About    isActive={currentSection === 1} />
    <Projects isActive={currentSection === 2} />
    <Skills   isActive={currentSection === 3} />
    <Contact  isActive={currentSection === 4} />
  </div>

  <div className={styles.counter}>
    <span>{String(currentSection + 1).padStart(2, '0')}</span> / 05
  </div>
  <div
    className={styles.scrollHint}
    style={{ opacity: scrollHintVisible ? 1 : 0 }}
  >
    SCROLL OR ARROW KEYS
  </div>
</>
```

**`App.module.css`** key rules:
```css
.sections {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  overflow: hidden;
}
```
(`index.css` holds only the noise overlay rule since that div has no scoped class. Counter and scrollHint styles live exclusively in `App.module.css` using `styles.counter` and `styles.scrollHint`.)

**`useScroll` hook** called at top of App:
```js
useScroll({ goTo, transitioning, currentSection })
```

---

## Components

### `Overlay.jsx`

- `motion.div`, `position: fixed; inset: 0`, `background: var(--red)`, z-index 500
- Props: `phase: 'idle' | 'in' | 'out'`
- `transformOrigin` switches based on phase: `phase === 'out' ? 'top' : 'bottom'` — set via `style` prop
- Variants:
  ```js
  const variants = {
    idle: { scaleY: 0 },
    in:   { scaleY: 1, transition: { duration: 0.42, ease: [0.7, 0, 0.3, 1] } },
    out:  { scaleY: 0, transition: { duration: 0.42, ease: [0.7, 0, 0.3, 1] } },
  }
  ```
- `animate={phase}` drives the variant

### `Cursor.jsx`

- `motion.div`
- Base style: `position: fixed; width: 12px; height: 12px; border-radius: 50%; background: var(--red); mix-blend-mode: difference; pointer-events: none; z-index: 9999; transform: translate(-50%, -50%)`
- `useEffect` on mount: listen to `mousemove`, set `el.style.left` and `el.style.top` directly via ref (not state)
- Expand on hover: listen to `mouseenter`/`mouseleave` on `a, button, [data-cursor-hover]`. Framer Motion `animate` between `{ width: 12, height: 12 }` and `{ width: 48, height: 48 }` with `transition={{ duration: 0.2, ease: 'easeInOut' }}`
- **Note:** `[data-cursor-hover]` is the React replacement for the reference's class-based selectors (`.proj-card`, `.dot`). NavDots and project cards must carry `data-cursor-hover` on their interactive root elements.

### `NavDots.jsx`

- `position: fixed; right: 28px; top: 50%; transform: translateY(-50%); display: flex; flex-direction: column; gap: 10px; z-index: 100`
- 5 dots: `width: 6px; height: 6px; border: 1px solid #444; border-radius: 50%; cursor: pointer`
- Active dot: `background: var(--red); border-color: var(--red)`
- `onClick` → `goTo(index)`
- Each dot element gets `data-cursor-hover` attribute
- No size change on dot hover — only background/border-color transition (`transition: background .2s, border-color .2s`); cursor expansion is handled by `Cursor.jsx`

---

## Sections

All sections receive `isActive: boolean`. All Framer Motion elements use:
```js
animate={isActive ? 'visible' : 'hidden'}
initial="hidden"
```
When `isActive` goes false, elements snap to `hidden` instantly (no exit transition — red wipe covers it).

Base section padding: `60px` on all sides (per-section overrides noted below).

---

### Section 1 — Hero (`bg: #080808`)

**Layout overrides:** `flex-direction: column; align-items: flex-start; justify-content: flex-end; padding-bottom: 80px`

**Scan line:**
```css
position: absolute; top: 0; left: 0; right: 0;
height: 2px;
background: linear-gradient(90deg, transparent, var(--red), transparent);
animation: scan 4s linear infinite;
opacity: 0.3;

@keyframes scan { 0% { top: 0; } 100% { top: 100%; } }
```

**Sub-label:**
- Text: `FULL-STACK ENGINEER · SYSTEMS · DISTRIBUTED`
- `font-size: 11px; color: var(--red); letter-spacing: .25em; text-transform: uppercase; margin-bottom: 28px`
- `hidden: { opacity: 0, x: -20 }` → `visible: { opacity: 1, x: 0, transition: { duration: 0.6, delay: 0.7 } }`

**Big name:**
- `font-family: 'Bebas Neue', sans-serif; font-size: clamp(90px, 18vw, 240px); line-height: .88; letter-spacing: -.01em; user-select: none; color: var(--white)`
- Two lines: `SAHIL` and `LAKHANI<span style={{ color: 'var(--red)' }}>.</span>`
- Each line: `overflow: hidden` wrapper div + inner `motion.span`
- `hidden: { y: '110%' }` → `visible: { y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } }`
- Line 1 `transition.delay: 0.05`, Line 2 `transition.delay: 0.18`

**Available row:**
- 8px pulsing red dot + `AVAILABLE FOR NEW ROLES — 2025`
- `font-size: 10px; color: #444; letter-spacing: .15em; display: flex; align-items: center; gap: 10px`
- Pulse: `@keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:.3 } }`, `animation: pulse 2s infinite`
- `hidden: { opacity: 0 }` → `visible: { opacity: 1, transition: { delay: 1 } }`

**Corner text:**
- `position: absolute; top: 40px; right: 60px; font-size: 9px; color: #2a2a2a; letter-spacing: .2em; text-align: right; line-height: 2`
- Content lines: `BASED IN BERLIN` / `UTC+1` / `OPEN TO REMOTE`
- `hidden: { opacity: 0 }` → `visible: { opacity: 1, transition: { delay: 1.2 } }`

---

### Section 2 — About (`bg: #f0ede6, color: #080808`)

**Layout overrides:** `flex-direction: column; align-items: flex-start; justify-content: center`

**Section label:**
- `002 — ABOUT` · `font-size: 9px; letter-spacing: .25em; color: var(--red); margin-bottom: 40px`
- `hidden: { opacity: 0, y: 10 }` → `visible: { opacity: 1, y: 0, transition: { delay: 0.1 } }`

**Bio text:**
- `font-family: 'IBM Plex Sans', sans-serif; font-size: clamp(24px, 4vw, 52px); font-weight: 300; line-height: 1.25; max-width: 820px; color: var(--black)`
- Text: `"I build the systems that other engineers rely on. Fast, fault-tolerant, boring in the best possible way. Six years of distributed systems, infrastructure, and backend work across startups and scale-ups."`
- Implementation: Split text into words in JSX. Outer container is a `motion.div` with `animate/initial` and container variants. Each word is a `<motion.span className={styles.word}>` (`display: inline-block; overflow: hidden; vertical-align: bottom; margin-right: 0.22em`) wrapping an inner `motion.span` child with word variants. The `.word` wrapper carries **no `variants` prop** of its own — Framer Motion propagates variant context through motion elements automatically, even without explicit variants.
- Container variants: `{ hidden: {}, visible: { transition: { delayChildren: 0.15, staggerChildren: 0.04 } } }`
- Word (inner `motion.span`) variants: `{ hidden: { y: '100%', transition: { duration: 0 } }, visible: { y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } } }`
- The `hidden` variant sets `transition: { duration: 0 }` so words snap to hidden instantly when `isActive` goes false (no 0.7s reverse animation).

**Stats row:**
- `display: flex; gap: 60px; margin-top: 60px`
- 4 stats: `6+ YEARS EXP` / `12 PROJECTS SHIPPED` / `0 P0 INCIDENTS` / `2.4K OSS STARS`
- Stat number: Bebas Neue, `52px`, `color: var(--black)`, `line-height: 1`
- Stat label: `9px`, `color: #888`, `letter-spacing: .15em`, `margin-top: 4px`
- `hidden: { opacity: 0, y: 20 }` → `visible: { opacity: 1, y: 0, transition: { delay: 0.8 } }`

**Faded `02`:**
- `position: absolute; right: 60px; bottom: 40px; font-family: 'Bebas Neue'; font-size: 200px; color: #e8e5de; line-height: 1; pointer-events: none; user-select: none`
- `hidden: { opacity: 0 }` → `visible: { opacity: 1, transition: { delay: 1 } }`

---

### Section 3 — Projects (`bg: #080808`)

**Layout overrides:** `flex-direction: column; align-items: flex-start; justify-content: center`

**Section label:**
- `003 — SELECTED WORK` · `font-size: 9px; letter-spacing: .25em; color: var(--red); margin-bottom: 40px`
- `hidden: { opacity: 0, x: -12 }` → `visible: { opacity: 1, x: 0, transition: { delay: 0.05 } }`

**Projects data** (top of `Projects.jsx`):
```js
const PROJECTS = [
  {
    num: '001', featured: true,
    title: 'DISTRIBUTED TASK QUEUE',
    desc: 'Redis-backed job scheduler handling 10k+ jobs/sec. Zero message loss across 18 months of production. Built for fault tolerance at scale.',
    tags: ['RUST', 'REDIS', 'TOKIO', 'GRPC'],
  },
  {
    num: '002', featured: false,
    title: 'REALTIME COLLAB EDITOR',
    desc: 'CRDT-based document sync with sub-50ms latency across 3 regions. Serves 40k monthly active users with 99.9% uptime.',
    tags: ['TYPESCRIPT', 'WEBSOCKET', 'CRDT'],
  },
  {
    num: '003', featured: false,
    title: 'OBSERVABILITY PLATFORM',
    desc: 'Unified metrics and tracing pipeline built on OpenTelemetry. Replaced three vendor tools, reduced costs by 60%.',
    tags: ['GO', 'OTEL', 'CLICKHOUSE'],
  },
  {
    num: '004', featured: false,
    title: 'CLI DEPLOY TOOLKIT',
    desc: 'Zero-config deployment CLI for any cloud provider. 2,400 GitHub stars. Used by 300+ engineering teams worldwide.',
    tags: ['GO', 'DOCKER', 'K8S'],
  },
]
```

**Grid:** `display: grid; grid-template-columns: 1fr 1fr; gap: 2px; width: 100%; max-width: 1100px`

**Card:**
- `border: 1px solid #1a1a1a; padding: 32px; position: relative; overflow: hidden; cursor: pointer`
- Featured card: `border-color: #2a2a2a`
- Hover: `border-color: var(--white); background: #0f0f0f`
- `data-cursor-hover` on root card element
- `hidden: { opacity: 0, y: 30 }` → `visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }`
- Delays per card: `0.1s, 0.22s, 0.34s, 0.46s`

**Card internals:**
- `.proj-num` — `9px; color: #333; letter-spacing: .15em; margin-bottom: 14px`. Featured: render as `{num} — FEATURED`, `color: var(--red)`
- `.proj-title` — Bebas Neue, `36px`, line-height 1, `margin-bottom: 10px`
- `.proj-desc` — IBM Plex Sans, `10px`, `color: #666`, `line-height: 1.6`, `max-width: 340px`
- `.proj-tags` — `display: flex; gap: 6px; flex-wrap: wrap; margin-top: 14px`
- `.ptag` — `8px; border: 1px solid #2a2a2a; padding: 3px 8px; color: #444; letter-spacing: .08em`
- `.proj-arrow` — `position: absolute; bottom: 28px; right: 28px; font-family: 'Bebas Neue'; font-size: 22px; color: #222`. Hover: `color: var(--red); transform: translate(4px, -4px)`. CSS transition `0.2s`.

---

### Section 4 — Skills (`bg: #f0ede6, color: #080808`)

**Layout overrides:** `flex-direction: column; align-items: flex-start; justify-content: center`

**Section label:**
- `004 — CAPABILITIES` · `font-size: 9px; letter-spacing: .25em; color: var(--red); margin-bottom: 40px`
- `hidden: { opacity: 0, y: 10 }` → `visible: { opacity: 1, y: 0, transition: { delay: 0.05 } }`

**Two-column layout:**
```css
.skillsLayout { display: flex; gap: 80px; align-items: flex-start; width: 100%; max-width: 1100px; }
.skillCol { flex: 1; }
```

**Column title:**
- Bebas Neue, `28px`, `color: #aaa`, `margin-bottom: 24px`
- `hidden: { opacity: 0 }` → `visible: { opacity: 1, transition: { duration: 0.5, delay: <see below> } }`
- Left (LANGUAGES): `delay: 0`. Right (DOMAINS): `delay: 0.05`

**Skill bar row:**
- `margin-bottom: 16px`
- `hidden: { opacity: 0, x: -16 }` → `visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }`
- Left column per-bar delays: `0.1, 0.18, 0.26, 0.34, 0.42`
- Right column per-bar delays: `0.12, 0.2, 0.28, 0.36, 0.44`

**Bar label row:** `font-size: 10px; letter-spacing: .08em; margin-bottom: 5px; display: flex; justify-content: space-between`. Level text: `font-size: 9px; color: #999`

**Bar track:** `height: 2px; background: #ddd; position: relative`

**Bar fill:**
- `height: 100%; background: var(--black)`
- Each bar fill is a `motion.div` that receives `pct` (number) and `delay` (number) as props
- Animation applied via inline `transition` prop (not shared variant), because the fill is a sibling/child of the row element and cannot inherit the row's `transition.delay`:
  ```jsx
  <motion.div
    initial={{ width: '0%' }}
    animate={isActive ? { width: `${pct}%` } : { width: '0%' }}
    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: isActive ? delay : 0 }}
  />
  ```
- Use the same `delay` value as the parent bar row (Left: `0.1, 0.18, 0.26, 0.34, 0.42`; Right: `0.12, 0.2, 0.28, 0.36, 0.44`)

**Languages** (left column): Rust 92% EXPERT · Go 88% EXPERT · TypeScript 82% PROFICIENT · Python 74% PROFICIENT · SQL 78% ADVANCED

**Tools row** (inside left column, below language bars, `margin-top: 32px`):
- Label: `TOOLS & INFRA` · `9px; color: #999; letter-spacing: .15em; margin-bottom: 10px`
- Pills: Docker, Kubernetes, AWS, Terraform, Postgres, Redis, Kafka, ClickHouse, gRPC
- `.tool-pill` — `display: inline-block; font-size: 9px; border: 1px solid #ccc; padding: 4px 10px; margin: 3px; color: #666; letter-spacing: .06em`
- `hidden: { opacity: 0, y: 14 }` → `visible: { opacity: 1, y: 0, transition: { delay: 0.9 } }`

**Domains** (right column): Distributed Systems 94% CORE · Infrastructure/IaC 88% CORE · Backend APIs 90% CORE · Observability & SRE 80% ADVANCED · Frontend 58% WORKING

**Faded `04`:**
- `position: absolute; right: 60px; bottom: 40px; font-family: 'Bebas Neue'; font-size: 200px; color: #e8e5de; line-height: 1; pointer-events: none; user-select: none`
- `hidden: { opacity: 0 }` → `visible: { opacity: 1, transition: { delay: 1 } }`

---

### Section 5 — Contact (`bg: #080808`)

**Layout overrides:** `flex-direction: column; align-items: flex-start; justify-content: center`

**Big heading:**
- Bebas Neue, `clamp(64px, 12vw, 160px)`, `line-height: .9; letter-spacing: -.01em`
- Three lines: `GET IN` / `TOUCH` (`color: var(--red)`) / `WITH ME`
- Each: `overflow: hidden` wrapper + inner `motion.span`
- `hidden: { y: '110%' }` → `visible: { y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } }`
- Delays: Line 1 `0.05`, Line 2 `0.2`, Line 3 `0.35`

**Contact links:**
- `display: flex; flex-direction: column; gap: 18px; margin-top: 60px`
- `hidden: { opacity: 0, x: -20 }` → `visible: { opacity: 1, x: 0, transition: { delay: 0.8 } }`
- Three links (Twitter omitted):
  - `EMAIL` → `Sahillakhani0106@gmail.com` (mailto:)
  - `GITHUB` → display `github.com/Sahil-Lakhani`, href `https://github.com/Sahil-Lakhani`
  - `LINKEDIN` → display `linkedin.com/in/lakhani-sahil`, href `https://www.linkedin.com/in/lakhani-sahil/`
- Each: `.cl-label` (`8px; color: #2a2a2a; width: 70px; letter-spacing: .15em`) + value span
- Link style: `font-size: 12px; color: #444; letter-spacing: .12em; text-decoration: none`
- Hover: `color: var(--white)` (CSS transition 0.2s)

**Red stripe:**
- `position: absolute; right: 0; top: 0; width: 6px; height: 100%; background: var(--red)`
- `hidden: { opacity: 0 }` → `visible: { opacity: 1, transition: { delay: 1.2 } }`

**Faded `05`:**
- `position: absolute; right: 60px; bottom: 40px; font-family: 'Bebas Neue'; font-size: 200px; color: #111; line-height: 1; pointer-events: none; user-select: none`
- `hidden: { opacity: 0 }` → `visible: { opacity: 1, transition: { delay: 1 } }`

---

## `useScroll` Hook

```js
useScroll({ goTo, transitioning, currentSection })
```

- `currentSection` stored in a ref internally to avoid stale closures in wheel handler
- **wheel**: `addEventListener('wheel', handler, { passive: false })`. `e.preventDefault()`. Cooldown via `lastWheel = useRef(0)`, gate 900ms. `deltaY > 0` → next, else prev.
- **keydown**: ArrowDown/Right → next, ArrowUp/Left → prev
- **touchstart**: save Y, `{ passive: true }`
- **touchend**: if `|delta| > 50` navigate, `{ passive: true }`
- All listeners cleaned up in `useEffect` return

---

## Animation Summary

| Element | Enter (`isActive: true`) |
|---|---|
| Overlay wipe-in | scaleY 0→1, origin bottom, 0.42s `[0.7,0,0.3,1]` |
| Overlay wipe-out | scaleY 1→0, origin top, 0.42s `[0.7,0,0.3,1]` |
| Hero name lines | y 110%→0, stagger delays 0.05s / 0.18s, ease `[0.16,1,0.3,1]` |
| Hero sub-label | opacity+x(-20px), delay 0.7s |
| About words | y 100%→0, delayChildren 0.15s, staggerChildren 0.04s |
| About stats | opacity+y(20px), delay 0.8s |
| Projects sec-label | opacity+x(-12px), delay 0.05s |
| Project cards | y(30px)+opacity, per-card delays 0.1/0.22/0.34/0.46s |
| Skill sec-label | opacity+y(10px), delay 0.05s |
| Skill col titles | opacity, L delay 0s / R delay 0.05s, duration 0.5s |
| Skill bar rows | opacity+x(-16px), per-bar delays (see above) |
| Skill bar fills | width 0→%, per-bar delays (same as row), duration 1s |
| Tools row | opacity+y(14px), delay 0.9s |
| Contact lines | y 110%→0, delays 0.05/0.2/0.35s, ease `[0.16,1,0.3,1]` |
| Contact links | opacity+x(-20px), delay 0.8s |
| Red stripe | opacity, delay 1.2s |
| Faded numbers (02/04/05) | opacity, delay 1s |

All `hidden` states apply instantly when `isActive` goes false.
