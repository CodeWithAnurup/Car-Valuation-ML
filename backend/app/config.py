import os
from pydantic_settings import BaseSettings
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
DEFAULT_MODEL_PATH = PROJECT_ROOT / "models" / "car_price_model_v1.joblib"
DEFAULT_METADATA_PATH = PROJECT_ROOT / "models" / "metadata.json"

class Settings(BaseSettings):
    MODEL_PATH: str = os.getenv("MODEL_PATH", str(DEFAULT_MODEL_PATH))
    METADATA_PATH: str = os.getenv("METADATA_PATH", str(DEFAULT_METADATA_PATH))
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]
    MODEL_VERSION: str = "v1"

    class Config:
        env_file = ".env"

settings = Settings()
