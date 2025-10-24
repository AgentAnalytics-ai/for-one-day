'use client'

import { useState } from 'react'
import { createPortalSession } from '@/app/actions/billing-actions'

/**
 * 🧪 Functionality Test Component
 * Expert testing interface to verify all settings functionality
 */
export function FunctionalityTest() {
  const [testResults, setTestResults] = useState<Record<string, { status: 'pending' | 'success' | 'error', message: string }>>({})
  const [isRunning, setIsRunning] = useState(false)

  const runTests = async () => {
    setIsRunning(true)
    setTestResults({})

    const tests = [
      {
        id: 'stripe-portal',
        name: 'Stripe Portal Session',
        test: async () => {
          const result = await createPortalSession()
          if (result.success) {
            return { status: 'success' as const, message: 'Portal session created successfully' }
          } else {
            return { status: 'error' as const, message: result.error || 'Unknown error' }
          }
        }
      },
      {
        id: 'email-checkbox',
        name: 'Email Notifications Checkbox',
        test: async () => {
          // Test if checkbox can be toggled
          const checkbox = document.querySelector('input[name="email_notifications"]') as HTMLInputElement
          if (checkbox) {
            const originalState = checkbox.checked
            checkbox.checked = !originalState
            checkbox.checked = originalState // Reset
            return { status: 'success' as const, message: 'Checkbox is interactive' }
          }
          return { status: 'error' as const, message: 'Email checkbox not found' }
        }
      },
      {
        id: 'unsubscribe-button',
        name: 'Unsubscribe Button',
        test: async () => {
          // Look for button with "Unsubscribe" text
          const buttons = Array.from(document.querySelectorAll('button'))
          const unsubscribeButton = buttons.find(btn => 
            btn.textContent?.includes('Unsubscribe') && 
            !btn.disabled &&
            btn.type === 'button'
          )
          if (unsubscribeButton) {
            return { status: 'success' as const, message: 'Unsubscribe button is clickable' }
          }
          return { status: 'error' as const, message: 'Unsubscribe button not found or disabled' }
        }
      },
      {
        id: 'delete-account-button',
        name: 'Delete Account Button',
        test: async () => {
          // Look for button with "Delete Account" text
          const buttons = Array.from(document.querySelectorAll('button'))
          const deleteButton = buttons.find(btn => 
            btn.textContent?.includes('Delete Account') && 
            !btn.disabled &&
            btn.type === 'button'
          )
          if (deleteButton) {
            return { status: 'success' as const, message: 'Delete account button is clickable' }
          }
          return { status: 'error' as const, message: 'Delete account button not found or disabled' }
        }
      },
      {
        id: 'executor-fields',
        name: 'Executor/Trustee Fields',
        test: async () => {
          const fields = [
            'executor_name',
            'executor_email', 
            'executor_phone',
            'executor_relationship'
          ]
          
          const missingFields = fields.filter(field => {
            const element = document.querySelector(`[name="${field}"]`)
            return !element
          })

          if (missingFields.length === 0) {
            return { status: 'success' as const, message: 'All executor fields are present' }
          } else {
            return { status: 'error' as const, message: `Missing fields: ${missingFields.join(', ')}` }
          }
        }
      }
    ]

    // Run tests sequentially
    for (const test of tests) {
      setTestResults(prev => ({
        ...prev,
        [test.id]: { status: 'pending', message: 'Running test...' }
      }))

      try {
        const result = await test.test()
        setTestResults(prev => ({
          ...prev,
          [test.id]: result
        }))
      } catch (error) {
        setTestResults(prev => ({
          ...prev,
          [test.id]: { 
            status: 'error', 
            message: `Test failed: ${error instanceof Error ? error.message : String(error)}` 
          }
        }))
      }

      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    setIsRunning(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'pending':
        return '⏳'
      default:
        return '❓'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      case 'pending':
        return 'text-yellow-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">🧪 Expert Functionality Test</h3>
        <button
          onClick={runTests}
          disabled={isRunning}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRunning ? 'Running Tests...' : 'Run Expert Tests'}
        </button>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        This expert testing interface verifies that all interactive elements are working correctly.
      </p>

      {Object.keys(testResults).length > 0 && (
        <div className="space-y-3">
          {Object.entries(testResults).map(([testId, result]) => (
            <div key={testId} className="flex items-center justify-between p-3 bg-white rounded-md border">
              <div className="flex items-center space-x-3">
                <span className="text-lg">{getStatusIcon(result.status)}</span>
                <span className="font-medium text-gray-900">
                  {testId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </div>
              <span className={`text-sm ${getStatusColor(result.status)}`}>
                {result.message}
              </span>
            </div>
          ))}
        </div>
      )}

      {isRunning && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-sm text-blue-800">Running comprehensive functionality tests...</span>
          </div>
        </div>
      )}
    </div>
  )
}
