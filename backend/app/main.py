import os
import sys

# Ensure the 'backend' directory is in the Python path for Vercel
# Vercel's root might be the project root, so 'app' needs to be resolvable.
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import auth, profile, jd, resume, ai
from app.config import settings

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Backend API for AI-RESUME-BUILDER"
)

import os

# CORS configurations
allow_origins_env = os.getenv("ALLOWED_ORIGINS", "")
if allow_origins_env:
    allow_origins = [origin.strip() for origin in allow_origins_env.split(",")]
else:
    allow_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000"
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(jd.router)
app.include_router(resume.router)
app.include_router(ai.router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "project": settings.PROJECT_NAME,
        "version": "1.0.0"
    }
