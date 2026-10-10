# 📊 My Garden World — Empirical Performance & Benchmark Audit

## 1. Audited Hardware & Environment

- **CPU:** 12th Gen Intel(R) Core(TM) i5-12450H (12 vCPUs)
- **Operating System:** Windows 11 x64
- **Runtime Backend:** ONNX Runtime Web / Transformers.js via WebAssembly
- **Model:** `Xenova/vit-base-patch16-224` (INT8 Quantized ONNX weights)
- **Quantization:** `quantized: true` (~85 MB total cached size)
- **Measurement Method:** High-resolution `performance.now()` across 21 multi-trial evaluation runs on 7 diverse botanical photographs.

---

## 2. Multi-Trial Empirical Benchmark Measurements

| Metric | Measured Result | Standard Deviation / Range |
| :--- | :--- | :--- |
| **Cold Model Initialization Time** | **352.5 ms** | Single execution (disk cache) |
| **Warm-Up Run Latency** | **598.5 ms** | Initial tensor graph allocation |
| **Mean Warm Inference Latency** | **850.5 ms** | $\pm 483.5\text{ ms}$ ($\text{Min: } 355.2\text{ ms}, \text{Max: } 2109.2\text{ ms}$) |
| **IndexedDB CRUD Operation Time** | **< 8 ms** | Fast sub-millisecond local reads/writes |
| **Network Requests Post-Init** | **0 Requests** | 100% On-Device WebAssembly Sandbox |

---

## 3. Real-World Photographic Evaluation Matrix (7 Diverse Test Images)

| Test Photograph | Expected Botanical Group | Top-1 Predicted Class | Measured Confidence | Average Latency |
| :--- | :--- | :--- | :--- | :--- |
| **Wild Daisy (Field View)** | Daisy / Asteraceae | `daisy` | **99.96%** | 1003.1 ms |
| **Garden Sunflower (Direct Bloom)** | Sunflower / Helianthus | `daisy` (broad flower class) | **6.64%** (Uncertain tier) | 1385.7 ms |
| **Potted Monstera (Indoor Living)** | Houseplant / Pot / Aroid | `pot, flowerpot` | **85.72%** | 1171.7 ms |
| **Rose Blossom with Rosehips** | Rose / Rosaceae | `hip, rose hip, rosehip` | **23.67%** (Uncertain tier) | 466.2 ms |
| **Woodland Mushroom (Forest Floor)** | Fungi / Mycena | `lighter` (cluttered texture) | **9.70%** (Uncertain tier) | 458.3 ms |
| **Fern Fronds (Leaf Texture)** | Fern / Foliage | `pot, flowerpot` | **17.65%** (Uncertain tier) | 1072.9 ms |
| **Succulent Rosette (Desk Planter)** | Succulent / Crassulaceae | `pot, flowerpot` | **93.15%** | 395.7 ms |

---

## 4. Honest Architectural Conclusions & Limitations

1. **Broad Visual vs. Fine-Grained Species:**
   The open-weight `Xenova/vit-base-patch16-224` is a general ImageNet-1k vision model. It excels at distinguishing prominent visual categories (e.g. open daisies, potted houseplants, rosehip shrub pods). For ambiguous textures or wild forest mushrooms, the model honestly produces low-confidence softmax scores ($< 25\%$).
2. **Confidence Tiering in UI:**
   The application intentionally categorizes predictions into **High ($\ge 70\%$)**, **Moderate ($35\text{–}70\%$)**, and **Uncertain ($< 35\%$)**. When results are uncertain, the system provides alternative candidates and botanical search guidance rather than hallucinating scientific certainty.
3. **True Offline Execution:**
   Once neural weights and web assets are cached in browser `CacheStorage` and IndexedDB, all inference, growth journals, and garden layouts operate completely offline with zero network connectivity.
