"""
Plant Vision Model Training and Fine-Tuning Pipeline.
Trains an open-weight vision model (e.g. MobileNetV3-Large or ResNet) on verified botanical datasets.
Tracks metrics, saves checkpoints, versions label mappings, and selects models via validation loss.
"""
import os
import time
import json
import random
import logging
from pathlib import Path
from typing import Dict, List, Tuple, Any

import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms, models
from PIL import Image

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("floraquest.train")

def set_seed(seed: int = 42):
    """Sets random seeds for full reproducibility."""
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False

class BotanicalDataset(Dataset):
    """PyTorch Dataset for botanical image classification."""
    def __init__(self, data_root: Path, split_records: List[Dict[str, Any]], transform=None):
        self.data_root = data_root
        self.records = split_records
        self.transform = transform

    def __len__(self):
        return len(self.records)

    def __getitem__(self, idx):
        item = self.records[idx]
        img_path = self.data_root / item["relative_path"]
        image = Image.open(img_path).convert("RGB")
        label = item["class_id"]

        if self.transform:
            image = self.transform(image)

        return image, label

def get_transforms():
    """Returns train and validation transforms with standard data augmentation."""
    train_transform = transforms.Compose([
        transforms.RandomResizedCrop(224, scale=(0.8, 1.0)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(15),
        transforms.ColorJitter(brightness=0.15, contrast=0.15, saturation=0.15),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    val_transform = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    return train_transform, val_transform

def train_model(
    data_dir: Path,
    output_dir: Path,
    architecture: str = "mobilenet_v3_large",
    epochs: int = 15,
    batch_size: int = 32,
    lr: float = 1e-3,
    weight_decay: float = 1e-4,
    device_name: str = "auto"
) -> Dict[str, Any]:
    """
    Fine-tunes a vision backbone on the botanical dataset.
    Saves best model weights and class mapping.
    """
    set_seed(42)
    output_dir.mkdir(parents=True, exist_ok=True)
    processed_dir = data_dir / "processed"

    # Verify prepared splits exist
    train_split_file = processed_dir / "train_split.json"
    val_split_file = processed_dir / "val_split.json"
    manifest_file = processed_dir / "dataset_manifest.json"

    if not train_split_file.exists() or not manifest_file.exists():
        raise FileNotFoundError(f"Missing prepared dataset in {processed_dir}. Run data_prep.py first.")

    with open(manifest_file, "r") as f:
        manifest = json.load(f)
    with open(train_split_file, "r") as f:
        train_records = json.load(f)
    with open(val_split_file, "r") as f:
        val_records = json.load(f)

    classes = manifest["classes"]
    num_classes = len(classes)
    logger.info(f"Loaded dataset: {len(train_records)} train, {len(val_records)} val samples across {num_classes} classes.")

    # Device selection
    if device_name == "auto":
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    else:
        device = torch.device(device_name)
    logger.info(f"Training on device: {device}")

    # Transforms & Loaders
    train_tf, val_tf = get_transforms()
    train_dataset = BotanicalDataset(data_dir, train_records, transform=train_tf)
    val_dataset = BotanicalDataset(data_dir, val_records, transform=val_tf)

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=0)

    # Initialize model
    if architecture == "mobilenet_v3_large":
        model = models.mobilenet_v3_large(weights=models.MobileNet_V3_Large_Weights.DEFAULT)
        in_features = model.classifier[3].in_features
        model.classifier[3] = nn.Linear(in_features, num_classes)
    elif architecture == "resnet18":
        model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
        in_features = model.fc.in_features
        model.fc = nn.Linear(in_features, num_classes)
    elif architecture == "resnet50":
        model = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)
        in_features = model.fc.in_features
        model.fc = nn.Linear(in_features, num_classes)
    else:
        raise ValueError(f"Unsupported architecture: {architecture}")

    model.to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(model.parameters(), lr=lr, weight_decay=weight_decay)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs, eta_min=1e-6)

    best_val_acc = 0.0
    best_val_loss = float("inf")
    history = []

    best_model_path = output_dir / f"plant_classifier_{architecture}.pt"
    class_mapping_path = output_dir / "class_mapping.json"

    # Save class mapping
    class_mapping = {str(i): name for i, name in enumerate(classes)}
    with open(class_mapping_path, "w") as f:
        json.dump({
            "num_classes": num_classes,
            "architecture": architecture,
            "classes": classes,
            "id2label": class_mapping,
            "label2id": {name: i for i, name in enumerate(classes)}
        }, f, indent=2)

    logger.info(f"Starting training for {epochs} epochs...")
    start_time = time.perf_counter()

    for epoch in range(1, epochs + 1):
        epoch_start = time.perf_counter()
        
        # Training Phase
        model.train()
        train_loss = 0.0
        train_correct = 0
        train_total = 0

        for inputs, labels in train_loader:
            inputs, labels = inputs.to(device), labels.to(device)
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            train_loss += loss.item() * inputs.size(0)
            _, preds = torch.max(outputs, 1)
            train_correct += torch.sum(preds == labels.data).item()
            train_total += inputs.size(0)

        scheduler.step()

        epoch_train_loss = train_loss / train_total
        epoch_train_acc = train_correct / train_total

        # Validation Phase
        model.eval()
        val_loss = 0.0
        val_correct = 0
        val_total = 0

        with torch.no_grad():
            for inputs, labels in val_loader:
                inputs, labels = inputs.to(device), labels.to(device)
                outputs = model(inputs)
                loss = criterion(outputs, labels)

                val_loss += loss.item() * inputs.size(0)
                _, preds = torch.max(outputs, 1)
                val_correct += torch.sum(preds == labels.data).item()
                val_total += inputs.size(0)

        epoch_val_loss = val_loss / val_total
        epoch_val_acc = val_correct / val_total
        epoch_duration = time.perf_counter() - epoch_start

        epoch_record = {
            "epoch": epoch,
            "train_loss": round(epoch_train_loss, 4),
            "train_acc": round(epoch_train_acc, 4),
            "val_loss": round(epoch_val_loss, 4),
            "val_acc": round(epoch_val_acc, 4),
            "lr": round(scheduler.get_last_lr()[0], 6),
            "duration_s": round(epoch_duration, 2)
        }
        history.append(epoch_record)

        logger.info(
            f"Epoch {epoch:02d}/{epochs:02d} | "
            f"Train Loss: {epoch_train_loss:.4f} Acc: {epoch_train_acc:.4f} | "
            f"Val Loss: {epoch_val_loss:.4f} Acc: {epoch_val_acc:.4f} | "
            f"Time: {epoch_duration:.1f}s"
        )

        # Save best model based on validation accuracy & loss
        if epoch_val_acc > best_val_acc or (epoch_val_acc == best_val_acc and epoch_val_loss < best_val_loss):
            best_val_acc = epoch_val_acc
            best_val_loss = epoch_val_loss
            torch.save({
                "epoch": epoch,
                "model_state_dict": model.state_dict(),
                "optimizer_state_dict": optimizer.state_dict(),
                "val_acc": epoch_val_acc,
                "val_loss": epoch_val_loss,
                "architecture": architecture,
                "num_classes": num_classes,
            }, best_model_path)
            logger.info(f"==> Checkpoint saved: Best Val Acc = {epoch_val_acc:.4f} at epoch {epoch}")

    total_training_time = round(time.perf_counter() - start_time, 2)
    logger.info(f"Training completed in {total_training_time}s. Best Val Acc: {best_val_acc:.4f}")

    # Save training summary
    summary = {
        "architecture": architecture,
        "epochs": epochs,
        "best_val_acc": round(best_val_acc, 4),
        "best_val_loss": round(best_val_loss, 4),
        "total_training_time_s": total_training_time,
        "checkpoint_file": str(best_model_path.name),
        "class_mapping_file": str(class_mapping_path.name),
        "history": history
    }

    with open(output_dir / "training_summary.json", "w") as f:
        json.dump(summary, f, indent=2)

    return summary

if __name__ == "__main__":
    base_data_dir = Path(__file__).resolve().parent.parent / "data"
    base_models_dir = Path(__file__).resolve().parent.parent / "models"
    train_model(base_data_dir, base_models_dir, architecture="mobilenet_v3_large", epochs=10)
