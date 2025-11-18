# Feature Analysis: Teaching Walkthrough & Child Email Accounts

## Expert Analysis from Meta/Product Expert Perspective

### 1. Teaching/Walkthrough Feature

**What This Is:**
An interactive onboarding experience that guides new users through the app's core features, explaining how to:
- Create their first legacy letter
- Set up scheduled delivery
- Understand the vault system
- Navigate the dashboard

**Implementation Approach:**
- **Tooltip Tour**: Step-by-step overlay that highlights features
- **Progressive Disclosure**: Show features as users need them
- **Contextual Help**: "?" buttons that explain features in context
- **Video Tutorials**: Optional short videos for complex features

**Best Practice (Meta/Google Style):**
- Non-intrusive (can be skipped)
- Saves progress (don't show again if completed)
- Contextual (appears when relevant)
- Mobile-friendly

---

## 2. Child Email Account Feature - LEGAL & TECHNICAL ANALYSIS

### ⚠️ CRITICAL LEGAL CONSIDERATIONS

#### **Google's Terms of Service**
- ❌ **NO automated account creation** - Google explicitly prohibits programmatic account creation
- ❌ **NO API exists** - Google does not provide an API for creating Gmail accounts
- ✅ **Manual creation is allowed** - Parents can create accounts manually for their children

#### **COPPA (Children's Online Privacy Protection Act)**
- ✅ **Legal for parents** - Parents can create accounts for children under 13
- ✅ **Parental consent required** - Must be done by parent/guardian
- ✅ **Account management** - Parents can manage accounts until child is 13+

#### **GDPR (If serving EU users)**
- ✅ **Parental consent** - Required for children under 16
- ✅ **Data protection** - Must securely store credentials
- ✅ **Right to deletion** - Must allow account deletion

### ✅ LEGAL & COMPLIANT SOLUTION

**Instead of automating Gmail creation, we provide:**

1. **Guided Setup Flow**
   - Step-by-step instructions for parents to create Gmail accounts manually
   - Links to Google's Family Link (for children under 13)
   - Clear explanation of why manual creation is required

2. **Secure Credential Storage**
   - Encrypted storage of email addresses and passwords
   - Only accessible by the parent/guardian
   - Can be shared when child is ready (with secure sharing mechanism)

3. **Scheduled Delivery Integration**
   - Letters automatically sent to stored email addresses
   - Works with any email provider (Gmail, Outlook, etc.)
   - No dependency on Google's APIs

### 🔒 SECURITY REQUIREMENTS

1. **Encryption at Rest**
   - Use Supabase Vault encryption or client-side encryption
   - Never store passwords in plain text
   - Use industry-standard encryption (AES-256)

2. **Access Control**
   - Only parent/guardian can view credentials
   - Audit log of who accessed credentials and when
   - Two-factor authentication for credential access

3. **Secure Sharing**
   - Generate secure, time-limited sharing links
   - Require additional verification before sharing
   - Notify parent when credentials are accessed

---

## IMPLEMENTATION PLAN

### Phase 1: Teaching/Walkthrough Feature

**Files to Create:**
- `components/onboarding/tour.tsx` - Main tour component
- `components/onboarding/tooltip.tsx` - Individual tooltip steps
- `lib/onboarding.ts` - Tour configuration and state management

**Database:**
- Add `onboarding_completed` boolean to `profiles` table

**Features:**
- Interactive step-by-step tour
- Progress saving
- Skip option
- Mobile-responsive

---

### Phase 2: Child Email Account Management

**Database Schema:**
```sql
CREATE TABLE child_email_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_name TEXT NOT NULL,
  email_address TEXT NOT NULL,
  email_encrypted TEXT NOT NULL, -- Encrypted password
  provider TEXT DEFAULT 'gmail' CHECK (provider IN ('gmail', 'outlook', 'yahoo', 'other')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  shared_at TIMESTAMPTZ, -- When credentials were shared with child
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT -- Optional notes about the account
);

-- RLS Policies
ALTER TABLE child_email_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own child accounts" ON child_email_accounts
  FOR ALL USING (user_id = auth.uid());
```

**Files to Create:**
- `app/(dashboard)/settings/email-accounts/page.tsx` - Management page
- `components/settings/email-account-form.tsx` - Add/edit form
- `components/settings/email-account-list.tsx` - List of accounts
- `lib/encryption.ts` - Client-side encryption utilities
- `app/api/email-accounts/route.ts` - API for managing accounts

**Features:**
1. **Guided Setup**
   - Instructions for creating Gmail accounts
   - Links to Google Family Link
   - Form to store credentials securely

2. **Credential Management**
   - Add/edit/delete email accounts
   - Encrypted password storage
   - View credentials (with 2FA verification)
   - Share credentials securely

3. **Integration with Scheduled Delivery**
   - Select child email when scheduling delivery
   - Automatic delivery to stored addresses
   - Delivery confirmation tracking

---

## RECOMMENDED APPROACH

### ✅ DO:
1. Provide clear, step-by-step instructions for manual Gmail creation
2. Store credentials securely with encryption
3. Integrate with scheduled delivery system
4. Add teaching/walkthrough for onboarding
5. Support multiple email providers (not just Gmail)

### ❌ DON'T:
1. Attempt to automate Gmail account creation
2. Store passwords in plain text
3. Access Google's APIs without authorization
4. Violate Google's Terms of Service
5. Create accounts without parental consent

---

## USER EXPERIENCE FLOW

1. **Parent wants to set up future email delivery**
   - Clicks "Set up email account for child"
   - Sees guided instructions
   - Creates Gmail account manually (or uses existing)
   - Enters credentials in secure form
   - Credentials encrypted and stored

2. **Parent creates legacy letter**
   - Selects child's email from dropdown
   - Schedules delivery date
   - Letter automatically sent on scheduled date

3. **When child is ready**
   - Parent can securely share credentials
   - Child receives all scheduled letters
   - Child can access their email account

---

## NEXT STEPS

1. ✅ Create teaching/walkthrough component
2. ✅ Design email account management UI
3. ✅ Implement encryption for credentials
4. ✅ Integrate with scheduled delivery
5. ✅ Add legal disclaimers and consent forms
6. ✅ Test security and compliance

