import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "AI Resume Builder"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key" if os.getenv("ENVIRONMENT") != "production" else "")
    if not SECRET_KEY:
        raise ValueError("SECRET_KEY environment variable is missing in production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./resume_builder.db" if os.getenv("ENVIRONMENT") != "production" else "")
    if os.getenv("ENVIRONMENT") == "production" and (not DATABASE_URL or DATABASE_URL.startswith("sqlite")):
        raise ValueError("DATABASE_URL environment variable is missing or uses SQLite in production. A PostgreSQL connection string is required.")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

settings = Settings()
