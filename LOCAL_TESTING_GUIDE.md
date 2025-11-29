# 🧪 Local Testing Guide - Media Features

## ✅ Backend Setup Complete
All Supabase setup is done. Time to test the UI components!

---

## 🚀 Quick Start

### 1. Start Development Server
```bash
npm run dev
```

The app should start on `http://localhost:3000`

---

## 📋 Testing Checklist

### ✅ Test 1: Legacy Note Image/Video Uploads

**Steps:**
1. Navigate to `/vault`
2. Click "Create New Note"
3. Fill in title and content
4. Click "Add Photo" button
5. Select an image file
6. Verify:
   - ✅ Image appears in preview gallery
   - ✅ Upload progress spinner shows
   - ✅ Image preview is correct
   - ✅ Can delete image with trash icon

**Test Video Upload:**
- If you're a free user: Should show upgrade modal
- If you're a Pro user: Should allow video upload

**Test Limits:**
- Free users: Should show "3 / 3 attachments added" message
- Should prevent adding more than 3 images

**Save Note:**
- Click "Create Legacy Note"
- Verify note is saved with attachments

---

### ✅ Test 2: View Legacy Note with Attachments

**Steps:**
1. Go to `/vault`
2. Click on a legacy note that has attachments
3. Verify:
   - ✅ Modal opens
   - ✅ Letter content displays
   - ✅ Attachments gallery shows below content
   - ✅ Images display correctly
   - ✅ Videos play correctly (if any)

---

### ✅ Test 3: Reflection Image Uploads

**Steps:**
1. Navigate to `/reflection`
2. Write a reflection
3. Click "Add Photo" button
4. Select one or more images
5. Verify:
   - ✅ Images appear in preview grid
   - ✅ Can delete images before saving
   - ✅ Upload progress shows
6. Click "Save Reflection"
7. Verify:
   - ✅ Reflection saves successfully
   - ✅ Images are saved with reflection
8. Refresh page
9. Verify:
   - ✅ Reflection shows as completed
   - ✅ Images display below reflection text

---

### ✅ Test 4: "This Time Last Year" Memory Card

**Steps:**
1. Create a reflection with images today
2. Note the date
3. Either:
   - **Option A:** Wait until same date next year (not practical!)
   - **Option B:** Manually update a reflection date in Supabase to be exactly one year ago

**Manual Testing Method:**
1. Go to Supabase SQL Editor
2. Find a reflection from one year ago (or create test data):
```sql
-- Find your user_id first
SELECT id FROM auth.users WHERE email = 'your-email@example.com';

-- Then check if reflection exists from one year ago
SELECT * FROM daily_reflections 
WHERE user_id = 'your-user-id'
AND date = (CURRENT_DATE - INTERVAL '1 year')::date;
```

3. If no reflection exists, you can create a test one:
```sql
INSERT INTO daily_reflections (user_id, date, reflection, media_urls)
VALUES (
  'your-user-id',
  (CURRENT_DATE - INTERVAL '1 year')::date,
  'This was my reflection one year ago!',
  ARRAY[]::text[]  -- Or add storage paths if you have images
);
```

4. Go to `/reflection` page
5. Verify:
   - ✅ "This Time Last Year" card appears at bottom
   - ✅ Shows reflection from one year ago
   - ✅ Images display if they exist

---

### ✅ Test 5: Edit Legacy Note with Attachments

**Steps:**
1. Go to `/vault`
2. Find a legacy note with attachments
3. Click edit button
4. Verify:
   - ✅ Existing attachments load
   - ✅ Can add more attachments
   - ✅ Can delete existing attachments
   - ✅ Updates save correctly

---

## 🔍 What to Watch For

### Potential Issues:

1. **Image Upload Fails:**
   - Check browser console for errors
   - Verify Supabase storage bucket exists (`vault` and `media`)
   - Check network tab for API errors

2. **Images Don't Display:**
   - Verify signed URLs are being generated
   - Check storage path is correct
   - Ensure RLS policies allow access

3. **Upload Progress Doesn't Show:**
   - Check browser console
   - Verify upload API is responding
   - Check file size limits (5MB images, 50MB videos)

4. **"This Time Last Year" Not Showing:**
   - Check if reflection exists from one year ago
   - Check browser console for API errors
   - Verify `/api/reflection/memories` endpoint works

---

## 🐛 Debugging Tips

### Check Browser Console
- Open DevTools (F12)
- Look for errors in Console tab
- Check Network tab for failed API calls

### Check Supabase Storage
1. Go to Supabase Dashboard
2. Storage → Browse buckets
3. Verify files are being uploaded:
   - `vault` bucket: Legacy note attachments
   - `media` bucket: Reflection images

### Check Database
```sql
-- Check legacy notes with attachments
SELECT id, title, metadata->'attachments' as attachments
FROM vault_items
WHERE kind = 'letter'
AND metadata->'attachments' IS NOT NULL;

-- Check reflections with images
SELECT date, reflection, media_urls
FROM daily_reflections
WHERE media_urls IS NOT NULL
AND array_length(media_urls, 1) > 0;
```

---

## ✅ Success Criteria

You'll know everything works when:

1. ✅ Can upload images to legacy notes
2. ✅ Images appear in preview gallery
3. ✅ Legacy notes save with attachments
4. ✅ Can view attachments in letter modal
5. ✅ Can upload images to reflections
6. ✅ Reflections save with images
7. ✅ Images display on reflection page
8. ✅ "This Time Last Year" card appears (if reflection exists)
9. ✅ Subscription limits work correctly
10. ✅ Video uploads require Pro (if free user)

---

## 🚨 Common Issues & Fixes

### Issue: "Failed to upload file"
**Fix:** Check Supabase storage bucket exists and RLS policies are set

### Issue: Images don't display after upload
**Fix:** Check signed URL generation - URLs expire after 1 hour

### Issue: Upload progress spinner never stops
**Fix:** Check API endpoint is responding - look for errors in Network tab

### Issue: "This Time Last Year" card doesn't show
**Fix:** Need a reflection from exactly one year ago - create test data if needed

---

## 📝 Test Data Creation

Need test data? Use Supabase SQL Editor:

```sql
-- Create a test reflection from one year ago
INSERT INTO daily_reflections (user_id, date, reflection, media_urls)
SELECT 
  id,
  (CURRENT_DATE - INTERVAL '1 year')::date,
  'This is a test reflection from one year ago!',
  ARRAY[]::text[]
FROM auth.users
WHERE email = 'your-email@example.com'
ON CONFLICT (user_id, date) DO UPDATE
SET reflection = EXCLUDED.reflection;
```

---

## 🎉 Ready to Test!

Run `npm run dev` and start testing! If you encounter any issues, check the debugging tips above or let me know what errors you see.

