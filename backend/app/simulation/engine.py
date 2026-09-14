import math
import random
import time
import datetime
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.domain import Bus, DetectionEvent, Camera, Incident, AuthorityAction, VehicleDetection
from app.api.ws_manager import ws_manager

# Predefined realistic bus routes with GPS coordinates around Prayagraj, UP
SIMULATED_ROUTES = {
    "Route 01: Civil Lines ↔ Naini Bridge": [
        (25.4525, 81.8349), (25.4480, 81.8390), (25.4390, 81.8450), 
        (25.4280, 81.8550), (25.4190, 81.8620), (25.4120, 81.8700)
    ],
    "Route 02: Katra ↔ University ↔ Civil Lines": [
        (25.4600, 81.8500), (25.4580, 81.8550), (25.4540, 81.8450), 
        (25.4510, 81.8380), (25.4460, 81.8320), (25.4400, 81.8280)
    ],
    "Route 03: Subedarganj ↔ High Court ↔ Phaphamau": [
        (25.4430, 81.7980), (25.4490, 81.8150), (25.4530, 81.8320), 
        (25.4650, 81.8410), (25.4820, 81.8550), (25.5000, 81.8650)
    ],
    "Route 04: Naini Industrial Area ↔ Rambagh": [
        (25.4050, 81.8720), (25.4150, 81.8610), (25.4250, 81.8510), 
        (25.4350, 81.8460), (25.4420, 81.8480), (25.4470, 81.8520)
    ],
    "Route 05: Teliyarganj ↔ Mayo Hall ↔ Railway Station": [
        (25.4850, 81.8600), (25.4720, 81.8520), (25.4610, 81.8430), 
        (25.4510, 81.8340), (25.4440, 81.8310), (25.4400, 81.8260)
    ]
}

