# 🧪 Testing Unsent Messages Feature

## ✅ Prerequisites

1. **Database tables created** ✅ (You just did this!)
2. **Storage bucket exists** (Check below)
3. **Resend API key configured** (For sending emails)

## 📋 Step-by-Step Test Flow

### Step 1: Verify Storage Bucket

1. Go to Supabase Dashboard → **Storage**
2. Check if `vault` bucket exists
3. If not, create it:
   - Name: `vault`
   - Public: **OFF** (Private)
   - Click "Create bucket"

### Step 2: Test Email Account Creation

1. Open your app: `http://localhost:3001` (or your dev URL)
2. Log in to your account
3. Go to **Settings** (new link in nav)
4. Scroll to **"Email Accounts for Future Delivery"**
5. Click **"+ Add Email Account"**
6. Fill in:
   - Child's Name: `Sarah`
   - Email Address: `sarah.test@gmail.com` (or any test email)
   - Password: `testpassword123`
7. Click **"Save"**
8. ✅ Should see: "Email account saved securely"
9. ✅ Should see the account listed below

### Step 3: Test Creating Unsent Message

1. Go to **Vault** (from nav)
2. Scroll to **"Unsent Messages"** section (at top)
3. Click **"+ New Message"**
4. Fill in:
   - Child's Name: `Sarah` (must match email account name)
   - Photo: (Optional - upload a test image)
   - Message Title: `A Letter for Your Wedding Day`
   - Your Message: `Dear Sarah, I wanted to write this letter...`
5. Click **"Save Message"**
6. ✅ Should see: "Message saved! You can send it when ready."
7. ✅ Should see a card with Sarah's info and your message preview

### Step 4: Test Sending Message

1. In the Unsent Messages section, find your message card
2. Check that it shows: **"✓ Email Created"** badge
3. Click **"Send Now"** button
4. Confirm the dialog
5. ✅ Should see: "Message sent! ✉️"
6. ✅ Check the email inbox (sarah.test@gmail.com)
7. ✅ Email should arrive from "For One Day <hello@foroneday.app>"

### Step 5: Test Onboarding Tour

1. **Reset tour** (if you want to see it again):
   - In Supabase SQL Editor, run:
   ```sql
   UPDATE profiles 
   SET onboarding_completed = FALSE 
   WHERE user_id = 'YOUR_USER_ID';
   ```
2. Log out and log back in
3. ✅ Tour should appear automatically
4. ✅ Should guide through: Today → Reflection → Vault → Settings

## 🐛 Troubleshooting

### "Failed to upload photo"
- Check `vault` bucket exists in Supabase Storage
- Check bucket is private (not public)
- Check RLS policies allow uploads

### "No email account found"
- Make sure child name in message matches email account name exactly
- Check email account was created successfully in Settings

### "Failed to send email"
- Check `RESEND_API_KEY` is set in `.env.local`
- Check Resend account is active
- Check email address is valid

### Tour not showing
- Check `onboarding_completed` is `FALSE` in `profiles` table
- Check browser console for errors
- Try refreshing the page

## ✅ Success Checklist

- [ ] Can create email account in Settings
- [ ] Can create unsent message in Vault
- [ ] Can upload child photo
- [ ] Message preview shows correctly
- [ ] Can send message via email
- [ ] Email arrives in inbox
- [ ] Tour guides through all steps
- [ ] Everything works on mobile

## 🎉 You're Done!

Once all tests pass, the feature is ready for users!

