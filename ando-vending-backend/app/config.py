from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # API Settings
    api_title: str = "Ando Vending Machine API"
    api_version: str = "0.1.0"

    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = False

    # Database
    database_url: str = "sqlite:///./vending.db"

    # Stripe
    stripe_secret_key: Optional[str] = None
    stripe_publishable_key: Optional[str] = None

    # Raspberry Pi
    raspberry_pi_host: str = "localhost"
    raspberry_pi_port: int = 8001

    # Queue settings
    max_queue_size: int = 1
    order_timeout_seconds: int = 600

    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
