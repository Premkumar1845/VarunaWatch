import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = os.getenv("DATABASE_URL", "postgresql://postgres:varunapassword@localhost:5432/varuna")
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    weather_api_key: str = os.getenv("WEATHER_API_KEY", "")
    gee_project: str = os.getenv("GEE_PROJECT", "")
    allowed_gemini_model: str = os.getenv("ALLOWED_GEMINI_MODEL", "gemini-3.7-flash")

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
