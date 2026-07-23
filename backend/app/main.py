import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Validate GROQ_API_KEY on startup
    groq_key = os.getenv("GROQ_API_KEY")
    if not groq_key or not groq_key.startswith("gsk_"):
        print("⚠️  WARNING: GROQ_API_KEY environment variable is not configured or invalid.")
        print("⚠️  AI explanations & Copilot Chat will operate in rule-based fallback mode.")
    else:
        print("✅ GROQ_API_KEY validated successfully. XAI Engine and Copilot are active.")

    # Setup ML models on startup
    from app.ml.model_manager import initialize_model
    initialize_model()
    yield
    # Cleanup on shutdown

app = FastAPI(
    title="PhishGuard XAI - Enterprise Threat Engine",
    description="Backend API for advanced threat intelligence and phishing detection",
    version="1.0.0",
    lifespan=lifespan
)

# Parse ALLOWED_ORIGINS from environment, default to "*" if not set
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")

# Allow CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api import v1_scan
app.include_router(v1_scan.router, prefix="/api/v1")

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "PhishGuard XAI Engine is running"}
