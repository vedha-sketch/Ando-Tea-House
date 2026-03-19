from fastapi import APIRouter, HTTPException, Query
from app.models import OrderCreate, OrderResponse, OrderStatus, RobotStateType
import uuid
from datetime import datetime
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# In-memory order storage
orders_db = {}
active_order = None  # Only one order can be active at a time

@router.get("/sessions/{session_id}")
async def validate_session(session_id: str):
    """Validate QR code session"""
    # For MVP, accept any session ID
    # In production, validate against vending machine registry
    return {"valid": True, "sessionId": session_id}

@router.post("/orders")
async def create_order(order_data: OrderCreate):
    """Create a new order"""
    global active_order

    # Check if machine is busy
    if active_order is not None:
        raise HTTPException(
            status_code=429,
            detail="Machine is currently preparing an order. Please wait."
        )

    # Create order
    order_id = f"ORD-{uuid.uuid4().hex[:8].upper()}"

    order = {
        "orderId": order_id,
        "sessionId": order_data.sessionId,
        "drinkId": order_data.drinkId,
        "drinkName": "Matcha Latte",  # Get from menu
        "size": order_data.size,
        "amount": order_data.amount,
        "status": OrderStatus.PENDING,
        "createdAt": datetime.now(),
        "updatedAt": datetime.now(),
    }

    # For MVP: simulate payment success immediately
    order["status"] = OrderStatus.PAID

    orders_db[order_id] = order
    # Don't lock the machine for MVP — allow multiple test orders
    # In production, active_order would be set and cleared by the Pi
    # active_order = order_id

    logger.info(f"Order created and payment simulated: {order_id}")

    return OrderResponse(
        orderId=order_id,
        status=OrderStatus.PAID,
        drinkName=order["drinkName"],
        size=order["size"]
    )

@router.get("/orders/{order_id}")
async def get_order(order_id: str):
    """Get order details"""
    order = orders_db.get(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    return OrderResponse(
        orderId=order["orderId"],
        status=order["status"],
        drinkName=order["drinkName"],
        size=order["size"]
    )

@router.post("/orders/{order_id}/confirm-payment")
async def confirm_payment(order_id: str, payment_intent_id: str = Query(...)):
    """Confirm payment and mark order as paid"""
    order = orders_db.get(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order["status"] = OrderStatus.PAID
    order["updatedAt"] = datetime.now()

    logger.info(f"Payment confirmed for order {order_id}")

    return {"status": "payment_confirmed", "orderId": order_id}

@router.post("/orders/{order_id}/complete")
async def complete_order(order_id: str):
    """Mark order as completed"""
    global active_order

    order = orders_db.get(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order["status"] = OrderStatus.COMPLETED
    order["updatedAt"] = datetime.now()

    if active_order == order_id:
        active_order = None

    logger.info(f"Order completed: {order_id}")

    return {"status": "completed", "orderId": order_id}

@router.post("/machine/reset")
async def reset_machine():
    """Reset the machine state (dev/admin only)"""
    global active_order
    active_order = None
    logger.info("Machine state reset")
    return {"status": "reset", "activeOrder": None}

@router.get("/machine/status")
async def machine_status():
    """Check if the machine is available"""
    return {"isAvailable": active_order is None, "activeOrder": active_order}
