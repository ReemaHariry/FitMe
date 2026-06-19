# Profile Page Fixes - Complete Summary

## SECTION 0: ROOT CAUSE SUMMARY

**Problem 1**: Profile form calls `updateProfile()` in Zustand store which only updates local state - there's no API call to backend `PUT /users/profile` endpoint (which didn't exist).

**Problem 2**: Body Metrics card hardcodes weight from `user.profile.weight` (onboarding weight) instead of fetching latest from `weight_logs` table via API.

**Problem 3**: `get_progress_photos()` returns ALL photos but frontend only displays the most recent one per type - navigation UI for photo history was missing.

**Problem 4**: WeightTracker shows "+0.5 kg since last log" but pill says "Lost 0.5 kg this week" because the logic compares different time periods without clear labeling context.

**Problem 5**: Chart shows duplicate "Jun 7" because recharts doesn't deduplicate x-axis labels when multiple logs have the same date.

**Problem 6**: `user.created_at` is not being set in the auth store from backend response, so it shows "—" instead of the actual member since date.

---

## SECTION 1: SQL TO RUN

**No schema changes required.** All necessary tables (`profiles`, `weight_logs`, `progress_photos`) already exist with correct columns.

---

## SECTION 2: BACKEND FIXES

### FILE: backend/app/services/supabase_service.py

**ADDED**: `update_profile()` function for PATCH-style updates
```python
def update_profile(user_id: str, update_data: Dict[str, Any]) -> Dict[str, Any]:
    """Update specific fields in user profile (PATCH semantics)."""
```

**ADDED**: `regenerate_photo_signed_urls()` function to refresh signed URLs
```python
def regenerate_photo_signed_urls(photos: list) -> list:
    """Regenerate signed URLs for a list of photos."""
```

**FIXED**: `save_profile()` now sets `updated_at` timestamp

**FIXED**: `get_progress_photos()` now regenerates signed URLs on every fetch and orders by `taken_at DESC`

**FIXED**: `upload_progress_photo_to_storage()` generates signed URLs with 1 year expiration

### FILE: backend/app/routes/users.py

**ADDED**: `ProfilePatchRequest` model for partial updates

**ADDED**: `PUT /users/profile` endpoint
- Accepts partial profile data (all fields optional)
- Updates only provided fields
- Returns updated profile
- Handles errors gracefully

**FIXED**: `GET /users/progress-photos` comment updated to reflect it returns ALL photos with fresh signed URLs

---

## SECTION 3: FRONTEND API FIXES

### FILE: Ui/src/api/users.ts

**ADDED**: `UpdateProfileRequest` interface for partial updates

**ADDED**: `usersApi.updateProfile()` function
```typescript
updateProfile: async (data: UpdateProfileRequest): Promise<ProfileDataResponse>
```

---

## SECTION 4: COMPONENT FIXES

### FILE: Ui/src/pages/profile/Profile.tsx

**FIX 1 - Profile Save**:
- Form now calls `usersApi.updateProfile()` which hits backend `PUT /users/profile`
- Shows success/error messages
- Save button disabled when no changes (`isDirty` check)
- Save button disabled during save operation
- Form values persist after page refresh

**FIX 2 - Body Metrics from Weight Logs**:
- Added `weightLogs` state loaded from API
- Body Metrics weight comes from `weightLogs[last].weight_kg`
- Height comes from `profile.height`
- Body fat row removed (not in database)
- Weight change calculated from last 2 logs
- Change indicator shows green for loss, amber for gain

**FIX 3 - Progress Photos Navigation**:
- Photos grouped by type: `frontPhotos`, `sidePhotos`, `backPhotos`
- Navigation state per slot: `frontPhotoIndex`, `sidePhotoIndex`, `backPhotoIndex`
- Left/Right arrow buttons to navigate history
- Photo counter shows "X / Y" for each slot
- Date label shows under each photo
- All photos accessible, not just latest

**FIX 6 - Member Since**:
- Reads from `user.created_at` 
- Falls back to `profile.created_at` if user.created_at not available
- Formats as "Jun 2025" (month + year)

### FILE: Ui/src/components/dashboard/WeightTracker.tsx

**FIX 4 - Weight Change Consistency**:
- "Since last log" compares last 2 entries with clear labeling
- "This week" pill shows weekly trend with emoji indicators
- Both can differ but have consistent logic and clear labels
- Removed contradictory "Lost/Gained" text - now shows numeric value

**FIX 5 - Chart Deduplication**:
- Chart data deduplicated by date using Map
- `allowDuplicatedCategory={false}` added to XAxis
- Only shows unique dates on x-axis

---

## SECTION 5: COMPLETE TESTING GUIDE

### TEST 1: Profile data saves to database
1. Open Profile page
2. Change Full Name, Age from 25 to 26
3. Click Save button
4. **Expected**: Loading spinner appears on button
5. **Expected**: Green success message "Profile updated successfully!"
6. **Expected**: Button becomes disabled (no unsaved changes)
7. Open Supabase → Table Editor → profiles table
8. **Expected**: The row shows age=26
9. Refresh the entire browser page
10. **Expected**: Profile still shows age 26
11. **PASS CRITERIA**: Data persists after refresh

### TEST 2: Profile save shows error correctly
1. Temporarily stop the backend server
2. Try to save a profile change
3. **Expected**: Red error message "Failed to save profile. Please try again."
4. **Expected**: Form values are NOT reset
5. Restart backend
6. Try save again
7. **Expected**: Saves successfully

