"""
AI Fitness Trainer API - Main Application Entry Point

This is the core FastAPI application that handles all HTTP requests.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings

# Import routers
from app.routes import auth, users, reports


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events.
    
    This is the modern way to handle startup/shutdown in FastAPI (replaces deprecated @app.on_event).
    Code before 'yield' runs on startup, code after 'yield' runs on shutdown.
    """
    # Startup: runs when the server starts
    print("🚀 AI Fitness Trainer API is starting up...")
    print(f"📁 Model directory: {settings.model_dir}")
    print(f"🌍 Environment: {settings.environment}")
    
    # This is where you would initialize:
    # - Database connections
    # - AI model loading
    # - Cache connections
    # etc.
    
    yield  # Server is now running and handling requests
    
    # Shutdown: runs when the server stops
    print("👋 AI Fitness Trainer API is shutting down...")
    # This is where you would cleanup:
    # - Close database connections
    # - Save any pending data
    # - Release resources
    # etc.


# Create the FastAPI application instance
app = FastAPI(
    title="AI Fitness Trainer API",
    version="1.0.0",
    description="Backend API for AI-powered fitness training and form correction",
    lifespan=lifespan  # Attach the lifespan context manager
)


# Configure CORS (Cross-Origin Resource Sharing)
# This allows your React frontend to make requests to this API
app.add_middleware(
    CORSMiddleware,
    # Allow requests from these origins (your React dev servers)
    allow_origins=[
        settings.frontend_url,      # http://localhost:3000
        settings.frontend_url_alt,  # http://localhost:5173
        "http://localhost:3000",    # Hardcoded fallback
        "http://localhost:5173",    # Hardcoded fallback
    ],
    # Allow cookies and authentication headers
    allow_credentials=True,
    # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_methods=["*"],
    # Allow all headers
    allow_headers=["*"],
)


# ============================================================================
# ROUTERS
# ============================================================================

# Include authentication routes
app.include_router(auth.router)

# Include user profile routes
app.include_router(users.router)

# Include reports routes
app.include_router(reports.router)


# ============================================================================
# HEALTH CHECK ENDPOINT
# ============================================================================

@app.get("/health")
async def health_check():
    """
    Health check endpoint.
    
    Returns the API status and confirms the server is running.
    This endpoint does NOT require authentication - it's public.
    
    Returns:
        dict: Status message confirming API is operational
    """
    return {
        "status": "ok",
        "message": "AI Fitness Trainer API is running",
        "version": "1.0.0",
        "environment": settings.environment
    }


# ============================================================================
# ROOT ENDPOINT
# ============================================================================

@app.get("/")
async def root():
    """
    Root endpoint - API welcome message.
    
    Returns:
        dict: Welcome message with links to documentation
    """
    return {
        "message": "Welcome to AI Fitness Trainer API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }


# ============================================================================
# FUTURE ROUTES WILL BE ADDED HERE
# ============================================================================
# Example:
# from app.routes import auth, workouts, ai_inference
# app.include_router(auth.router)
# app.include_router(workouts.router)
# app.include_router(ai_inference.router)
