"""
Plant Vision AI Classifier using Open-Weight Vision Transformer (ViT).
License: Apache 2.0
"""
import time
import io
import os
import logging
from typing import List, Dict, Any, Tuple
from PIL import Image
import torch
from transformers import AutoImageProcessor, AutoModelForImageClassification
from .botanical_db import lookup_botanical_info

logger = logging.getLogger("floraquest.ai")

MODEL_ID = os.getenv("MODEL_ID", "google/vit-base-patch16-224")

class PlantClassifierService:
    def __init__(self, model_id: str = MODEL_ID):
        self.model_id = model_id
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.processor = None
        self.model = None
        self.is_loaded = False
        self.init_time_ms = 0.0

    def load_model(self):
        """Loads model weights, sends to device, and performs a warm-up inference."""
        start_t = time.perf_counter()
        logger.info(f"Loading open-weight model '{self.model_id}' on device: {self.device}...")
        
        self.processor = AutoImageProcessor.from_pretrained(self.model_id)
        self.model = AutoModelForImageClassification.from_pretrained(self.model_id)
        self.model.to(self.device)
        self.model.eval()

        # Warm-up inference
        dummy_img = Image.new("RGB", (224, 224), color=(34, 197, 94))
        inputs = self.processor(images=dummy_img, return_tensors="pt").to(self.device)
        with torch.no_grad():
            _ = self.model(**inputs)

        self.init_time_ms = round((time.perf_counter() - start_t) * 1000, 2)
        self.is_loaded = True
        logger.info(f"Model '{self.model_id}' loaded and warmed up in {self.init_time_ms} ms.")

    def get_model_card(self) -> Dict[str, Any]:
        """Returns verified model card details and licensing."""
        return {
            "model_id": self.model_id,
            "architecture": "Vision Transformer (ViT-Base-Patch16-224)",
            "license": "Apache-2.0",
            "weights_source": f"https://huggingface.co/{self.model_id}",
            "device": str(self.device),
            "parameters_count": "86.6M",
            "input_resolution": "224x224 RGB",
            "num_classes": len(self.model.config.id2label) if self.model else 1000,
            "initialization_time_ms": self.init_time_ms,
            "status": "active" if self.is_loaded else "uninitialized"
        }

    def classify_image(self, image_bytes: bytes, top_k: int = 5) -> Dict[str, Any]:
        """
        Executes real image classification inference on input bytes.
        Returns top-K predictions, confidence tier, latency, and botanical facts.
        """
        if not self.is_loaded:
            self.load_model()

        start_t = time.perf_counter()
        
        # Load and convert image
        try:
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        except Exception as e:
            raise ValueError(f"Invalid image format or corrupted file: {str(e)}")

        # Preprocess
        inputs = self.processor(images=image, return_tensors="pt").to(self.device)

        # Forward pass
        with torch.no_grad():
            outputs = self.model(**inputs)
            logits = outputs.logits
            probabilities = torch.nn.functional.softmax(logits, dim=-1)[0]

        # Extract top-K
        top_probs, top_indices = torch.topk(probabilities, top_k)
        
        predictions: List[Dict[str, Any]] = []
        for prob, idx in zip(top_probs, top_indices):
            label = self.model.config.id2label[idx.item()]
            score = round(prob.item(), 4)
            botanical_info = lookup_botanical_info(label)
            predictions.append({
                "label": label,
                "score": score,
                "botanical_info": botanical_info
            })

        inference_time_ms = round((time.perf_counter() - start_t) * 1000, 2)
        top_prediction = predictions[0]
        top_score = top_prediction["score"]

        # Honest confidence tier calibration
        if top_score >= 0.70:
            confidence_tier = "high"
        elif top_score >= 0.35:
            confidence_tier = "moderate"
        else:
            confidence_tier = "uncertain"

        return {
            "model_name": self.model_id,
            "inference_time_ms": inference_time_ms,
            "confidence_tier": confidence_tier,
            "top_prediction": top_prediction,
            "alternative_predictions": predictions[1:],
            "device": str(self.device)
        }

# Global singleton instance
classifier_service = PlantClassifierService()