class SimulationEngine:
    def __init__(self):
        self.is_running: bool = True
        self.bus_route_indices: Dict[int, int] = {}
        self.pending_edge_queues: Dict[int, List[Dict[str, Any]]] = {}
        self.events_transmitted_count: int = 142

    def update_fleet_positions(self, db: Session):
        """
        Advances buses along their predefined route coordinates in a deterministic, smooth motion.
        Broadcasts updated positions via WebSocket to /ws/fleet.
        """
        if not self.is_running:
            return

        buses = db.query(Bus).filter(Bus.status == "ONLINE").all()
        fleet_updates = []

        for bus in buses:
            waypoints = SIMULATED_ROUTES.get(bus.route)
            if not waypoints:
                waypoints = list(SIMULATED_ROUTES.values())[0]

            idx = self.bus_route_indices.get(bus.id, 0)
            next_idx = (idx + 1) % len(waypoints)
            self.bus_route_indices[bus.id] = next_idx

            curr_lat, curr_lng = waypoints[idx]
            next_lat, next_lng = waypoints[next_idx]

            # Micro perturbation for organic vehicle movement
            jitter_lat = random.uniform(-0.0003, 0.0003)
            jitter_lng = random.uniform(-0.0003, 0.0003)

            bus.latitude = round(next_lat + jitter_lat, 6)
            bus.longitude = round(next_lng + jitter_lng, 6)
            bus.last_seen = datetime.datetime.utcnow()

            fleet_updates.append({
                "id": bus.id,
                "bus_number": bus.bus_number,
                "route": bus.route,
                "status": bus.status,
                "latitude": bus.latitude,
                "longitude": bus.longitude,
                "last_seen": bus.last_seen.isoformat(),
                "network_status": bus.network_status
            })

        db.commit()

        # Broadcast fleet movement via WebSockets asynchronously
        ws_manager.broadcast_fleet({"type": "FLEET_UPDATE", "data": fleet_updates})

    def generate_single_event(
        self, 
        db: Session, 
        event_type: str, 
        severity: str = "Medium", 
        bus_id: int = None,
        description: str = None
    ) -> DetectionEvent:
        """
        Creates a geo-referenced event from a simulated bus Edge AI node.
        Handles offline queueing if network status is Offline.
        """
        if not bus_id:
            bus = db.query(Bus).filter(Bus.status == "ONLINE").order_by(Bus.id).first()
            if not bus:
                bus = db.query(Bus).first()
            bus_id = bus.id if bus else 1
        else:
            bus = db.query(Bus).get(bus_id)

        lat = bus.latitude if bus else 25.4525
        lng = bus.longitude if bus else 81.8349

        ev_type_descriptions = {
            "Pothole": "Deep pothole detected on active traffic lane causing vehicle slowing.",
            "Waterlogging": "Substantial water accumulation on road surface impacting traction.",
            "Damaged Road": "Severe surface deterioration and cracking on road segment.",
            "Traffic Congestion": "High vehicle density detected; average fleet speed dropped below 10 km/h.",
            "Missing Divider": "Missing or damaged concrete road median divider posing head-on collision risk.",
            "Missing Zebra Crossing": "Unmarked pedestrian crossing area with frequent vulnerable foot traffic.",
            "Damaged Traffic Sign": "Distorted/missing regulatory speed limit signboard.",
            "Rash Driving": "Erratic lateral lane weaving vehicle detected by side camera tracker.",
            "Hit and Run": "Vehicle collision detected; offending vehicle fleeing scene.",
            "Vulnerable Pedestrian": "Pedestrian standing dangerously close to high-speed bus lane.",
            "Road Obstruction": "Fallen tree branch / construction debris blocking primary lane."
        }

        desc = description or ev_type_descriptions.get(event_type, f"{event_type} anomaly detected by Edge AI camera.")
        confidence = round(random.uniform(0.89, 0.97), 2)
        evidence_file = f"/static/evidence/demo_{event_type.lower().replace(' ', '_')}.jpg"

        event = DetectionEvent(
            bus_id=bus_id,
            camera_id=1,
            event_type=event_type,
            severity=severity,
            latitude=lat,
            longitude=lng,
            confidence=confidence,
            timestamp=datetime.datetime.utcnow(),
            evidence_url=evidence_file,
            status="New",
            description=desc
        )

        # Check bus network status for low-connectivity support
        if bus and bus.network_status == "Offline":
            # Push to local edge queue
            if bus_id not in self.pending_edge_queues:
                self.pending_edge_queues[bus_id] = []
            self.pending_edge_queues[bus_id].append({
                "event_type": event_type,
                "severity": severity,
                "latitude": lat,
                "longitude": lng,
                "confidence": confidence,
                "description": desc
            })
            return None

        db.add(event)
        db.commit()
        db.refresh(event)

        # If incident type, create incident record & ANPR simulation
        if event_type in ["Hit and Run", "Rash Driving", "Vulnerable Pedestrian"]:
            plates = ["UP-70-AB-1234", "UP-70-CZ-9876", "DL-01-AX-5521", "MH-12-PQ-4410", "KA-03-MB-8809"]
            inc = Incident(
                event_id=event.id,
                vehicle_number=random.choice(plates),
                vehicle_number_confidence=round(random.uniform(0.92, 0.98), 2),
                incident_type=event_type,
                evidence_url=evidence_file,
                status="Pending Review"
            )
            db.add(inc)

        # Create auto-assigned Authority Action
        dept = "Road Maintenance"
        if event_type in ["Traffic Congestion", "Rash Driving", "Hit and Run"]:
            dept = "Traffic Authority"
        elif event_type in ["Missing Divider", "Missing Zebra Crossing", "Damaged Traffic Sign"]:
            dept = "Municipal Corporation"
        elif event_type in ["Vulnerable Pedestrian"]:
            dept = "Public Safety"

        action = AuthorityAction(
            event_id=event.id,
            assigned_department=dept,
            assigned_to="Duty Inspector",
            action="Automated Alert Dispatch",
            status="New",
            remarks="Event logged from Edge AI bus camera telemetry.",
            created_at=datetime.datetime.utcnow()
        )
        db.add(action)
        db.commit()

        self.events_transmitted_count += 1

        # Broadcast Alert via WebSocket to /ws/alerts
        event_dict = {
            "id": event.id,
            "bus_id": event.bus_id,
            "bus_number": bus.bus_number if bus else f"BUS-00{bus_id}",
            "route": bus.route if bus else "Route 01",
            "event_type": event.event_type,
            "severity": event.severity,
            "latitude": event.latitude,
            "longitude": event.longitude,
            "confidence": event.confidence,
            "timestamp": event.timestamp.isoformat(),
            "evidence_url": event.evidence_url,
            "status": event.status,
            "description": event.description
        }

        ws_manager.broadcast_alert({"type": "NEW_ALERT", "data": event_dict})
        return event

    def flush_edge_queue(self, db: Session, bus_id: int):
        """Batch uploads pending offline edge events when bus re-connects."""
        queue = self.pending_edge_queues.get(bus_id, [])
        if not queue:
            return 0
        
        count = 0
        for item in queue:
            self.generate_single_event(
                db=db,
                event_type=item["event_type"],
                severity=item["severity"],
                bus_id=bus_id,
                description=item["description"]
            )
            count += 1
        
        self.pending_edge_queues[bus_id] = []
        return count

simulation_engine = SimulationEngine()
