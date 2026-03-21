"""
Hardware Control API — Elevator & Printer

Provides endpoints to synchronize the frontend AR experience
with the physical vending machine hardware:
  - Elevator: pause at 50%, resume to 100%
  - Printer: thermal receipt printing of haiku text

When no physical hardware is connected (dev mode), these endpoints
return success immediately so the frontend flow works unchanged.
"""

from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


# ──────────────────────────────────────────────
#  STATE
# ──────────────────────────────────────────────

elevator_state = {
    "position": 0,       # 0 = bottom, 50 = paused, 100 = top
    "paused": False,
    "order_id": None,
}


# ──────────────────────────────────────────────
#  MODELS
# ──────────────────────────────────────────────

class ElevatorResponse(BaseModel):
    status: str
    position: int
    message: str


class PrintRequest(BaseModel):
    haiku: str = Field(..., description="The haiku text to print (newline-separated)")
    order_id: Optional[str] = Field(default=None, description="Associated order ID")


class PrintResponse(BaseModel):
    status: str
    message: str
    printed: bool


# ──────────────────────────────────────────────
#  ELEVATOR ENDPOINTS
# ──────────────────────────────────────────────

@router.post("/elevator/pause", response_model=ElevatorResponse)
async def elevator_pause(order_id: Optional[str] = None):
    """
    Pause the elevator at 50% height.
    Called when the user opts into the Tanzaku haiku experience —
    the drink waits mid-delivery while they decide to print or let go.
    """
    elevator_state["position"] = 50
    elevator_state["paused"] = True
    elevator_state["order_id"] = order_id
    logger.info(f"Elevator PAUSED at 50% for order {order_id}")

    # TODO: When Raspberry Pi is connected, send GPIO/serial command:
    #   from hardware.elevator import pause_at_half
    #   await pause_at_half()

    return ElevatorResponse(
        status="paused",
        position=50,
        message="Elevator paused at 50% — awaiting user decision",
    )


@router.post("/elevator/resume", response_model=ElevatorResponse)
async def elevator_resume():
    """
    Resume the elevator from 50% to 100% (delivery window).
    Called after the user clicks "Let it go" or after printing completes.
    """
    prev = elevator_state["position"]
    elevator_state["position"] = 100
    elevator_state["paused"] = False
    order_id = elevator_state["order_id"]
    logger.info(f"Elevator RESUMED from {prev}% → 100% for order {order_id}")

    # TODO: When Raspberry Pi is connected, send GPIO/serial command:
    #   from hardware.elevator import resume_to_top
    #   await resume_to_top()

    return ElevatorResponse(
        status="delivered",
        position=100,
        message="Elevator reached delivery window — drink is ready",
    )


@router.get("/elevator/status", response_model=ElevatorResponse)
async def elevator_status():
    """Get current elevator state."""
    status = "paused" if elevator_state["paused"] else (
        "delivered" if elevator_state["position"] >= 100 else "idle"
    )
    return ElevatorResponse(
        status=status,
        position=elevator_state["position"],
        message=f"Elevator at {elevator_state['position']}%",
    )


# ──────────────────────────────────────────────
#  PRINTER ENDPOINT
# ──────────────────────────────────────────────

@router.post("/printer/print", response_model=PrintResponse)
async def print_haiku(request: PrintRequest):
    """
    Send the haiku text to the thermal receipt printer.
    Also saves to the communal grove for the AR experience.

    In dev mode (no printer connected), logs the text and returns success.
    """
    haiku_text = request.haiku.strip()
    logger.info(f"Print request received for order {request.order_id}")
    logger.info(f"Haiku to print:\n{haiku_text}")

    printed = False

    # TODO: When thermal printer is connected (e.g., Epson TM series via USB):
    #
    # try:
    #     from escpos.printer import Usb
    #     p = Usb(0x04b8, 0x0e15)  # Epson vendor/product IDs
    #     p.set(align='center', font='a', width=2, height=2)
    #     p.text("\n")
    #     p.text("── Ando Tea House ──\n\n")
    #     for line in haiku_text.split('\n'):
    #         p.text(f"  {line.strip()}  \n")
    #     p.text("\n")
    #     p.text("· · ·\n\n")
    #     p.cut()
    #     printed = True
    # except Exception as e:
    #     logger.error(f"Printer error: {e}")

    # Dev mode: simulate successful print
    logger.info("Dev mode: simulating print (no hardware connected)")
    printed = True

    return PrintResponse(
        status="success" if printed else "error",
        message="Haiku printed successfully" if printed else "Printer not available",
        printed=printed,
    )
