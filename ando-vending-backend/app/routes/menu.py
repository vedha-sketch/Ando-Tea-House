from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class DrinkOption(BaseModel):
    id: str
    name: str
    description: str
    basePrice: float
    sizes: list[dict]

# Available drinks
DRINKS = [
    {
        "id": "matcha-latte",
        "name": "Matcha Latte",
        "description": "Traditional whisked matcha with creamy milk",
        "basePrice": 6.50,
        "sizes": [
            {"size": "Small", "price": 0},
            {"size": "Medium", "price": 0.75},
            {"size": "Large", "price": 1.50},
        ]
    }
]

@router.get("/menu")
async def get_menu():
    return {
        "drinks": DRINKS
    }

@router.get("/menu/{drink_id}")
async def get_drink(drink_id: str):
    drink = next((d for d in DRINKS if d["id"] == drink_id), None)
    if not drink:
        return {"error": "Drink not found"}, 404
    return drink
