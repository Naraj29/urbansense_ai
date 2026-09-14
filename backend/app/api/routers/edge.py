from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from app.core.database import get_db
from app.models.domain import Bus, DetectionEvent
from app.schemas.schemas import EdgeEventBatch, DetectionEventCreate, DetectionEventResponse
from app.simulation.engine import simulation_engine

router = APIRouter(prefix="/edge", tags=["Edge AI Simulator"])

@router.get("/status")
def get_edge_console_status(db: Session = Depends(get_db)):
    buses = db.query(Bus).all()
    result = []
    
    for b in buses:
        pending = len(simulation_engine.pending_edge_queues.get(b.id, []))
        result.append({
            "bus_id": b.id,
            "bus_number": b.bus_number,
            "route": b.route,
            "status": b.status,
            "network_status": b.network_status,
            "camera_count": b.camera_count,
            "fps": 30.2 if b.status == "ONLINE" else 0.0,
            "inference_status": "Processing YOLOv8-Custom" if b.status == "ONLINE" else "Idle",
            "pending_queue_count": pending,
            "last_gps": {"lat": b.latitude, "lng": b.longitude}
        })

    return {
        "is_simulation_active": simulation_engine.is_running,
        "total_transmitted_events": simulation_engine.events_transmitted_count,
        "buses": result
    }

@router.get("/{bus_id}/status")
def get_single_bus_edge_status(bus_id: int, db: Session = Depends(get_db)):
    bus = db.query(Bus).filter(Bus.id == bus_id).first()
    if not bus:
        raise HTTPException(status_code=404, detail="Bus not found")
    
    pending = len(simulation_engine.pending_edge_queues.get(bus.id, []))
    events_count = db.query(DetectionEvent).filter(DetectionEvent.bus_id == bus_id).count()

    return {
        "bus_id": bus.id,
        "bus_number": bus.bus_number,
        "route": bus.route,
        "network_status": bus.network_status,
        "status": bus.status,
        "fps": 30.2 if bus.status == "ONLINE" else 0.0,
        "camera_count": bus.camera_count,
        "pending_queue_count": pending,
        "events_transmitted": events_count,
        "current_gps": {"latitude": bus.latitude, "longitude": bus.longitude},
        "last_seen": bus.last_seen
    }

@router.post("/toggle-simulation")
def toggle_simulation():
    simulation_engine.is_running = not simulation_engine.is_running
    return {
        "status": "success",
        "is_running": simulation_engine.is_running,
        "message": f"Simulation {'started' if simulation_engine.is_running else 'paused'}."
    }

@router.post("/trigger-event")
def trigger_demo_event(
    event_type: str = Body(..., embed=True),
    severity: str = Body(default="High", embed=True),
    bus_id: Optional[int] = Body(default=None, embed=True),
    db: Session = Depends(get_db)
):
    """
    Demo trigger control for SIH Presentation judging.
    Instantly fires a geo-referenced edge AI detection event.
    """
    event = simulation_engine.generate_single_event(
        db=db,
        event_type=event_type,
        severity=severity,
        bus_id=bus_id
    )

    if not event:
        return {
            "status": "queued_offline",
            "message": f"Bus is in Offline state. Event queued in local Edge AI buffer."
        }

    return {
        "status": "success",
        "message": f"Event '{event_type}' generated and transmitted via Edge API.",
        "event_id": event.id
    }

@router.post("/set-network")
def set_bus_network_status(
    bus_id: int = Body(..., embed=True),
    network_status: str = Body(..., embed=True), # Online, Weak Network, Offline
    db: Session = Depends(get_db)
):
    bus = db.query(Bus).filter(Bus.id == bus_id).first()
    if not bus:
        raise HTTPException(status_code=404, detail="Bus not found")
    
    old_status = bus.network_status
    bus.network_status = network_status
    db.commit()

    uploaded = 0
    if old_status == "Offline" and network_status in ["Online", "Weak Network"]:
        # Flush pending queue
        uploaded = simulation_engine.flush_edge_queue(db, bus_id)

    return {
        "status": "success",
        "bus_id": bus_id,
        "network_status": network_status,
        "flushed_batch_events": uploaded
    }

@router.post("/batch-upload")
def batch_upload_edge_events(payload: EdgeEventBatch, db: Session = Depends(get_db)):
    """Receives buffered events from Edge device local queue after connectivity restoration."""
    count = 0
    for ev in payload.events:
        simulation_engine.generate_single_event(
            db=db,
            event_type=ev.event_type,
            severity=ev.severity,
            bus_id=payload.bus_id,
            description=ev.description
        )
        count += 1
    
    return {
        "status": "success",
        "bus_id": payload.bus_id,
        "processed_events": count
    }
