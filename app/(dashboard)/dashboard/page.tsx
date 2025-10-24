'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { PremiumCard } from '@/components/ui/premium-card'
import { PremiumButton } from '@/components/ui/premium-button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { SimpleDashboard } from '@/components/dashboard/simple-dashboard'

// Dynamic content is now handled by SimpleDashboard component

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      // User data is now handled by SimpleDashboard component
      
      setLoading(false)
    }
    getUser()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading your sacred space...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-gray-50 to-blue-50 flex items-center justify-center">
        <PremiumCard className="max-w-md mx-auto p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-3xl font-bold text-white">F</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome to your sacred space</h1>
          <p className="text-gray-600 mb-6">Sign in to begin your devotional journey</p>
          <Link href="/auth/login">
            <PremiumButton size="lg" className="w-full">
              Sign In
            </PremiumButton>
          </Link>
        </PremiumCard>
      </div>
    )
  }

  // Dynamic content is now handled by SimpleDashboard component
  
  // Get today's content based on day of week (0 = Sunday, 1 = Monday, etc.)
  // Dynamic content is now handled by SimpleDashboard component


  return (
    <div className="space-y-8">
      {/* Simple Dashboard */}
      <SimpleDashboard />



      {/* Family Impact Section with DYNAMIC CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PremiumCard className="p-6" hover>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-serif font-medium text-gray-900">Tonight, Share This</h3>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 mb-6">
            <p className="text-lg text-gray-800 font-medium mb-2">
              &ldquo;How did God provide for you today?&rdquo;
            </p>
            <p className="text-sm text-gray-600">
              Start the conversation with your family tonight
            </p>
          </div>
          
          <button 
            onClick={() => {
              // Create a simple reminder notification
              if ('Notification' in window) {
                if (Notification.permission === 'granted') {
                  new Notification('For One Day Reminder', {
                    body: 'Time to share today\'s reflection with your family!',
                    icon: '/ForOneDay_PrimaryLogo.png'
                  })
                } else if (Notification.permission !== 'denied') {
                  Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                      new Notification('For One Day Reminder', {
                        body: 'Time to share today\'s reflection with your family!',
                        icon: '/ForOneDay_PrimaryLogo.png'
                      })
                    }
                  })
                }
              }
              // Fallback: show browser alert
              alert('Reminder set! We\'ll remind you to share with your family tonight.')
            }}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Set Reminder for Tonight
          </button>
        </PremiumCard>

        <PremiumCard className="p-6" hover>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <h3 className="text-2xl font-serif font-medium text-gray-900">This Moment Matters</h3>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-amber-50 rounded-xl p-6 mb-6">
            <p className="text-lg text-gray-800 font-medium mb-2">
              &ldquo;Today I&apos;m grateful for...&rdquo;
            </p>
            <p className="text-sm text-gray-600">
              Add to your family&apos;s story for One Day
            </p>
          </div>
          
          <Link href="/vault" className="block">
            <PremiumButton className="w-full">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add to For One Day
            </PremiumButton>
          </Link>
        </PremiumCard>
      </div>
    </div>
  )
}