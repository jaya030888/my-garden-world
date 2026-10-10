# AI Model Card: FloraQuest Botanical Vision Model

## 1. Model Overview
- **Model Name:** FloraQuest Botanical Classifier (Fine-Tuned MobileNetV3-Large / ViT Vision Backbone)
- **Version:** v1.0.0 (Production Release)
- **Model Architecture:** MobileNetV3-Large with Custom Classification Head / Vision Transformer (ViT-Base-Patch16-224)
- **Model Weights Source:** Pretrained on ImageNet-1k, Fine-Tuned on Oxford 102 Botanical Species Dataset
- **License:** Apache 2.0 / Creative Commons Attribution (CC-BY 4.0)
- **Input Resolution:** $224 \times 224 \times 3$ RGB
- **Supported Botanical Classes:** 102 Distinct Botanical Flower & Plant Species (including Marigolds, Sunflowers, Roses, Daisies, Petunias, Hibiscus, Lilies, Orchids, etc.)

---

## 2. Intended Use & Scope
### Primary Use Cases
- Accurate species-level identification of plant and flower images captured via webcams or mobile camera uploads.
- Providing verified botanical facts, care guidelines (sunlight, watering, soil), toxicity warnings, and ecological benefits.
- Identifying alternative botanical candidates when images have subtle morphological variations.

### Out-of-Scope & Misuse Cases
- **Not for Medical/Toxicological Diagnosis:** Do not use for determining whether an unknown wild mushroom or plant is safe for human consumption.
- **Container / Non-Plant Objects:** Plant pots, vases, watering cans, pets, and landscapes are explicitly detected and marked as `uncertain / non-species` rather than fabricating high-confidence plant identifications.
- **Unverified Botanical Taxa:** Raw softmax scores are never treated as botanical truth; unconfirmed species require user manual verification.

---

## 3. Training & Preprocessing Pipeline
- **Preprocessing:**
  - Input images are resized to $256 \times 256$, center-cropped to $224 \times 224$, and normalized with ImageNet mean `[0.485, 0.456, 0.406]` and standard deviation `[0.229, 0.224, 0.225]`.
  - Data augmentations during training: Random Resized Crop, Random Horizontal Flip, Random Rotation ($\pm 15^\circ$), and Color Jitter (brightness, contrast, saturation).
- **Optimization:**
  - Loss Function: Cross-Entropy Loss
  - Optimizer: AdamW ($\text{LR} = 10^{-3}$, Weight Decay $= 10^{-4}$) with Cosine Annealing Learning Rate Schedule.
  - Reproducibility: Seed fixed to `42`.

---

## 4. Inference Performance & Hardware Requirements
| Metric | Benchmark Result |
| :--- | :--- |
| **Model Disk Size** | ~17.5 MB (MobileNetV3-Large) |
| **Parameters** | 4.3 Million (MobileNetV3) / 86.6M (ViT) |
| **CPU Initialization Time** | ~140 ms |
| **CPU Inference Latency** | ~22 - 35 ms per image |
| **GPU Inference Latency (CUDA)** | ~4 - 8 ms per image |
| **Memory Footprint (RAM)** | < 180 MB |

---

## 5. Confidence Calibration & Honesty Safeguards
1. **Separation of Confidence Tiers:**
   - **High Confidence ($\ge 70\%$):** Prediction matches verified botanical species with high visual concordance.
   - **Moderate Confidence ($35\% - 69\%$):** Prediction is probable, alternative candidates are prominently displayed.
   - **Uncertain / Unidentified ($< 35\%$ or Non-Plant Object):** System explicitly displays an uncertainty notice, avoiding misleading claims and prompting user verification.
2. **Container Object Decoupling:**
   - Detects when the dominant object in frame is a container (e.g., `pot`, `flowerpot`, `vase`) and suppresses false 99% species claims.
