# Final Evidence-Based AI Model Audit Report: My Garden World / FloraQuest

**Audit Date:** October 10, 2026  
**Auditor:** Antigravity AI Engineering & Verification System  
**System Tested:** FloraQuest Plant Vision Subsystem (`ai-service` FastAPI & `frontend` Web Vision Pipeline)  
**Host Environment:** Windows 10 x64, 12th Gen Intel(R) Core(TM) i5-12450H (12 Cores), Python 3.13.11, Node.js v22.18.0, PyTorch 2.14.1+cpu, Transformers 5.19.0 / @xenova/transformers 2.17.2  

---

## 1. Executive Summary & Verdict

This document presents a final, empirical, evidence-based audit of the artificial intelligence vision model integrated into *My Garden World* (FloraQuest). Every claim in this audit is backed by direct code inspection, runtime introspection, shell command executions, and empirical benchmark outputs across real botanical photographs, synthetic stimuli, and out-of-distribution (OOD) non-plant images.

### Overall Audit Verdict:
```text
PRETRAINED MODEL ONLY
```

*(Note: Prior claims in earlier documentation suggesting that a fine-tuned botanical checkpoint had been fully trained and deployed to production were unverified. The active production service executes a general-purpose ImageNet-1k Vision Transformer paired with a curated botanical taxonomy mapping and confidence calibration layer).*

---

## 2. Model Architecture, Weights Provenance & Licensing

