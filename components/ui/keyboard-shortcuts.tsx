'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  action: () => void
  description: string
}

/**
 * Keyboard Shortcuts Provider
 * Desktop power-user features
 */
export function KeyboardShortcuts() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const shortcuts: KeyboardShortcut[] = [
      {
        key: 'd',
        ctrl: true,
        action: () => router.push('/dashboard'),
        description: 'Go to Dashboard'
      },
      {
        key: 'v',
        ctrl: true,
        action: () => router.push('/vault'),
        description: 'Go to Vault'
      },
      {
        key: 's',
        ctrl: true,
        action: () => router.push('/settings'),
        description: 'Go to Settings'
      },
      {
        key: 'u',
        ctrl: true,
        action: () => router.push('/upgrade'),
        description: 'Go to Upgrade'
      },
      {
        key: '?',
        action: () => {
          // Show keyboard shortcuts modal (to be implemented)
          console.log('Keyboard shortcuts help')
        },
        description: 'Show Keyboard Shortcuts'
      }
    ]

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return
      }

      shortcuts.forEach((shortcut) => {
        const ctrlMatch = shortcut.ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase()

        if (ctrlMatch && shiftMatch && keyMatch) {
          e.preventDefault()
          shortcut.action()
        }
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [router, pathname])

  return null
}

/**
 * Keyboard Shortcuts Help Modal
 */
export function KeyboardShortcutsHelp({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null

  const shortcuts = [
    { keys: 'Ctrl/Cmd + D', description: 'Go to Dashboard' },
    { keys: 'Ctrl/Cmd + V', description: 'Go to Vault' },
    { keys: 'Ctrl/Cmd + S', description: 'Go to Settings' },
    { keys: 'Ctrl/Cmd + U', description: 'Go to Upgrade' },
    { keys: '?', description: 'Show this help' }
  ]

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl border-2 border-primary-200 animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-serif font-bold text-gray-900">
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <span className="text-sm text-gray-600">{shortcut.description}</span>
              <kbd className="px-3 py-1 bg-white border-2 border-gray-300 rounded-lg text-sm font-mono font-semibold text-gray-700 shadow-sm">
                {shortcut.keys}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Press <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">?</kbd> anytime to show this help
          </p>
        </div>
      </div>
    </div>
  )
}
