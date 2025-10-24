'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { PremiumCard } from '@/components/ui/premium-card'
import { PremiumButton } from '@/components/ui/premium-button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ToastContainer } from '@/components/ui/toast'
import { toast } from '@/lib/toast'

interface DailyReflection {
  day: number
  scripture: {
    ref: string
    text: string
  }
  question: string
  date: string
  completed: boolean
  userReflection: string | null
}

export default function ReflectionPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [reflection, setReflection] = useState<DailyReflection | null>(null)
  const [userReflection, setUserReflection] = useState('')
  const [saving, setSaving] = useState(false)
  const [toasts, setToasts] = useState<Array<{ id: string; type: 'success' | 'error' | 'warning' | 'info'; title: string; message?: string }>>([])

  useEffect(() => {
    async function getUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()

    // Set up toast subscription
    const unsubscribe = toast.subscribe(setToasts)
    return unsubscribe
  }, [])

  useEffect(() => {
    if (user) {
      loadReflection()
    }
  }, [user])

  const loadReflection = async () => {
    try {
      const response = await fetch('/api/reflection/daily')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setReflection(data.reflection)
          if (data.reflection.userReflection) {
            setUserReflection(data.reflection.userReflection)
          }
        }
      }
    } catch (error) {
      console.error('Error loading reflection:', error)
      toast.error('Failed to load daily reflection')
    }
  }

  const saveReflection = async () => {
    if (!userReflection.trim()) return

    setSaving(true)
    try {
      const response = await fetch('/api/reflection/daily', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reflection: userReflection.trim()
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          toast.success('Reflection saved!')
          setReflection(prev => prev ? { ...prev, completed: true, userReflection: userReflection.trim() } : null)
        }
      } else {
        toast.error('Failed to save reflection')
      }
    } catch (error) {
      console.error('Error saving reflection:', error)
      toast.error('Failed to save reflection')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Loading today&apos;s reflection...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (!reflection) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No reflection available today. Please try again later.</p>
      </div>
    )
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={(id) => toast.remove(id)} />
      
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-serif font-medium text-gray-900 mb-2">
            Daily Reflection
          </h1>
          <p className="text-gray-600">
            {reflection.completed ? 'Reflection completed!' : 'Take a moment to reflect on God&apos;s word'}
          </p>
        </div>

        {/* Scripture */}
        <PremiumCard className="p-8">
          <div className="text-center">
            <div className="text-lg text-blue-600 font-medium mb-4">
              {reflection.scripture.ref}
            </div>
            <div className="text-xl text-gray-700 italic leading-relaxed mb-6">
              &ldquo;{reflection.scripture.text}&rdquo;
            </div>
            <div className="text-lg text-gray-800 font-medium">
              {reflection.question}
            </div>
          </div>
        </PremiumCard>

        {/* Reflection Input */}
        <PremiumCard className="p-8">
          <h3 className="text-xl font-medium text-gray-900 mb-4">Your Reflection</h3>
          
          <div className="space-y-4">
            <textarea
              value={userReflection}
              onChange={(e) => setUserReflection(e.target.value)}
              placeholder="Write your thoughts on today's scripture and question..."
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={reflection.completed}
            />
            
            {!reflection.completed && (
              <div className="flex justify-end">
                <PremiumButton
                  onClick={saveReflection}
                  disabled={!userReflection.trim() || saving}
                  className="px-6"
                >
                  {saving ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Saving...
                    </>
                  ) : (
                    'Save Reflection'
                  )}
                </PremiumButton>
              </div>
            )}
            
            {reflection.completed && (
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-800 font-medium">Reflection saved!</span>
                </div>
              </div>
            )}
          </div>
        </PremiumCard>

        {/* Next Steps */}
        <PremiumCard className="p-8 text-center">
          <h3 className="text-xl font-medium text-gray-900 mb-4">What&apos;s Next?</h3>
          <p className="text-gray-600 mb-6">
            Consider creating a legacy note to preserve your insights for your family.
          </p>
          <a
            href="/vault"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Create Legacy Note
          </a>
        </PremiumCard>
      </div>
    </>
  )
}
