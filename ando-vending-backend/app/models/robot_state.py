from pydantic import BaseModel
from enum import Enum
from typing import Optional

class RobotStateType(str, Enum):
    IDLE = "Idle"
    SELECTION = "Selection"
    PURCHASE = "Purchase"
    PREPARATION = "Preparation"
    FULFILLMENT = "Fulfillment"
    CONCLUSION = "Conclusion"

class RobotStateUpdate(BaseModel):
    state: RobotStateType
    orderId: Optional[str] = None
    eta: Optional[int] = None  # seconds
    message: Optional[str] = None

class MachineStatus(BaseModel):
    status: RobotStateType
    currentOrderId: Optional[str] = None
    isAvailable: bool
