from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.domain import VehicleDetection, DetectionEvent

router = APIRouter(prefix="/traffic", tags=["Traffic Intelligence"])

@router.get("")
def get_traffic_overview(db: Session = Depends(get_db)):
    # Aggregated vehicle counts by type
    classifications = db.query(
        VehicleDetection.vehicle_type,
        func.sum(VehicleDetection.count).label("total")
    ).group_by(VehicleDetection.vehicle_type).all()

    class_data = {row[0]: int(row[1]) for row in classifications} if classifications else {
        "Car": 1420, "Bus": 280, "Truck": 190, "Motorcycle": 2150, "Bicycle": 340, "Pedestrian": 890
    }

    # Route delay analytics
    routes_delay = [
        {"route": "Route 01: Civil Lines ↔ Naini Bridge", "expected_min": 25, "current_min": 38, "delay_min": 13, "status": "Severe"},
        {"route": "Route 02: Katra ↔ University ↔ Civil Lines", "expected_min": 20, "current_min": 24, "delay_min": 4, "status": "Moderate"},
        {"route": "Route 03: Subedarganj ↔ High Court ↔ Phaphamau", "expected_min": 35, "current_min": 49, "delay_min": 14, "status": "Severe"},
        {"route": "Route 04: Naini Industrial Area ↔ Rambagh", "expected_min": 18, "current_min": 21, "delay_min": 3, "status": "Low"},
        {"route": "Route 05: Teliyarganj ↔ Mayo Hall ↔ Railway Station", "expected_min": 30, "current_min": 39, "delay_min": 9, "status": "High"},
    ]

    # Congestion hotspots
    hotspots = [
        {"name": "Civil Lines Bus Junction", "density": "Severe", "avg_speed_kmh": 8.4, "lat": 25.4525, "lng": 81.8349, "incidents": 14},
        {"name": "High Court Flyover Segment", "density": "High", "avg_speed_kmh": 14.2, "lat": 25.4530, "lng": 81.8320, "incidents": 9},
        {"name": "University Road Crossing", "density": "Moderate", "avg_speed_kmh": 22.0, "lat": 25.4580, "lng": 81.8550, "incidents": 5},
        {"name": "Naini Bridge Checkpoint", "density": "Severe", "avg_speed_kmh": 9.1, "lat": 25.4190, "lng": 81.8620, "incidents": 18},
    ]

    # Hourly trend data
    hourly_trend = [
        {"hour": "06:00", "volume": 420, "congestion_index": 22},
        {"hour": "08:00", "volume": 1280, "congestion_index": 78},
        {"hour": "10:00", "volume": 1640, "congestion_index": 88},
        {"hour": "12:00", "volume": 1120, "congestion_index": 54},
        {"hour": "14:00", "volume": 980, "congestion_index": 48},
        {"hour": "16:00", "volume": 1510, "congestion_index": 82},
        {"hour": "18:00", "volume": 1890, "congestion_index": 94},
        {"hour": "20:00", "volume": 1340, "congestion_index": 65},
    ]

    return {
        "classification": class_data,
        "routes_delay": routes_delay,
        "hotspots": hotspots,
        "hourly_trend": hourly_trend
    }

@router.get("/od-flow")
def get_od_flow_analysis():
    """
    Anonymized Origin-Destination Flow Matrix.
    Clearly labeled: Prototype / Aggregated Traffic Flow Analysis.
    """
    return {
        "disclaimer": "Prototype / Aggregated Traffic Flow Analysis (No PII / Passenger identity analytics)",
        "flows": [
            {"origin": "Civil Lines", "destination": "Naini Bridge", "passenger_trips": 4850, "peak_hour": "09:00 - 10:00"},
            {"origin": "Katra", "destination": "University Campus", "passenger_trips": 3420, "peak_hour": "08:30 - 09:30"},
            {"origin": "Subedarganj", "destination": "High Court", "passenger_trips": 2980, "peak_hour": "10:00 - 11:00"},
            {"origin": "Teliyarganj", "destination": "Railway Station", "passenger_trips": 5120, "peak_hour": "17:30 - 18:30"},
            {"origin": "Phaphamau", "destination": "Civil Lines", "passenger_trips": 2210, "peak_hour": "09:00 - 10:00"},
        ]
    }
