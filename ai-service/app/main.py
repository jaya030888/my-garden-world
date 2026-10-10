"""
FastAPI Plant AI Inference Service for My Garden World.
"""
import base64
import logging
from contextlib import asynccontextmanager
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .classifier import classifier_service

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("floraquest.api")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Eagerly load AI model on server startup."""
    logger.info("Initializing AI Model Inference Service...")
    try:
        classifier_service.load_model()
    except Exception as e:
        logger.error(f"Failed to load AI model during startup: {e}")
    yield
    logger.info("Shutting down AI Model Inference Service.")

app = FastAPI(
    title="FloraQuest Plant AI Inference Service",
    description="Dedicated open-weight Vision Transformer API for botanical plant identification.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Base64ClassifyRequest(BaseModel):
    image_base64: str = Field(..., description="Base64-encoded image string (with or without data URI prefix)")
    top_k: int = Field(5, ge=1, le=10, description="Number of top predictions to return")

class BotanicalInfoResponse(BaseModel):
    species_name: str
    scientific_name: str
    family: str
    common_names: List[str]
    description: str
    native_region: str
    sunlight: str
    watering: str
    soil: str
    humidity: str
    toxicity: str
    pet_safe: bool
    propagation: str
    ecological_fact: str
    difficulty: str

class ClassificationItem(BaseModel):
    label: str
    score: float
    botanical_info: Optional[BotanicalInfoResponse] = None

class ClassificationResponse(BaseModel):
    success: bool = True
    model_name: str
    inference_time_ms: float
    confidence_tier: str
    top_prediction: ClassificationItem
    alternative_predictions: List[ClassificationItem]
    device: str

@app.get("/")
def root():
    return {
        "service": "FloraQuest Plant AI Inference Service",
        "status": "operational",
        "model": classifier_service.model_id,
        "docs_url": "/docs"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy" if classifier_service.is_loaded else "initializing",
        "model_loaded": classifier_service.is_loaded,
        "model_id": classifier_service.model_id,
        "device": str(classifier_service.device),
        "init_time_ms": classifier_service.init_time_ms
    }

@app.get("/model-card")
def get_model_card():
    return classifier_service.get_model_card()

@app.post("/classify", response_model=ClassificationResponse)
async def classify_image_upload(
    file: Optional[UploadFile] = File(None),
    top_k: int = 5
):
    """Classify an uploaded image file (multipart/form-data)."""
    if not file:
        raise HTTPException(status_code=400, detail="No image file provided.")

    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        result = classifier_service.classify_image(contents, top_k=top_k)
        return {
            "success": True,
            **result
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Classification error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Inference execution failed: {str(e)}")

@app.post("/classify/base64", response_model=ClassificationResponse)
async def classify_image_base64(payload: Base64ClassifyRequest):
    """Classify a base64-encoded image string."""
    raw_b64 = payload.image_base64
    if "," in raw_b64:
        raw_b64 = raw_b64.split(",", 1)[1]

    try:
        image_bytes = base64.b64decode(raw_b64)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid base64 payload: {str(e)}")

    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="Decoded image payload is empty.")

    try:
        result = classifier_service.classify_image(image_bytes, top_k=payload.top_k)
        return {
            "success": True,
            **result
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Classification error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Inference execution failed: {str(e)}")
