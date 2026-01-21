# Spam Protection Recommendations

## Current Situation
- **155 users total** in Supabase
- **Most are spam accounts** with display names like "85.000 Lira Seni Bekliyor - Tek Tıkla Al! https://bit.ly/4nl80Jq"
- **No spam protection** currently implemented
- **No email verification** required
- **No rate limiting** on signups

## Immediate Actions Needed

### 1. **Add Email Verification** (High Priority)
Currently, signups redirect directly to dashboard without email verification. This allows spam accounts to be created instantly.

**Fix:**
```typescript
// In app/auth/actions.ts
export async function signUp(formData: FormData) {
  // ... existing code ...
  
  // Remove this line:
  // redirect('/dashboard')
  
  // Add this instead:
  redirect('/auth/check-email')
}
```

### 2. **Add Display Name Validation** (High Priority)
Block spam keywords and URLs in display names.

**Implementation:**
```typescript
// In app/auth/actions.ts
const fullName = formData.get('full-name') as string

// Validate display name
const spamKeywords = ['85.000', 'Lira', 'bit.ly', 'tinyurl', 'http://', 'https://']
const hasSpam = spamKeywords.some(keyword => 
  fullName.toLowerCase().includes(keyword.toLowerCase())
)

if (hasSpam) {
  redirect('/auth/signup?error=' + encodeURIComponent('Invalid name'))
}
```

### 3. **Add Rate Limiting** (High Priority)
Limit signups per IP address.

**Implementation:**
- Use Vercel Edge Config or Redis
- Limit to 3 signups per IP per hour
- Block IPs that exceed limit

### 4. **Add reCAPTCHA** (Medium Priority)
Add Google reCAPTCHA v3 to signup form.

**Implementation:**
```bash
npm install react-google-recaptcha-v3
```

### 5. **Add Honeypot Field** (Low Priority)
Add hidden field that bots will fill but humans won't.

## Cleanup Existing Spam

### Option 1: Delete Spam Accounts (Recommended)
Run this SQL in Supabase:

```sql
-- First, backup the data
CREATE TABLE spam_users_backup AS
SELECT * FROM auth.users u
JOIN public.profiles p ON p.user_id = u.id
WHERE p.full_name LIKE '%85.000%' OR p.full_name LIKE '%Lira%';

-- Then delete spam accounts
DELETE FROM auth.users 
WHERE id IN (
  SELECT u.id FROM auth.users u
  JOIN public.profiles p ON p.user_id = u.id
  WHERE p.full_name LIKE '%85.000%' 
     OR p.full_name LIKE '%Lira%'
     OR p.full_name LIKE '%http%'
     OR p.full_name LIKE '%bit.ly%'
);
```

### Option 2: Mark as Spam (Safer)
Add a `is_spam` column to profiles table:

```sql
ALTER TABLE public.profiles ADD COLUMN is_spam BOOLEAN DEFAULT false;

UPDATE public.profiles
SET is_spam = true
WHERE full_name LIKE '%85.000%' 
   OR full_name LIKE '%Lira%'
   OR full_name LIKE '%http%'
   OR full_name LIKE '%bit.ly%';
```

Then filter spam accounts in queries:
```sql
SELECT * FROM profiles WHERE is_spam = false;
```

## Webhook Issue for Kreg

### Problem
Kreg paid but his account still shows "free" plan. This means:
1. Stripe webhook didn't fire, OR
2. Webhook fired but failed, OR
3. Webhook endpoint not configured in Stripe Dashboard

### Solution

**Step 1: Check Stripe Dashboard**
1. Go to Stripe Dashboard → Webhooks
2. Verify webhook endpoint is configured: `https://your-domain.com/api/webhooks/stripe`
3. Check webhook events for Kreg's payment

**Step 2: Manually Fix Kreg's Account**
Run the SQL script: `supabase/fix-kreg-subscription.sql`

**Step 3: Verify Webhook Configuration**
1. Check environment variable: `STRIPE_WEBHOOK_SECRET`
2. Check Vercel logs for webhook errors
3. Test webhook endpoint manually

**Step 4: Use Admin API (if needed)**
```bash
curl -X POST https://your-domain.com/api/admin/fix-subscription \
  -H "Content-Type: application/json" \
  -d '{"email": "kcdecker23@outlook.com", "plan": "pro"}'
```

## Prevention Going Forward

1. ✅ **Email Verification Required** - Block unverified accounts
2. ✅ **Display Name Validation** - Block spam keywords
3. ✅ **Rate Limiting** - Limit signups per IP
4. ✅ **reCAPTCHA** - Block bots
5. ✅ **Monitor Signups** - Alert on suspicious patterns

## Next Steps

1. **Immediate:** Fix Kreg's subscription manually
2. **Today:** Add email verification requirement
3. **This Week:** Add display name validation and rate limiting
4. **This Month:** Add reCAPTCHA and monitoring