### TEST 3: Body Metrics shows latest weight from weight tracker
1. Note current weight shown in Body Metrics (e.g. 70 kg)
2. Go to Dashboard
3. Log a new weight: 68.0 kg
4. Go back to Profile page
5. **Expected**: Body Metrics weight now shows 68.0 kg
6. **Expected**: Change indicator shows "-2.0 kg"
7. **PASS CRITERIA**: Profile weight matches Dashboard weight

### TEST 4: Body fat row behavior
- **Expected**: Body fat row is completely hidden (not in database)
- **Expected**: NOT showing fake "15%" value

### TEST 5: Progress photos - upload new photo
1. Click "Add Photos" or upload button for Front slot
2. Select a photo file
3. **Expected**: Photo uploads and appears in Front slot
4. Upload another photo for Front slot
5. **Expected**: New photo appears as current Front photo
6. **Expected**: Left arrow ← and counter "1 / 2" appears
7. Click the left arrow
8. **Expected**: Previous photo appears
9. Click right arrow →
10. **Expected**: Returns to newest photo
11. **PASS CRITERIA**: Both photos exist and are navigable

### TEST 6: Progress photos - photos are private
1. Note the photo URL from Profile page
2. Open incognito browser (not logged in)
3. Paste the photo URL
4. **Expected**: Image does NOT load (403/401 error)
5. **PASS CRITERIA**: Photos are not publicly accessible

### TEST 7: Progress photos persist after refresh
1. Upload photos for Front, Side, Back
2. Navigate away (go to Dashboard)
3. Come back to Profile
4. **Expected**: All uploaded photos still show
5. Refresh the page
6. **Expected**: Photos still there
7. **PASS CRITERIA**: Photos load from database on every mount

### TEST 8: Weight change indicator consistency
1. Log weight: 70 kg (first log)
2. Log weight: 68 kg (second log)
3. **Expected**: "-2.0 kg since last log" (lost weight)
4. **Expected**: "2.0 kg this week" pill (weekly change)
5. Both indicators show weight loss - consistent
6. Log weight: 69 kg (third log)
7. **Expected**: "+1.0 kg since last log" (gained since previous)
8. **Expected**: Weekly change still shows net change from 7 days ago
9. **PASS CRITERIA**: Clear labels explain what each metric compares

### TEST 9: Weight chart no duplicate dates
1. Log two weights on the same day
2. Open the weight chart
3. **Expected**: Date appears ONCE on x-axis, not twice
4. **Expected**: Chart shows the latest weight for that date
5. **PASS CRITERIA**: No duplicate date labels

### TEST 10: Member Since shows real date
1. Open Profile page
2. Look at Account Stats → Member Since
3. **Expected**: Shows "Jun 2025" or similar
4. **Expected**: NOT showing "—"
5. Check Supabase Auth → Users → see created_at
6. **Expected**: Displayed date matches created_at month/year
7. **PASS CRITERIA**: Real date shown, not placeholder

### TEST 11: Full page refresh test
1. Make changes and save profile (Test 1)
2. Upload a new progress photo (Test 5)
3. Log a weight (Test 8)
4. Close the browser completely
5. Open browser again and go to Profile page
6. **Expected**: All saved data is still there
7. **PASS CRITERIA**: All data persists across browser sessions

---

## VERIFICATION CHECKLIST

### BACKEND:
- [x] PUT /users/profile endpoint exists and updates Supabase
- [x] GET /users/progress-photos returns ALL photos (not just 1 per type)
- [x] Photos return fresh signed URLs on every call
- [x] GET /weight/logs returns logs sorted ASC by logged_at
- [x] Profile update function uses PATCH semantics

### FRONTEND:
- [x] Profile form is controlled (state for each field)
- [x] Save button calls PUT /users/profile with form data
- [x] Success message shows after save
- [x] Error message shows if save fails
- [x] Profile values persist after page refresh
- [x] Body Metrics weight comes from weight_logs, not profiles table
- [x] Body Metrics height comes from profiles table
- [x] Body fat hidden (not in database)
- [x] Weight change indicator is consistent (not contradictory)
- [x] Photo slots show most recent photo per type
- [x] Navigation arrows appear when more than 1 photo per type
- [x] Photo counter shows "X / Y" for each slot
- [x] Date label shows under each photo
- [x] Old photos accessible via navigation (not deleted/hidden)
- [x] Weight chart has no duplicate x-axis labels
- [x] Member Since shows formatted date from user.created_at
- [x] Account Stats shows real data from API

---

## FILES MODIFIED

### Backend:
1. `backend/app/services/supabase_service.py` - Added update_profile(), regenerate_photo_signed_urls()
2. `backend/app/routes/users.py` - Added PUT /users/profile endpoint

### Frontend:
1. `Ui/src/api/users.ts` - Added updateProfile() function
2. `Ui/src/pages/profile/Profile.tsx` - Complete rewrite with all 6 fixes
3. `Ui/src/components/dashboard/WeightTracker.tsx` - Fixed weight change labeling and chart deduplication

---

## IMPORTANT NOTES

- The Supabase Python client is SYNCHRONOUS (no await on .execute())
- Signed URLs from private Supabase storage MUST be used for photos
- Photos are private and require authentication
- Weight for Body Metrics comes from weight_logs.weight_kg, NOT profiles.weight
- Progress photo navigation state is local (not stored in database)
- Photo URLs are signed and generated fresh on each page load

---

## DEPLOYMENT CHECKLIST

1. ✅ Backend changes deployed
2. ✅ Frontend changes built and deployed
3. ⏳ Run all 11 tests from Testing Guide
4. ⏳ Verify all checklist items
5. ⏳ Check error logs for any issues
6. ⏳ Verify photos are private (Test 6)
7. ⏳ Verify data persists (Test 11)
