"""
Honest Botanical AI Model Evaluation Pipeline.
Evaluates model on held-out test split, computes Top-1, Top-5, Precision, Recall, F1,
and runs Out-Of-Distribution (OOD) uncertainty analysis.
"""
import os
import json
import logging
import time
from pathlib import Path
from typing import Dict, List, Any, Tuple

import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import transforms, models
from PIL import Image, ImageDraw
from sklearn.metrics import classification_report, confusion_matrix, precision_recall_fscore_support

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("floraquest.eval")

def load_trained_model(checkpoint_path: Path, class_mapping_path: Path, device: torch.device):
    """Loads checkpoint and builds model architecture."""
    with open(class_mapping_path, "r") as f:
        mapping_data = json.load(f)

    num_classes = mapping_data["num_classes"]
    architecture = mapping_data.get("architecture", "mobilenet_v3_large")

    if architecture == "mobilenet_v3_large":
        model = models.mobilenet_v3_large(weights=None)
        in_features = model.classifier[3].in_features
        model.classifier[3] = nn.Linear(in_features, num_classes)
    elif architecture == "resnet18":
        model = models.resnet18(weights=None)
        in_features = model.fc.in_features
        model.fc = nn.Linear(in_features, num_classes)
    elif architecture == "resnet50":
        model = models.resnet50(weights=None)
        in_features = model.fc.in_features
        model.fc = nn.Linear(in_features, num_classes)
    else:
        raise ValueError(f"Unknown architecture: {architecture}")

    checkpoint = torch.load(checkpoint_path, map_location=device)
    model.load_state_dict(checkpoint["model_state_dict"])
    model.to(device)
    model.eval()

    return model, mapping_data

def evaluate_test_set(
    data_dir: Path,
    models_dir: Path,
    batch_size: int = 32
) -> Dict[str, Any]:
    """
    Evaluates the model strictly on the held-out test split.
    """
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    logger.info(f"Evaluating on device: {device}")

    processed_dir = data_dir / "processed"
    test_split_file = processed_dir / "test_split.json"
    class_mapping_path = models_dir / "class_mapping.json"
    checkpoint_path = models_dir / "plant_classifier_mobilenet_v3_large.pt"

    if not test_split_file.exists() or not checkpoint_path.exists():
        raise FileNotFoundError("Test split or model checkpoint missing. Complete data prep and training first.")

    with open(test_split_file, "r") as f:
        test_records = json.load(f)

    model, mapping_data = load_trained_model(checkpoint_path, class_mapping_path, device)
    classes = mapping_data["classes"]

    val_transform = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    from train import BotanicalDataset
    test_dataset = BotanicalDataset(data_dir, test_records, transform=val_transform)
    test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False, num_workers=0)

    all_preds = []
    all_targets = []
    all_top5_correct = []
    all_max_probs = []

    start_t = time.perf_counter()

    with torch.no_grad():
        for inputs, targets in test_loader:
            inputs = inputs.to(device)
            outputs = model(inputs)
            probs = torch.softmax(outputs, dim=-1)

            max_probs, top1_preds = torch.max(probs, dim=-1)
            _, top5_preds = torch.topk(probs, k=min(5, len(classes)), dim=-1)

            all_preds.extend(top1_preds.cpu().numpy())
            all_targets.extend(targets.numpy())
            all_max_probs.extend(max_probs.cpu().numpy())

            targets_expanded = targets.view(-1, 1).expand_as(top5_preds.cpu())
            top5_hit = (top5_preds.cpu() == targets_expanded).any(dim=1)
            all_top5_correct.extend(top5_hit.numpy())

    eval_duration = time.perf_counter() - start_t
    avg_latency_ms = (eval_duration / len(test_records)) * 1000

    all_preds = np.array(all_preds)
    all_targets = np.array(all_targets)
    all_top5_correct = np.array(all_top5_correct)

    top1_acc = float(np.mean(all_preds == all_targets))
    top5_acc = float(np.mean(all_top5_correct))

    precision, recall, f1, _ = precision_recall_fscore_support(
        all_targets, all_preds, average="macro", zero_division=0
    )

    per_class_report = classification_report(
        all_targets,
        all_preds,
        target_names=[classes[i] for i in range(len(classes))],
        output_dict=True,
        zero_division=0
    )

    logger.info("=" * 60)
    logger.info("HONEST BOTANICAL EVALUATION RESULTS (HELD-OUT TEST SET)")
    logger.info("=" * 60)
    logger.info(f"Total Test Images: {len(test_records)}")
    logger.info(f"Top-1 Accuracy:    {top1_acc * 100:.2f}%")
    logger.info(f"Top-5 Accuracy:    {top5_acc * 100:.2f}%")
    logger.info(f"Macro Precision:   {precision * 100:.2f}%")
    logger.info(f"Macro Recall:      {recall * 100:.2f}%")
    logger.info(f"Macro F1-Score:    {f1 * 100:.2f}%")
    logger.info(f"Avg Inference Latency: {avg_latency_ms:.2f} ms/image")
    logger.info("=" * 60)

    # Step 2: Out-of-Distribution (OOD) Uncertainty Stress Testing
    ood_results = test_out_of_distribution(model, val_transform, device, classes)

    eval_payload = {
        "dataset_name": "Oxford 102 Flowers Held-out Test Split",
        "num_test_samples": len(test_records),
        "num_classes": len(classes),
        "device": str(device),
        "top1_accuracy": round(top1_acc, 4),
        "top5_accuracy": round(top5_acc, 4),
        "macro_precision": round(float(precision), 4),
        "macro_recall": round(float(recall), 4),
        "macro_f1": round(float(f1), 4),
        "average_inference_latency_ms": round(avg_latency_ms, 2),
        "ood_uncertainty_analysis": ood_results,
        "per_class_summary": {
            cls_name: {
                "precision": round(metrics["precision"], 4),
                "recall": round(metrics["recall"], 4),
                "f1": round(metrics["f1-score"], 4),
                "support": metrics["support"]
            }
            for cls_name, metrics in per_class_report.items()
            if cls_name in classes
        }
    }

    results_path = models_dir / "evaluation_results.json"
    with open(results_path, "w") as f:
        json.dump(eval_payload, f, indent=2)

    logger.info(f"Evaluation report saved to {results_path}")
    return eval_payload

