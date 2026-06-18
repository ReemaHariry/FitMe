import os
import numpy as np
import logging
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
os.environ["MEDIAPIPE_DISABLE_GPU"] = "1"

# Original routers
from app.routes import auth, users, reports, videos, sessions, dashboard

# New feature routers
from app.routes import nutrition, workout_plan

from app.websockets.live_handler import handle_live_session

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 AI Fitness Trainer API is starting up...")
    logger.info(f"📁 Model directory: {settings.model_dir}")
    logger.info(f"🌍 Environment: {settings.environment}")

    model_path  = os.path.join(settings.model_dir, "best_model.keras")
    labels_path = os.path.join(settings.model_dir, "label_encoder.npy")

    if os.path.exists(model_path) and os.path.exists(labels_path):
        try:
            import tensorflow as tf
            logger.info(f"Loading model from {model_path}...")
            try:
                app.state.model = tf.keras.models.load_model(model_path, compile=False)
            except Exception as e1:
                logger.warning(f"Failed to load best_model.keras: {e1}")
                alt = os.path.join(settings.model_dir, "lstm_model.keras")
                if os.path.exists(alt):
                    app.state.model = tf.keras.models.load_model(alt, compile=False)
                else:
                    raise e1
            app.state.labels = np.load(labels_path, allow_pickle=True)
            app.state.labels = np.array([str(x) for x in app.state.labels])
            app.state.model_loaded = True
            logger.info(f"✅ Model loaded. Classes: {app.state.labels}")
        except Exception as e:
            logger.error(f"❌ Failed to load model: {e}")
            app.state.model = None
            app.state.labels = None
            app.state.model_loaded = False
    else:
        logger.warning(f"⚠️  Model files not found at {settings.model_dir}.")
        app.state.model = None
        app.state.labels = None
        app.state.model_loaded = False

    yield
    logger.info("👋 AI Fitness Trainer API is shutting down...")


app = FastAPI(
    title="AI Fitness Trainer API",
    version="1.0.0",
    description="Backend API for AI-powered fitness training and form correction",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Original routers ──────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(reports.router)
app.include_router(videos.router,    prefix="/videos",   tags=["videos"])
app.include_router(sessions.router,  prefix="/sessions", tags=["sessions"])
app.include_router(dashboard.router, prefix="/dashboard",tags=["dashboard"])

# ── New feature routers ───────────────────────────────────────────────────────
app.include_router(nutrition.router)
app.include_router(workout_plan.router)


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/health")
async def health_check():
    from app.services.session_service import get_active_session_count
    return {
        "status": "ok",
        "message": "AI Fitness Trainer API is running",
        "version": "1.0.0",
        "environment": settings.environment,
        "model_loaded": getattr(app.state, "model_loaded", False),
        "active_live_sessions": get_active_session_count(),
    }


@app.get("/")
async def root():
    return {"message": "Welcome to AI Fitness Trainer API", "docs": "/docs"}


# ── WebSocket ─────────────────────────────────────────────────────────────────
@app.websocket("/ws/live/{session_id}")
async def websocket_live(websocket: WebSocket, session_id: str):
    await handle_live_session(websocket, session_id)