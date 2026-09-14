from typing import List
from fastapi import WebSocket

class WebSocketManager:
    """
    Manages active WebSocket connections for live command center updates.
    Broadcasts fleet movements to /ws/fleet and critical alerts to /ws/alerts.
    """
    def __init__(self):
        self.fleet_connections: List[WebSocket] = []
        self.alert_connections: List[WebSocket] = []

    async def connect_fleet(self, websocket: WebSocket):
        await websocket.accept()
        self.fleet_connections.append(websocket)

    def disconnect_fleet(self, websocket: WebSocket):
        if websocket in self.fleet_connections:
            self.fleet_connections.remove(websocket)

    async def connect_alert(self, websocket: WebSocket):
        await websocket.accept()
        self.alert_connections.append(websocket)

    def disconnect_alert(self, websocket: WebSocket):
        if websocket in self.alert_connections:
            self.alert_connections.remove(websocket)

    def broadcast_fleet(self, message: dict):
        # Synchronous safe broadcast helper
        import asyncio
        disconnected = []
        for connection in self.fleet_connections:
            try:
                loop = asyncio.get_event_loop()
                if loop.is_running():
                    loop.create_task(connection.send_json(message))
            except Exception:
                disconnected.append(connection)
        for conn in disconnected:
            self.disconnect_fleet(conn)

    def broadcast_alert(self, message: dict):
        import asyncio
        disconnected = []
        for connection in self.alert_connections:
            try:
                loop = asyncio.get_event_loop()
                if loop.is_running():
                    loop.create_task(connection.send_json(message))
            except Exception:
                disconnected.append(connection)
        for conn in disconnected:
            self.disconnect_alert(conn)

ws_manager = WebSocketManager()
