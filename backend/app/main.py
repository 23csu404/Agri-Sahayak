
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import farmer
from app.routes import schemes
from app.routes import vision
app = FastAPI(
    title="AgriSahayak API",
    description="AI-Powered Smart Farmer Assistance System",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict this before production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(farmer.router)

@app.get("/")
def home():
    return {
        "project": "AgriSahayak",
        "message": "Welcome to AgriSahayak API!",
        "status": "Running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "database": "configured",
        "message": "AgriSahayak backend is running successfully"
    }
app.include_router(schemes.router)
app.include_router(vision.router)