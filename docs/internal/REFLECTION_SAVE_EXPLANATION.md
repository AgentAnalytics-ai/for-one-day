# 📖 How Reflections Work - After Saving

## Where Saved Reflections Appear

After you save a reflection, here's what happens:

### 1. **Same Page, Different View**
- The `/reflection` page will **reload** after saving
- Instead of showing the form, it will show:
  - ✅ "Reflection completed!" message
  - Your saved reflection text (in a green box)
  - All your images displayed in a gallery below

### 2. **"This Time Last Year" Feature**
- Your saved reflections appear in the **"This Time Last Year"** card at the bottom
- Example: If you save a reflection today (Jan 15, 2025), it will show up on Jan 15, 2026
- Shows both your text AND images from that day

### 3. **Daily Reflections**
- Each day, you can save ONE reflection
- If you already saved today's reflection, you'll see the completed view
- Tomorrow, you can write a new reflection

---

## Current Issue: Can't Save

If you're having trouble saving, check these:

### Common Issues:

1. **Images Still Uploading**
   - Wait for all image uploads to finish (spinner should disappear)
   - Check that all images show without a loading spinner

2. **No Reflection Text**
   - Make sure you've written something in the text box
   - Can't save empty reflections

3. **API Error**
   - Open browser console (F12)
   - Look for red error messages
   - Check Network tab for failed API calls

4. **Database Issue**
   - Check Supabase dashboard
   - Verify `daily_reflections` table exists
   - Check for any error messages

---

## Testing Steps:

1. **Write a reflection** in the text box
2. **Add photos** (optional) - wait for uploads to complete
3. **Click "Save Reflection"**
4. **Page reloads** - you should see:
   - Green "Reflection completed!" box
   - Your text displayed
   - Your images in a gallery
   - "This Time Last Year" card at bottom (if you have old reflections)

---

## Debug Checklist:

✅ Write text in reflection box  
✅ Images uploaded completely (no spinners)  
✅ Click "Save Reflection" button  
✅ Check browser console (F12) for errors  
✅ Check Network tab for API response  
✅ Verify Supabase `daily_reflections` table has your entry  

---

## What You'll See After Saving:

```
┌─────────────────────────────────┐
│ ✅ Reflection completed!        │
│                                 │
│ "Your reflection text here..."  │
│                                 │
│ [Image] [Image] [Image]         │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ 🕐 This Time Last Year          │
│ (Shows old reflections)         │
└─────────────────────────────────┘
```

---

## Need Help Debugging?

If saving still doesn't work:

1. Open browser console (F12)
2. Try saving again
3. Copy any error messages you see
4. Share the error message for help!

