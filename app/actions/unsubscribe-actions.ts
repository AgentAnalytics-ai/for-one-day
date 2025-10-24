'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function unsubscribeUser(formData: FormData) {
  const email = formData.get('email') as string

  if (!email) {
    redirect('/unsubscribe?error=email-required')
  }

  try {
    const supabase = await createClient()
    
    // Find user by email
    const { data: users } = await supabase.auth.admin.listUsers()
    const user = users.users.find(u => u.email === email)
    
    if (!user) {
      redirect('/unsubscribe?error=user-not-found')
    }

    // Update user profile to disable email notifications
    await supabase
      .from('profiles')
      .update({ 
        email_notifications_enabled: false,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)

    // Redirect to success page
    redirect(`/unsubscribe?email=${encodeURIComponent(email)}&success=true`)
  } catch (error) {
    console.error('Unsubscribe error:', error)
    redirect('/unsubscribe?error=processing-error')
  }
}
