"""
AI Fitness Trainer API - Main Application Entry Point

This is the core FastAPI application that handles all HTTP requests.
"""

import os
import numpy as np
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings

# Configure TensorFlow and MediaPipe before importing
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"  # Suppress TensorFlow warnings
os.environ["MEDIAPIPE_DISABLE_GPU"] = "1"  # Use CPU only

# Import routers
from app.routes import auth, users, reports, videos

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events.
    
    This is the modern way to handle startup/shutdown in FastAPI (replaces deprecated @app.on_event).
    Code before 'yield' runs on startup, code after 'yield' runs on shutdown.
    """
    # Startup: runs when the server starts
    logger.info("🚀 AI Fitness Trainer API is starting up...")
    logger.info(f"📁 Model directory: {settings.model_dir}")
    logger.info(f"🌍 Environment: {settings.environment}")
    
    # Load AI model if files exist
    model_path = os.path.join(settings.model_dir, "best_model.keras")
    labels_path = os.path.join(settings.model_dir, "label_encoder.npy")
    
    if os.path.exists(model_path) and os.path.exists(labels_path):
        try:
            import tensorflow as tf
            logger.info(f"Loading model from {model_path}...")
            
            # Try loading with compile=False to avoid optimizer issues
            try:
                app.state.model = tf.keras.models.load_model(model_path, compile=False)
            except Exception as e1:
                logger.warning(f"Failed to load best_model.keras: {e1}")
                # Try alternative model file
                alt_model_path = os.path.join(settings.model_dir, "lstm_model.keras")
                if os.path.exists(alt_model_path):
                    logger.info(f"Trying alternative model: {alt_model_path}")
                    app.state.model = tf.keras.models.load_model(alt_model_path, compile=False)
                else:
                    raise e1
            
            app.state.labels = np.load(labels_path, allow_pickle=True)
            app.state.labels = np.array([str(x) for x in app.state.labels])
            app.state.model_loaded = True
            
            logger.info(f"✅ Model loaded successfully. Classes: {app.state.labels}")
            
        except Exception as e:
            logger.error(f"❌ Failed to load model: {e}")
            app.state.model = None
            app.state.labels = None
            app.state.model_loaded = False
    else:
        logger.warning(f"⚠️  Model files not found at {settings.model_dir}. AI analysis will be unavailable.")
        app.state.model = None
        app.state.labels = None
        app.state.model_loaded = False
    
    yield  # Server is now running and handling requests
    
    # Shutdown: runs when the server stops
    logger.info("👋 AI Fitness Trainer API is shutting down...")


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
    allow_origins=settings.cors_origins,  # FIXED: Use config instead of hardcoded
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

# Include video upload routes
app.include_router(videos.router, prefix="/videos", tags=["videos"])


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
        "environment": settings.environment,
        "model_loaded": app.state.model_loaded if hasattr(app.state, 'model_loaded') else False
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
