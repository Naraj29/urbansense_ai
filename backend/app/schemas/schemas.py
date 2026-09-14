from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# --- Auth Schemas ---
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_name: str
    user_role: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Camera & Bus Schemas ---
class CameraResponse(BaseModel):
    id: int
    camera_type: str
    status: str
    stream_url: Optional[str] = None

    class Config:
        from_attributes = True

class BusResponse(BaseModel):
    id: int
    bus_number: str
    route: str
    status: str
    latitude: float
    longitude: float
    last_seen: datetime
    camera_count: int
    network_status: str

    class Config:
        from_attributes = True

class BusDetailResponse(BusResponse):
    cameras: List[CameraResponse] = []

# --- Event & Incident Schemas ---
class DetectionEventCreate(BaseModel):
    bus_id: int
    camera_id: Optional[int] = None
    event_type: str
    severity: str = "Medium"
    latitude: float
    longitude: float
    confidence: float
    description: Optional[str] = None
    evidence_url: Optional[str] = None

class FeedbackSchema(BaseModel):
    feedback: str # "Correct" or "Incorrect"

class AuthorityActionCreate(BaseModel):
    assigned_department: str
    assigned_to: Optional[str] = "Field Inspector"
    action: str = "Investigation"
    remarks: Optional[str] = None
    status: str = "Assigned"

class AuthorityActionResponse(BaseModel):
    id: int
    event_id: int
    assigned_department: str
    assigned_to: Optional[str] = None
    action: str
    status: str
    remarks: Optional[str] = None
    created_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class IncidentResponse(BaseModel):
    id: int
    event_id: int
    vehicle_number: Optional[str] = None
    vehicle_number_confidence: Optional[float] = None
    incident_type: str
    evidence_url: Optional[str] = None
    status: str

    class Config:
        from_attributes = True

class DetectionEventResponse(BaseModel):
    id: int
    bus_id: int
    camera_id: Optional[int] = None
    event_type: str
    severity: str
    latitude: float
    longitude: float
    confidence: float
    timestamp: datetime
    evidence_url: Optional[str] = None
    status: str
    description: Optional[str] = None
    feedback: Optional[str] = None
    bus_number: Optional[str] = None
    route: Optional[str] = None
    incident: Optional[IncidentResponse] = None
    authority_actions: List[AuthorityActionResponse] = []

    class Config:
        from_attributes = True

# --- Edge Simulator Schemas ---
class EdgeEventBatch(BaseModel):
    bus_id: int
    events: List[DetectionEventCreate]

class EdgeStatusResponse(BaseModel):
    bus_id: int
    bus_number: str
    network_status: str
    fps: float
    camera_status: str
    pending_queue_count: int
    events_transmitted: int
    last_gps: dict

# --- System Health Schema ---
class SystemHealthResponse(BaseModel):
    api_server: str
    database: str
    gis_service: str
    ai_service: str
    websocket: str
    active_buses: str
    message_queue: str
    storage: str
    events_per_minute: float
    average_latency_ms: float
    pending_edge_events: int
