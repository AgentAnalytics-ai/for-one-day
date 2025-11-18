# 🧪 Professional Tour Testing Guide

## Quick Test Steps

### Option 1: Test with a New Account (Recommended)

1. **Create a new test account:**
   - Go to `/auth/signup`
   - Use a new email (or test email)
   - Sign up and log in

2. **Navigate to Vault:**
   - Click "Vault" in navigation
   - OR go to `/vault` directly

3. **Wait for tour:**
   - Tour appears automatically after 2 seconds
   - You should see:
     - Dark backdrop overlay
     - Blue highlight around target element
     - Professional tooltip with arrow

4. **Test interactions:**
   - Click "Next" to go through steps
   - Click "Back" to go to previous step
   - Click "Skip tour" to dismiss
   - Press `Escape` key to close
   - Click outside tooltip to close

5. **Verify it never shows again:**
   - Refresh the page → Tour should NOT appear
   - Navigate away and back → Tour should NOT appear
   - Log out and log back in → Tour should NOT appear

---

### Option 2: Reset Existing Account for Testing

If you want to test with your existing account:

1. **Get your User ID:**
   ```sql
   -- Run in Supabase SQL Editor
   SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
   ```

2. **Reset onboarding flag:**
   ```sql
   -- Run in Supabase SQL Editor
   UPDATE profiles 
   SET onboarding_completed = FALSE 
   WHERE user_id = 'YOUR_USER_ID_HERE';
   ```

3. **Test the tour:**
   - Go to `/vault` page
   - Tour should appear after 2 seconds
   - Complete or skip the tour

4. **Verify it's marked complete:**
   ```sql
   -- Check if flag is set
   SELECT user_id, onboarding_completed 
   FROM profiles 
   WHERE user_id = 'YOUR_USER_ID_HERE';
   ```
   Should show `onboarding_completed = true`

---

## What to Look For

### ✅ Professional Design
- [ ] Smooth animations (no janky movements)
- [ ] Professional tooltip with gradient icon
- [ ] Clean backdrop blur effect
- [ ] Blue highlight with glow effect
- [ ] Arrow pointing to target element
- [ ] Progress dots showing current step
- [ ] Step counter (e.g., "Step 1 of 2")

### ✅ Functionality
- [ ] Tour appears automatically (2 second delay)
- [ ] Highlights correct elements
- [ ] Tooltip positioned correctly (not off-screen)
- [ ] Smooth scrolling to targets
- [ ] "Next" button works
- [ ] "Back" button works (on step 2)
- [ ] "Skip tour" closes tour
- [ ] Escape key closes tour
- [ ] Clicking outside closes tour

### ✅ One-Time Only
- [ ] Shows on first visit
- [ ] Does NOT show after completion
- [ ] Does NOT show after refresh
- [ ] Does NOT show after logout/login
- [ ] Database flag is set to `true`

### ✅ Responsive Design
- [ ] Works on desktop
- [ ] Works on tablet
- [ ] Works on mobile
- [ ] Tooltip doesn't go off-screen
- [ ] Text is readable on all sizes

---

## Testing Checklist

### First-Time User Experience
- [ ] Sign up with new account
- [ ] Navigate to `/vault`
- [ ] Tour appears after 2 seconds
- [ ] Can complete tour successfully
- [ ] Database shows `onboarding_completed = true`

### Returning User Experience
- [ ] Log in with completed account
- [ ] Navigate to `/vault`
- [ ] Tour does NOT appear
- [ ] Page loads normally

### Edge Cases
- [ ] What if target element doesn't exist? (Should mark as completed)
- [ ] What if user closes browser mid-tour? (Should still mark as completed on next visit)
- [ ] What if database update fails? (Tour should still hide for session)

---

## SQL Queries for Testing

### Check if tour will show:
```sql
SELECT 
  p.user_id,
  p.onboarding_completed,
  u.email
FROM profiles p
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'your-email@example.com';
```

### Reset tour for testing:
```sql
UPDATE profiles 
SET onboarding_completed = FALSE 
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'your-email@example.com'
);
```

### Verify tour was completed:
```sql
SELECT 
  p.user_id,
  p.onboarding_completed,
  p.updated_at
FROM profiles p
WHERE p.user_id = 'YOUR_USER_ID';
```

---

## Common Issues & Solutions

### Tour doesn't appear:
1. Check `onboarding_completed` flag:
   ```sql
   SELECT onboarding_completed FROM profiles WHERE user_id = 'YOUR_ID';
   ```
   If `true`, reset it to `false` for testing

2. Check browser console for errors (F12)

3. Make sure you're on `/vault` page

4. Wait 2-3 seconds (has a delay for page render)

### Tour appears every time:
- Check database: `onboarding_completed` should be `true` after first completion
- Check browser console for database errors
- Verify Supabase connection is working

### Tooltip positioned incorrectly:
- This is normal - tooltip adjusts based on viewport
- On mobile, it may reposition automatically
- Check if it's readable and not cut off

---

## Production Testing

After deploying to Vercel:

1. **Test with real new user:**
   - Sign up on production site
   - Navigate to vault
   - Verify tour appears

2. **Monitor in Supabase:**
   - Check `profiles` table
   - Verify `onboarding_completed` flags are being set

3. **Check analytics (if you have them):**
   - Track how many users complete tour
   - Track how many skip tour

---

## Quick Reset Script

If you want to quickly reset the tour for multiple users:

```sql
-- Reset tour for all users (use carefully!)
UPDATE profiles 
SET onboarding_completed = FALSE;

-- Or reset for specific user
UPDATE profiles 
SET onboarding_completed = FALSE 
WHERE user_id = 'USER_ID_HERE';
```

---

## That's It!

The tour is production-ready and will work automatically. Just make sure:
1. ✅ SQL migration has been run (`onboarding_completed` column exists)
2. ✅ User has a profile in the database
3. ✅ User is logged in
4. ✅ User is on `/vault` page

Happy testing! 🚀

