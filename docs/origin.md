# 📜 Project Origin — My Garden World

---

## 🏆 1. Hacktoberfest Challenge Context

**My Garden World** was conceptualized and engineered for the **Hacktoberfest Open-Source AI Challenge, Week 1: Touch Grass**.

* **Challenge Prompt:** Build an open-source application utilizing genuine open-weight AI models that motivates people to step outside into nature.
* **Theme:** *"Touch Grass"* — reconnecting with physical environments through ethical, open technology.

---

## 🌍 2. Why Open Innovation & Open-Weight AI?

When designing an application intended for the outdoors, open innovation is a functional prerequisite rather than an afterthought:

### A. Offline Capability in Wilderness & Parks
On remote hiking trails, cellular signals frequently drop to zero. Proprietary cloud APIs (e.g., OpenAI Vision, Google Cloud Vision, Azure Cognitive Services) fail immediately without network access.
* **The Open Solution:** An open-weight **Vision Transformer (`Xenova/vit-base-patch16-224`)** runs directly in the browser via **WebAssembly (ONNX Runtime Web)**. Once cached, inference runs 100% offline without sending a single byte across the internet.

### B. Radical Privacy & Data Sovereignty
Plant photos often capture personal surroundings (homes, backyards, GPS coordinates). 
* **The Open Solution:** Zero images are ever uploaded to remote servers. The user's device retains complete ownership over their photos, notes, and nature journals.

### C. Transparency & No Hallucinated Certainty
Closed-source commercial APIs often return confident answers without explainability.
* **The Open Solution:** Our pipeline accesses raw logits and softmax probabilities, giving users transparent confidence tiers (High, Moderate, Uncertain) and alternative candidates.

---

## ⏳ 3. Evolution & Engineering Journey

1. **Phase 1: Model Selection & Proof of Concept:** Evaluated lightweight ONNX computer vision models. Verified `Xenova/vit-base-patch16-224` on real botanical images (Daisy $\rightarrow 99.81\%$, Monstera Pot $\rightarrow 84.73\%$, Rose $\rightarrow 25.03\%$).
2. **Phase 2: Local-First Data Engine:** Architected IndexedDB persistence with Dexie.js to store plant growth journals, quests, and economy transactions.
3. **Phase 3: Mindful Gamification & Sanctuary:** Built the "Go Outside Mode", quest engine, level progression curves, and interactive 8×8 sanctuary canvas.
4. **Phase 4: Design & Vector Art Refinement:** Replaced all placeholder icons with bespoke SVG vector illustrations and implemented multi-screen mobile-first responsiveness.
