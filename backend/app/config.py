import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "AI Resume Builder"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-for-ai-resume-builder-12345")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./resume_builder.db")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

settings = Settings()
