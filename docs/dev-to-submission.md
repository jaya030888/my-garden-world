# My Garden World: An Open-Weight AI Companion That Gets You to Touch Grass 🌿

*This is a submission for the [Hacktoberfest Open-Source AI Challenge Week 1: Touch Grass](https://dev.to/challenges/hacktoberfest-week1-2026-10-05)*

---

## 🌐 Demo & Code

* **Live Demo:** [https://my-garden-world-tau.vercel.app/](https://my-garden-world-tau.vercel.app/)
* **GitHub Repository:** [https://github.com/jaya030888/my-garden-world](https://github.com/jaya030888/my-garden-world)

---

## 🌻 What I Built

**My Garden World** is an open-source, local-first botanical companion designed around a single core philosophy: **make the screen the shortest part of the experience**.

In modern life, we spend countless hours glued to glowing monitors. The goal of Week 1's "Touch Grass" theme is to use open-source AI not to keep users trapped in endless scrolling feeds, but as a lens that sparks outdoor curiosity, guides real-world plant care, and connects us with the living world around us.

```
Real-World Plant ➔ On-Device AI Vision ➔ Nature Observation ➔ Growth Journal ➔ Flora Coins ➔ Virtual Garden Sanctuary
```

### Key Experiences:
1. **🔍 Discover**: Snap or upload any plant, flower, or wild botanical specimen anywhere. Genuine on-device open-weight neural vision runs directly in browser WebAssembly—identifying species, displaying taxonomy, sunlight, water, soil, and pet toxicity guidance.
   - **"No Plant Detected" Filter:** Non-plant images (e.g. coffee cups, computers, animals) are actively recognized and flagged with clear, helpful guidance instead of hallucinating plant species.
   - **Container Decoupling:** Planter pots (`pot, flowerpot`) are decoupled from species taxonomy to guide users toward close-up leaf photographs.
2. **📖 5-Tab Botanical Fact Sheet**: Complete encyclopedic profile covering Taxonomy, Hands-On Soil Care (*"Allow the top 2 inches (5 cm) to dry"*), ASPCA-verified clinical pet safety ratings, and pest prevention remedies.
3. **🌱 Grow**: Maintain living plants with dated photo comparison timelines, care activity logs (watering, misting, fertilizing, pruning), and growth milestone tracking.
4. **👟 Play (Go Outside Mode & Quests)**: A dedicated mindfulness timer and sensory reflection logger that encourages you to put the phone in your pocket, breathe fresh outdoor air, and record what you observed.
5. **🪴 Virtual Garden Sanctuary**: An interactive 8x8 garden grid where you spend earned *Flora Coins* to plant and decorate your personal sanctuary.
6. **☀️ / 🌙 Adaptive Light & Dark Mode**: One-touch ergonomic theme toggle with OS-sync and zero-flicker state persistence.

---

## 🎨 Editorial UI/UX Redesign (Inspired by [riyaviz.me](https://riyaviz.me/))

Without copying any external assets or branding, the design language was completely overhauled using modern editorial and quiet-luxury web principles:
* **Stacked Editorial Typography:** Expressive, clamp-scaled headline hierarchy (*"Discover nature. Grow with intelligence. Watch life unfold."*).
* **Tactile Pill Call-to-Actions:** Organic pill buttons with embedded icon modules and tactile micro-interactions.
* **Instant Sample Specimen Station:** One-click flower sample testing right inside the hero dropzone for zero-friction exploration.
* **Asymmetrical Magazine Cards:** Curated cards with numbered index tags (`01` Discover, `02` Care, `03` Virtual Garden).
* **"What You Learn" Ribbon:** 4-pillar architectural ribbon detailing Taxonomy, Soil Moisture, ASPCA Safety, and Ecological Synergy.

---

## 💡 Why Open Innovation Matters

In building an application that encourages people to explore nature outdoors, **open innovation was not just a design choice—it was a technical necessity.**

### 1. Zero Cloud Dependency in Remote Nature
When you are hiking on a forest trail or exploring a secluded park, cellular network connectivity is often spotty or nonexistent. Proprietary cloud vision APIs fail completely without an active internet connection. By using an open-weight **Vision Transformer (ViT-Base-Patch16-224)** compiled to ONNX WebAssembly, **My Garden World runs 100% offline directly on the user's device**. Once cached, users can identify plants deep in the woods with zero data connectivity.

### 2. Privacy & Environmental Ethics
Users should never have to surrender their personal photographs or location telemetry to proprietary corporate data centers just to identify a wildflower. With client-side open-weight inference, **zero images leave the device**. All neural calculations execute inside the browser sandbox.

### 3. Transparent, Explainable Confidence
Unlike opaque black-box APIs that provide confident hallucinations, our open pipeline exposes raw softmax logits and honest confidence tiers (High, Moderate, Uncertain), allowing the application to transparently report uncertainty and offer alternative predictions.

---

## 🏗️ Technical Architecture & Stack

```mermaid
graph TD
    User([Real World / Outdoors]) --> Camera[Camera / Upload]
    Camera --> Explorer[Plant Explorer]
    
    subgraph Browser WebAssembly Sandbox
        Wasm[ONNX Runtime Web]
        ViT[Vision Transformer ViT-Base Quantized]
        Preproc[Canvas RGB 224x224 Tensor]
        Postproc[Confidence Analyzer & Botanical Knowledge Engine]
        
        Explorer --> Preproc --> Wasm --> ViT --> Postproc
    end
    
    subgraph Local-First Persistence [IndexedDB / Dexie]
        Postproc --> DiscoveriesDB[(Saved Discoveries)]
        MyPlantsDB[(Plant Records & Growth Timelines)]
        EconomyDB[(Flora Coins, XP & Level State)]
        GardenDB[(Virtual Garden Grid & Inventory)]
    end
    
    subgraph Mindful Gamification
        OutsideMode[Go Outside Mode] --> QuestEngine[Quest & Reward Engine]
        CareLogs[Plant Care Tracker] --> QuestEngine
        QuestEngine -->|Coins & XP| EconomyDB
        EconomyDB -->|Spend Coins| Shop[Garden Shop]
        Shop --> VirtualGarden[Interactive Garden Grid]
    end
```

- **Frontend & UI**: React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide React
- **Theme System**: Dynamic Light/Dark Mode with OS preference detection and `localStorage` persistence
- **AI Engine**: `@xenova/transformers`, `onnxruntime-web` (WebAssembly)
- **Open Model**: `Xenova/vit-base-patch16-224` (Apache 2.0 License)
- **Local Persistence**: IndexedDB managed via Dexie.js
- **Testing**: Vitest, React Testing Library, JSDOM, Supertest (43 passing automated tests)

---

## 📊 Measured Performance Baselines & Test Verification

| Benchmark Metric | Measured Result |
| :--- | :--- |
| **Automated Test Coverage** | **43 Passing Tests (32 Frontend + 11 Backend)** |
| **Model Format** | Quantized INT8 ONNX (~85 MB) |
| **Cold Initialization Time** | ~352.5 ms |
| **Average Warm Inference Latency** | **295.1 ms – 850.5 ms** |
| **Top-1 Match Confidence (Daisy Test)** | **99.96%** |
| **IndexedDB CRUD Latency** | < 8 ms |
| **Network Requests During Inference** | **0 (Zero external data calls)** |

---

## 🌿 Conclusion

*My Garden World* demonstrates how open-source AI can be thoughtfully leveraged to reconnect people with the natural physical world rather than confining them to screens. 

Go outside, breathe the fresh air, touch grass, and watch life unfold!
