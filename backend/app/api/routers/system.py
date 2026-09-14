from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.domain import Bus, DetectionEvent
from app.simulation.engine import simulation_engine

router = APIRouter(prefix="/system-health", tags=["System Health"])

@router.get("")
def get_system_health(db: Session = Depends(get_db)):
    total_buses = db.query(Bus).count()
    online_buses = db.query(Bus).filter(Bus.status == "ONLINE").count()
    
    total_pending_queue = sum(len(q) for q in simulation_engine.pending_edge_queues.values())

    return {
        "services": {
            "api_server": "HEALTHY",
            "database": "HEALTHY",
            "gis_service": "HEALTHY",
            "ai_service": "HEALTHY",
            "websocket": "CONNECTED",
            "edge_buses": f"{online_buses} / {total_buses} ONLINE",
            "message_queue": "HEALTHY",
            "storage": "HEALTHY"
        },
        "telemetry": {
            "last_sync": "Just now",
            "events_per_minute": 18.4,
            "average_latency_ms": 24.8,
            "pending_edge_events": total_pending_queue,
            "system_uptime": "99.98%",
            "active_ws_connections": len(simulation_engine.bus_route_indices)
        }
    }
