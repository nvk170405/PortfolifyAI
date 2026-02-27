from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    GROQ_API_KEY: str = ""
    GOOGLE_CLIENT_ID: str = ""
    MONGODB_URI: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "portfolifyai"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
