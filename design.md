# 🎨 Design System & UX Philosophy — My Garden World

---

## 🌿 1. Aesthetic Vision & Palette

The design language of **My Garden World** evokes the tranquility of a lush botanical greenhouse, blending modern glassmorphism with organic warmth and earthy undertones.

### Color Tokens

| Palette | Primary Hex | Usage |
| :--- | :--- | :--- |
| **Forest Green** | `#1c3e2b` to `#2e744b` | Core branding, primary headers, action buttons, active navigation states |
| **Sage Green** | `#6d8a69` to `#afc4ab` | Subtle borders, background accents, plant metadata badges |
| **Warm Cream** | `#fbf9f4` to `#f3ece0` | Global page background, soft card backing, comfortable readability |
| **Earthy Amber** | `#b45309` to `#f59e0b` | Flora Coins currency, level progression highlights, solar decor |
| **Flora Accent Blue** | `#0284c7` to `#38bdf8` | Water drop indicators, hydration care actions, birdbath ripples |

---

## 🔤 2. Typography

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
