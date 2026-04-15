# Feature 5: Reports System - Complete Testing Guide

## PART C: TESTING GUIDE

### STEP 1: Seed Test Data

#### Option A: Using Swagger UI (Recommended for beginners)

1. **Start the backend server:**
   ```bash
   cd backend
   gradvenv\Scripts\activate
   uvicorn app.main:app --reload --port 8000
   ```

2. **Open Swagger docs:**
   - Navigate to: http://localhost:8000/docs
   - You'll see the interactive API documentation

3. **Authenticate:**
   - Click the "Authorize" button (lock icon) at the top right
   - Enter your Bearer token in the format: `Bearer YOUR_TOKEN_HERE`
   - Get your token from:
     - Browser DevTools → Application → Local Storage → `auth_token`
     - Or login via the frontend and copy the token
   - Click "Authorize" then "Close"

4. **Call the seed endpoint:**
   - Scroll down to "Reports" section
   - Find `POST /reports/seed-test-data`
   - Click "Try it out"
   - Click "Execute"
   - You should see a 200 response with:
     ```json
     {
       "message": "Test data created successfully",
       "report_id": "uuid-here",
       "session_id": "uuid-here"
     }
     ```

#### Option B: Using curl (For command line users)

1. **Get your auth token:**
   - Login via frontend
   - Open DevTools → Application → Local Storage
   - Copy the value of `auth_token`

2. **Run this curl command:**
   ```bash
   curl -X POST "http://localhost:8000/reports/seed-test-data" \
     -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     -H "Content-Type: application/json"
   ```

3. **Expected response:**
   ```json
   {
     "message": "Test data created successfully",
     "report_id": "abc123...",
     "session_id": "def456..."
   }
   ```

---

### STEP 2: Verify in Supabase

#### 2.1 Check exercise_sessions table

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "Table Editor" in the left sidebar
4. Click on "exercise_sessions" table
5. You should see a new row with:
   - `exercise_type`: "squat"
   - `session_name`: "Test Session - Squat Practice"
   - `duration_seconds`: 332
   - `form_score`: 64
   - `performance_rating`: "fair"
   - `total_mistakes`: 12
   - `status`: "completed"
   - `total_frames_processed`: 498
   - `started_at` and `ended_at`: timestamps about 5 minutes apart

#### 2.2 Check reports table

1. In Table Editor, click on "reports" table
2. You should see a new row with:
   - `session_id`: matches the session from step 2.1
   - `exercise_type`: "squat"
   - `form_score`: 64
   - `performance_rating`: "fair"
   - `total_mistakes`: 12
   - `full_report`: Click to expand - should be a large JSONB object

#### 2.3 Inspect the full_report JSONB

Click on the `full_report` field. It should contain:

```json
{
  "session_info": {
    "session_id": "...",
    "user_id": "...",
    "session_name": "Test Session - Squat Practice",
    "duration_seconds": 332,
    "duration_formatted": "05:32",
    "exercise_detected": "squat",
    "total_frames_processed": 498
  },
  "overall_summary": {
    "performance_rating": "fair",
    "message": "Good effort! You completed the session...",
    "total_mistakes": 12,
    "unique_mistake_types": 3,
    "high_risk_warnings": 2
  },
  "mistakes": [
    {
      "mistake_type": "knees_past_toes",
      "mistake_message": "Knees extending too far forward past toes",
      "count": 7,
      "severity": "high",
      "correction_tip": "Keep your weight on your heels...",
      "warning": {
        "level": "critical",
        "message": "This mistake occurred 7 times...",
        "injury_risk": "Repeated knee-over-toe positioning..."
      }
    }
    // ... more mistakes
  ],
  "statistics": {
    "total_mistakes": 12,
    "most_common_mistake": "knees_past_toes",
    "high_frequency_mistakes": ["knees_past_toes"]
  }
}
```

#### 2.4 Verify the JOIN

Run this SQL query in Supabase SQL Editor:

```sql
SELECT 
  r.id,
  r.exercise_type,
  r.form_score,
  r.total_mistakes,
  s.session_name,
  s.duration_seconds
FROM reports r
INNER JOIN exercise_sessions s ON r.session_id = s.id
WHERE r.user_id = 'YOUR_USER_ID_HERE';
```

This should return the joined data showing both report and session info.

---

### STEP 3: Test API Endpoints

#### 3.1 Test GET /reports

**Curl command:**
```bash
curl -X GET "http://localhost:8000/reports" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected response:**
```json
[
  {
    "id": "report-uuid",
    "session_id": "session-uuid",
    "exercise_type": "squat",
    "form_score": 64,
    "performance_rating": "fair",
    "total_mistakes": 12,
    "duration_seconds": 332,
    "session_name": "Test Session - Squat Practice",
    "generated_at": "2026-04-15T...",
    "created_at": "2026-04-15T..."
  }
]
```

**What to verify:**
- ✅ Returns an array (even if only one report)
- ✅ `duration_seconds` and `session_name` are present (from JOIN)
- ✅ Ordered by `generated_at` DESC (newest first)

#### 3.2 Test GET /reports/stats

**Curl command:**
```bash
curl -X GET "http://localhost:8000/reports/stats" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected response:**
```json
{
  "total_sessions": 1,
  "total_minutes": 5.5,
  "average_form_score": 64.0,
  "best_exercise": "squat"
}
```

