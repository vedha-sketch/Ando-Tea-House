from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.routes import menu, orders, health
from app.websockets import manager as ws_manager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Lifespan context manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Ando Vending Machine API")
    yield
    # Shutdown
    logger.info("Shutting down Ando Vending Machine API")

# Create FastAPI app
app = FastAPI(
    title="Ando Vending Machine API",
    description="API for the Ando robot dog vending machine",
    version="0.1.0",
    lifespan=lifespan,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(menu.router, prefix="/api", tags=["menu"])
app.include_router(orders.router, prefix="/api", tags=["orders"])

# WebSocket endpoint
@app.websocket("/ws/{order_id}")
async def websocket_endpoint(order_id: str):
    await ws_manager.connect(order_id)
    try:
        while True:
            # Keep connection alive, messages are pushed via broadcast
            data = await ws_manager.wait_for_message(order_id)
            if data:
                await ws_manager.send_to_client(order_id, data)
    except Exception as e:
        logger.error(f"WebSocket error for {order_id}: {e}")
    finally:
        await ws_manager.disconnect(order_id)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
