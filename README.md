# My Garden World 🌿

> **"Discover nature. Grow with intelligence. Watch life unfold."**  
> *An open-source AI nature companion built for outdoor mindfulness, intelligent plant care, and virtual gardening.*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-success?style=for-the-badge&logo=vercel)](https://my-garden-world-tau.vercel.app/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-blue?style=for-the-badge&logo=github)](https://github.com/jaya030888/my-garden-world)
[![Tests](https://img.shields.io/badge/Tests-46%20Passing-brightgreen?style=for-the-badge&logo=vitest)](https://github.com/jaya030888/my-garden-world)
[![AI Model](https://img.shields.io/badge/Vision%20AI-ViT--Base--224%20(WASM)-orange?style=for-the-badge&logo=huggingface)](https://huggingface.co/Xenova/vit-base-patch16-224)
[![Database](https://img.shields.io/badge/PostgreSQL-Neon%20Serverless-00e599?style=for-the-badge&logo=postgresql)](https://neon.tech)

---

## 🌟 Overview & Philosophy

**My Garden World** bridges real-world outdoor exploration with on-device botanical intelligence and a persistent virtual sanctuary. The digital interface is deliberately designed to be the *shortest* part of your experience: stepping outside to touch grass, identify flora, and track plant vitality fuels your progression in both the living world and your virtual garden.

---

## ✨ Key Features & Capabilities

### 1. 🌿 AI-Powered Plant Discovery (`/discover`)
* **100% On-Device Client Inference:** Runs Google's Vision Transformer (`Xenova/vit-base-patch16-224` quantized) directly in your browser via **Transformers.js** & **ONNX Runtime Web (WASM)**.
* **Complete Privacy Protection:** Zero photographs leave your device. Model weights download once and cache locally, enabling full offline inference with $0 cloud API costs.
* **Truthful Confidence Calibration:** Categorizes predictions into calibrated tiers (`High`, `Moderate`, `Uncertain`). No synthetic score overrides or hallucinated identifications.
* **"No Plant Detected" Filter:** Accurately recognizes non-plant images and informs the user to upload clear foliage or flower photographs.
* **Container Decoupling:** Decouples ceramic planter detections (`pot, flowerpot`) from plant species to prevent misleading container-as-plant labels.

### 2. 📖 Comprehensive Botanical Fact Sheets
* **5-Tab Reference Guide:** Botanical Profile, Care & Cultivation, Safety & Ecology, Pests & Prevention, and Attribution.
* **Practical Soil-Moisture Care:** Hands-on soil checks (e.g. *"Allow the top 2 inches (5 cm) to dry out completely"*) instead of rigid, arbitrary daily watering rules.
* **Authoritative Citations:** Clinical pet toxicity ratings for dogs, cats, and horses verified through the **ASPCA Animal Poison Control Center**, alongside cultivation criteria from the **Royal Horticultural Society (RHS)** and **USDA NRCS**.

### 3. 🌱 Garden Care & Growth Journal (`/grow`)
* **Track Living Houseplants:** Adopt real indoor or balcony plants, schedule watering and misting reminders, and log care activities.
* **Photo Timeline progression:** Chronologically document plant growth stages to compare leaf fenestration and foliage health over time.
* **Evidence-Based Care Plans:** Guidance on sunlight thresholds, humidity requirements, and non-toxic pest treatments (aphids, spider mites).

### 4. 🎮 Cozy Virtual Garden & Nature Quests (`/garden` & `/play`)
* **Interactive 8×8 Isometric Canvas:** Plant unlocked seeds, arrange stone paths, rotate decor in 90° increments, and watch living flora thrive.
* **Atmospheric Weather & Audio:** Dynamic weather engine featuring sunshine, rain showers, and soothing ambient soundscapes.
* **"Touch Grass" Outdoor Quests:** Complete real-world outdoor challenges, log nature observations, earn Flora Coins, and level up your Botanist rank.
* **Garden Shop & Economy:** Atomic currency ledger ensuring legitimate coin rewards and preventing duplicate item claims.

### 5. ☀️ / 🌙 Adaptive Light & Dark Mode
* **Instant Tactile Theme Switching:** Full visual palette adaptation with custom theme toggle in the header navbar and settings.
* **OS Preference Auto-Detection:** Automatically synchronizes with system `prefers-color-scheme: dark/light`.
* **Zero Flicker Local Storage:** Persists preference in `localStorage ('my_garden_theme')` with smooth CSS transitions across all cards, modals, and charts.

### 6. 📱 Installable Progressive Web App (PWA) & Mobile Native UX
* **Installable on Android & iOS:** Add directly to home screen via Chrome, Samsung Internet, Safari, or desktop browsers with standalone app experience.
* **Safe Offline Service Worker:** Pre-caches app shell, fonts, and assets while deliberately excluding authenticated APIs and large neural weights.
* **Mobile-Optimized Touch Controls:** Safe-area padding (`env(safe-area-inset-bottom)`), touch manipulation optimizations, and floating bottom navigation.
* **Capacitor Android Support:** Includes standalone `capacitor.config.ts` allowing direct generation of a native Android APK (`.apk`) without Expo Go.

---

## 🎨 Editorial UI/UX Redesign

Inspired by modern editorial and minimalist luxury design principles (such as [riyaviz.me](https://riyaviz.me/)):
* **Stacked Editorial Typography:** High-contrast, clamp-scaled display typography for an unforgettable hero presence (*"Discover nature. Grow with intelligence. Watch life unfold."*).
* **Tactile Pill Call-to-Actions:** Ergonomic pill-shaped buttons with integrated icon containers and responsive hover micro-interactions.
* **Interactive Dropzone & Sample Specimen Station:** Direct one-click sample flower scanning right in the hero section for instant user engagement.
* **Asymmetrical Feature Showcases:** Magazine-style cards with numbered tags (`01` Discovery, `02` Garden Care, `03` Virtual Garden) avoiding generic repeating boxes.
* **"What You Learn" Architectural Ribbon:** 4-column overview highlighting Taxonomy, Soil Moisture, ASPCA Safety, and Ecological Synergy.
* **Unified Light & Dark Modes:** Glassmorphism styled to strictly adhere to WCAG AA color contrast guidelines across both themes.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies | Details |
| :--- | :--- | :--- |
| **Frontend UI** | React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide Icons | Responsive SPA, editorial typography, zero AI-generated artifacts |
| **On-Device Vision AI** | `@xenova/transformers`, ONNX Runtime WebAssembly (WASM) | `Xenova/vit-base-patch16-224` quantized INT8 model; 100% client execution |
| **Local-First Database** | Dexie.js (IndexedDB) | Instant offline gameplay, client persistence, and guest mode support |
| **Backend REST API** | Node.js, Express, TypeScript, Zod, Helmet, Express-Rate-Limit | Production-ready REST endpoints with JWT authentication and health checks |
| **Database & ORM** | PostgreSQL (Neon Serverless), Prisma ORM | Relational data models with collision checks and atomic transaction ledgers |
| **Hosting & CI/CD** | Vercel (Frontend SPA) + Render (Backend REST API) | Automated continuous integration and deployment on push to `main` |

---

## 🧪 Automated Quality Gates & Testing

The project maintains **46 automated tests** across 9 suites (35 frontend unit/integration/PWA tests + 11 backend REST API tests):

```bash
# Run all automated test suites
npm test

# Run frontend tests (Vitest)
npm run test:frontend

# Run backend tests (Supertest + Vitest)
npm run test:backend
```

```text
✓ src/__tests__/pwa.test.ts (3 tests)
✓ src/__tests__/botanicalDatabase.test.ts (4 tests)
✓ src/__tests__/dataManagement.test.ts (2 tests)
✓ src/__tests__/gardenLayout.test.ts (4 tests)
✓ src/__tests__/plantRecordJourney.test.ts (4 tests)
✓ src/__tests__/economyService.test.ts (4 tests)
✓ src/__tests__/questEngine.test.ts (4 tests)
✓ src/__tests__/auditMatrix.test.ts (10 tests)
✓ backend/src/__tests__/api.test.ts (11 tests)

Test Files  9 passed (9)
Tests       46 passed (46)
```

---

## 💻 Local Development Setup

### 1. Prerequisites
- Node.js v20+ or v22+
- npm

### 2. Clone & Install
```bash
# Clone repository
git clone https://github.com/jaya030888/my-garden-world.git
cd my-garden-world

# Install root & workspace dependencies
npm install
npm --prefix frontend install
npm --prefix backend install
```

### 3. Start Development Servers
```bash
# Start backend API (Port 5000)
npm run dev:backend

# In a separate terminal, start frontend (Port 5173)
npm run dev:frontend
```

* **Frontend Web App**: `http://localhost:5173/`
* **Backend REST API**: `http://localhost:5000/api`
* **API Health Check**: `http://localhost:5000/api/health`

---

## 📚 Documentation Index

Detailed architectural specs, model cards, and audit reports are available in the [`docs/`](docs/) directory:

| Document | Description |
| :--- | :--- |
| **[`docs/FINAL_APPLICATION_AUDIT.md`](docs/FINAL_APPLICATION_AUDIT.md)** | **Complete application quality gate, AI architecture verification, and test outputs** |
| **[`docs/documentation.md`](docs/documentation.md)** | Full-stack engineering documentation, system topology, and state flow |
| **[`docs/api-documentation.md`](docs/api-documentation.md)** | Complete REST API specification, schemas, status codes, and security |
| **[`docs/architecture.md`](docs/architecture.md)** | High-level system architecture and component integration diagrams |
| **[`docs/deployment.md`](docs/deployment.md)** | Production deployment guide for Vercel, Render, and Neon PostgreSQL |
| **[`docs/database-migrations.md`](docs/database-migrations.md)** | PostgreSQL relational schema models and Prisma migration guide |
| **[`docs/performance.md`](docs/performance.md)** | Empirical AI benchmark methodology and multi-trial latency results |
| **[`docs/design.md`](docs/design.md)** | Design tokens, color palette, and handcrafted SVG vector artwork |
| **[`docs/AI_FINAL_AUDIT.md`](docs/AI_FINAL_AUDIT.md)** | Evidence-based model audit and container-decoupling analysis |
| **[`docs/dev-to-submission.md`](docs/dev-to-submission.md)** | Ready-to-publish Dev.to challenge submission post |

---

## 📄 License & Open-Source Attribution

- **Application Code:** [MIT License](LICENSE)
- **AI Model Weights:** [Apache License 2.0](https://huggingface.co/Xenova/vit-base-patch16-224) (`google/vit-base-patch16-224` quantized by Xenova)
- **Icons & Illustrations:** Custom hand-crafted SVG vector artwork & [Lucide Icons](https://lucide.dev) (ISC License)
