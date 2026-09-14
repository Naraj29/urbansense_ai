import os
import uuid
from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.ai.detector import urban_ai_engine
from app.models.domain import DetectionEvent

router = APIRouter(prefix="/ai", tags=["AI Detection Lab"])

@router.post("/inference")
async def run_ai_inference(file: UploadFile = File(...)):
    """
    AI Detection Lab Endpoint.
    Accepts image/video upload, runs object detection & tracking inference,
    returns bounding boxes, confidence score, ANPR results, and annotated evidence frame.
    """
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in [".jpg", ".jpeg", ".png", ".webp", ".mp4"]:
        raise HTTPException(status_code=400, detail="Unsupported file format. Please upload JPG, PNG or MP4.")

    unique_name = f"upload_{uuid.uuid4().hex[:8]}{file_ext}"
    input_path = os.path.join(settings.EVIDENCE_DIR, unique_name)
    output_filename = f"annotated_{unique_name}.jpg"
    output_path = os.path.join(settings.EVIDENCE_DIR, output_filename)

    with open(input_path, "wb") as f:
        content = await file.read()
        f.write(content)

    # Run AI inference module
    result = urban_ai_engine.run_image_inference(input_path, output_path)
    result["annotated_image_url"] = f"/static/evidence/{output_filename}"

    return {
        "status": "success",
        "data": result
    }
