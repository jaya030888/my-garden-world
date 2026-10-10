import io
import base64
import pytest
from PIL import Image
from fastapi.testclient import TestClient
from app.main import app
from app.classifier import classifier_service

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_model():
    """Ensure model is loaded before tests."""
    if not classifier_service.is_loaded:
        classifier_service.load_model()

def create_test_image_bytes(color=(34, 197, 94)) -> bytes:
    """Create in-memory RGB PNG bytes for testing."""
    img = Image.new("RGB", (224, 224), color=color)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["model_loaded"] is True
    assert "google/vit-base-patch16-224" in data["model_id"]

def test_model_card_endpoint():
    response = client.get("/model-card")
    assert response.status_code == 200
    data = response.json()
    assert data["license"] == "Apache-2.0"
    assert data["architecture"] == "Vision Transformer (ViT-Base-Patch16-224)"
    assert data["status"] == "active"

def test_classify_image_upload():
    img_bytes = create_test_image_bytes()
    files = {"file": ("test_plant.png", img_bytes, "image/png")}
    response = client.post("/classify?top_k=3", files=files)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "top_prediction" in data
    assert "alternative_predictions" in data
    assert len(data["alternative_predictions"]) == 2
    assert data["inference_time_ms"] > 0
    assert data["confidence_tier"] in ["high", "moderate", "uncertain"]
    assert "label" in data["top_prediction"]
    assert "score" in data["top_prediction"]

def test_classify_base64_endpoint():
    img_bytes = create_test_image_bytes(color=(234, 179, 8))
    b64_str = f"data:image/png;base64,{base64.b64encode(img_bytes).decode('utf-8')}"
    
    response = client.post("/classify/base64", json={"image_base64": b64_str, "top_k": 3})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "label" in data["top_prediction"]
    assert "score" in data["top_prediction"]

def test_invalid_image_upload_error():
    files = {"file": ("corrupted.txt", b"not-an-image-content", "text/plain")}
    response = client.post("/classify", files=files)
    assert response.status_code == 400
    assert "Invalid image format" in response.json()["detail"]
