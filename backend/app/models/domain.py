import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="Admin") # Admin, Traffic Authority, Municipal Authority, Road Maintenance, Viewer
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Bus(Base):
    __tablename__ = "buses"

    id = Column(Integer, primary_key=True, index=True)
    bus_number = Column(String(50), unique=True, index=True, nullable=False)
    route = Column(String(100), nullable=False)
    status = Column(String(20), default="ONLINE") # ONLINE, OFFLINE, MAINTENANCE
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    last_seen = Column(DateTime, default=datetime.datetime.utcnow)
    camera_count = Column(Integer, default=4)
    network_status = Column(String(20), default="Online") # Online, Weak Network, Offline
    
    cameras = relationship("Camera", back_populates="bus", cascade="all, delete-orphan")
    events = relationship("DetectionEvent", back_populates="bus")

class Camera(Base):
    __tablename__ = "cameras"

    id = Column(Integer, primary_key=True, index=True)
    bus_id = Column(Integer, ForeignKey("buses.id"), nullable=False)
    camera_type = Column(String(20), nullable=False) # Front, Rear, Left, Right, Cabin
    status = Column(String(20), default="Active") # Active, Degraded, Inactive
    stream_url = Column(String(255), nullable=True)

    bus = relationship("Bus", back_populates="cameras")

class DetectionEvent(Base):
    __tablename__ = "detection_events"

    id = Column(Integer, primary_key=True, index=True)
    bus_id = Column(Integer, ForeignKey("buses.id"), nullable=False)
    camera_id = Column(Integer, nullable=True)
    event_type = Column(String(50), nullable=False, index=True) 
    # Pothole, Damaged Road, Waterlogging, Missing Divider, Missing Zebra Crossing, Damaged Traffic Sign, Traffic Congestion, Vulnerable Pedestrian, Rash Driving, Hit and Run, Road Obstruction
    severity = Column(String(20), nullable=False, default="Medium") # Critical, High, Medium, Low
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    confidence = Column(Float, nullable=False) # e.g. 0.94
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    evidence_url = Column(String(255), nullable=True)
    status = Column(String(20), default="New", index=True) # New, Verified, Assigned, In Progress, Resolved, Rejected
    description = Column(Text, nullable=True)
    feedback = Column(String(20), nullable=True) # Correct, Incorrect

    bus = relationship("Bus", back_populates="events")
    incident = relationship("Incident", back_populates="event", uselist=False)
    authority_actions = relationship("AuthorityAction", back_populates="event", cascade="all, delete-orphan")

class VehicleDetection(Base):
    __tablename__ = "vehicle_detections"

    id = Column(Integer, primary_key=True, index=True)
    bus_id = Column(Integer, ForeignKey("buses.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    vehicle_type = Column(String(50), nullable=False) # Car, Bus, Truck, Motorcycle, Bicycle, Pedestrian
    count = Column(Integer, default=1)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("detection_events.id"), nullable=False)
    vehicle_number = Column(String(50), nullable=True)
    vehicle_number_confidence = Column(Float, nullable=True)
    incident_type = Column(String(50), nullable=False) # Hit and Run, Rash Driving, Illegal Parking, Severe Violation
    evidence_url = Column(String(255), nullable=True)
    status = Column(String(20), default="Pending Review")

    event = relationship("DetectionEvent", back_populates="incident")

class AuthorityAction(Base):
    __tablename__ = "authority_actions"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("detection_events.id"), nullable=False)
    assigned_department = Column(String(100), nullable=False) # Road Maintenance, Traffic Authority, Municipal Corporation, Public Safety
    assigned_to = Column(String(100), nullable=True)
    action = Column(String(255), nullable=False)
    status = Column(String(50), nullable=False) # New, Verified, Assigned, In Progress, Resolved
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    event = relationship("DetectionEvent", back_populates="authority_actions")
