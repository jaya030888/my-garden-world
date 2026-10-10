# My Garden World — System Architecture

## 1. High-Level Architecture Overview

**My Garden World** is an open-source, local-first botanical companion built for the Hacktoberfest Open-Source AI Challenge (Week 1: *Touch Grass*). It unites genuine on-device computer vision inference with plant care journaling and an interactive virtual garden economy.

```mermaid
graph TD
    User([User in Real World / Outdoors])
    Camera[Device Camera / File Upload] --> Explorer[Plant Explorer Module]
    
    subgraph Client-Side AI Engine [On-Device Open-Weight Inference]
        Wasm[ONNX Runtime Web / Transformers.js]
        ViT[Vision Transformer ViT-Base-Patch16-224 Quantized]
        Preproc[Canvas 224x224 RGB Normalizer]
        Postproc[Confidence Analyzer & Botanical Mapper]
        
        Explorer --> Preproc --> Wasm --> ViT --> Postproc
    end
    
    subgraph Botanical Intelligence
        Postproc --> KnowledgeBase[Botanical Knowledge Graph & Care Profiles]
    end
    
    subgraph Local Persistence [IndexedDB / Dexie.js]
        KnowledgeBase --> SavedDiscoveries[(Saved Discoveries)]
        MyPlants[(My Plants & Growth Timeline)]
        QuestDB[(Quests & Observation History)]
        GardenDB[(Virtual Garden Grid & Inventory)]
        UserEconomy[(Flora Coins, XP & Level State)]
    end
    
    subgraph Gamification & Engagement
        Quests[Daily/Weekly Nature Quests] --> QuestEngine[Quest & Reward Engine]
        OutsideMode[Go Outside Observation Mode] --> QuestEngine
        CareTasks[Real-World Plant Care Logs] --> QuestEngine
        QuestEngine -->|Flora Coins & XP| UserEconomy
    end
    
    subgraph Virtual Garden
        UserEconomy -->|Spend Coins| Shop[Garden Shop & Catalog]
        Shop --> Inventory[Item Inventory]
        Inventory --> VirtualGarden[Interactive Garden Grid Canvas]
    end
```

---

## 2. Module Responsibilities

| Module | Responsibility | Key Dependencies |
| :--- | :--- | :--- |
| **`src/ai/plantClassifier.ts`** | Stable boundary for open-weight model loading, preprocessing, inference execution, and honest confidence scoring. | `@xenova/transformers`, `onnxruntime-web` |
| **`src/ai/botanicalDatabase.ts`** | Curated botanical database with taxonomy, sunlight, hydration, soil, propagation, and eco-facts. | None (Pure TS domain model) |
| **`src/db/index.ts`** | Local-first persistence layer managing plants, dated growth photos, quests, garden items, and transaction logs. | `dexie` (IndexedDB) |
| **`src/services/questEngine.ts`** | Validates quest criteria, computes XP/Flora Coins, prevents duplicate claims, and handles "Go Outside" observations. | `dexie` |
| **`src/services/economyService.ts`** | Manages coin balances, level progression curves, shop purchases, and inventory allocations. | `dexie` |
| **`src/components/garden/*`** | Interactive 2.5D virtual garden grid allowing drag-and-drop placement, rotation, and persistence of plants, pots, and decorations. | `framer-motion`, `lucide-react` |
| **`src/components/plants/*`** | Plant growth journal, before/after visual timeline comparisons, and care history trackers. | `lucide-react` |

---

## 3. Plant-Identification Data Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant UI as Plant Explorer (UI)
    participant Classifier as plantClassifier.ts
    participant Hub as Hugging Face Hub / Browser Cache
    participant ORT as ONNX Runtime WebAssembly
    participant Knowledge as Botanical Knowledge Graph
    participant DB as IndexedDB (Dexie)

    User->>UI: Captures/Uploads plant photo
    UI->>Classifier: identifyPlant(imageElement / Blob)
    alt Model not in memory
        Classifier->>Hub: Fetch ViT-Base ONNX weights & tokenizer config
        Hub-->>Classifier: Cached Wasm/ONNX model files
    end
    Classifier->>ORT: Run ViT patch projection & transformer attention layers
    ORT-->>Classifier: Softmax logits (1,000 ImageNet / Botanical classes)
    Classifier->>Classifier: Filter top 5 predictions, compute confidence & uncertainty bounds
    Classifier->>Knowledge: Map top class to detailed botanical care & ecology profile
    Knowledge-->>Classifier: Enriched Botanical Discovery Object
    Classifier-->>UI: Return typed PlantClassificationResult
    UI->>User: Display prediction, confidence meter, care guide & alternatives
    User->>UI: Click "Save to Discoveries" / "Add to My Plants"
    UI->>DB: Store discovery record & trigger 20 Flora Coins + 25 XP reward
```

---

## 4. Quest-to-Reward Transaction Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant QuestUI as Nature Quests UI
    participant Outside as Go Outside Mode
    participant Engine as Quest Engine
    participant DB as IndexedDB (Dexie)
    participant Eco as Economy Service

    User->>Outside: Activate "Go Outside Mode" (30-min timer / nature walk)
    Outside-->>User: Screen dimmed, nature observation prompt active
    User->>Outside: End walk & log real-world botanical observation
    Outside->>Engine: completeQuest(questId: "outside-walk-1", payload)
    Engine->>DB: Check if quest completed in current period (duplicate prevention)
    alt Already Claimed
        Engine-->>QuestUI: Error("Quest already claimed for this period")
    else Eligible
        Engine->>DB: Record quest completion timestamp
        Engine->>Eco: awardRewards(coins: 25, xp: 30, reason: "Nature observation")
        Eco->>DB: Update user stats, check for Level Up
        Eco-->>QuestUI: Return TransactionResult(newCoins, newXP, didLevelUp: true)
        QuestUI->>User: Trigger Level Up modal + confetti celebration
    end
```

---

## 5. Persistence Strategy & Offline Architecture

- **Local-First Reliability**: All user data (plant records, dated growth photos in base64/blob storage, nature logs, garden layout, coins) is stored locally in IndexedDB using Dexie.js.
- **Offline Model Caching**: ONNX model files are cached using the browser's CacheStorage API (`env.useBrowserCache = true`). Once fetched initially, inference works fully offline without internet access.
- **Service Worker & Manifest**: PWA shell caching enables the complete web application to open and run offline in outdoor settings with zero connectivity.

---

## 6. Privacy & Security Decisions

1. **Zero External Vision Uploads**: Plant photos are processed **100% on the user's device** inside WebAssembly. No photos are sent to proprietary vision APIs or remote third parties.
2. **Optional Location Privacy**: Location coordinates are not collected or transmitted. Nature observation timestamps and user notes remain strictly in client-side IndexedDB.
3. **Data Ownership**: Users have a one-click "Export Garden Data (JSON)" and "Clear All Data" control in Settings.
4. **Honest Economy**: The in-game currency (*Flora Coins*) is clearly communicated as a local gamified progression mechanic, not a real-world cryptocurrency.
