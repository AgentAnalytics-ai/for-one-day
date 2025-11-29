import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * 🗑️ Delete Reflection Image API
 * Removes an image from Supabase Storage
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { storage_path } = await request.json()

    if (!storage_path) {
      return NextResponse.json({ error: 'Storage path is required' }, { status: 400 })
    }

    // Verify the file belongs to the user (check path structure)
    if (!storage_path.startsWith(`${user.id}/`)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Delete from storage
    const { error: deleteError } = await supabase.storage
      .from('media')
      .remove([storage_path])

    if (deleteError) {
      console.error('Error deleting image:', deleteError)
      return NextResponse.json({ 
        error: 'Failed to delete image',
        details: deleteError.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Image deleted successfully'
    })

  } catch (error) {
    console.error('Error in delete image API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

