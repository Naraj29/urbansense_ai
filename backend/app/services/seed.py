import random
import datetime
from sqlalchemy.orm import Session
from app.models.domain import User, Bus, Camera, DetectionEvent, VehicleDetection, Incident, AuthorityAction
from app.core.security import get_password_hash
from app.simulation.engine import SIMULATED_ROUTES

def seed_database(db: Session):
    """
    Populates database with realistic Indian urban prototype seed data (Prayagraj region).
    """
    # 1. Seed Demo Admin User
    existing_user = db.query(User).filter(User.email == "admin@urbansense.demo").first()
    if not existing_user:
        admin_user = User(
            name="BEL Command Officer",
            email="admin@urbansense.demo",
            password_hash=get_password_hash("Demo@123"),
            role="Admin",
            created_at=datetime.datetime.utcnow()
        )
        db.add(admin_user)
        
        traffic_user = User(
            name="Prayagraj Traffic Authority",
            email="traffic@urbansense.demo",
            password_hash=get_password_hash("Demo@123"),
            role="Traffic Authority",
            created_at=datetime.datetime.utcnow()
        )
        db.add(traffic_user)

    # 2. Seed 10 Buses & Cameras
    existing_buses = db.query(Bus).count()
    if existing_buses == 0:
        routes_list = list(SIMULATED_ROUTES.keys())
        
        for i in range(1, 11):
            bus_num = f"UP-70-BUS-{100+i:03d}"
            route = routes_list[(i - 1) % len(routes_list)]
            waypoints = SIMULATED_ROUTES[route]
            start_lat, start_lng = waypoints[i % len(waypoints)]
            
            network_st = "Online"
            if i == 4:
                network_st = "Weak Network"
            elif i == 8:
                network_st = "Offline"

            bus = Bus(
                id=i,
                bus_number=bus_num,
                route=route,
                status="ONLINE" if i != 10 else "MAINTENANCE",
                latitude=start_lat,
                longitude=start_lng,
                last_seen=datetime.datetime.utcnow(),
                camera_count=4,
                network_status=network_st
            )
            db.add(bus)
            db.flush()

            # Add 4 cameras for each bus (Front, Rear, Left, Right)
            cam_types = ["Front", "Rear", "Left", "Right"]
            for c_idx, c_type in enumerate(cam_types, start=1):
                cam = Camera(
                    bus_id=bus.id,
                    camera_type=c_type,
                    status="Active" if not (i == 4 and c_type == "Right") else "Degraded",
                    stream_url=f"/streams/bus_{bus.id}_cam_{c_type.lower()}"
                )
                db.add(cam)

    # 3. Seed 100+ Detection Events
    existing_events = db.query(DetectionEvent).count()
    if existing_events < 50:
        event_types = [
            ("Pothole", "High", "Road Hazard", "Deep surface crater on right wheel path."),
            ("Waterlogging", "Medium", "Road Hazard", "Standing water accumulation post rain."),
            ("Damaged Road", "Medium", "Road Hazard", "Cracked asphalt and surface erosion."),
            ("Missing Divider", "Critical", "Infrastructure", "Damaged concrete median barrier."),
            ("Missing Zebra Crossing", "Low", "Infrastructure", "Faded pedestrian crosswalk marking."),
            ("Damaged Traffic Sign", "Low", "Infrastructure", "Speed limit 40 km/h sign bent."),
            ("Traffic Congestion", "High", "Traffic", "Average vehicle speed reduced below 12 km/h."),
            ("Vulnerable Pedestrian", "High", "Safety Incident", "Pedestrian walking inside designated bus lane."),
            ("Rash Driving", "Critical", "Safety Incident", "Sudden lane changes without signaling."),
            ("Hit and Run", "Critical", "Safety Incident", "Motorcycle collision with hit and run attempt."),
            ("Road Obstruction", "Medium", "Road Hazard", "Construction material debris on curb line.")
        ]

        buses = db.query(Bus).all()
        now = datetime.datetime.utcnow()

        for idx in range(1, 110):
            ev_tuple = random.choice(event_types)
            ev_name, default_severity, cat_group, default_desc = ev_tuple
            
            assigned_bus = random.choice(buses)
            waypoints = SIMULATED_ROUTES.get(assigned_bus.route, list(SIMULATED_ROUTES.values())[0])
            wp_lat, wp_lng = random.choice(waypoints)

            # Scatter around waypoint
            ev_lat = round(wp_lat + random.uniform(-0.004, 0.004), 6)
            ev_lng = round(wp_lng + random.uniform(-0.004, 0.004), 6)
            
            # Timestamp scattered over last 7 days
            hours_ago = random.randint(0, 168)
            ev_time = now - datetime.timedelta(hours=hours_ago, minutes=random.randint(0, 59))
            
            status_choices = ["New", "Verified", "Assigned", "In Progress", "Resolved"]
            status_weights = [0.15, 0.20, 0.25, 0.20, 0.20]
            status = random.choices(status_choices, weights=status_weights)[0]

            feedback = None
            if status == "Resolved":
                feedback = random.choices(["Correct", "Incorrect"], weights=[0.92, 0.08])[0]

            event = DetectionEvent(
                bus_id=assigned_bus.id,
                camera_id=1,
                event_type=ev_name,
                severity=default_severity,
                latitude=ev_lat,
                longitude=ev_lng,
                confidence=round(random.uniform(0.88, 0.98), 2),
                timestamp=ev_time,
                evidence_url=f"/static/evidence/sample_{ev_name.lower().replace(' ', '_')}.jpg",
                status=status,
                description=default_desc,
                feedback=feedback
            )
            db.add(event)
            db.flush()

            # Add Authority Action record
            dept = "Road Maintenance"
            if cat_group == "Traffic":
                dept = "Traffic Authority"
            elif cat_group == "Infrastructure":
                dept = "Municipal Corporation"
            elif cat_group == "Safety Incident":
                dept = "Public Safety"

            action = AuthorityAction(
                event_id=event.id,
                assigned_department=dept,
                assigned_to=f"{dept} Inspector #{random.randint(101, 108)}",
                action="Verification & Priority Tagging" if status != "Resolved" else "Hazard Repair & Inspection",
                status=status,
                remarks=f"Initial triage performed by {dept}.",
                created_at=ev_time,
                resolved_at=ev_time + datetime.timedelta(hours=random.randint(2, 24)) if status == "Resolved" else None
            )
            db.add(action)

            # Add Incident record if safety incident
            if cat_group == "Safety Incident" or ev_name == "Traffic Congestion":
                plates = ["UP-70-AB-1234", "UP-70-CZ-9876", "DL-01-AX-5521", "MH-12-PQ-4410", "KA-03-MB-8809"]
                inc = Incident(
                    event_id=event.id,
                    vehicle_number=random.choice(plates),
                    vehicle_number_confidence=round(random.uniform(0.91, 0.97), 2),
                    incident_type=ev_name,
                    evidence_url=f"/static/evidence/sample_{ev_name.lower().replace(' ', '_')}.jpg",
                    status="Active" if status != "Resolved" else "Closed"
                )
                db.add(inc)

            # Add Vehicle Count Telemetry
            v_types = ["Car", "Bus", "Truck", "Motorcycle", "Bicycle", "Pedestrian"]
            for vt in v_types:
                v_det = VehicleDetection(
                    bus_id=assigned_bus.id,
                    timestamp=ev_time,
                    vehicle_type=vt,
                    count=random.randint(2, 25),
                    latitude=ev_lat,
                    longitude=ev_lng
                )
                db.add(v_det)

    db.commit()
