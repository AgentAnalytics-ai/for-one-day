'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

/**
 * 🎨 Error & Success Display Component
 * Professional feedback system for user actions
 */

export function ErrorSuccessDisplay() {
  const searchParams = useSearchParams()
  const [visible, setVisible] = useState(false)
  
  const error = searchParams.get('error')
  const success = searchParams.get('success')
  const message = error || success
  const type = error ? 'error' : 'success'
  
  useEffect(() => {
    if (message) {
      setVisible(true)
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => setVisible(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])
  
  if (!message || !visible) return null
  
  return (
    <div className={`mb-6 rounded-xl border p-4 ${
      type === 'error' 
        ? 'bg-red-50 border-red-200' 
        : 'bg-green-50 border-green-200'
    }`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {type === 'error' ? (
            <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ) : (
            <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
        
        <div className="flex-1">
          <p className={`text-sm font-medium ${
            type === 'error' ? 'text-red-800' : 'text-green-800'
          }`}>
            {decodeURIComponent(message)}
          </p>
        </div>
        
        <button
          onClick={() => setVisible(false)}
          className={`flex-shrink-0 rounded-md p-1.5 hover:bg-opacity-20 transition-colors ${
            type === 'error' 
              ? 'text-red-400 hover:bg-red-600' 
              : 'text-green-400 hover:bg-green-600'
          }`}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
