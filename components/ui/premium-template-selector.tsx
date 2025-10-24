'use client'

import React, { useState, useEffect } from 'react'
import { PremiumCard } from '@/components/ui/premium-card'
import { PremiumButton } from '@/components/ui/premium-button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface LegacyTemplate {
  id: string
  name: string
  description: string
  category: string
  template_content: string
  placeholders: string[]
}

interface PremiumTemplateSelectorProps {
  onSelectTemplate: (template: LegacyTemplate) => void
  onClose: () => void
  isOpen: boolean
}

export function PremiumTemplateSelector({ onSelectTemplate, onClose, isOpen }: PremiumTemplateSelectorProps) {
  const [templates, setTemplates] = useState<LegacyTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    if (isOpen) {
      fetchTemplates()
    }
  }, [isOpen])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/legacy-templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { id: 'all', name: 'All Templates', icon: '📝' },
    { id: 'wedding', name: 'Wedding', icon: '💒' },
    { id: 'graduation', name: 'Graduation', icon: '🎓' },
    { id: 'birthday', name: 'Birthday', icon: '🎂' },
    { id: 'general', name: 'Love Letters', icon: '💝' },
    { id: 'estate', name: 'Estate Planning', icon: '📋' }
  ]

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(template => template.category === selectedCategory)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Premium Legacy Templates</h2>
              <p className="text-gray-600 mt-1">Choose from professionally crafted templates</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Category Filter */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category.id
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-96">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
                <span className="ml-3 text-gray-600">Loading premium templates...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredTemplates.map((template) => (
                  <PremiumCard key={template.id} className="p-6 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {template.name}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {template.description}
                        </p>
                      </div>
                      <div className="ml-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Premium
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="text-xs text-gray-500 mb-2">Template includes:</div>
                      <div className="flex flex-wrap gap-1">
                        {template.placeholders.map((placeholder, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-600"
                          >
                            {placeholder}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <div className="text-xs text-gray-500 mb-1">Preview:</div>
                      <div className="text-sm text-gray-700 line-clamp-3">
                        {template.template_content.substring(0, 150)}...
                      </div>
                    </div>

                    <PremiumButton
                      onClick={() => onSelectTemplate(template)}
                      className="w-full"
                      size="sm"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Use This Template
                    </PremiumButton>
                  </PremiumCard>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Premium Feature:</span> Professional templates with guided prompts
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Pro Members Only
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