| Attribute | Specification / Verification Evidence |
| :--- | :--- |
| **Model Identifier** | `google/vit-base-patch16-224` (Python Backend) / `Xenova/vit-base-patch16-224` (Frontend Client) |
| **Model Architecture** | Vision Transformer (`ViTForImageClassification`, base variant, 16x16 patch resolution, 224x224 input grid) |
| **Parameter Count** | **86.6 Million parameters** (12 Transformer encoder layers, hidden size 768, 12 attention heads) |
| **Pretrained Source** | Google Research / Hugging Face Hub ([google/vit-base-patch16-224](https://huggingface.co/google/vit-base-patch16-224)) |
| **License** | **Apache 2.0** (Permissive open-source commercial and personal use) |
| **Weights Artifact Location** | Cached on Hugging Face Hub / Torch Hub (`~/.cache/huggingface/hub/models--google--vit-base-patch16-224`) and ONNX INT8 Web runtime |
| **Original Pretraining Corpus** | Pretrained on ImageNet-21k (14M images, 21,843 classes) at resolution 224x224, fine-tuned by Google on ImageNet-1k (1,000 general object classes) |
| **Active Class Head** | 1,000 ImageNet-1k object classes (containing general objects e.g., `pot, flowerpot`, `daisy`, `hip, rose hip`, `cardoon`, `rapeseed`, `lighter`, `notebook`, `espresso`) |

---

## 3. Training Provenance & Verification

### Codebase Inspection Findings:
1. **Training Code Exists:** The repository contains modular training scripts under `ai-service/training/`:
   - `data_prep.py`: Downloads Oxford 102 Flowers benchmark dataset, computes MD5 hashes to prevent cross-split leakage, extracts ground truth labels (`imagelabels.mat`), and partitions into train/val/test splits.
   - `train.py`: Fine-tuning harness for PyTorch backbones (`mobilenet_v3_large`, `resnet18`, `resnet50`) with Cosine Annealing, AdamW, and data augmentations.
   - `evaluate.py`: Evaluation pipeline computing Top-1, Top-5, macro precision/recall/F1, and OOD stress testing.
2. **Production Checkpoint Reality:**
   - No pre-saved custom weights checkpoint (e.g. `plant_classifier_mobilenet_v3_large.pt`) was packaged or activated in `ai-service/app/classifier.py`.
   - The production FastAPI service directly instantiates `AutoModelForImageClassification.from_pretrained("google/vit-base-patch16-224")`.
   - **Conclusion:** Custom plant-specific fine-tuning has **not** been executed for the active production model. The model is an off-the-shelf ImageNet-1k pretrained Vision Transformer.

---

## 4. Inference Execution & Preprocessing Validation

### Neural Execution Reality:
- **No Mocking / Hardcoding:** The system does **not** use static mock responses, fake random delays, or hardcoded prediction dictionaries.
- **Genuine Neural Inference:** The runtime loads the 86.6M parameter ViT weights, runs standard patch embedding tokenization, passes input through 12 self-attention layers, and calculates softmax probabilities over all 1,000 ImageNet logits.

### Preprocessing Pipeline:
- **Image Resizing & Normalization:** `AutoImageProcessor` resizes inputs to $224 \times 224$, scales RGB channels to $[0, 1]$, and normalizes via ImageNet mean `[0.5, 0.5, 0.5]` and std `[0.5, 0.5, 0.5]`.
- **Validation:** Tested with invalid and corrupt files; invalid image formats trigger an HTTP 400 with descriptive error details (`Invalid image format or corrupted file`), verified via PyTest.

### Output Decoding & Botanical Taxonomy:
- **Decoupled Container Classes:** The ImageNet-1k class `pot, flowerpot` (class 738), `vase`, `greenhouse`, `tray`, etc. are explicitly intercepted in `app/botanical_db.py` and `frontend/src/ai/botanicalDatabase.ts`. They are flagged as `detection_type: "container_object"` with `is_verified_species: false` and forced to `confidence_tier: "uncertain"`.
- **Taxonomic Integrity:** Mapped species (`Bellis perennis`, `Helianthus annuus`, `Rosa canina`, `Tagetes patula`, `Monstera deliciosa`, `Epipremnum aureum`, `Lavandula angustifolia`, `Cynara cardunculus`) use verified botanical nomenclature, non-fabricated care parameters (sunlight, soil, watering), and ASPCA-verified toxicity data.

---

## 5. Empirical Benchmark Results

### Command 1: PyTest AI Service Test Suite
```bash
python -m pytest tests/
```
**Output:**
```text
============================= test session starts =============================
platform win32 -- Python 3.13.11, pytest-9.1.1, pluggy-1.6.0
rootdir: C:\Users\Jaya\Desktop\FloraQuest\my-garden-world\ai-service
collected 9 items

tests\test_ai_service.py .....                                           [ 55%]
tests\test_model_pipeline.py ....                                        [100%]

======================== 9 passed in 68.88s (0:01:08) =========================
```

---

### Command 2: Empirical Multi-Specimen Photographic & OOD Benchmark
```bash
python run_benchmark_audit.py
```
**Results Table:**

| Specimen Name | Category | Expected Taxon | Model Predicted Class | Raw Softmax | Confidence Tier | Species Verified? |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Wild Field Daisy** | Real Flower | *Bellis perennis* (Daisy) | `daisy` | **98.96%** | **High** | **Yes (Verified Species)** |
| **Garden Sunflower Bloom** | Real Flower | *Helianthus annuus* | `monitor` / `daisy` | 55.71% | **Uncertain** | No (ImageNet visual mismatch) |
| **Wild Rosehip Blossom** | Real Shrub | *Rosa canina* | `pot, flowerpot` / `rosehip` | 19.00% | **Uncertain** | No (Intercepted container) |
| **Potted Indoor Monstera** | Houseplant | *Monstera deliciosa* | `pot, flowerpot` | 59.66% | **Uncertain** | **No (Container decoupled)** |
| **Desk Planter Succulent** | Houseplant | *Crassulaceae* | `pot, flowerpot` | 66.10% | **Uncertain** | **No (Container decoupled)** |
| **Woodland Forest Mushroom** | Wild Fungi | Fungi / Agaric | `scale, weighing machine` | 23.62% | **Uncertain** | No (Unidentified non-plant) |
| **Ceramic Coffee Mug** | Inanimate OOD | Non-plant (Mug) | `espresso` | 72.38% | **Uncertain** | No (Unidentified non-plant) |
| **Urban Office Laptop** | Inanimate OOD | Non-plant (Electronics) | `notebook, notebook computer` | 72.22% | **Uncertain** | No (Unidentified non-plant) |

---

### Command 3: Marigold Photograph & User Upload Audit
```bash
python run_audit.py
```
**Results on User Artifacts & Controlled Stimuli:**
- **Marigold / Yellow Flower Simulation:** Predicted `flagpole, flagstaff` (Score: 9.61%), Tier: `uncertain`, `is_verified_species: false`.
- **UI Screen Captures (User Uploads):** Correctly classified by ImageNet as `web site, website, internet site, site` (Score: 81.9% - 98.6%) and `jigsaw puzzle` (Score: 45.0% - 98.5%). Because these are non-botanical classes, the system safely labeled them `uncertain` without hallucinating botanical plant data.
- **Pure Random Gaussian Noise:** Predicted `tray` (Score: 29.6%), Tier: `uncertain`, `is_verified_species: false`.
- **Solid Black Blank Frame:** Predicted `matchstick` (Score: 3.2%), Tier: `uncertain`, `is_verified_species: false`.

---

## 6. Confidence Calibration Analysis

A major defect in naive AI applications is treating raw softmax outputs $P(y \mid x) = \frac{e^{z_y}}{\sum_j e^{z_j}}$ as true Bayesian posterior probabilities of botanical correctness.

### How Confidence Is Calibrated in FloraQuest:
1. **Container Object Decoupling:** When the vision model predicts container objects (`pot, flowerpot`, `vase`), raw confidence may exceed 90%. However, the system assigns `confidence_tier = "uncertain"` and informs the user that a container was detected rather than the plant species.
2. **Species Verification Gate:** Softmax scores are only promoted to `"high"` ($\ge 70\%$) or `"moderate"` ($35\% - 69\%$) if the predicted class maps to a biologically verified species in `VERIFIED_BOTANICAL_TAXONOMY`.
3. **Out-of-Distribution Suppression:** All non-plant classes (e.g., mugs, laptops, websites, noise) are automatically classified as `is_unidentified = true` and `confidence_tier = "uncertain"`.

---

## 7. Confirmed Defect Fixes & Improvements Implemented

1. **Fixed Container Classification Bias:** Prevented flowerpot detections from masquerading as high-confidence plant identifications.
2. **Fixed Taxonomy Hallucination:** Strict 1-to-1 biological mapping ensures only verified species are returned with scientific names and ASPCA toxicity data.
3. **Unified Frontend & Backend Pipelines:** Both the Python FastAPI backend and the client-side ONNX vision engine share identical 3-tier calibration thresholds and container intercept rules.
4. **Reproducible Benchmark Automation:** Built automated audit tools (`run_audit.py`, `run_benchmark_audit.py`, and `audit-ai-benchmarks.mjs`) for empirical testing across cold start, warm-up, and OOD scenarios.

---

## 8. Recommendations & Future Plant Fine-Tuning Pipeline

To transition from `PRETRAINED MODEL ONLY` to `VERIFIED TRAINED AND EVALUATED`:
1. **Acquire Labeled Botanical Datasets:** Download the full Oxford 102 Flowers dataset (8,189 images) or the iNaturalist 2021 Plant subset (10,000+ species, CC-BY-NC licensed).
2. **Execute Full Fine-Tuning Run:**
   ```bash
   cd ai-service
   python training/data_prep.py
   python training/train.py --architecture mobilenet_v3_large --epochs 25 --batch-size 32
   ```
3. **Evaluate Without Leakage:**
   ```bash
   python training/evaluate.py
   ```
4. **Deploy Trained Artifact:** Load the generated `plant_classifier_mobilenet_v3_large.pt` checkpoint in `classifier.py` and verify test metrics on the held-out split before updating production documentation.

---

## 9. Final Mandatory Verdict

```text
PRETRAINED MODEL ONLY
```
