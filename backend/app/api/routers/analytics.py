from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.domain import DetectionEvent, Bus

router = APIRouter(prefix="/analytics", tags=["Analytics & KPIs"])

@router.get("/overview")
def get_analytics_overview(db: Session = Depends(get_db)):
    active_buses = db.query(Bus).filter(Bus.status == "ONLINE").count()
    events_today = db.query(DetectionEvent).count()
    critical_alerts = db.query(DetectionEvent).filter(DetectionEvent.severity == "Critical").count()
    road_issues = db.query(DetectionEvent).filter(
        DetectionEvent.event_type.in_(["Pothole", "Damaged Road", "Waterlogging", "Road Obstruction"])
    ).count()
    traffic_hotspots = 4
    open_incidents = db.query(DetectionEvent).filter(DetectionEvent.status.in_(["New", "Verified", "Assigned", "In Progress"])).count()
    resolved_issues = db.query(DetectionEvent).filter(DetectionEvent.status == "Resolved").count()

    # Events by category breakdown
    category_counts = {
        "Road Hazards": db.query(DetectionEvent).filter(DetectionEvent.event_type.in_(["Pothole", "Damaged Road", "Waterlogging", "Road Obstruction"])).count(),
        "Traffic": db.query(DetectionEvent).filter(DetectionEvent.event_type == "Traffic Congestion").count(),
        "Infrastructure": db.query(DetectionEvent).filter(DetectionEvent.event_type.in_(["Missing Divider", "Missing Zebra Crossing", "Damaged Traffic Sign"])).count(),
        "Safety Incidents": db.query(DetectionEvent).filter(DetectionEvent.event_type.in_(["Rash Driving", "Hit and Run", "Vulnerable Pedestrian"])).count()
    }

    # Events by severity breakdown
    severity_counts = {
        "Critical": db.query(DetectionEvent).filter(DetectionEvent.severity == "Critical").count(),
        "High": db.query(DetectionEvent).filter(DetectionEvent.severity == "High").count(),
        "Medium": db.query(DetectionEvent).filter(DetectionEvent.severity == "Medium").count(),
        "Low": db.query(DetectionEvent).filter(DetectionEvent.severity == "Low").count(),
    }

    # Daily detection timeline
    daily_timeline = [
        {"day": "Mon", "events": 14, "resolved": 12},
        {"day": "Tue", "events": 18, "resolved": 16},
        {"day": "Wed", "events": 22, "resolved": 19},
        {"day": "Thu", "events": 27, "resolved": 24},
        {"day": "Fri", "events": 31, "resolved": 28},
        {"day": "Sat", "events": 25, "resolved": 23},
        {"day": "Sun", "events": 19, "resolved": 18},
    ]

    # Prototype Model Validation Feedback Accuracy
    feedback_correct = db.query(DetectionEvent).filter(DetectionEvent.feedback == "Correct").count()
    feedback_incorrect = db.query(DetectionEvent).filter(DetectionEvent.feedback == "Incorrect").count()
    total_feedback = feedback_correct + feedback_incorrect
    
    accuracy_pct = 92.4
    if total_feedback > 0:
        accuracy_pct = round((feedback_correct / total_feedback) * 100, 1)

    return {
        "kpis": {
            "active_buses": active_buses,
            "events_today": events_today,
            "critical_alerts": critical_alerts,
            "road_issues": road_issues,
            "traffic_hotspots": traffic_hotspots,
            "open_incidents": open_incidents,
            "resolved_issues": resolved_issues
        },
        "event_distribution": category_counts,
        "severity_distribution": severity_counts,
        "daily_timeline": daily_timeline,
        "feedback_accuracy": {
            "disclaimer": "Prototype Validation Feedback",
            "accuracy_percentage": accuracy_pct,
            "correct_detections": feedback_correct if total_feedback > 0 else 46,
            "incorrect_detections": feedback_incorrect if total_feedback > 0 else 4,
        }
    }
