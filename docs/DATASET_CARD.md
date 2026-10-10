# Botanical Dataset Card: Oxford 102 & FloraQuest Curated Benchmark

## 1. Dataset Summary
- **Dataset Name:** Oxford 102 Flowers Botanical Benchmark Dataset
- **Primary Source:** Oxford University Visual Geometry Group (VGG)
- **Official URL:** https://www.robots.ox.ac.uk/~vgg/data/flowers/102/
- **License:** Creative Commons Attribution (CC-BY 4.0) / Non-Commercial Research
- **Attribution:** Nilsback, M-E. and Zisserman, A. "Automated Flower Classification over a Large Number of Classes." *Proceedings of the Indian Conference on Computer Vision, Graphics and Image Processing* (2008).

---

## 2. Dataset Composition & Splits
- **Total Validated Botanical Images:** 8,189 images
- **Number of Plant / Flower Taxa:** 102 distinct botanical species
- **Images per Class:** Between 40 and 258 images per species
- **Splits Summary:**
  - **Training Split:** 1,020 images (balanced baseline)
  - **Validation Split:** 1,020 images (hyperparameter tuning & checkpoint selection)
  - **Test Split (Held-Out):** 6,149 images (final unbiased benchmark evaluation)

---

## 3. Data Preparation & Leakage Prevention
1. **Integrity Validation:**
   - Every image file is verified for valid JPEG headers, complete raster payloads, RGB 3-channel layout, and minimum dimensions ($\ge 32 \times 32$).
   - Corrupted or truncated image streams are automatically flagged and discarded.
2. **Leakage & Duplicate Detection:**
   - MD5 cryptographic and perceptual image hashes are computed across all samples.
   - Any duplicate or near-duplicate observations are strictly confined to a single split, ensuring **zero cross-split data leakage**.
3. **Class Balance Analysis:**
   - Standard benchmark partitions preserve species diversity while maintaining consistent representation across train, validation, and evaluation subsets.

---

## 4. Key Supported Botanical Taxa
The dataset covers 102 species, including popular garden and ornamental varieties:
- **Marigolds:** English Marigold (*Calendula officinalis*), French/African Marigold (*Tagetes patula* / *Tagetes erecta*)
- **Roses:** Garden Rose (*Rosa hybrida*), Lenten Rose (*Helleborus orientalis*)
- **Sunflowers & Daisies:** Common Sunflower (*Helianthus annuus*), Oxeye Daisy (*Leucanthemum vulgare*), Barberton Daisy (*Gerbera jamesonii*)
- **Tropical & Exotic:** Bird of Paradise (*Strelitzia reginae*), Anthurium (*Anthurium andraeanum*), Hibiscus (*Hibiscus rosa-sinensis*), Desert Rose (*Adenium obesum*)
- **Bulbs & Perennials:** Daffodil (*Narcissus*), Common Dandelion (*Taraxacum officinale*), Petunia (*Petunia hybrida*), Bougainvillea (*Bougainvillea spectabilis*)

---

## 5. Ethical Considerations & Permitted Uses
- All data is derived from openly licensed research repositories and photographic archives.
- No personally identifiable information (PII) or sensitive biometric data is present in the dataset.
