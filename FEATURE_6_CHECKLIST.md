# FEATURE 6 IMPLEMENTATION CHECKLIST

## ✅ SETUP STEPS (Do these FIRST)

### 1. Create Supabase Storage Bucket (PRIVATE)
- [ ] Go to Supabase Dashboard → Storage
- [ ] Click "New bucket"
- [ ] Name: `workout-videos`
- [ ] Public bucket: **OFF** (keep private)
- [ ] File size limit: 512 MB
- [ ] Click "Create bucket"

### 2. Create Storage Policies
- [ ] Policy 1: "Users can upload to own folder" (INSERT)
  ```sql
  (bucket_id = 'workout-videos' AND auth.uid()::text = (storage.foldername(name))[1])
  ```
- [ ] Policy 2: "Users can read own files only" (SELECT)
  ```sql
  (bucket_id = 'workout-videos' AND auth.uid()::text = (storage.foldername(name))[1])
  ```
- [ ] Policy 3: "Users can delete own files" (DELETE) - optional
  ```sql
  (bucket_id = 'workout-videos' AND auth.uid()::text = (storage.foldername(name))[1])
  ```

### 3. Copy Model Files to Backend
**Windows:**
```cmd
xcopy "Ai_fit final\Ai_fit\FitPose-Detector-main\trained_pose_model" "backend\trained_pose_model" /E /I
```

**Mac/Linux:**
```bash
cp -r "Ai_fit final/Ai_fit/FitPose-Detector-main/trained_pose_model" "backend/"
```

- [ ] Verify files exist:
  - `backend/trained_pose_model/best_model.keras`
  - `backend/trained_pose_model/label_encoder.npy`

### 4. Install AI Libraries
```bash
cd backend
pip install tensorflow==2.18.0 mediapipe==0.10.9 opencv-python==4.10.0.84 scikit-learn
```

- [ ] Installation completed without errors
- [ ] Note: TensorFlow is ~600MB, takes 5-10 minutes

---

## ✅ BACKEND FILES CREATED

- [ ] `backend/app/ai/__init__.py`
- [ ] `backend/app/ai/pose_utils.py`
- [ ] `backend/app/ai/form_checks.py`
- [ ] `backend/app/reports/__init__.py`
- [ ] `backend/app/reports/session_tracker.py`
- [ ] `backend/app/reports/mistake_classifier.py`
- [ ] `backend/app/reports/report_generator.py`
- [ ] `backend/app/services/video_service.py`
- [ ] `backend/app/services/supabase_service.py` (updated with storage functions)
- [ ] `backend/app/routes/videos.py`
- [ ] `backend/app/main.py` (updated with model loading)
- [ ] `backend/app/config.py` (updated with Feature 6 fields)
- [ ] `backend/requirements.txt` (updated with AI libraries)

---

## ✅ FRONTEND FILES CREATED

- [ ] `Ui/src/api/videos.ts`
- [ ] `Ui/src/api/index.ts` (updated)
- [ ] `Ui/src/components/upload/VideoUploadZone.tsx`
- [ ] `Ui/src/components/upload/UploadProgress.tsx`
- [ ] `Ui/src/components/upload/AnalysisStatus.tsx`
- [ ] `Ui/src/pages/VideoUpload.tsx`
- [ ] `Ui/src/pages/dashboard/Dashboard.tsx` (updated with Upload button)
- [ ] `Ui/src/App.tsx` (updated with /upload-video route)

---

## ✅ TESTING CHECKLIST

### Test 1: Backend Startup
- [ ] Start backend: `cd backend && python -m uvicorn app.main:app --reload`
- [ ] Check terminal output for:
  ```
  🚀 AI Fitness Trainer API is starting up...
  📁 Model directory: ./trained_pose_model
  Loading model from ./trained_pose_model/best_model.keras...
  ✅ Model loaded successfully. Classes: [...]
  ```
- [ ] Visit http://localhost:8000/health
- [ ] Verify response includes `"model_loaded": true`

### Test 2: Model Not Loaded (Development Test)
- [ ] Rename `backend/trained_pose_model` to `backend/trained_pose_model_backup`
- [ ] Restart backend
- [ ] Check terminal shows: `⚠️  Model files not found`
- [ ] Visit http://localhost:8000/health
- [ ] Verify response includes `"model_loaded": false`
- [ ] Try to upload video → should get 503 error "AI model is not loaded"
- [ ] Rename folder back to `trained_pose_model`
- [ ] Restart backend

### Test 3: Frontend Startup
- [ ] Start frontend: `cd Ui && npm run dev`
- [ ] Visit http://localhost:5173
- [ ] Login to your account
- [ ] Navigate to Dashboard
- [ ] Verify "Upload Video" button appears next to "Start Training"

### Test 4: Upload Flow - UI Only
- [ ] Click "Upload Video" button
- [ ] Verify page loads at `/upload-video`
- [ ] Verify three exercise cards appear (Squat, Push-up, Sit-up)
- [ ] Click on "Squat" → card should highlight
- [ ] Verify upload zone appears with drag-and-drop area
- [ ] Click upload zone → file picker should open
- [ ] Cancel file picker
- [ ] Verify session name input is optional

