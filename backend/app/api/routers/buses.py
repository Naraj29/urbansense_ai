from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.domain import Bus, DetectionEvent
from app.schemas.schemas import BusResponse, BusDetailResponse, DetectionEventResponse

router = APIRouter(prefix="/buses", tags=["Bus Fleet"])

@router.get("", response_model=List[BusResponse])
def get_all_buses(db: Session = Depends(get_db)):
    buses = db.query(Bus).all()
    return buses

@router.get("/{bus_id}", response_model=BusDetailResponse)
def get_bus_by_id(bus_id: int, db: Session = Depends(get_db)):
    bus = db.query(Bus).filter(Bus.id == bus_id).first()
    if not bus:
        raise HTTPException(status_code=404, detail="Bus not found")
    return bus

@router.get("/{bus_id}/events", response_model=List[DetectionEventResponse])
def get_bus_events(bus_id: int, db: Session = Depends(get_db)):
    events = db.query(DetectionEvent).filter(DetectionEvent.bus_id == bus_id).order_by(DetectionEvent.timestamp.desc()).all()
    result = []
    for ev in events:
        ev_dict = DetectionEventResponse.model_validate(ev)
        ev_dict.bus_number = ev.bus.bus_number if ev.bus else None
        ev_dict.route = ev.bus.route if ev.bus else None
        result.append(ev_dict)
    return result
