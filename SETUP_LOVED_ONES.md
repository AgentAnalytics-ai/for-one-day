# 🚀 Simple Setup Guide - Loved Ones System

## One-Time Setup (5 minutes)

### Step 1: Run the SQL Migration

1. Open **Supabase Dashboard** → **SQL Editor**
2. Copy and paste the entire contents of `supabase/setup-loved-ones-system.sql`
3. Click **Run** ✅

That's it! This one file sets up everything:
- Creates `loved_ones` table (or renames from `child_email_accounts` if it exists)
- Creates `unsent_messages` table
- Sets up all indexes and RLS policies
- Handles the migration automatically

### Step 2: Create Storage Bucket (Optional - for photos)

**Only needed if you want photo uploads to work:**

1. Go to **Supabase Dashboard** → **Storage**
2. Click **New bucket**
3. Name: `vault`
4. Public: **OFF** (private)
5. Click **Create bucket**

6. Then run `supabase/storage-policies.sql` in the SQL Editor

**Note:** Photos are optional! The app works perfectly without them. You can always add photos later.

## ✅ Done!

Now you can:
- Add loved ones (spouse, children, family, friends) in Settings
- Upload photos (if bucket is set up)
- Create messages to send later
- Everything works!

## Troubleshooting

**Photo upload fails?**
- That's okay! Photos are optional. The loved one will be saved without a photo.
- To fix: Create the `vault` bucket and run `storage-policies.sql`

**Migration errors?**
- If you see "table already exists" errors, that's fine - the migration handles it
- If you see other errors, check that you're running it in the Supabase SQL Editor

