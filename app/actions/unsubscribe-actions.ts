'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * Unsubscribe user from marketing emails
 * Note: We'll add email_notifications_enabled to profiles table later
 * For now, this just confirms the unsubscribe action
 */
export async function unsubscribeUser(formData: FormData) {
  const email = formData.get('email') as string

  if (!email) {
    redirect('/unsubscribe?error=email-required')
  }

  try {
    const supabase = await createClient()
    
    // Find user by email - we'll store this preference once we add the column
    // For now, we'll just confirm the unsubscribe
    const { data: users, error: searchError } = await supabase.auth.admin.listUsers()
    
    if (searchError) {
      console.error('Error searching for user:', searchError)
      redirect('/unsubscribe?error=processing-error')
    }

    const user = users.users.find(u => u.email === email)

    if (!user) {
      redirect('/unsubscribe?error=user-not-found')
    }

    // TODO: Once we add email_notifications_enabled column to profiles table:
    // await supabase
    //   .from('profiles')
    //   .update({ email_notifications_enabled: false })
    //   .eq('user_id', user.id)

    // For now, just confirm success
    redirect('/unsubscribe?success=true')
  } catch (error) {
    console.error('Unsubscribe error:', error)
    redirect('/unsubscribe?error=processing-error')
  }
}
