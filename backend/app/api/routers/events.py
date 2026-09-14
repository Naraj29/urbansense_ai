import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.domain import DetectionEvent, Bus, AuthorityAction
from app.schemas.schemas import (
    DetectionEventResponse, 
    DetectionEventCreate, 
    AuthorityActionCreate, 
    FeedbackSchema
)

router = APIRouter(prefix="/events", tags=["Detection Events"])

@router.get("", response_model=List[DetectionEventResponse])
def get_events(
    event_type: Optional[str] = None,
    severity: Optional[str] = None,
    status: Optional[str] = None,
    bus_id: Optional[int] = None,
    limit: int = Query(default=100, le=500),
    db: Session = Depends(get_db)
):
    query = db.query(DetectionEvent)
    if event_type:
        query = query.filter(DetectionEvent.event_type == event_type)
    if severity:
        query = query.filter(DetectionEvent.severity == severity)
    if status:
        query = query.filter(DetectionEvent.status == status)
    if bus_id:
        query = query.filter(DetectionEvent.bus_id == bus_id)

    events = query.order_by(DetectionEvent.timestamp.desc()).limit(limit).all()
    
    result = []
    for ev in events:
        ev_dict = DetectionEventResponse.model_validate(ev)
        ev_dict.bus_number = ev.bus.bus_number if ev.bus else None
        ev_dict.route = ev.bus.route if ev.bus else None
        result.append(ev_dict)
    return result

@router.get("/{event_id}", response_model=DetectionEventResponse)
def get_event_by_id(event_id: int, db: Session = Depends(get_db)):
    event = db.query(DetectionEvent).filter(DetectionEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    ev_dict = DetectionEventResponse.model_validate(event)
    ev_dict.bus_number = event.bus.bus_number if event.bus else None
    ev_dict.route = event.bus.route if event.bus else None
    return ev_dict

@router.post("", response_model=DetectionEventResponse)
def create_event(payload: DetectionEventCreate, db: Session = Depends(get_db)):
    event = DetectionEvent(
        bus_id=payload.bus_id,
        camera_id=payload.camera_id or 1,
        event_type=payload.event_type,
        severity=payload.severity,
        latitude=payload.latitude,
        longitude=payload.longitude,
        confidence=payload.confidence,
        description=payload.description or f"{payload.event_type} detected.",
        evidence_url=payload.evidence_url or f"/static/evidence/sample_{payload.event_type.lower().replace(' ', '_')}.jpg",
        timestamp=datetime.datetime.utcnow(),
        status="New"
    )
    db.add(event)
    db.commit()
    db.refresh(event)

    # Create initial action record
    action = AuthorityAction(
        event_id=event.id,
        assigned_department="Road Maintenance" if "Road" in payload.event_type or "Pothole" in payload.event_type else "Traffic Authority",
        assigned_to="System Triage",
        action="Created & Queued",
        status="New",
        remarks="Event created from API ingestion",
        created_at=datetime.datetime.utcnow()
    )
    db.add(action)
    db.commit()

    ev_dict = DetectionEventResponse.model_validate(event)
    ev_dict.bus_number = event.bus.bus_number if event.bus else None
    ev_dict.route = event.bus.route if event.bus else None
    return ev_dict

@router.post("/{event_id}/verify", response_model=DetectionEventResponse)
def verify_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(DetectionEvent).filter(DetectionEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    event.status = "Verified"
    action = AuthorityAction(
        event_id=event.id,
        assigned_department="Command Center",
        assigned_to="Verification Officer",
        action="Detection Verified",
        status="Verified",
        remarks="Visual evidence inspected and verified by authority.",
        created_at=datetime.datetime.utcnow()
    )
    db.add(action)
    db.commit()
    db.refresh(event)

    ev_dict = DetectionEventResponse.model_validate(event)
    ev_dict.bus_number = event.bus.bus_number if event.bus else None
    ev_dict.route = event.bus.route if event.bus else None
    return ev_dict

@router.post("/{event_id}/assign", response_model=DetectionEventResponse)
def assign_event(event_id: int, payload: AuthorityActionCreate, db: Session = Depends(get_db)):
    event = db.query(DetectionEvent).filter(DetectionEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    event.status = "Assigned"
    action = AuthorityAction(
        event_id=event.id,
        assigned_department=payload.assigned_department,
        assigned_to=payload.assigned_to or "Field Unit",
        action=payload.action or "Dispatched for Action",
        status="Assigned",
        remarks=payload.remarks or f"Assigned to {payload.assigned_department}",
        created_at=datetime.datetime.utcnow()
    )
    db.add(action)
    db.commit()
    db.refresh(event)

    ev_dict = DetectionEventResponse.model_validate(event)
    ev_dict.bus_number = event.bus.bus_number if event.bus else None
    ev_dict.route = event.bus.route if event.bus else None
    return ev_dict

@router.post("/{event_id}/resolve", response_model=DetectionEventResponse)
def resolve_event(event_id: int, remarks: Optional[str] = "Issue successfully remediated.", db: Session = Depends(get_db)):
    event = db.query(DetectionEvent).filter(DetectionEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    event.status = "Resolved"
    action = AuthorityAction(
        event_id=event.id,
        assigned_department="Field Operations",
        assigned_to="Resolution Officer",
        action="Remediation Completed",
        status="Resolved",
        remarks=remarks,
        created_at=datetime.datetime.utcnow(),
        resolved_at=datetime.datetime.utcnow()
    )
    db.add(action)
    db.commit()
    db.refresh(event)

    ev_dict = DetectionEventResponse.model_validate(event)
    ev_dict.bus_number = event.bus.bus_number if event.bus else None
    ev_dict.route = event.bus.route if event.bus else None
    return ev_dict

@router.post("/{event_id}/feedback", response_model=DetectionEventResponse)
def submit_feedback(event_id: int, payload: FeedbackSchema, db: Session = Depends(get_db)):
    event = db.query(DetectionEvent).filter(DetectionEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    event.feedback = payload.feedback
    db.commit()
    db.refresh(event)

    ev_dict = DetectionEventResponse.model_validate(event)
    ev_dict.bus_number = event.bus.bus_number if event.bus else None
    ev_dict.route = event.bus.route if event.bus else None
    return ev_dict
