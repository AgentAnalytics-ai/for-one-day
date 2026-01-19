'use client'

import { useState, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface EnhancedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

/**
 * Enhanced Input with Micro-Interactions
 * Beautiful form inputs with focus animations
 */
export const EnhancedInput = forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false)

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            {...props}
            onFocus={(e) => {
              setIsFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              props.onBlur?.(e)
            }}
            className={cn(
              'w-full px-4 py-3 border-2 rounded-xl',
              'transition-all duration-200',
              'focus:outline-none focus:ring-4',
              isFocused
                ? 'border-primary-500 ring-primary-300 shadow-lg'
                : 'border-gray-300',
              error && 'border-red-500 ring-red-300',
              'hover:border-primary-400',
              className
            )}
          />
          {/* Focus indicator line */}
          {isFocused && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 animate-in slide-in-from-left duration-300" />
          )}
        </div>
        {error && (
          <p className="text-sm text-red-600 font-medium animate-in fade-in slide-in-from-top-2">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    )
  }
)

EnhancedInput.displayName = 'EnhancedInput'

interface EnhancedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

export const EnhancedTextarea = forwardRef<HTMLTextAreaElement, EnhancedTextareaProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false)

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
            {label}
          </label>
        )}
        <div className="relative">
          <textarea
            ref={ref}
            {...props}
            onFocus={(e) => {
              setIsFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              props.onBlur?.(e)
            }}
            className={cn(
              'w-full px-4 py-3 border-2 rounded-xl resize-none',
              'transition-all duration-200',
              'focus:outline-none focus:ring-4',
              isFocused
                ? 'border-primary-500 ring-primary-300 shadow-lg'
                : 'border-gray-300',
              error && 'border-red-500 ring-red-300',
              'hover:border-primary-400',
              className
            )}
          />
          {/* Focus indicator line */}
          {isFocused && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 animate-in slide-in-from-left duration-300" />
          )}
        </div>
        {error && (
          <p className="text-sm text-red-600 font-medium animate-in fade-in slide-in-from-top-2">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    )
  }
)

EnhancedTextarea.displayName = 'EnhancedTextarea'
