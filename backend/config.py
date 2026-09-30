"""
VarunaWatch Backend - Configuration
Environment-based settings with Pydantic
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded securely from environment variables."""

    # App
    APP_NAME: str = "VarunaWatch API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:3001"

    # Gemini AI
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-3.7-flash"

    # Supabase / PostgreSQL (PostGIS)
    SUPABASE_URL: Optional[str] = None
    SUPABASE_KEY: Optional[str] = None
    DATABASE_URL: Optional[str] = None

    # Weather API (Tomorrow.io / Open-Meteo)
    WEATHER_API_URL: str = "https://api.open-meteo.com/v1"
    TOMORROW_API_KEY: Optional[str] = None
    WEATHER_API_KEY: Optional[str] = None

    # Google Earth Engine / Earth Observation
    GEE_API_KEY: Optional[str] = None
    GEE_SERVICE_ACCOUNT: Optional[str] = None
    GEE_KEY_FILE: Optional[str] = None

    # Twilio Emergency Voice/SMS Relay
    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    TWILIO_FROM_NUMBER: Optional[str] = None
    TWILIO_EMERGENCY_CONTACT: Optional[str] = None

    # Demo mode
    USE_DEMO_DATA: bool = True

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()
