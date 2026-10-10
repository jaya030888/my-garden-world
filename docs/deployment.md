# Production Deployment Guide: My Garden World

This guide provides end-to-end instructions for deploying **My Garden World** into a production-grade full-stack environment:
- **Frontend:** React 19 + TypeScript + Vite deployed on **Vercel**.
- **Backend:** Node.js + Express + Prisma REST API deployed on **Render**.
- **Database:** Serverless PostgreSQL on **Neon**.

---

## Architecture Topology

```
┌────────────────────────────────────────────────────────┐
│             Vercel (Client SPA)                        │
│  - React 19 + Vite + Tailwind CSS                      │
│  - On-Device Vision Transformer (ONNX Runtime WASM)   │
│  - Dexie.js IndexedDB (Offline & Local Cache Layer)   │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS / REST (JWT Cookies & Bearer)
┌───────────────────────────▼────────────────────────────┐
│             Render (Backend Web Service)               │
│  - Express + TypeScript                                │
│  - Helmet + Rate Limiting + Cookie Parser              │
│  - Server-Authoritative Economy & Anti-Double-Claim    │
└───────────────────────────┬────────────────────────────┘
                            │ TLS / Connection Pool
┌───────────────────────────▼────────────────────────────┐
│             Neon (PostgreSQL Database)                 │
│  - Prisma ORM                                          │
│  - Relational Schema with Unique Collision & Period Keys│
└────────────────────────────────────────────────────────┘
```

---

## 1. Database Setup: Neon PostgreSQL

1. Log in to [Neon Console](https://console.neon.tech/).
2. Create a new project named `floraquest-db`.
3. Copy the pooled PostgreSQL connection string from the dashboard:
   ```env
   DATABASE_URL="postgresql://<user>:<password>@<neon-host>/floraquest?sslmode=require"
   ```
4. Run migrations from your terminal to initialize tables:
   ```bash
   cd backend
   npx prisma db push # or npx prisma migrate deploy
   npm run prisma:seed
   ```

---

## 2. Backend Deployment: Render Web Service

### Option A: Using `render.yaml` Blueprint
1. In the [Render Dashboard](https://dashboard.render.com/), select **New +** $\rightarrow$ **Blueprint**.
2. Connect your GitHub repository.
3. Render will detect `render.yaml` and configure both `floraquest-backend` and `floraquest-ai-service` automatically.

### Option B: Manual Web Service Setup
1. Create a **New Web Service** and link your repository.
2. Configure build & runtime parameters:
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npx prisma generate && npm run build`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/api/health`
3. Add Environment Variables in Render:
   | Variable | Value | Notes |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Enables production security & cookies |
   | `PORT` | `5000` | Render internal port |
   | `DATABASE_URL` | `postgresql://...` | Your Neon PostgreSQL connection string |
   | `JWT_SECRET` | *(64-char random hex)* | Token signing secret |
   | `COOKIE_SECRET`| *(32-char random hex)* | Cookie signing secret |
   | `CLIENT_ORIGIN`| `https://my-garden-world.vercel.app` | Your deployed Vercel frontend URL |

4. Deploy the service. Once active, your API URL will be:
   ```
   https://floraquest-backend.onrender.com/api
   ```
5. Test the health endpoint: `https://floraquest-backend.onrender.com/api/health`

---

## 3. Frontend Deployment: Vercel

1. Log in to [Vercel Dashboard](https://vercel.com/).
2. Click **Add New...** $\rightarrow$ **Project** and import your repository.
3. Configure Project Settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `./` (or `my-garden-world`)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Set Environment Variables in Vercel:
   | Variable | Value | Notes |
   | :--- | :--- | :--- |
   | `VITE_API_URL` | `https://floraquest-backend.onrender.com/api` | Render backend endpoint |

5. Deploy! Vercel will build the SPA and provide a live URL (e.g. `https://my-garden-world.vercel.app`).
6. Update the `CLIENT_ORIGIN` variable in Render to match your Vercel production domain.

---

## 4. Post-Deployment Verification Checklist

- [ ] **Health Endpoint:** `GET /api/health` returns `{ status: "healthy", database: "connected" }`.
- [ ] **User Registration:** Register a new user with email and password $\rightarrow$ verify +100 Starter Flora Coins awarded.
- [ ] **On-Device Vision AI:** Scan a plant on `/discover` $\rightarrow$ verify ViT-Base ONNX runs in browser $\rightarrow$ click **Save to My Plants** $\rightarrow$ verify persisted to PostgreSQL.
- [ ] **Care & Growth:** Log watering and a growth photo on `/grow` $\rightarrow$ verify coins and XP awarded on server.
- [ ] **Anti-Double-Claim Integrity:** Click **Claim Quest** twice $\rightarrow$ verify second attempt is rejected with `QUEST_ALREADY_CLAIMED`.
- [ ] **Shop & Virtual Garden:** Purchase an item from `/garden` $\rightarrow$ verify balance is deducted on server $\rightarrow$ place item on grid $\rightarrow$ refresh browser and confirm item remains in same cell.
- [ ] **Cross-Device Persistence:** Open a Private / Incognito window $\rightarrow$ log in with the same credentials $\rightarrow$ confirm all plants, growth timelines, coins, and garden placements load identically.
- [ ] **Offline Resilience:** Disconnect internet $\rightarrow$ app continues functioning using local Dexie IndexedDB cache.
