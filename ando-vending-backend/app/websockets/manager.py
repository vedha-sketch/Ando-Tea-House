from fastapi import WebSocket
import json
import logging
from typing import Dict, List

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        # Dictionary to store active connections per order_id
        self.active_connections: Dict[str, List[WebSocket]] = {}
        # Queue for pending messages
        self.message_queue: Dict[str, List[dict]] = {}

    async def connect(self, order_id: str, websocket: WebSocket):
        """Add a new WebSocket connection"""
        await websocket.accept()
        if order_id not in self.active_connections:
            self.active_connections[order_id] = []
            self.message_queue[order_id] = []
        self.active_connections[order_id].append(websocket)
        logger.info(f"Client connected to order {order_id}")

    async def disconnect(self, order_id: str, websocket: WebSocket):
        """Remove a WebSocket connection"""
        if order_id in self.active_connections:
            self.active_connections[order_id].remove(websocket)
            if not self.active_connections[order_id]:
                del self.active_connections[order_id]
        logger.info(f"Client disconnected from order {order_id}")

    async def broadcast(self, order_id: str, message: dict):
        """Send message to all connected clients for an order"""
        if order_id in self.active_connections:
            for connection in self.active_connections[order_id]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.error(f"Error broadcasting to {order_id}: {e}")

    async def send_to_client(self, order_id: str, websocket: WebSocket, message: dict):
        """Send message to a specific client"""
        try:
            await websocket.send_json(message)
        except Exception as e:
            logger.error(f"Error sending to client: {e}")

    async def wait_for_message(self, order_id: str, websocket: WebSocket):
        """Wait for a message from client"""
        try:
            return await websocket.receive_json()
        except Exception as e:
            logger.error(f"Error receiving message: {e}")
            return None

manager = ConnectionManager()
