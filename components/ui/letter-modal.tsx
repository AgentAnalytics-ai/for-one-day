'use client'

import React from 'react'
import { X, Calendar, User, Heart } from 'lucide-react'

interface LetterModalProps {
  isOpen: boolean
  onClose: () => void
  letter: {
    id: string
    title: string
    description: string
    created_at: string
    metadata?: {
      recipient?: string
      occasion?: string
    }
    kind: string
  }
}

export function LetterModal({ isOpen, onClose, letter }: LetterModalProps) {
  if (!isOpen) return null

  const recipient = letter.metadata?.recipient || 'family'
  const occasion = letter.metadata?.occasion
  const createdAt = new Date(letter.created_at).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  const recipientIcons = {
    daughter: <Heart className="w-4 h-4" />,
    son: <User className="w-4 h-4" />,
    wife: <Heart className="w-4 h-4" />,
    children: <User className="w-4 h-4" />,
    family: <User className="w-4 h-4" />
  }

  const recipientColors = {
    daughter: 'bg-pink-50 border-pink-200 text-pink-800',
    son: 'bg-blue-50 border-blue-200 text-blue-800',
    wife: 'bg-purple-50 border-purple-200 text-purple-800',
    children: 'bg-green-50 border-green-200 text-green-800',
    family: 'bg-gray-50 border-gray-200 text-gray-800'
  }

  const recipientColor = recipientColors[recipient as keyof typeof recipientColors] || recipientColors.family
  const recipientIcon = recipientIcons[recipient as keyof typeof recipientIcons] || recipientIcons.family

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${recipientColor}`}>
                {recipientIcon}
                {recipient === 'family' ? 'Family' : `For ${recipient}`}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                {createdAt}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {letter.title}
            </h2>
            
            {occasion && (
              <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                <div className="flex items-center gap-2 text-purple-700 font-medium">
                  <Calendar className="w-4 h-4" />
                  {occasion}
                </div>
              </div>
            )}

            <div className="prose prose-lg max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {letter.description}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-purple-500 rounded-full" />
              {letter.kind === 'letter' ? 'Letter' : letter.kind}
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