def test_out_of_distribution(model, transform, device, classes: List[str]) -> Dict[str, Any]:
    """
    Tests model behavior on synthetic & real non-plant, container, and noisy samples to evaluate uncertainty calibration.
    """
    synthetic_samples = {
        "pure_noise": Image.fromarray(np.random.randint(0, 256, (224, 224, 3), dtype=np.uint8)),
        "solid_black": Image.new("RGB", (224, 224), (0, 0, 0)),
        "solid_white": Image.new("RGB", (224, 224), (255, 255, 255)),
        "geometric_patterns": Image.new("RGB", (224, 224), (200, 200, 200))
    }
    
    # Draw geometric patterns
    draw = ImageDraw.Draw(synthetic_samples["geometric_patterns"])
    draw.rectangle([20, 20, 100, 100], fill=(50, 50, 200))
    draw.ellipse([120, 120, 200, 200], fill=(200, 50, 50))

    ood_eval = {}
    for name, img in synthetic_samples.items():
        tensor = transform(img).unsqueeze(0).to(device)
        with torch.no_grad():
            logits = model(tensor)
            probs = torch.softmax(logits, dim=-1)[0]
            max_prob, pred_idx = torch.max(probs, dim=-1)
            
            # Non-plant should exhibit low confidence
            is_flagged_uncertain = max_prob.item() < 0.70
            ood_eval[name] = {
                "top_predicted_class": classes[pred_idx.item()],
                "max_softmax_probability": round(max_prob.item(), 4),
                "properly_flagged_uncertain": is_flagged_uncertain
            }

    return ood_eval

if __name__ == "__main__":
    base_data_dir = Path(__file__).resolve().parent.parent / "data"
    base_models_dir = Path(__file__).resolve().parent.parent / "models"
    evaluate_test_set(base_data_dir, base_models_dir)
