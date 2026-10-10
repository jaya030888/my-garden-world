import os
import sys
import io
import json
import urllib.request
from pathlib import Path
from PIL import Image, ImageDraw
import torch

sys.stdout.reconfigure(line_buffering=True)
print("Initializing comprehensive botanical and OOD benchmark...", flush=True)

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from app.classifier import classifier_service
from app.botanical_db import lookup_botanical_info

TEST_SPECIMENS = [
    {
        "name": "Wild Field Daisy",
        "url": "https://images.unsplash.com/photo-1560717789-0ac7c58ac90a?w=400&q=80",
        "expected_taxon": "Bellis perennis (Daisy)",
        "category": "Real Botanical Flower"
    },
    {
        "name": "Garden Sunflower Bloom",
        "url": "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=400&q=80",
        "expected_taxon": "Helianthus annuus (Sunflower)",
        "category": "Real Botanical Flower"
    },
    {
        "name": "Wild Rosehip Blossom",
        "url": "https://images.unsplash.com/photo-1496062031456-07b8f162a322?w=400&q=80",
        "expected_taxon": "Rosa canina (Rosehip)",
        "category": "Real Botanical Flower"
    },
    {
        "name": "Potted Indoor Monstera",
        "url": "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400&q=80",
        "expected_taxon": "Monstera deliciosa (Potted)",
        "category": "Potted Houseplant"
    },
    {
        "name": "Desk Planter Succulent",
        "url": "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=400&q=80",
        "expected_taxon": "Crassulaceae (Planter)",
        "category": "Potted Houseplant"
    },
    {
        "name": "Woodland Forest Mushroom",
        "url": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&q=80",
        "expected_taxon": "Fungi / Wild Agaric",
        "category": "Wild Fungi (Non-Plantae)"
    },
    {
        "name": "Ceramic Coffee Mug (OOD)",
        "url": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&q=80",
        "expected_taxon": "Non-plant (Cup/Mug)",
        "category": "Inanimate Non-Plant"
    },
    {
        "name": "Urban Office Laptop (OOD)",
        "url": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80",
        "expected_taxon": "Non-plant (Electronics)",
        "category": "Inanimate Non-Plant"
    }
]

def run_comprehensive_audit():
    classifier_service.load_model()
    
    results = []
    
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
    
    for item in TEST_SPECIMENS:
        try:
            req = urllib.request.Request(item["url"], headers=headers)
            with urllib.request.urlopen(req, timeout=10) as response:
                img_bytes = response.read()
        except Exception as e:
            print(f"Failed to fetch {item['name']}: {e}")
            continue
            
        res = classifier_service.classify_image(img_bytes, top_k=5)
        top = res["top_prediction"]
        
        entry = {
            "name": item["name"],
            "category": item["category"],
            "expected_taxon": item["expected_taxon"],
            "predicted_label": top["label"],
            "raw_softmax_score": top["score"],
            "confidence_tier": res["confidence_tier"],
            "is_verified_species": top["is_verified_species"],
            "detection_type": top["detection_type"],
            "scientific_name": top["botanical_info"]["scientific_name"] if top["botanical_info"] else "N/A",
            "latency_ms": res["inference_time_ms"],
            "top3_classes": [f"{alt['label']} ({alt['score']:.1%})" for alt in [top] + res["alternative_predictions"][:2]]
        }
        results.append(entry)
        print(f"[{entry['category']}] {entry['name']} -> Pred: '{entry['predicted_label']}' (Score: {entry['raw_softmax_score']:.2%}, Tier: {entry['confidence_tier']}, Verified: {entry['is_verified_species']})")

    output_path = Path(__file__).resolve().parent / "empirical_benchmark_report.json"
    with open(output_path, "w") as f:
        json.dump(results, f, indent=2)
    print(f"\nSaved empirical results to {output_path}")

if __name__ == "__main__":
    run_comprehensive_audit()
