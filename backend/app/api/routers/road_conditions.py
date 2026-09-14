from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.domain import DetectionEvent

router = APIRouter(prefix="/road-conditions", tags=["Road Conditions"])

@router.get("")
def get_road_conditions(db: Session = Depends(get_db)):
    # Count events by road defect type
    potholes = db.query(DetectionEvent).filter(DetectionEvent.event_type == "Pothole").count()
    damaged_roads = db.query(DetectionEvent).filter(DetectionEvent.event_type == "Damaged Road").count()
    waterlogging = db.query(DetectionEvent).filter(DetectionEvent.event_type == "Waterlogging").count()
    infra_issues = db.query(DetectionEvent).filter(
        DetectionEvent.event_type.in_(["Missing Divider", "Missing Zebra Crossing", "Damaged Traffic Sign"])
    ).count()

    # Prototype Road Condition Index calculation
    total_defects = potholes + damaged_roads + waterlogging + infra_issues
    
    # Weighted penalty score (0 to 100)
    score_raw = 100 - min(90, (potholes * 3 + damaged_roads * 2.5 + waterlogging * 2 + infra_issues * 1.5))
    rci_score = round(max(10, score_raw), 1)

    rci_rating = "Good"
    if rci_score < 40:
        rci_rating = "Critical"
    elif rci_score < 60:
        rci_rating = "Poor"
    elif rci_score < 80:
        rci_rating = "Moderate"

    # Defect clusters for map visualization
    clusters = [
        {"location": "Naini Bridge Approach Road", "potholes": 12, "waterlogging": 3, "score": 38, "rating": "Critical", "lat": 25.4190, "lng": 81.8620},
        {"location": "Subedarganj Station Corridor", "potholes": 8, "waterlogging": 5, "score": 52, "rating": "Poor", "lat": 25.4430, "lng": 81.7980},
        {"location": "Civil Lines MG Marg Segment", "potholes": 3, "waterlogging": 1, "score": 78, "rating": "Moderate", "lat": 25.4525, "lng": 81.8349},
        {"location": "Phaphamau Highway Link", "potholes": 15, "waterlogging": 8, "score": 28, "rating": "Critical", "lat": 25.4820, "lng": 81.8550},
        {"location": "Katra Market Main Square", "potholes": 4, "waterlogging": 2, "score": 71, "rating": "Moderate", "lat": 25.4600, "lng": 81.8500},
    ]

    return {
        "disclaimer": "Prototype Road Condition Index (Weighted Multi-Factor Defect Assessment)",
        "rci_score": rci_score,
        "rci_rating": rci_rating,
        "metrics": {
            "potholes_detected": potholes,
            "damaged_roads_detected": damaged_roads,
            "waterlogging_zones": waterlogging,
            "infrastructure_deficiencies": infra_issues,
            "total_road_defects": total_defects
        },
        "clusters": clusters
    }
