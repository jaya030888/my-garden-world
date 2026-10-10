# FloraQuest AI Inference Service (Python + FastAPI)

Dedicated open-weight Vision Transformer microservice for botanical plant classification.

---

## 🔬 Model Details
- **Architecture:** Vision Transformer (ViT-Base-Patch16-224)
- **Model ID:** `google/vit-base-patch16-224`
- **License:** **Apache License 2.0**
- **Parameters:** ~86.6 Million
- **Input Resolution:** 224×224 RGB
- **Classes:** 1,000 ImageNet synset categories with specialized botanical knowledge enrichment

---

## 🚀 Running Locally

```bash
cd ai-service

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server (Port 8000)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive OpenAPI Swagger UI: `http://localhost:8000/docs`

---

## 🧪 Testing

```bash
pytest tests/ -v
```
