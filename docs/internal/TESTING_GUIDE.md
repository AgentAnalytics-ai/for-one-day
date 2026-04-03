# Testing Guide - New Features

## ✅ Step 1: Run the Database Migration

You have the SQL open in Supabase. Just click **"Run"** (or press `CTRL + Enter`).

This creates:
- `child_email_accounts` table
- `onboarding_completed` column in `profiles` table
- Security policies

---

## 🎯 Where to Find Each Feature

### 1. **Onboarding Tour** 
**Location:** `/vault` page (Legacy Vault)

**How it works:**
- Automatically appears for NEW users (who haven't completed onboarding)
- Shows 2 steps:
  1. Highlights "Your Legacy Notes" section
  2. Highlights "Create New Note" button
- Can be skipped or completed
- Never shows again after completion

**To test:**
1. Create a new test account (or reset onboarding for existing user)
2. Go to `/vault` page
3. Tour should appear automatically after 1.5 seconds

---

### 2. **Email Account Management**
**Location:** `/settings` page → Scroll down to "Email Accounts for Future Delivery"

**How it works:**
- Parents can add email accounts for their children
- Includes setup guide with links to Google Family Link
- Stores email + password securely
- Can view password or delete accounts

**To test:**
1. Go to `/settings` page
2. Scroll to "Email Accounts for Future Delivery" section
3. Click "+ Add Email Account"
4. Fill in:
   - Child's Name: "Sarah"
   - Email Address: "sarah.test@gmail.com"
   - Password: "test123"
5. Click "Save"
6. You should see the account in the list
7. Click "View Password" to retrieve it
8. Click "Delete" to remove it

---

## 🧪 Complete Testing Steps

### Test 1: Onboarding Tour (New User Experience)

1. **Create a new test account:**
   ```bash
   # Or just sign up at /auth/signup with a new email
   ```

2. **Reset onboarding for existing user (if testing with existing account):**
   ```sql
   -- Run in Supabase SQL Editor
   UPDATE profiles 
   SET onboarding_completed = FALSE 
   WHERE user_id = 'YOUR_USER_ID';
   ```

3. **Navigate to Vault:**
   - Go to `/vault` or click "Vault" in navigation
   - Wait 1.5 seconds
   - Tour should appear automatically

4. **Test tour interactions:**
   - Click "Next" to go through steps
   - Click "Skip tour" to dismiss
   - Click "Back" to go to previous step
   - Complete the tour

5. **Verify it doesn't show again:**
   - Refresh the page
   - Tour should NOT appear again

---

### Test 2: Email Account Management

1. **Navigate to Settings:**
   - Go to `/settings` or click "Settings" in navigation
   - Scroll down to find "Email Accounts for Future Delivery"

2. **Add an email account:**
   - Click "+ Add Email Account"
   - Fill in the form:
     - Child's Name: "Test Child"
     - Email: "testchild@gmail.com"
     - Password: "mypassword123"
   - Click "Save"
   - Should see success toast

3. **View the account:**
   - Account should appear in the list
   - Shows child name and email

4. **View password:**
   - Click "View Password"
   - Should show password in alert (in production, use secure modal)

5. **Delete account:**
   - Click "Delete"
   - Confirm deletion
   - Account should disappear

6. **Test setup guide:**
   - When no accounts exist, should show setup instructions
   - Links should open Google Family Link in new tab

---

## 🔍 How to Verify Database

### Check if tables exist:
```sql
-- Run in Supabase SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('child_email_accounts', 'profiles');
```

### Check if onboarding flag exists:
```sql
-- Run in Supabase SQL Editor
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'onboarding_completed';
```

### View test data:
```sql
-- Run in Supabase SQL Editor
SELECT * FROM child_email_accounts;
SELECT user_id, onboarding_completed FROM profiles;
```

---

## 🐛 Troubleshooting

### Tour doesn't appear:
- Check if `onboarding_completed` is `FALSE` in profiles table
- Check browser console for errors
- Make sure you're on `/vault` page
- Wait 2-3 seconds (has a delay)

### Email account form doesn't save:
- Check browser console for errors
- Verify `child_email_accounts` table exists
- Check RLS policies are set correctly
- Make sure you're logged in

### Can't see "Email Accounts" section:
- Make sure you're on `/settings` page
- Scroll down (it's below Subscription Management)
- Check if component imported correctly

---

## 📱 Testing on Mobile

Both features work on mobile:
- Tour adapts to smaller screens
- Email form is responsive
- Touch-friendly buttons

---

## ✨ Next Steps After Testing

1. ✅ Verify everything works
2. ✅ Test with real email accounts (optional)
3. ✅ Integrate with scheduled delivery (future feature)
4. ✅ Consider upgrading password encryption (production)

---

## 🎯 Quick Test Checklist

- [ ] SQL migration ran successfully
- [ ] Tour appears for new users on `/vault`
- [ ] Tour can be skipped/completed
- [ ] Tour doesn't show again after completion
- [ ] Email account manager visible in `/settings`
- [ ] Can add email account
- [ ] Can view password
- [ ] Can delete account
- [ ] Setup guide shows when no accounts
- [ ] Everything works on mobile

