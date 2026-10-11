# 🎨 Design System & UX Philosophy — My Garden World

---

## 🌿 1. Aesthetic Vision & Palette

The design language of **My Garden World** evokes the tranquility of a lush botanical greenhouse, blending modern editorial layout, tactile pill ergonomics, and seamless dual-theme adaptability (Dark and Light modes).

### Dual-Theme Color Tokens

| Palette | Light Mode (`light`) | Dark Mode (`dark`) | Usage |
| :--- | :--- | :--- | :--- |
| **Forest Green** | `#15803d` to `#166534` | `#1c3e2b` to `#2e744b` | Core branding, primary headers, active navigation pills |
| **Sage / Olive Accent** | `#e2ece0` to `#86efac` | `#1e293b` to `#334155` | Card borders, secondary containers, metadata badges |
| **Surface Background** | `#f8fafc` / `#ffffff` | `#020617` / `#0b1320` | Page body, card background, glassmorphism panels |
| **High-Contrast Text** | `#0f172a` (Charcoal Slate) | `#f8fafc` (Pure Cloud) | Primary readable typography adhering to WCAG AA contrast |
| **Earthy Amber** | `#b45309` to `#f59e0b` | `#d97706` to `#fbbf24` | Flora Coins currency, level progression highlights |
| **Hydration Blue** | `#0284c7` to `#38bdf8` | `#0369a1` to `#0ea5e9` | Water indicators, soil hydration guides |

### Theme System Architecture
* **`ThemeContext.tsx`**: Provides `'light' | 'dark'` state with automatic fallback to system OS `prefers-color-scheme`.
* **Zero Flicker**: Immediately applies `<html class="dark">` or `<html class="light">` and caches choice in `localStorage ('my_garden_theme')`.
* **Ergonomic Toggle**: Tactical Sun ☀️ / Moon 🌙 button accessible in the primary desktop header navbar and within Settings.

---

## 🏛️ 2. Editorial UX & Storytelling (Inspired by [riyaviz.me](https://riyaviz.me/))

Drawing inspiration from editorial portfolio and quiet-luxury layouts:
1. **Stacked Typography Hero:** Hero headline (*"Discover nature. Grow with intelligence. Watch life unfold."*) utilizes clamped dynamic scaling with rhythmic line spacing.
2. **Tactile Pill Call-to-Actions:** Organic rounded pills with nested micro-icon containers and subtle hover springs.
3. **Integrated Dropzone & Sample Specimen Station:** Direct in-hero test flowers allow visitors to evaluate the Vision Transformer AI in one click without leaving the page.
4. **Asymmetrical Magazine Cards:** Curated showcase tiles with numbered tags (`01` Discovery, `02` Garden Care, `03` Virtual Garden) for rich visual pacing.
5. **Architectural 4-Column Ribbon:** Highlights Taxonomy, Soil Moisture, ASPCA Safety, and Ecological Synergy.

* **Display & Headers:** **`Outfit`** (Google Fonts) — Geometric, friendly, and organic for titles, banners, and modal headers.
* **Body & Data:** **`Plus Jakarta Sans`** — Clean, legible modern sans-serif with excellent numerals for botanical metrics and transaction ledgers.
* **Telemetry & Time:** **`JetBrains Mono / monospace`** — Precise timestamps, model latency meters, and confidence percentages.

---

## 📱 3. Multi-Screen Responsive System

| Device Category | Target Viewport | Design Adaptations |
| :--- | :--- | :--- |
| **Mobile Phones** | `320px – 640px` | Fixed bottom navigation with safe-area padding; fluid 8×8 sanctuary grid; horizontal scrolling plant selector on Grow page; stacked single-column cards. |
| **Tablets** | `640px – 1024px` | 2-column balanced grids for botanical profiles and shop cards; centered modal overlays with touch scrolling. |
| **Desktop / Laptops** | `1024px+` | Multi-column expansive canvas; persistent sidebar plant directory; side-by-side growth timelines. |

---

## 🪴 4. Handcrafted SVG Vector Illustration System

All placeholder or generic icons have been replaced with dedicated, scalable SVG vector components (`GardenItemIllustrations.tsx`):

1. **Flora:**
   * `vp-monstera`: Deep green fenestrated leaf blade with stem shadow and cutout holes.
   * `vp-sunflower`: Symmetrical golden yellow petals with textured concentric seed disc.
   * `vp-lavender`: Multi-stalked purple floral spires with herb foliage base.
   * `vp-bonsai`: Contorted miniature wood trunk with layered evergreen foliage clouds.
2. **Pots:**
   * `pot-terracotta`: Flared warm clay planter with shadow base.
   * `pot-ceramic-teal`: Glazed seafoam porcelain vessel with specular highlight.
   * `pot-marble-gold`: White polished marble cylinder with brushed brass accents.
3. **Decorations:**
   * `dec-birdbath`: Chiseled stone pedestal with blue water ripples and songbird.
   * `dec-solar-lantern`: Amber glowing glass filament lantern.
   * `dec-zen-fountain`: Bamboo water spout with stone reservoir.
   * `dec-stepping-stones`: Smooth river pebble trail.

---

## ✨ 5. Micro-Animations & Tactile Feedback

* **Inference Shimmer:** Custom CSS keyframe sweep over cards during on-device model computation.
* **Item Placement & Rotation:** Smooth spring animations using Framer Motion when placing or rotating items on the 8×8 grid.
* **Level-Up Confetti:** Multi-colored celebratory particle bursts on level milestones and shop purchases.
* **Focus & Accessibility:** High-contrast focus rings and `prefers-reduced-motion` compliance.