**What to verify:**
- ✅ `total_sessions` is 1 (or more if you seeded multiple times)
- ✅ `total_minutes` is approximately 5.5 (332 seconds / 60)
- ✅ `average_form_score` is 64.0
- ✅ `best_exercise` is "squat"

#### 3.3 Test GET /reports/{id}

**Curl command:**
```bash
curl -X GET "http://localhost:8000/reports/REPORT_ID_HERE" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Replace `REPORT_ID_HERE` with the actual report ID from step 3.1.

**Expected response:**
```json
{
  "id": "report-uuid",
  "session_id": "session-uuid",
  "full_report": {
    "session_info": { ... },
    "overall_summary": { ... },
    "mistakes": [ ... ],
    "statistics": { ... }
  },
  "exercise_type": "squat",
  "form_score": 64,
  "performance_rating": "fair",
  "total_mistakes": 12,
  "generated_at": "2026-04-15T...",
  "session": {
    "session_name": "Test Session - Squat Practice",
    "duration_seconds": 332,
    "started_at": "2026-04-15T...",
    "ended_at": "2026-04-15T..."
  }
}
```

**What to verify:**
- ✅ `full_report` contains the complete JSONB structure
- ✅ `session` object has all 4 fields
- ✅ `mistakes` array has 3 items
- ✅ At least one mistake has a `warning` object

---

### STEP 4: Test Frontend

#### 4.1 Start the frontend

```bash
cd Ui
npm run dev
```

Navigate to: http://localhost:5173

#### 4.2 Test Reports Page

1. **Login** if not already logged in
2. **Navigate to Reports** (usually `/reports`)
3. **Check the Network tab:**
   - Open DevTools → Network tab
   - You should see two requests:
     - `GET /reports` - returns array of reports
     - `GET /reports/stats` - returns statistics
   - Both should return 200 OK

4. **Verify the UI displays:**
   - ✅ **Summary Stats Cards:**
     - Total Sessions: 1 (not hardcoded 0)
     - Total Minutes: 5.5 (not hardcoded 0)
     - Average Accuracy: 64% (not hardcoded 87%)
   - ✅ **Detailed Feedback Section:**
     - Shows "Squat" as the exercise type
     - Shows the date
     - Shows "5 minutes" duration
     - Shows form score badge (64/100) in yellow/amber color
     - Shows "12 mistakes detected"
     - Has a "View Details" button
   - ✅ **Recent Sessions Table:**
     - One row with the squat session
     - Date column shows today's date
     - Workout Type shows "Squat"
     - Duration shows "5.5 minutes"
     - Form Score shows "64" in yellow badge
     - "View Details" button is clickable

5. **Check for NO references to:**
   - ❌ localStorage.getItem('workout-reports')
   - ❌ mockWorkoutHistory
   - ❌ Hardcoded averageScore: 87

#### 4.3 Test ReportDetail Page

1. **Click "View Details"** on the squat report
2. **Check the Network tab:**
   - Should see `GET /reports/{id}` request
   - Should return 200 OK with full report data

3. **Verify the UI displays:**
   - ✅ **Header Section:**
     - Title: "Squat Report"
     - Session name: "Test Session - Squat Practice"
     - Date: formatted nicely
     - Form score: "64/100" in large text
     - Performance rating badge: "FAIR" in yellow
   - ✅ **Quick Stats:**
     - Duration: "05:32"
     - Frames Analyzed: 498
     - Accuracy: 64%
   - ✅ **Overall Summary:**
     - Shows the friendly message: "Good effort! You completed the session..."
     - Shows total mistakes: 12
     - Shows unique types: 3
     - Shows high risk warnings: 2
   - ✅ **Mistakes Section:**
     - Shows 3 mistake cards
     - Each card has:
       - Mistake message as title
       - "Occurred X times"
       - First seen and last seen timestamps
       - Severity badge (HIGH/MEDIUM/LOW)
       - Green "How to Fix" box with correction tip
       - Timestamps shown as badges (e.g., "00:45", "01:23")
     - At least one mistake has a warning box:
       - Red/yellow background
       - "CRITICAL" or "WARNING" badge
       - Warning message
       - Injury risk description
   - ✅ **Statistics Section:**
     - Most common mistake: "Knees Past Toes"
     - High frequency mistakes list with red dots

4. **Test the back button:**
   - Click "Back to Reports"
   - Should navigate back to `/reports`

---

### STEP 5: Test Error Cases

#### 5.1 Test Empty State (No Reports)

1. **Delete the test report from Supabase:**
   - Go to Table Editor → reports
   - Delete the row
   - Go to exercise_sessions
   - Delete the corresponding session

2. **Refresh the Reports page:**
   - Should show empty state:
     - Target icon
     - "No sessions yet" message
     - "Create Test Data" button

3. **Click "Create Test Data":**
   - Should call the seed endpoint
   - Should automatically refresh and show the new report

#### 5.2 Test Report Not Found

1. **Navigate to a fake report ID:**
   - Go to: http://localhost:5173/reports/00000000-0000-0000-0000-000000000000

2. **Should show 404 error:**
   - Alert icon
   - "Report not found" message
   - "Back to Reports" button

3. **Check Network tab:**
   - `GET /reports/00000000-0000-0000-0000-000000000000`
   - Should return 404 Not Found

#### 5.3 Test Expired Token

1. **Clear localStorage:**
   - DevTools → Application → Local Storage
   - Delete the `auth_token` key

2. **Refresh the Reports page:**
   - Should redirect to `/login`
   - This is handled by the axios interceptor in `client.ts`

3. **Check Network tab:**
   - `GET /reports` returns 401 Unauthorized
   - Interceptor catches it and redirects

#### 5.4 Test Unauthorized Access

1. **Try to access another user's report:**
   - This requires knowing another user's report ID
   - If you try: `GET /reports/{other_user_report_id}`
   - Backend returns 404 (not 403, for security)
   - Frontend shows "Report not found"

---

## DONE CHECKLIST

### Backend
- [ ] `supabase_service.py` has: `get_user_reports`, `get_report_by_id`, `create_report`, `create_session`, `get_user_stats`
- [ ] `reports.py` has: `GET /reports`, `GET /reports/stats`, `GET /reports/{id}`, `POST /reports/seed-test-data`
- [ ] Routes registered in `main.py`
- [ ] `/reports/stats` route comes BEFORE `/reports/{id}` (order matters!)

### Frontend
- [ ] `src/api/reports.ts` created with all interfaces and functions
- [ ] `src/api/index.ts` exports reportsApi
- [ ] `Reports.tsx` fetches from API, shows real data
- [ ] `Reports.tsx` has NO references to localStorage or mockWorkoutHistory
- [ ] `ReportDetail.tsx` fetches by ID, renders full_report fields
- [ ] Form score badges have color coding (green/yellow/red)
- [ ] Exercise types are formatted nicely ("squat" → "Squat")

### Testing
- [ ] Seed endpoint works: data appears in Supabase
- [ ] `GET /reports` returns seeded report in list
- [ ] `GET /reports/stats` returns real numbers (not 0)
- [ ] `GET /reports/{id}` returns full report JSON
- [ ] Reports page shows seeded report in the list
- [ ] Reports page shows real stats (not hardcoded 87%)
- [ ] Clicking a report navigates to ReportDetail
- [ ] ReportDetail shows: performance rating, form score, mistake cards with correction tips, warning boxes
- [ ] Empty state shows when no reports
- [ ] Error state shows when report not found
- [ ] Token expiry redirects to login

---

## Common Issues and Solutions

### Issue 1: "Cannot import reportsApi"
**Solution:** Make sure you ran `npm install` in the Ui folder. The TypeScript types should be recognized.

### Issue 2: "404 on /reports/stats"
**Solution:** Check that `/reports/stats` route is defined BEFORE `/reports/{id}` in `reports.py`. FastAPI matches routes in order.

### Issue 3: "JOIN query returns empty"
**Solution:** Check that the `session_id` in reports table matches an `id` in exercise_sessions table. The `!inner` syntax requires a match.

### Issue 4: "full_report is null"
**Solution:** Check that the seed endpoint is creating the full_report JSONB correctly. It should be a dict, not a string.

### Issue 5: "Stats show 0 even after seeding"
**Solution:** Check that the session has `status='completed'`. The stats query filters by status.

### Issue 6: "Form score badge is always gray"
**Solution:** Check that `form_score` is a number, not null. The color function checks the value.

---

## Next Steps After Testing

Once all tests pass:

1. **Remove the seed endpoint** before production:
   - Delete the `POST /reports/seed-test-data` endpoint from `reports.py`
   - Remove the "Create Test Data" button from `Reports.tsx`

2. **Integrate with AI pipeline:**
   - When a workout session completes, call `create_session()` and `create_report()`
   - Pass the real ReportGenerator output to `create_report()`

3. **Add filtering and sorting:**
   - Filter by exercise type
   - Filter by date range
   - Sort by form score, date, etc.

4. **Add export functionality:**
   - Implement the "Export Report" button
   - Generate PDF or CSV

5. **Add charts:**
   - Progress over time chart using real data
   - Mistake frequency chart
   - Form score trends

---

## Support

If you encounter issues:

1. Check backend logs for detailed error messages
2. Check browser console for frontend errors
3. Check Network tab to see exact API requests/responses
4. Verify Supabase Dashboard shows expected data
5. Try the complete flow from scratch with a new user
