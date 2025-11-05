# 🚨 Emergency Access Process - How It Works

## Overview

For One Day provides emergency access to legacy letters when a user passes away or becomes incapacitated. This document outlines the process for handling these requests.

---

## User Setup (In Settings)

### Emergency Contact Information
Users can designate:
- **Emergency Contact** (usually spouse or adult child)
  - Name
  - Email
  - Phone (optional)
  - Relationship
  - Enable/disable emergency access

### Executor/Trustee Information  
Users can also designate:
- **Executor** (legal authority)
  - Name
  - Email
  - Phone (optional)
  - Relationship

**Data Storage:** All information stored in `profiles` table with proper encryption.

---

## When Someone Requests Access

### Step 1: Request Submission

**Two Ways to Request:**

**Option A: Via Emergency Access Page**
1. Go to `foroneday.app/emergency-access`
2. Fill out form with:
   - Account holder's name and email
   - Requester's name, email, phone
   - Relationship to account holder
   - Reason (death, incapacitated, missing)
   - Additional verification info
3. Submit → Saves to `emergency_access_requests` table

**Option B: Direct Email**
1. Email `support@foroneday.app`
2. Include same information as above
3. We manually create request record

---

### Step 2: Verification Process

**You (Admin) Check:**

1. **Lookup User in Database:**
   ```sql
   SELECT 
     full_name,
     emergency_contact_name,
     emergency_contact_email,
     emergency_contact_phone,
     executor_name,
     executor_email
   FROM profiles
   WHERE user_id = (
     SELECT id FROM auth.users 
     WHERE email = 'deceased-user-email@example.com'
   );
   ```

2. **Verify Requester Matches:**
   - Does requester email match `emergency_contact_email` or `executor_email`?
   - Does name match?
   - Does relationship make sense?

3. **Request Documentation (if appropriate):**
   - Death certificate
   - Power of attorney
   - Government ID
   - Proof of relationship

4. **Verify in Person (optional):**
   - Video call
   - In-person meeting (if local)
   - Notarized documents

---

### Step 3: Grant Access

**Three Options:**

**Option A: Email All Letters (SIMPLE)**
1. Query user's vault items
2. Compile all letters into PDF
3. Email to verified emergency contact
4. Mark request as "approved" in database

**Option B: Temporary Password Reset (MEDIUM)**
1. Generate password reset link for user's account
2. Send to emergency contact
3. They login and access vault directly
4. Set expiration (30 days)

**Option C: Add to Family (COMPLEX)**
1. Create account for emergency contact (if needed)
2. Add them to user's family_members
3. Grant them access via RLS policies
4. Permanent access to vault

**Recommended:** Start with Option A (email PDFs), upgrade to B/C later.

---

## Response Time SLA

### Free Users
- **3-5 business days** for verification and access
- Email acknowledgment within 24 hours
- Standard verification process

### Pro Users  
- **24-48 hours** for verification and access
- Immediate email acknowledgment
- Priority support line
- Expedited verification

---

## Email Templates

### Acknowledgment Email
```
Subject: Emergency Access Request Received - For One Day

Dear [Requester Name],

We've received your request for emergency access to [Account Holder]'s legacy notes.

Request ID: [ID]
Submitted: [Date]
Estimated response: [3-5 business days / 24-48 hours for Pro]

Next steps:
1. We'll verify your identity and relationship
2. We may contact you for additional documentation
3. Once verified, we'll provide access to the legacy notes

If you have urgent questions, reply to this email.

Best regards,
For One Day Support Team
support@foroneday.app
```

### Verification Request Email
```
Subject: Verification Required - Emergency Access Request

Dear [Requester Name],

To process your emergency access request, we need to verify your identity.

Please provide:
1. Government-issued photo ID
2. [Death certificate / Power of attorney]
3. Proof of relationship to [Account Holder]

You can reply to this email with scanned/photographed documents.

Best regards,
For One Day Support Team
```

### Access Granted Email
```
Subject: Emergency Access Granted - For One Day

Dear [Requester Name],

Your identity has been verified. Attached are the legacy notes from [Account Holder].

This includes:
- [X] letters
- [X] documents
- Created between [dates]

Please keep these safe and private.

If you have any questions, reply to this email.

With sympathy,
For One Day Support Team
```

---

## Security & Privacy

### Data Protection
- ✅ All requests logged in database
- ✅ Verification required before access
- ✅ Audit trail maintained
- ✅ GDPR/Privacy compliant

### Legal Considerations
- Users agree to emergency access in Terms of Service
- We verify identity before granting access
- We maintain records for legal compliance
- We don't provide legal advice (refer to estate attorney if needed)

---

## Admin Tools Needed (Future)

### Phase 1 (Manual Process - NOW)
- Email inbox: support@foroneday.app
- Supabase SQL queries to look up data
- Manual PDF generation
- Email responses

### Phase 2 (Admin Dashboard - Month 2)
- View pending requests
- One-click user lookup
- PDF generation button
- Email template system
- Mark as approved/denied

### Phase 3 (Automation - Month 6)
- Automated email acknowledgments
- Self-service document upload
- Automated PDF delivery after approval
- Analytics on request volume

---

## Marketing This Feature

### Value Propositions

**Free Tier:**
> "Your emergency contact can access your letters... eventually. We verify their identity and deliver within 3-5 business days."

**Pro Tier:**
> "⚡ Priority Emergency Access - 24-hour verification and delivery. Your family gets your letters when they need them most."

### Messaging

**Landing Page:**
> "What happens to your letters if something happens to you? We've got you covered. Designate an emergency contact, and we'll ensure your family receives your legacy - verified, secure, and guaranteed."

**Settings Page:**
> "Peace of mind: If something happens to you, your emergency contact can request access to your legacy notes. We verify their identity and securely deliver your letters to them."

---

## Cost Analysis

### Per-Request Cost (Manual Process)
- Admin time: 30 minutes @ $50/hour = **$25**
- PDF generation: Free
- Email delivery: $0.10
- **Total: ~$25 per request**

### Revenue Impact
- Conversion driver: High
- Retention: Very High  
- Justifies Pro pricing
- Competitive differentiator

**This feature alone could drive 20-30% upgrade conversions.**

---

## FAQ

**Q: What if emergency contact has changed?**
A: We use most recent info in user's settings. Users should keep it updated.

**Q: What if we can't verify identity?**
A: We don't grant access. Better to be safe. Requester can provide more documentation.

**Q: What if multiple people request access?**
A: We prioritize emergency contact, then executor, then we verify case-by-case.

**Q: What if user didn't set up emergency contact?**
A: We can still verify based on other factors, but it takes longer. This becomes a selling point to set it up.

---

## Next Steps to Implement

1. ✅ Add database columns (run SQL migration)
2. ✅ Test settings form saves emergency contact info
3. [ ] Set up support@foroneday.app email inbox
4. [ ] Create internal doc with SQL queries for lookups
5. [ ] Test end-to-end with a real scenario
6. [ ] Add to marketing materials

This feature transforms "abandoned vault" risk into "guaranteed family access" value proposition. It's CRITICAL to your business model.

