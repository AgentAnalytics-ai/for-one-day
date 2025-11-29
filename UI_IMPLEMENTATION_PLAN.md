# UI Implementation Plan - Media Features

## ✅ Backend Complete!

All backend infrastructure is ready:
- ✅ Supabase database schema updated
- ✅ Storage buckets configured
- ✅ RLS policies in place
- ✅ API endpoints created
- ✅ File size limits configured

---

## 🎨 UI Components to Build

### Phase 1: Legacy Note Modal (Most Complex)
**File:** `components/ui/create-legacy-note-modal.tsx`

**Features to add:**
1. Image upload button (Instagram-style)
2. Video upload button (Pro-only badge)
3. Attachment preview gallery
4. Upload progress indicators
5. Delete attachment buttons
6. Attachment limit display (3 for free, unlimited for Pro)

**Pattern to follow:** Existing voice recording implementation

---

### Phase 2: Reflection Form (Simple)
**File:** `components/reflection/reflection-form.tsx`

**Features to add:**
1. Image upload button (WhatsApp-style)
2. Image preview grid
3. Delete image buttons
4. Upload images before saving reflection

---

### Phase 3: Vault Display (Medium)
**File:** `app/(dashboard)/vault/page.tsx`

**Features to add:**
1. Update `VaultItem` interface to include `attachments`
2. Display attachments in `LetterModal` component
3. Image gallery (Instagram-style grid)
4. Video player (Facebook-style inline)

---

### Phase 4: Reflection Page (Simple)
**File:** `app/(dashboard)/reflection/page.tsx`

**Features to add:**
1. Display reflection images below text
2. "This Time Last Year" card component
3. Fetch and display memory reflection
4. Show image thumbnails if available

---

## 🚀 Ready to Start UI Implementation

Should I proceed with building all UI components now? I'll start with the legacy note modal and work through each component systematically.

**Estimated time:** 2-3 hours for all components

---

