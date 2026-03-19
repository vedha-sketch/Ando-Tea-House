from fastapi import APIRouter
from app.models import MachineStatus, RobotStateType

router = APIRouter()

# In-memory state (will be replaced with persistent storage)
machine_state = {
    "status": RobotStateType.IDLE,
    "currentOrderId": None,
}

@router.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "Ando Vending Machine API",
        "version": "0.1.0"
    }

@router.get("/machine/status")
async def get_machine_status():
    return MachineStatus(
        status=machine_state["status"],
        currentOrderId=machine_state["currentOrderId"],
        isAvailable=machine_state["status"] == RobotStateType.IDLE
    )

def set_machine_state(state: RobotStateType, order_id: str = None):
    """Update machine state"""
    machine_state["status"] = state
    machine_state["currentOrderId"] = order_id
