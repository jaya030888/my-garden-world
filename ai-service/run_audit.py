import os
import sys
import io
import json
from pathlib import Path
from PIL import Image, ImageDraw
import torch

sys.stdout.reconfigure(line_buffering=True)
print("Initializing run_audit script...", flush=True)

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from app.classifier import classifier_service
from app.botanical_db import lookup_botanical_info

def run_comprehensive_inference_audit():
    print("===============================================================", flush=True)
    print("DEEP EMPIRICAL AI MODEL INFERENCE & CALIBRATION AUDIT", flush=True)
    print("===============================================================", flush=True)
    
    print("Loading ViT Model...", flush=True)
    classifier_service.load_model()
    print("ViT Model successfully loaded in memory.", flush=True)
    
    # 1. Check user uploaded images if present
    uploaded_dir = Path(r"C:\Users\Jaya\.gemini\antigravity-ide\brain\3e02fef6-683c-41b4-93ec-af98414d5248\.user_uploaded")
    uploaded_images = list(uploaded_dir.glob("*.*")) if uploaded_dir.exists() else []
    print(f"Found {len(uploaded_images)} user uploaded image(s): {[p.name for p in uploaded_images]}", flush=True)
    
    # 2. Prepare test cases: user images, synthesized plant patterns, and out-of-distribution non-plants
    test_cases = []
    
    for img_path in uploaded_images:
        with open(img_path, "rb") as f:
            test_cases.append({
                "name": f"User Upload ({img_path.name})",
                "bytes": f.read(),
                "category": "User Uploaded Photograph"
            })
            
    # Synthetic / Controlled Images:
    # Yellow-Orange flower-like disk (similar to marigold / sunflower)
    img_marigold_sim = Image.new("RGB", (224, 224), (34, 139, 34)) # green background
    draw = ImageDraw.Draw(img_marigold_sim)
    draw.ellipse([40, 40, 184, 184], fill=(255, 140, 0)) # orange flower head
    draw.ellipse([80, 80, 144, 144], fill=(255, 215, 0)) # yellow disc florets
    buf = io.BytesIO()
    img_marigold_sim.save(buf, format="JPEG")
    test_cases.append({
        "name": "Synthesized Marigold-like Orange/Yellow Flower",
        "bytes": buf.getvalue(),
        "category": "Synthetic Floral Image"
    })
    
    # Non-plant OOD test cases
    # 1. Coffee Mug / Cup
    img_mug = Image.new("RGB", (224, 224), (240, 240, 240))
    draw = ImageDraw.Draw(img_mug)
    draw.rectangle([70, 60, 150, 170], fill=(50, 100, 200)) # blue cylinder
    draw.arc([130, 80, 180, 150], 270, 90, fill=(50, 100, 200), width=10) # handle
    buf = io.BytesIO()
    img_mug.save(buf, format="JPEG")
    test_cases.append({
        "name": "Coffee Mug (Non-Plant OOD)",
        "bytes": buf.getvalue(),
        "category": "Inanimate Non-Plant Object"
    })
    
    # 2. Pure Random Gaussian Noise
    import numpy as np
    noise_arr = np.random.randint(0, 256, (224, 224, 3), dtype=np.uint8)
    img_noise = Image.fromarray(noise_arr)
    buf = io.BytesIO()
    img_noise.save(buf, format="PNG")
    test_cases.append({
        "name": "Pure Random Noise (OOD)",
        "bytes": buf.getvalue(),
        "category": "Synthetic Noise OOD"
    })
    
    # 3. Solid Black Image
    img_black = Image.new("RGB", (224, 224), (0, 0, 0))
    buf = io.BytesIO()
    img_black.save(buf, format="PNG")
    test_cases.append({
        "name": "Solid Black Frame (OOD)",
        "bytes": buf.getvalue(),
        "category": "Blank Image OOD"
    })

    print(f"\nRunning inference across {len(test_cases)} test cases...\n", flush=True)
    
    results = []
    for tc in test_cases:
        res = classifier_service.classify_image(tc["bytes"], top_k=5)
        top = res["top_prediction"]
        item = {
            "test_case": tc["name"],
            "category": tc["category"],
            "top_imagenet_label": top["label"],
            "raw_softmax_score": top["score"],
            "confidence_tier": res["confidence_tier"],
            "is_verified_species": top["is_verified_species"],
            "detection_type": top["detection_type"],
            "scientific_name": top["botanical_info"]["scientific_name"] if top["botanical_info"] else "N/A",
            "latency_ms": res["inference_time_ms"],
            "alternatives": [f"{alt['label']} ({alt['score']:.3f})" for alt in res["alternative_predictions"][:3]]
        }
        results.append(item)
        print(f"[{item['category']}] {item['test_case']} -> {item['top_imagenet_label']} (Score: {item['raw_softmax_score']}, Tier: {item['confidence_tier']}, Verified: {item['is_verified_species']})", flush=True)
        
    print("\n--- Summary JSON ---", flush=True)
    print(json.dumps(results, indent=2), flush=True)
    
    with open("audit_inference_results.json", "w") as f:
        json.dump(results, f, indent=2)
        
    print("\nSaved inference audit to audit_inference_results.json", flush=True)

if __name__ == "__main__":
    run_comprehensive_inference_audit()
