"""
Digital Tanzaku — Zen Haiku Generation API

Calls an LLM (Anthropic Claude) to generate a personalized haiku
based on the user's current thoughts during drink preparation.
Stores haikus in-memory for the Bamboo Grove AR experience.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
import httpx
import os
import logging
import json
import uuid
from datetime import datetime

logger = logging.getLogger(__name__)
router = APIRouter()

# ──────────────────────────────────────────────
#  CONFIGURATION
# ──────────────────────────────────────────────

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

# ──────────────────────────────────────────────
#  IN-MEMORY HAIKU GROVE (persists per server run)
# ──────────────────────────────────────────────

# Stores the last N haikus so new guests see previous visitors' thoughts
MAX_GROVE_SIZE = 20
haiku_grove: List[dict] = []

# Debug: confirm key is loaded on startup
if ANTHROPIC_API_KEY:
    logger.info(f"Anthropic API key loaded: {ANTHROPIC_API_KEY[:12]}...")
else:
    logger.warning("No ANTHROPIC_API_KEY found — haiku will use local fallback")

SYSTEM_PROMPT = """You are a wise, compassionate Zen tea master and poet. The user will share a thought, feeling, or observation with you. Your task is to acknowledge their thought by writing a beautiful, minimalist, 3-line Haiku in English. Rules:
1. Do not judge or give advice. Merely observe and reflect their emotion through nature imagery (e.g., wind, water, stones, seasons).
2. Maintain a tone of serene acceptance and warmth.
3. Format the output strictly as three lines separated by newline characters. Do not include quotes, greetings, or conversational filler."""


# ──────────────────────────────────────────────
#  REQUEST / RESPONSE MODELS
# ──────────────────────────────────────────────

class HaikuRequest(BaseModel):
    thought: str = Field(..., min_length=1, max_length=500, description="The user's thought or feeling")


class HaikuResponse(BaseModel):
    haiku: str = Field(..., description="Three-line haiku separated by newlines")
    source: str = Field(default="llm", description="Generation source: llm or fallback")
    id: Optional[str] = Field(default=None, description="Unique haiku ID")


class GroveHaiku(BaseModel):
    id: str
    haiku: str
    created_at: str


class GroveResponse(BaseModel):
    haikus: List[GroveHaiku]
    total: int


# ──────────────────────────────────────────────
#  LLM PROVIDERS
# ──────────────────────────────────────────────

async def generate_with_anthropic(thought: str) -> str:
    """Generate haiku using Anthropic Claude API."""
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": "claude-sonnet-4-20250514",
                "max_tokens": 100,
                "system": SYSTEM_PROMPT,
                "messages": [
                    {"role": "user", "content": thought}
                ],
            },
        )

        if response.status_code != 200:
            logger.error(f"Anthropic API error {response.status_code}: {response.text}")
            raise Exception(f"Anthropic API returned {response.status_code}")

        data = response.json()
        # Extract text from the first content block
        text = data["content"][0]["text"].strip()
        return text


async def generate_with_openai(thought: str) -> str:
    """Generate haiku using OpenAI API (fallback)."""
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENAI_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "gpt-4o-mini",
                "max_tokens": 100,
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": thought},
                ],
            },
        )

        if response.status_code != 200:
            logger.error(f"OpenAI API error {response.status_code}: {response.text}")
            raise Exception(f"OpenAI API returned {response.status_code}")

        data = response.json()
        text = data["choices"][0]["message"]["content"].strip()
        return text


def generate_fallback(thought: str) -> str:
    """
    Poetic fallback — returns a pre-written haiku when no API key is configured.
    Selects based on simple keyword matching to feel somewhat personalized.
    """
    thought_lower = thought.lower()

    haiku_bank = [
        # Joy / happiness
        ("joy", "happy", "smile", "laugh", "love", "grateful"),
        "Light finds every leaf\na warmth the wind carries far\njoy needs no reason",

        # Sadness / melancholy
        ("sad", "miss", "lost", "grief", "lonely", "alone", "cry"),
        "Rain on quiet stone\neach drop a memory held\nthe earth drinks it all",

        # Stress / anxiety
        ("stress", "anxious", "worry", "overwhelm", "busy", "tired", "exhaust"),
        "Still water runs deep\nbeneath the rushing current\nstones rest undisturbed",

        # Hope / future
        ("hope", "dream", "future", "wish", "tomorrow", "new", "begin"),
        "Seeds beneath the snow\nknow nothing of winter's weight\nonly spring's bright call",

        # Nature / peace
        ("peace", "calm", "nature", "quiet", "forest", "mountain", "ocean"),
        "Pine bends to the wind\nnot breaking but remembering\nhow to be still",

        # Work / purpose
        ("work", "purpose", "create", "build", "learn", "grow", "study"),
        "The potter's slow hands\nshape what the clay already\nknew it could become",

        # Default
        (),
        "A thought arrives soft\nlike petals on moving stream\nthen gently moves on",
    ]

    # Walk through keyword groups, return matching haiku
    for i in range(0, len(haiku_bank) - 1, 2):
        keywords = haiku_bank[i]
        haiku_text = haiku_bank[i + 1]
        if any(kw in thought_lower for kw in keywords):
            return haiku_text

    # Default fallback
    return haiku_bank[-1]


# ──────────────────────────────────────────────
#  API ENDPOINT
# ──────────────────────────────────────────────

@router.post("/generate-haiku", response_model=HaikuResponse)
async def generate_haiku(request: HaikuRequest):
    """
    Generate a personalized Zen haiku based on the user's thought.

    Tries Anthropic Claude first, then OpenAI, then a local fallback.
    Always returns a 3-line haiku. Stores it in the grove for future visitors.
    """
    thought = request.thought.strip()
    logger.info(f"Haiku request received: '{thought[:50]}...'")

    haiku = None
    source = "fallback"

    # Try Anthropic first
    if ANTHROPIC_API_KEY:
        try:
            haiku = await generate_with_anthropic(thought)
            source = "anthropic"
            logger.info("Haiku generated via Anthropic")
        except Exception as e:
            logger.warning(f"Anthropic failed, trying fallback: {e}")

    # Try OpenAI second
    if not haiku and OPENAI_API_KEY:
        try:
            haiku = await generate_with_openai(thought)
            source = "openai"
            logger.info("Haiku generated via OpenAI")
        except Exception as e:
            logger.warning(f"OpenAI failed, using local fallback: {e}")

    # Local fallback — always works, no API needed
    if not haiku:
        haiku = generate_fallback(thought)
        logger.info("Haiku generated via local fallback")

    # Store in the grove
    haiku_id = str(uuid.uuid4())[:8]
    grove_entry = {
        "id": haiku_id,
        "haiku": haiku,
        "created_at": datetime.utcnow().isoformat(),
    }
    haiku_grove.append(grove_entry)

    # Trim to max size
    while len(haiku_grove) > MAX_GROVE_SIZE:
        haiku_grove.pop(0)

    logger.info(f"Grove now has {len(haiku_grove)} haikus")

    return HaikuResponse(haiku=haiku, source=source, id=haiku_id)


@router.get("/haiku-grove", response_model=GroveResponse)
async def get_haiku_grove():
    """
    Retrieve all stored haikus for the Bamboo Grove AR experience.
    Returns the most recent haikus left by previous guests.
    """
    return GroveResponse(
        haikus=[GroveHaiku(**h) for h in haiku_grove],
        total=len(haiku_grove),
    )
