import asyncio
import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.services.seed import seed_database
from app.simulation.engine import simulation_engine
from app.api.ws_manager import ws_manager

from app.api.routers import (
    auth, buses, events, incidents, traffic, 
    road_conditions, analytics, edge, ai, system
)

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="UrbanSense AI - AI-Powered Mobile Urban Intelligence Platform using Public Transport Fleet (BEL PS #26124)"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static evidence directory
app.mount("/static", StaticFiles(directory=settings.STATIC_DIR), name="static")

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(buses.router, prefix=settings.API_V1_STR)
app.include_router(events.router, prefix=settings.API_V1_STR)
app.include_router(incidents.router, prefix=settings.API_V1_STR)
app.include_router(traffic.router, prefix=settings.API_V1_STR)
app.include_router(road_conditions.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(edge.router, prefix=settings.API_V1_STR)
app.include_router(ai.router, prefix=settings.API_V1_STR)
app.include_router(system.router, prefix=settings.API_V1_STR)

# --- WebSockets ---
@app.websocket("/ws/fleet")
async def websocket_fleet_endpoint(websocket: WebSocket):
    await ws_manager.connect_fleet(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect_fleet(websocket)

@app.websocket("/ws/alerts")
async def websocket_alerts_endpoint(websocket: WebSocket):
    await ws_manager.connect_alert(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect_alert(websocket)

# --- Background Fleet Movement Loop ---
async def fleet_simulation_loop():
    while True:
        try:
            db = SessionLocal()
            simulation_engine.update_fleet_positions(db)
            db.close()
        except Exception as e:
            print(f"[Simulation Error]: {e}")
        await asyncio.sleep(4.0) # Move buses every 4 seconds

@app.on_event("startup")
async def startup_event():
    # Seed database with initial prototype dataset
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    
    # Launch background simulation task
    asyncio.create_task(fleet_simulation_loop())

@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "tagline": "Turning Public Buses into Mobile Urban Sensors",
        "status": "ONLINE",
        "docs": "/docs"
    }
