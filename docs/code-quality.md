# My Garden World — Code Quality & Engineering Standards

## 1. Conventions & Principles

- **Strict TypeScript**: No `any` escapes in business logic. All database entities, AI predictions, quest definitions, and shop items are strictly typed.
- **Local-First Single Source of Truth**: IndexedDB managed via Dexie is the authoritative storage engine. React state reflects Dexie live queries or reactive hooks.
- **Defensive Error Handling**: All asynchronous network and model loading operations are guarded by structured try/catch blocks with user-friendly fallback guidance.
- **Honest AI Reporting**: Prediction confidence percentages are displayed transparently. The system distinguishes between high confidence (>70%), moderate confidence (40-70%), and uncertain results (<40%).
- **Clean Micro-Interactions**: Smooth animations using Framer Motion with reduced-motion media query respect.

---

## 2. Verification Commands

| Action | Command | Purpose |
| :--- | :--- | :--- |
| **Type Check** | `npm run build` | Validates strict TypeScript compilation across the codebase |
| **Unit & Integration Tests** | `npm test` | Runs Vitest test suite for AI classifier, quest engine, economy, and DB |
| **Dev Server** | `npm run dev` | Starts Vite local development server with HMR |
| **Production Preview** | `npm run preview` | Validates optimized production bundle |
