# My Garden World 🌿

> **"Discover nature. Grow with intelligence. Watch life unfold."**  
> *Built for Hacktoberfest Open-Source AI Challenge, Week 1: Touch Grass.*

---

## 🌟 Overview & Philosophy

**My Garden World** connects outdoor mindfulness with intelligent plant care and a persistent virtual botanical sanctuary. The screen is deliberately designed to be the *shortest* part of your experience: stepping outside to touch grass, photograph plants, and log mindfulness sessions powers your progression in both the real world and your virtual sanctuary.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies & Frameworks | Details |
| :--- | :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Canvas-Confetti | Modern responsive UI, Glassmorphism, Zero AI-gen icons |
| **Backend API** | Node.js, Express, TypeScript, Zod, Helmet, Morgan, Express-Rate-Limit | REST API with JWT Auth in HTTP-only cookies + Bearer headers |
| **Database & ORM** | PostgreSQL on Neon, Prisma ORM | Relational models with collision & anti-double-claim constraints |
| **On-Device AI** | `@xenova/transformers`, ONNX Runtime WASM (`Xenova/vit-base-patch16-224`) | 100% Client-side local inference (zero image uploads) |
| **Local Cache** | Dexie.js (IndexedDB) | Offline resilient cache & Guest mode fallback |
| **Deployment** | Vercel (Frontend SPA) + Render (Backend REST API) + Neon (PostgreSQL) | Production-ready with health checks and CORS protection |

---

## 🚀 Key Features Across the 5 Modules

1. **🌿 Discover (On-Device Vision AI):**
   - 100% browser-based Vision Transformer (`vit-base-patch16-224`, INT8 quantized).
   - Honest confidence tiering (`high` $\ge 70\%$, `moderate` $35\text{--}70\%$, `uncertain` $< 35\%$).
   - Botanical facts, light/water recommendations, and ASPCA pet safety info.

2. **🌱 Grow (My Plants & Growth Timelines):**
   - Adopt real-world plants and log dated growth photos.
   - Interactive side-by-side growth photo comparison slider.
   - Care event logging (*Water*, *Mist*, *Fertilize*, *Prune*).

3. **🧘 Play (Touch Grass Mindfulness & Quests):**
   - **Go Outside Mode:** 5-minute outdoor mindfulness timer with sensory observation logger.
   - Daily and weekly nature quests with server-authoritative anti-double-claim validation.
   - Level progression curves, XP, and Flora Coins economy.

4. **🌸 Virtual Garden Sanctuary:**
   - Interactive 8×8 grid canvas with handcrafted scalable SVG vector plants, pots, and decorations.
   - Item purchasing, placement bounds validation (`0..7`), collision detection, 90° rotation, and deletion.

5. **⚙️ Settings & Full-Stack Control:**
   - Sign In / Registration with persistent sessions and guest mode support.
   - Live backend & database health monitor (`GET /api/health`).
   - 1-Click JSON export and import for complete cross-device data portability.

---

## 🧪 Automated Test Suites

The project features a **32-test automated suite** across 7 test files:

```bash
# Run all tests (frontend + backend)
npm run test:all

# Run backend tests only
npm run test:server

# Run frontend tests only
npm run test:client
```

```
 Test Files  7 passed (7)
      Tests  32 passed (32)
   ✓ src/__tests__/botanicalDatabase.test.ts (4 tests)
   ✓ src/__tests__/dataManagement.test.ts (2 tests)
   ✓ src/__tests__/gardenLayout.test.ts (4 tests)
   ✓ src/__tests__/plantRecordJourney.test.ts (4 tests)
   ✓ src/__tests__/economyService.test.ts (4 tests)
   ✓ src/__tests__/questEngine.test.ts (4 tests)
   ✓ server/src/__tests__/api.test.ts (10 tests)
```

---

## 💻 Local Development Setup

### 1. Prerequisites
- Node.js v20+ / v22+
- npm or pnpm

### 2. Clone & Install
```bash
# Clone the repository
git clone <repository-url>
cd my-garden-world

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 3. Start Development Servers
```bash
# Start backend API (Port 5000)
npm run dev:server

# In a separate terminal, start frontend (Port 5173)
npm run dev:client
```

* Frontend: `http://localhost:5173/`
* Backend API: `http://localhost:5000/api`
* Health Check: `http://localhost:5000/api/health`

---

## 📚 Documentation Index

All in-depth architecture, design, and API documentation files are organized in the [`docs/`](docs/) directory:

| Document | Description |
| :--- | :--- |
| **[`docs/documentation.md`](docs/documentation.md)** | Full-stack engineering documentation, system topology, and state flow |
| **[`docs/FINAL_VERIFICATION_REPORT.md`](docs/FINAL_VERIFICATION_REPORT.md)** | Complete end-to-end verification report & test results (33/33 tests passing) |
| **[`docs/api-documentation.md`](docs/api-documentation.md)** | Complete REST API specification, payloads, status codes, and security |
| **[`docs/architecture.md`](docs/architecture.md)** | High-level system architecture and component integration diagrams |
| **[`docs/deployment.md`](docs/deployment.md)** | Production deployment guide for Vercel, Render, and Neon PostgreSQL |
| **[`docs/database-migrations.md`](docs/database-migrations.md)** | PostgreSQL relational schema models and Prisma migration guide |
| **[`docs/performance.md`](docs/performance.md)** | Empirical AI benchmark methodology and multi-trial latency results |
| **[`docs/design.md`](docs/design.md)** | Design tokens, color palette, and handcrafted SVG vector artwork |
| **[`docs/idea.md`](docs/idea.md)** | Product concept and Hacktoberfest challenge alignment |
| **[`docs/origin.md`](docs/origin.md)** | Origin story and philosophy behind "Touch Grass" |
| **[`docs/solution.md`](docs/solution.md)** | Solution architecture and technical specifications |
| **[`docs/code-quality.md`](docs/code-quality.md)** | Code review guidelines and security checklist |
| **[`docs/dev-to-submission.md`](docs/dev-to-submission.md)** | Ready-to-publish Dev.to challenge submission post |

---

## 📄 License & Open-Source Attribution

- **Application Code:** [MIT License](LICENSE)
- **AI Model Weights:** [Apache License 2.0](https://huggingface.co/Xenova/vit-base-patch16-224)
- **Icons & Illustrations:** Custom hand-crafted SVG vector artwork
