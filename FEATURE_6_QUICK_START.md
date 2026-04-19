# Feature 6: Quick Start Guide

## 🚀 Get Feature 6 Running in 10 Minutes

### Step 1: Setup Supabase Storage (2 minutes)

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **Storage** → **New bucket**
4. Name: `workout-videos`
5. **Public bucket: OFF** ✅ (keep it private!)
6. File size limit: 512 MB
7. Click **Create bucket**

8. Add policies (Storage → Policies → workout-videos):
   - **Policy 1** (INSERT): Users can upload to own folder
     ```sql
     (bucket_id = 'workout-videos' AND auth.uid()::text = (storage.foldername(name))[1])
     ```
   - **Policy 2** (SELECT): Users can read own files
     ```sql
     (bucket_id = 'workout-videos' AND auth.uid()::text = (storage.foldername(name))[1])
     ```

### Step 2: Copy Model Files (1 minute)

**Windows:**
```cmd
xcopy "Ai_fit final\Ai_fit\FitPose-Detector-main\trained_pose_model" "backend\trained_pose_model" /E /I
```

**Mac/Linux:**
```bash
cp -r "Ai_fit final/Ai_fit/FitPose-Detector-main/trained_pose_model" "backend/"
```

Verify:
```
backend/trained_pose_model/best_model.keras ✅
backend/trained_pose_model/label_encoder.npy ✅
```

### Step 3: Install AI Libraries (5 minutes)

```bash
cd backend
pip install tensorflow==2.18.0 mediapipe==0.10.9 opencv-python==4.10.0.84 scikit-learn
```

⏳ This downloads ~770MB, takes 5-10 minutes.

### Step 4: Start Backend (1 minute)

```bash
cd backend
python -m uvicorn app.main:app --reload
```

✅ Look for this in terminal:
```
🚀 AI Fitness Trainer API is starting up...
Loading model from ./trained_pose_model/best_model.keras...
✅ Model loaded successfully. Classes: [...]
```

✅ Visit http://localhost:8000/health
Should show: `"model_loaded": true`

### Step 5: Start Frontend (1 minute)

```bash
cd Ui
npm run dev
```

✅ Visit http://localhost:5173

### Step 6: Test Upload (2 minutes)

1. Login to your account
2. Go to Dashboard
3. Click **"Upload Video"** button
4. Select **Squat** exercise
5. Upload a test video:
   - Use `Ai_fit final/Ai_fit/FitPose-Detector-main/test_videos/squats.mp4`
   - OR record a 10-second video of yourself doing squats
6. Wait 30-60 seconds for analysis
7. ✅ See results with form score!

---

## ✅ Success Checklist

- [ ] Supabase bucket `workout-videos` created (private)
- [ ] Storage policies added
- [ ] Model files copied to `backend/trained_pose_model/`
- [ ] AI libraries installed
- [ ] Backend starts with "Model loaded successfully"
- [ ] `/health` shows `model_loaded: true`
- [ ] Frontend shows "Upload Video" button on Dashboard
- [ ] Can upload a video and see analysis results
- [ ] Report appears in Reports page
- [ ] Can view report details

---

## 🐛 Troubleshooting

### Model won't load
```
⚠️  Model files not found at ./trained_pose_model
```
**Fix:** Copy model files (Step 2)

### Import errors
```
ModuleNotFoundError: No module named 'tensorflow'
```
**Fix:** Install AI libraries (Step 3)

### 503 Error on upload
```
AI model is not loaded. Contact administrator.
```
**Fix:** Restart backend, check model loaded in terminal

### "No pose detected" error
**Fix:** 
- Ensure full body visible in video
- Use good lighting
- Try a different video

### Upload takes forever
**Normal!** Analysis takes time:
- 10-second video = 10-20 seconds
- 30-second video = 30-60 seconds
- 2-minute video = 2-4 minutes

---

## 📝 Quick Test Script

```bash
# Terminal 1: Backend
cd backend
python -m uvicorn app.main:app --reload

# Terminal 2: Frontend
cd Ui
npm run dev

# Browser: http://localhost:5173
# 1. Login
# 2. Dashboard → Upload Video
# 3. Select Squat
# 4. Upload test video
# 5. Wait for results
```

---

## 🎉 You're Done!

Feature 6 is now fully functional. Users can upload videos and get AI-powered form analysis!

Next: See `FEATURE_6_CHECKLIST.md` for comprehensive testing.
