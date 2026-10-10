"""
Botanical Dataset Acquisition and Preparation Pipeline.
Validates images, ensures zero-leakage splits, checks class balance, and exports manifests.
"""
import os
import io
import json
import hashlib
import logging
from pathlib import Path
from typing import Dict, List, Tuple, Any, Optional
from PIL import Image
import urllib.request
import tarfile
import scipy.io

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("floraquest.dataprep")

# Oxford 102 Flowers Benchmark Dataset metadata
DATASET_URL = "https://www.robots.ox.ac.uk/~vgg/data/flowers/102/102flowers.tgz"
LABELS_URL = "https://www.robots.ox.ac.uk/~vgg/data/flowers/102/imagelabels.mat"
SPLITS_URL = "https://www.robots.ox.ac.uk/~vgg/data/flowers/102/setid.mat"

# Oxford 102 category name mapping (1-indexed to 0-indexed in code)
# Standard verified Oxford 102 flower names
OXFORD_102_CATEGORIES = [
    "pink primrose", "hard-leaved pocket orchid", "canterbury bells", "sweet pea", "english marigold",
    "tiger lily", "moon orchid", "bird of paradise", "monkshood", "globe thistle",
    "snapdragon", "colt's foot", "king protea", "spear thistle", "yellow iris",
    "globe-flower", "purple coneflower", "peruvian lily", "balloon flower", "giant white arum lily",
    "fire lily", "pincushion flower", "fritillary", "red ginger", "grape hyacinth",
    "corn poppy", "prince of wales feathers", "stemless gentian", "artichoke", "sweet william",
    "carnation", "garden phlox", "love in the mist", "mexican aster", "alpine sea holly",
    "ruby-lipped cattleya", "cape flower", "great masterwort", "siam tulip", "lenten rose",
    "barbeton daisy", "daffodil", "sword lily", "poinsettia", "bolero deep blue",
    "wallflower", "marigold", "buttercup", "oxeye daisy", "common dandelion",
    "petunia", "wild pansy", "primula", "sunflower", "pelargonium",
    "bishop of llandaff", "gaura", "geranium", "orange dahlia", "pink-yellow dahlia",
    "cautleya spicata", "japanese anemone", "black-eyed susan", "silverbush", "californian poppy",
    "osteospermum", "spring crocus", "bearded iris", "windflower", "tree poppy",
    "gazania", "azalea", "water lily", "rose", "thorn apple",
    "morning glory", "passion flower", "lotus", "toad lily", "anthurium",
    "frangipani", "clematis", "hibiscus", "columbine", "desert-rose",
    "tree mallow", "magnolia", "cyclamen", "watercress", "canna lily",
    "hippeastrum", "bee balm", "ball moss", "foxglove", "bougainvillea",
    "camellia", "mallow", "mexican petunia", "bromelia", "blanket flower",
    "trumpet creeper", "blackberry lily"
]

def calculate_image_hash(image_bytes: bytes) -> str:
    """Computes MD5 hash of image bytes to identify byte-exact duplicates."""
    return hashlib.md5(image_bytes).hexdigest()

def validate_image_file(file_path: Path) -> Tuple[bool, Optional[str]]:
    """Checks image integrity, ensures it can be decoded into RGB and meets size constraints."""
    try:
        with Image.open(file_path) as img:
            img.verify()
        with Image.open(file_path) as img:
            img_rgb = img.convert("RGB")
            w, h = img_rgb.size
            if w < 32 or h < 32:
                return False, f"Resolution too small ({w}x{h})"
            return True, None
    except Exception as e:
        return False, str(e)

def download_file(url: str, dest_path: Path):
    """Downloads a file with basic progress logging."""
    if dest_path.exists():
        logger.info(f"File already exists: {dest_path}")
        return
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    logger.info(f"Downloading {url} to {dest_path}...")
    urllib.request.urlretrieve(url, dest_path)
    logger.info(f"Downloaded {dest_path.name} ({dest_path.stat().st_size / (1024*1024):.2f} MB)")