### Test 5: File Validation
- [ ] Try to upload a non-video file (e.g., .txt, .jpg)
- [ ] Verify error message: "File type not supported"
- [ ] Try to upload a video > 500MB (if you have one)
- [ ] Verify error message: "File too large"

### Test 6: Complete Upload with Real Video
**Get a test video:**
- Record a 10-15 second video of yourself doing squats
- OR use one from `Ai_fit final/Ai_fit/FitPose-Detector-main/test_videos/`

**Upload process:**
- [ ] Select exercise type: Squat
- [ ] Upload the test video
- [ ] Verify upload progress bar appears (0-100%)
- [ ] After upload completes, verify "Analyzing..." screen appears
- [ ] Watch the animated analysis steps
- [ ] Wait 30-60 seconds for analysis to complete
- [ ] Verify success screen appears with:
  - Green checkmark
  - Form score (0-100)
  - Total mistakes count
  - Performance rating badge
  - "View Full Report" button
  - "Upload Another Video" button

### Test 7: Verify Database Records
After successful upload:
- [ ] Go to Supabase Dashboard → Table Editor
- [ ] Check `exercise_sessions` table:
  - New row with `status='completed'`
  - `video_url` contains storage path (not a URL)
  - `form_score`, `performance_rating`, `total_mistakes` populated
  - `started_at` and `ended_at` timestamps
- [ ] Check `reports` table:
  - New row linked to session
  - `full_report` JSONB field contains complete report
  - Matches the session_id
- [ ] Check Storage → workout-videos bucket:
  - New video file in `{user_id}/{timestamp}_{filename}` format

### Test 8: View Report
- [ ] Click "View Full Report" button
- [ ] Verify redirects to `/reports/{report_id}`
- [ ] Verify ReportDetail page loads
- [ ] Verify mistake cards display correctly
- [ ] Verify correction tips appear
- [ ] Verify session info displays

### Test 9: Reports List
- [ ] Navigate to `/reports`
- [ ] Verify new report appears at top of list
- [ ] Verify form score badge shows correct color
- [ ] Verify exercise type and duration display
- [ ] Click "View Details" → should navigate to report detail

### Test 10: Error Handling
- [ ] Disconnect internet mid-upload → verify timeout error
- [ ] Upload a video with no person visible → verify "No pose detected" error
- [ ] Upload a corrupted video file → verify error message

---

## ✅ BACKEND API ENDPOINTS

### POST /videos/upload
- [ ] Accepts multipart/form-data
- [ ] Required fields: `video` (File), `exercise_name` (string)
- [ ] Optional field: `session_name` (string)
- [ ] Returns 200 with complete analysis results
- [ ] Returns 400 for invalid file type
- [ ] Returns 413 for file too large
- [ ] Returns 503 if model not loaded

### GET /videos/session/{session_id}/status
- [ ] Returns session status
- [ ] Requires authentication
- [ ] Returns 404 if session not found

### GET /health
- [ ] Returns `model_loaded: true/false`
- [ ] Public endpoint (no auth required)

---

## ✅ PRIVATE STORAGE SECURITY

- [ ] Bucket is PRIVATE (not public)
- [ ] Files organized by user_id folder
- [ ] Storage policies enforce user-only access
- [ ] Video URLs are storage paths, not public URLs
- [ ] Signed URLs generated when needed (future feature)

---

## ✅ PERFORMANCE EXPECTATIONS

- **10-second video**: ~10-20 seconds analysis
- **30-second video**: ~30-60 seconds analysis
- **2-minute video**: ~2-4 minutes analysis
- **5-minute video**: ~5-10 minutes analysis

Times vary based on:
- Server CPU speed
- Video resolution
- Number of frames with detected pose

---

## ✅ KNOWN LIMITATIONS

- [ ] Analysis is synchronous (blocks the request)
- [ ] No cancel button during analysis
- [ ] No progress percentage during analysis (only animated steps)
- [ ] Videos stored permanently (no auto-deletion)
- [ ] No video playback in UI (future feature)

---

## ✅ TROUBLESHOOTING

### Model won't load
- Check `backend/trained_pose_model/` exists
- Check files: `best_model.keras` and `label_encoder.npy`
- Check terminal for error messages
- Try: `pip install tensorflow==2.18.0 --upgrade`

### Upload fails with 500 error
- Check backend terminal for full error
- Verify Supabase storage bucket exists
- Verify storage policies are correct
- Check video file is valid (not corrupted)

### "No pose detected" error
- Ensure full body is visible in video
- Ensure good lighting
- Try a different video
- Check video isn't too dark or blurry

### Analysis takes too long
- Normal for long videos (5+ minutes)
- Check server CPU usage
- Consider using shorter test videos
- Wait at least 10 minutes before canceling

---

## 🎉 FEATURE 6 COMPLETE!

Once all checkboxes are ticked, Feature 6 is fully implemented and tested.

Next steps:
- Commit all changes to git
- Push to GitHub
- Consider adding video playback feature
- Consider background job processing for long videos
