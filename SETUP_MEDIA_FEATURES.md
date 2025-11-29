# Media Features Setup Guide

This guide will walk you through setting up the new media features for legacy letters and daily reflections.

## 📋 Prerequisites

- Supabase project already created
- Storage buckets already exist (`vault` and `media`)
- Database schema already set up

## 🚀 Setup Steps

### Step 1: Run Supabase SQL Files

Run these SQL files in your Supabase SQL Editor (in order):

1. **Add reflection media support**
   ```bash
   Run: supabase/add-reflection-media.sql
   ```
   This adds the `media_urls` column to `daily_reflections` table.

2. **Update vault bucket limits**
   ```bash
   Run: supabase/update-vault-limits.sql
   ```
   This increases file size limit to 50MB and adds image/video MIME types.

3. **Add media bucket policies**
   ```bash
   Run: supabase/media-storage-policies.sql
   ```
   This adds RLS policies for the `media` bucket.

### Step 2: Verify Storage Buckets

Ensure both buckets exist in Supabase Storage dashboard:

1. **`vault` bucket**
   - Public: **OFF** (Private)
   - File size limit: 50MB (after running SQL)
   - MIME types: audio, image, video (after running SQL)

2. **`media` bucket**
   - Public: **OFF** (Private)
   - File size limit: 5MB (default is fine for reflection images)
   - MIME types: image/* (default)

### Step 3: Verify Configuration

Check that `next.config.mjs` has been updated:
- `bodySizeLimit: '60mb'` (for video uploads)

## ✅ Feature Limits

### Free Tier
- **Legacy Letter Images**: 3 attachments per letter
- **Legacy Letter Videos**: Not available (Pro-only)
- **Reflection Images**: Unlimited
- **Image Size**: 5MB max
- **Video Size**: N/A

### Pro Tier
- **Legacy Letter Images**: Unlimited
- **Legacy Letter Videos**: Unlimited
- **Reflection Images**: Unlimited
- **Image Size**: 10MB max
- **Video Size**: 50MB max

## 🎯 New API Endpoints

1. **POST `/api/vault/upload-attachment`**
   - Uploads images/videos for legacy letters
   - Handles subscription limits automatically

2. **POST `/api/reflection/upload-image`**
   - Uploads images for daily reflections
   - Free for all users

3. **GET `/api/reflection/memories?date=YYYY-MM-DD`**
   - Returns reflection from "this time last year"
   - Free for all users

## 📁 Storage Structure

### Legacy Letter Attachments
```
vault/
  └── {user_id}/
      └── letters/
          └── {vault_item_id}/
              ├── image1.jpg
              ├── image2.jpg
              └── video1.mp4
```

### Reflection Images
```
media/
  └── {user_id}/
      └── reflections/
          └── {date}/  (YYYY-MM-DD)
              ├── image1.jpg
              └── image2.jpg
```

## 🔒 Security

- All files are stored in private buckets
- RLS policies ensure users can only access their own files
- Signed URLs are used for file access (1-hour expiry)
- File size limits enforced at API level
- Subscription limits enforced at API level

## 🧪 Testing

1. **Test legacy letter image upload**
   - Create a legacy letter
   - Add 1-3 images (free) or unlimited (Pro)
   - Verify images display correctly

2. **Test legacy letter video upload**
   - Create a legacy letter
   - Try adding video (should fail on free tier)
   - Upgrade to Pro and retry (should succeed)

3. **Test reflection image upload**
   - Create a daily reflection
   - Add images
   - Verify images display correctly

4. **Test "this time last year"**
   - Create a reflection today
   - Wait 1 year or manually set date
   - Verify "this time last year" shows correct reflection

## 📝 Next Steps

After running the SQL files:
1. ✅ API endpoints are ready
2. ⏳ UI components need to be updated (coming next)
3. ⏳ Frontend integration (coming next)

## 🆘 Troubleshooting

**Issue**: Upload fails with "Unauthorized"
- **Solution**: Check that storage bucket policies have been applied

**Issue**: File size error
- **Solution**: Verify bucket file size limits match API limits

**Issue**: MIME type error
- **Solution**: Check that bucket allows the file type you're uploading

**Issue**: Signed URL not working
- **Solution**: Ensure storage bucket is private (not public)

---

✅ **Setup Complete!** The backend is now ready for media features.

