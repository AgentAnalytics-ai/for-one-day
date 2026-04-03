# 🚀 Quick Start - Where to Find Everything

## Step 1: Run the SQL (You're Already There!)

You have the SQL open in Supabase. Just click **"Run"** button (or press `CTRL + Enter`).

✅ You should see: "Success. No rows returned"

---

## Step 2: Where to Find Each Feature

### 🎯 Feature 1: Onboarding Tour

**Where:** `/vault` page (Legacy Vault)

**How to get there:**
1. Log into your app
2. Click **"Vault"** in the top navigation
3. OR go directly to: `http://localhost:3000/vault`

**What happens:**
- Tour appears automatically after 1.5 seconds (for new users)
- Highlights 2 key areas:
  1. "Your Legacy Notes" section
  2. "Create New Note" button
- You can skip it or complete it
- Never shows again after completion

**To test with existing account:**
```sql
-- Run in Supabase SQL Editor to reset onboarding
UPDATE profiles 
SET onboarding_completed = FALSE 
WHERE user_id = 'YOUR_USER_ID_HERE';
```

---

### 📧 Feature 2: Email Account Management

**Where:** `/settings` page → Scroll down

**How to get there:**
1. Log into your app
2. Click **"Settings"** in the top navigation
3. OR go directly to: `http://localhost:3000/settings`
4. Scroll down past "Subscription Management"
5. Look for: **"Email Accounts for Future Delivery"**

**What you'll see:**
- Setup guide (when no accounts exist)
- "+ Add Email Account" button
- List of saved accounts (after adding)

**Quick test:**
1. Click "+ Add Email Account"
2. Fill in:
   - Child's Name: "Test"
   - Email: "test@gmail.com"
   - Password: "test123"
3. Click "Save"
4. See it appear in the list!

---

## 🧪 Quick Test Checklist

### Test Onboarding Tour:
- [ ] Go to `/vault` page
- [ ] Tour appears (or reset onboarding first)
- [ ] Can click "Next" through steps
- [ ] Can click "Skip tour"
- [ ] Tour doesn't show again after completion

### Test Email Accounts:
- [ ] Go to `/settings` page
- [ ] See "Email Accounts for Future Delivery" section
- [ ] Click "+ Add Email Account"
- [ ] Fill form and save
- [ ] Account appears in list
- [ ] Can click "View Password"
- [ ] Can click "Delete"

---

## 🗺️ Navigation Map

```
Dashboard (/dashboard)
  ├── Today - Main dashboard
  ├── Reflection - Daily reflections
  ├── Vault - Legacy vault ⭐ TOUR IS HERE
  └── Settings - Account settings ⭐ EMAIL MANAGER IS HERE
```

---

## 🔍 Verify Database Setup

Run this to check everything is set up:

```sql
-- Check if table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'child_email_accounts';

-- Check if column exists
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'onboarding_completed';
```

Both should return results if setup correctly.

---

## 🐛 Common Issues

**Tour doesn't appear:**
- Make sure `onboarding_completed = FALSE` in profiles table
- Wait 2-3 seconds (has a delay)
- Check browser console for errors

**Can't see Email Accounts section:**
- Make sure you're on `/settings` page
- Scroll down (it's below Subscription Management)
- Check if SQL migration ran successfully

**Form doesn't save:**
- Check browser console (F12)
- Verify you're logged in
- Make sure `child_email_accounts` table exists

---

## ✨ That's It!

Both features are now live and ready to test. Start with the SQL migration, then navigate to the pages above!

