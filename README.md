# My Garden World 🌿

> **"Discover nature. Grow with intelligence. Watch life unfold."**  
> *Built for Hacktoberfest Open-Source AI Challenge, Week 1: Touch Grass.*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-success?style=for-the-badge&logo=vercel)](https://my-garden-world-tau.vercel.app/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-blue?style=for-the-badge&logo=github)](https://github.com/jaya030888/my-garden-world)
[![Database](https://img.shields.io/badge/PostgreSQL-Neon%20Serverless-00e599?style=for-the-badge&logo=postgresql)](https://neon.tech)
[![AI Model](https://img.shields.io/badge/Vision%20AI-ViT--Base--224-orange?style=for-the-badge&logo=huggingface)](https://huggingface.co/Xenova/vit-base-patch16-224)

---

## 🌟 Overview & Philosophy

**My Garden World** connects outdoor mindfulness with intelligent plant care and a persistent virtual botanical sanctuary. The screen is deliberately designed to be the *shortest* part of your experience: stepping outside to touch grass, photograph plants, and log mindfulness sessions powers your progression in both the real world and your virtual sanctuary.

---

## ✅ What Has Been Done Till Now (Project Status)

### 1. Cloud Infrastructure & Live Deployment
* [x] **Frontend Deployed on Vercel:** Live and accessible at **[https://my-garden-world-tau.vercel.app/](https://my-garden-world-tau.vercel.app/)**.
* [x] **Backend API Hosted on Render:** Express REST API configured with production security, rate limiting, and health checks (`/api/health`).
* [x] **Database on Neon PostgreSQL:** Schema synchronized via Prisma ORM, migrations deployed, and seeded with 11 virtual shop items and 5 core nature quests.
* [x] **Build & Typing Fixes for Cloud CI/CD:** Resolved production build issues on Render by structuring TypeScript and `@types/*` dependencies to build reliably in `NODE_ENV=production`.

### 2. On-Device Vision AI (100% Free & Private)
* [x] **Zero-Server Browser AI:** Embedded Google Vision Transformer (`google/vit-base-patch16-224` quantized) running via **Transformers.js** & **ONNX Runtime Web (WASM)**.
* [x] **Client-Side Privacy:** Zero photographs leave the user's device. Inference runs locally on mobile or desktop browsers with $0 cloud API costs.
* [x] **Container-to-Plant Promotion:** Decoupled container classes (`pot, flowerpot`) so photos of potted plants intelligently promote the verified plant species growing inside.
* [x] **Botanical Presets & Specimen Hints:** Fixed the in-game Plant Scanner to resolve real botanical photographs directly with verified care guides and coin rewards.

### 3. Core Gameplay & Botanical Features
* [x] **🌿 Plant Discovery (`/discover`):** Real-time camera or photo upload identification with confidence tiers (`High`, `Moderate`, `Uncertain`).
* [x] **🌱 Plant Care & Timeline (`/grow`):** Adopt real houseplants, log watering/misting activities, compare dated growth photos side-by-side, and view NASA air-filtering scores and ASPCA pet-safety advisories.
* [x] **🎮 Virtual Garden Grid (`/garden`):** Interactive 8×8 grid sanctuary with collision detection, item rotation, and placement persistence.
* [x] **🪙 Game Economy & Quests:** Earn Flora Coins and XP by completing outdoor activities and caring for real plants; spend coins in the Garden Shop.
* [x] **💾 Local-First Persistence:** Dexie.js (IndexedDB) caching provides instant offline gameplay with cloud PostgreSQL sync when connected.

### 4. Quality Assurance & Hackathon Submission
* [x] **33+ Automated Tests Passing:** Complete Vitest suite covering the botanical knowledge base, economy rules, grid layout, and API endpoints.
* [x] **Hacktoberfest Submission:** Prepared and validated the official challenge post for the *Open-Source AI* and *Touch Grass* prize categories.

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

## 🧪 Automated Test Suites

The project features a comprehensive automated test suite across frontend and backend:

```bash
# Run frontend tests
npm --prefix frontend test

# Run backend tests
npm --prefix backend test
```

```text
 ✓ src/__tests__/botanicalDatabase.test.ts (4 tests)
 ✓ src/__tests__/dataManagement.test.ts (2 tests)
 ✓ src/__tests__/gardenLayout.test.ts (4 tests)
 ✓ src/__tests__/plantRecordJourney.test.ts (4 tests)
 ✓ src/__tests__/economyService.test.ts (4 tests)
 ✓ src/__tests__/questEngine.test.ts (4 tests)
 ✓ backend/src/__tests__/api.test.ts (11 tests)
```

---

## 💻 Local Development Setup

### 1. Prerequisites
- Node.js v20+ / v22+
- npm

### 2. Clone & Install
```bash
# Clone the repository
git clone https://github.com/jaya030888/my-garden-world.git
cd my-garden-world

# Install root dependencies
npm install

# Install frontend & backend workspaces
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

* Frontend: `http://localhost:5173/`
* Backend API: `http://localhost:5000/api`
* Health Check: `http://localhost:5000/api/health`

---

## 📚 Documentation Index

All in-depth architecture, design, and API documentation files are organized in the [`docs/`](docs/) directory:

| Document | Description |
| :--- | :--- |
| **[`docs/documentation.md`](docs/documentation.md)** | Full-stack engineering documentation, system topology, and state flow |
| **[`docs/FINAL_VERIFICATION_REPORT.md`](docs/FINAL_VERIFICATION_REPORT.md)** | Complete end-to-end verification report & test results |
| **[`docs/api-documentation.md`](docs/api-documentation.md)** | Complete REST API specification, payloads, status codes, and security |
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
- **AI Model Weights:** [Apache License 2.0](https://huggingface.co/Xenova/vit-base-patch16-224)
- **Icons & Illustrations:** Custom hand-crafted SVG vector artwork

