from pydantic import BaseModel
from typing import Optional
from enum import Enum
from datetime import datetime

class OrderStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    PREPARING = "preparing"
    READY = "ready"
    COMPLETED = "completed"
    FAILED = "failed"

class DrinkSize(str, Enum):
    SMALL = "Small"
    MEDIUM = "Medium"
    LARGE = "Large"

class OrderCreate(BaseModel):
    sessionId: str
    drinkId: str
    size: DrinkSize
    amount: int  # in cents

class Order(BaseModel):
    orderId: str
    sessionId: str
    drinkId: str
    drinkName: str
    size: DrinkSize
    amount: int
    status: OrderStatus
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    orderId: str
    status: OrderStatus
    paymentIntentId: Optional[str] = None
    drinkName: str
    size: DrinkSize
