# AI Fitness Trainer - Graduation Project

Full-stack AI-powered fitness training application with real-time form correction.

## Project Structure

```
├── backend/                    # FastAPI Backend
│   ├── app/                   # Main application
│   │   ├── main.py           # FastAPI app + health endpoint
│   │   ├── config.py         # Environment configuration
│   │   ├── routes/           # API endpoints (future)
│   │   ├── services/         # Business logic (future)
│   │   ├── ai/               # AI model integration (future)
│   │   ├── reports/          # Report generation (future)
│   │   └── websockets/       # Real-time features (future)
│   ├── .env                  # Environment variables
│   ├── requirements.txt      # Python dependencies
│   └── start_server.bat/sh   # Quick start scripts
│
├── Ui/                        # React Frontend
│   ├── src/                  # Source code
│   └── package.json          # Node dependencies
│
└── Ai_fit final/             # AI Models & Training
    └── Ai_fit/FitPose-Detector-main/
        ├── form_checks.py            # Form validation rules
        ├── session_tracker.py        # Session tracking
        ├── mistake_classifier.py     # Mistake categorization
        ├── report_generator.py       # Report generation
        ├── main_with_reporting.py    # Enhanced main with reports
        └── trained_pose_model/       # Trained AI models
```

## Quick Start

### Backend (FastAPI)
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
source venv/bin/activate       # Mac/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Test: http://localhost:8000/health

### Frontend (React)
```bash
cd Ui
npm install
npm run dev
```

## Features

- ✅ Real-time pose detection with MediaPipe
- ✅ Exercise classification (squats, push-ups, sit-ups)
- ✅ Form correction feedback
- ✅ Session tracking and reporting
- ✅ Injury risk warnings
- ✅ Video upload analysis
- ✅ Live camera training

## Tech Stack

**Backend:** FastAPI, Python, TensorFlow, MediaPipe  
**Frontend:** React, TypeScript, Vite  
**Database:** Supabase (to be integrated)  
**AI:** LSTM model for exercise classification
