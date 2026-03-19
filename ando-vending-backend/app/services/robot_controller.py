import asyncio
import json
import logging
from typing import Optional
from app.models import RobotStateType
from app.config import settings

logger = logging.getLogger(__name__)

class RobotController:
    def __init__(self):
        self.pi_websocket = None
        self.current_state = RobotStateType.IDLE
        self.current_order_id: Optional[str] = None
        self.connected = False

    async def connect_to_pi(self):
        """Connect to Raspberry Pi WebSocket"""
        try:
            import websockets
            pi_url = f"ws://{settings.raspberry_pi_host}:{settings.raspberry_pi_port}/ws"
            self.pi_websocket = await websockets.connect(pi_url, ping_interval=30)
            self.connected = True
            logger.info(f"Connected to Raspberry Pi at {pi_url}")

            # Listen for state updates from Pi
            asyncio.create_task(self._listen_to_pi())
        except Exception as e:
            logger.error(f"Failed to connect to Raspberry Pi: {e}")
            self.connected = False

    async def _listen_to_pi(self):
        """Listen for messages from Raspberry Pi"""
        try:
            while self.pi_websocket and not self.pi_websocket.closed:
                message = await self.pi_websocket.recv()
                data = json.loads(message)
                await self._handle_pi_message(data)
        except Exception as e:
            logger.error(f"Error listening to Pi: {e}")
            self.connected = False

    async def _handle_pi_message(self, data: dict):
        """Handle messages from Pi"""
        if "state" in data:
            self.current_state = RobotStateType(data["state"])
            logger.info(f"Robot state updated to: {self.current_state}")

    async def send_state(self, state: RobotStateType, order_id: str = None):
        """Send state change command to Pi"""
        if not self.connected:
            logger.warning("Not connected to Raspberry Pi")
            return

        try:
            message = {
                "action": "set_state",
                "state": state.value,
                "orderId": order_id,
            }
            await self.pi_websocket.send(json.dumps(message))
            self.current_state = state
            self.current_order_id = order_id
            logger.info(f"Sent state to Pi: {state}")
        except Exception as e:
            logger.error(f"Failed to send state to Pi: {e}")

    async def start_order(self, order_id: str):
        """Start processing an order"""
        await self.send_state(RobotStateType.SELECTION, order_id)

    async def confirm_payment(self, order_id: str):
        """Confirm payment and start preparation"""
        await self.send_state(RobotStateType.PURCHASE, order_id)
        # After a delay, move to preparation
        await asyncio.sleep(2)
        await self.send_state(RobotStateType.PREPARATION, order_id)

    async def complete_order(self, order_id: str):
        """Mark order as complete"""
        await self.send_state(RobotStateType.FULFILLMENT, order_id)
        # After fulfillment, return to idle
        await asyncio.sleep(2)
        await self.send_state(RobotStateType.CONCLUSION, order_id)
        await asyncio.sleep(2)
        await self.send_state(RobotStateType.IDLE)

    def get_status(self):
        """Get current robot status"""
        return {
            "state": self.current_state.value,
            "connected": self.connected,
            "currentOrderId": self.current_order_id,
        }

# Global robot controller instance
robot_controller = RobotController()
