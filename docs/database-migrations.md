# Database Migrations & Prisma Setup: PostgreSQL on Neon

This document covers schema design, database migrations, connection pooling, and seeding procedures for **My Garden World**.

---

## Prisma Schema Overview

The relational PostgreSQL schema in `server/prisma/schema.prisma` models all core entities and constraints:

- `User`: Handles credentials (`passwordHash`), levels, XP, and coin balances.
- `Plant`: Represents user-adopted plants with scientific metadata and care preferences.
- `GrowthEntry`: Chronological photo journal linked to each plant with cascade deletion.
- `CareLog`: Timestamped watering, fertilizing, pruning, and misting records.
- `Discovery`: On-device AI inference logs with top prediction, alternative synsets, and confidence tiers.
- `Observation`: Outdoor mindfulness logs from Go Outside Mode.
- `Quest` & `QuestClaim`: Gamification quests with unique compound index `[userId, questId, periodKey]` enforcing zero double-claiming per daily/weekly cycle.
- `ShopItem` & `UserInventory`: Botanical shop catalog and user item inventories.
- `GardenPlacement`: 8×8 grid sanctuary placements with compound unique index `[userId, gridX, gridY]` enforcing coordinate collision prevention at the database engine level.
- `CoinTransaction`: Immutable financial ledger tracking every reward, bonus, and purchase.
- `Achievement` & `UserAchievement`: Unlockable milestone badges.

---

## Migration Workflows

### 1. Local Development Migrations
When adding or altering schema models during development:
```bash
cd server
npx prisma migrate dev --name <migration_name>
```

### 2. Deploying Migrations to Production (Neon)
When deploying to Render or staging with a live Neon PostgreSQL database:
```bash
cd server
npx prisma migrate deploy
```

### 3. Database Seeding
To populate initial shop items, default quests, and achievements:
```bash
cd server
npx prisma db seed
```

---

## Neon Connection String & Pooling

Neon serverless PostgreSQL supports direct connections and pooled connections via PgBouncer.

- **Direct URL (for migrations):**
  ```
  postgresql://user:pass@ep-hostname.us-east-2.aws.neon.tech/floraquest?sslmode=require
  ```
- **Pooled URL (for runtime Express server):**
  ```
  postgresql://user:pass@ep-hostname-pooler.us-east-2.aws.neon.tech/floraquest?sslmode=require&pgbouncer=true
  ```

Set `DATABASE_URL` in your Render Environment Variables to the pooled connection string for optimal connection handling under concurrent traffic.