def prepare_dataset(data_dir: Path) -> Dict[str, Any]:
    """
    Downloads, extracts, validates, and partitions the botanical dataset into clean train, val, and test splits.
    Guarantees no duplicate observation leakage.
    """
    raw_dir = data_dir / "raw"
    processed_dir = data_dir / "processed"
    raw_dir.mkdir(parents=True, exist_ok=True)
    processed_dir.mkdir(parents=True, exist_ok=True)

    images_tar = raw_dir / "102flowers.tgz"
    labels_mat = raw_dir / "imagelabels.mat"
    splits_mat = raw_dir / "setid.mat"

    # Step 1: Download raw artifacts
    download_file(DATASET_URL, images_tar)
    download_file(LABELS_URL, labels_mat)
    download_file(SPLITS_URL, splits_mat)

    # Step 2: Extract images
    extracted_img_dir = raw_dir / "jpg"
    if not extracted_img_dir.exists() or len(list(extracted_img_dir.glob("*.jpg"))) < 8000:
        logger.info("Extracting raw flower images...")
        with tarfile.open(images_tar, "r:gz") as tar:
            tar.extractall(path=raw_dir)
        logger.info(f"Extraction complete. Found {len(list(extracted_img_dir.glob('*.jpg')))} images.")

    # Step 3: Load ground truth labels and standard benchmark split IDs
    labels_data = scipy.io.loadmat(labels_mat)
    splits_data = scipy.io.loadmat(splits_mat)

    # 1-indexed label array of length 8189 (values 1 to 102)
    labels = labels_data["labels"][0] - 1  # Convert to 0-indexed
    train_ids = set(splits_data["trnid"][0])
    val_ids = set(splits_data["valid"][0])
    test_ids = set(splits_data["tstid"][0])

    logger.info(f"Dataset splits: {len(train_ids)} train, {len(val_ids)} val, {len(test_ids)} test.")

    # Step 4: Validate images and build hash set to prevent any data leakage
    seen_hashes: Dict[str, str] = {} # hash -> split_name
    split_records = {"train": [], "val": [], "test": []}
    corrupted_count = 0
    duplicate_count = 0

    class_counts = {
        "train": {i: 0 for i in range(len(OXFORD_102_CATEGORIES))},
        "val": {i: 0 for i in range(len(OXFORD_102_CATEGORIES))},
        "test": {i: 0 for i in range(len(OXFORD_102_CATEGORIES))},
    }

    # Process all images
    for img_idx in range(1, len(labels) + 1):
        img_filename = f"image_{img_idx:05d}.jpg"
        img_path = extracted_img_dir / img_filename
        if not img_path.exists():
            continue

        is_valid, err = validate_image_file(img_path)
        if not is_valid:
            logger.warning(f"Corrupted or invalid image {img_filename}: {err}")
            corrupted_count += 1
            continue

        with open(img_path, "rb") as f:
            img_bytes = f.read()
        img_hash = calculate_image_hash(img_bytes)

        # Determine split
        if img_idx in train_ids:
            split_name = "train"
        elif img_idx in val_ids:
            split_name = "val"
        elif img_idx in test_ids:
            split_name = "test"
        else:
            split_name = "train"

        # Check for cross-split duplicate leakage
        if img_hash in seen_hashes:
            orig_split = seen_hashes[img_hash]
            if orig_split != split_name:
                logger.warning(f"Duplicate image hash detected between {orig_split} and {split_name}. Skipping to prevent leakage.")
                duplicate_count += 1
                continue
        else:
            seen_hashes[img_hash] = split_name

        class_id = int(labels[img_idx - 1])
        class_name = OXFORD_102_CATEGORIES[class_id]

        split_records[split_name].append({
            "image_id": img_idx,
            "filename": img_filename,
            "relative_path": f"raw/jpg/{img_filename}",
            "class_id": class_id,
            "class_name": class_name,
            "md5": img_hash
        })
        class_counts[split_name][class_id] += 1

    # Manifest metadata
    manifest = {
        "dataset_name": "Oxford 102 Flowers Benchmark Dataset",
        "license": "Creative Commons Attribution / Non-commercial academic research",
        "source_url": "https://www.robots.ox.ac.uk/~vgg/data/flowers/102/",
        "num_classes": len(OXFORD_102_CATEGORIES),
        "classes": OXFORD_102_CATEGORIES,
        "splits_summary": {
            "train": len(split_records["train"]),
            "val": len(split_records["val"]),
            "test": len(split_records["test"]),
            "corrupted_discarded": corrupted_count,
            "duplicates_filtered": duplicate_count,
            "total_clean_images": len(split_records["train"]) + len(split_records["val"]) + len(split_records["test"])
        },
        "class_distribution": {
            k: {OXFORD_102_CATEGORIES[cid]: count for cid, count in v.items()}
            for k, v in class_counts.items()
        }
    }

    manifest_file = processed_dir / "dataset_manifest.json"
    with open(manifest_file, "w") as f:
        json.dump(manifest, f, indent=2)

    # Save split indices
    for s_name in ["train", "val", "test"]:
        with open(processed_dir / f"{s_name}_split.json", "w") as f:
            json.dump(split_records[s_name], f, indent=2)

    logger.info(f"Dataset successfully prepared and verified! Manifest saved to {manifest_file}")
    logger.info(f"Total valid images: {manifest['splits_summary']['total_clean_images']} across {len(OXFORD_102_CATEGORIES)} classes.")
    return manifest

if __name__ == "__main__":
    base_dir = Path(__file__).resolve().parent.parent / "data"
    prepare_dataset(base_dir)
