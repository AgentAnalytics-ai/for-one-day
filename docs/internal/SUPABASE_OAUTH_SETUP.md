# 🔐 SUPABASE GOOGLE OAUTH SETUP GUIDE

## 🚨 **CURRENT ISSUE**
Google OAuth shows: `{"code":400,"error_code": "validation_failed", "msg": "Unsupported provider: provider is not enabled"}`

## ✅ **SOLUTION STEPS**

### **Step 1: Enable Google Provider in Supabase**

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project: `for-one-day`

2. **Navigate to Authentication Settings**
   - Click on "Authentication" in the left sidebar
   - Click on "Providers" tab

3. **Enable Google Provider**
   - Find "Google" in the list of providers
   - Toggle the switch to **ON**
   - Click "Configure"

### **Step 2: Configure Google OAuth Credentials**

1. **Get Google OAuth Credentials**
   - Go to: https://console.developers.google.com/
   - Create a new project or select existing one
   - Enable Google+ API
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"

2. **Configure OAuth Consent Screen**
   - Add your app name: "For One Day"
   - Add authorized domains: `yourdomain.com` (when you set up custom domain)
   - For now, add: `localhost:3000` and your Vercel domain

3. **Create OAuth 2.0 Client ID**
   - Application type: "Web application"
   - Authorized JavaScript origins:
     - `http://localhost:3000`
     - `https://your-vercel-domain.vercel.app`
   - Authorized redirect URIs:
     - `https://your-supabase-project.supabase.co/auth/v1/callback`

### **Step 3: Add Credentials to Supabase**

1. **In Supabase Google Provider Settings**
   - Client ID: Paste your Google OAuth Client ID
   - Client Secret: Paste your Google OAuth Client Secret
   - Click "Save"

### **Step 4: Update Environment Variables**

Add to your `.env.local`:
```bash
# Google OAuth (if needed for additional features)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### **Step 5: Test Google Login**

1. **Deploy the updated app**
2. **Test Google login button**
3. **Verify user creation in Supabase Auth**

## 🔧 **MAGIC LINK FIX**

### **Current Issue**: Magic link redirects back to login page

### **Solution**:
1. **Check Supabase Auth Settings**
   - Go to Authentication → Settings
   - Verify "Enable email confirmations" is ON
   - Check "Site URL" is set correctly

2. **Update Site URL**
   - Set to: `https://your-vercel-domain.vercel.app`
   - For development: `http://localhost:3000`

3. **Check Redirect URLs**
   - Add to "Redirect URLs":
     - `https://your-vercel-domain.vercel.app/auth/callback`
     - `http://localhost:3000/auth/callback`

## 🚀 **QUICK FIX COMMANDS**

```bash
# 1. Deploy current fixes
vercel --prod --yes

# 2. Test authentication flows
# - Google OAuth (after Supabase setup)
# - Magic Link (after URL configuration)
# - Email/Password (should work already)
```

## 📋 **TESTING CHECKLIST**

- [ ] Google OAuth enabled in Supabase
- [ ] Google credentials configured
- [ ] Site URL set correctly
- [ ] Redirect URLs configured
- [ ] Test Google login
- [ ] Test Magic Link
- [ ] Test Email/Password
- [ ] Verify user creation in Supabase Auth

## 🆘 **TROUBLESHOOTING**

### **Google OAuth Still Not Working?**
1. Check browser console for errors
2. Verify redirect URIs match exactly
3. Ensure OAuth consent screen is configured
4. Check if domain is verified in Google Console

### **Magic Link Still Redirecting?**
1. Check Supabase logs in dashboard
2. Verify email template settings
3. Check spam folder for magic link emails
4. Ensure Site URL matches your domain

---

**After completing these steps, your authentication should work perfectly! 🎯**
