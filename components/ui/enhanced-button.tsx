'use client'

import { ReactNode, useState } from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface EnhancedButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  className?: string
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

/**
 * Enhanced Button with Micro-Interactions
 * 10/10 button experience with delightful animations
 */
export function EnhancedButton({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}: EnhancedButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const [isPressed, setIsPressed] = useState(false)

  const baseClasses = `
    relative inline-flex items-center justify-center
    font-bold rounded-xl transition-all duration-200 ease-out
    focus:outline-none focus:ring-4 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    group overflow-hidden
    active:scale-95
  `

  const variants = {
    primary: `
      bg-gradient-to-r from-primary-700 via-primary-800 to-primary-900
      hover:from-primary-600 hover:via-primary-700 hover:to-primary-800
      text-white shadow-lg shadow-primary-500/25
      hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-0.5
      focus:ring-primary-300
      before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent 
      before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-200
    `,
    secondary: `
      bg-white border-2 border-secondary-200
      hover:border-secondary-300 hover:bg-secondary-50
      text-secondary-800 shadow-md hover:shadow-lg
      focus:ring-secondary-300
    `,
    ghost: `
      bg-transparent hover:bg-primary-50
      text-primary-900 hover:text-primary-800
      focus:ring-primary-300
    `,
    danger: `
      bg-gradient-to-r from-red-500 to-red-600
      hover:from-red-600 hover:to-red-700
      text-white shadow-lg shadow-red-500/25
      hover:shadow-xl hover:shadow-red-500/40 hover:-translate-y-0.5
      focus:ring-red-300
    `
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm min-h-[36px]',
    md: 'px-6 py-3 text-base min-h-[44px]',
    lg: 'px-8 py-4 text-lg min-h-[52px]'
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        isPressed && 'scale-95',
        className
      )}
      {...props}
    >
      {/* Ripple effect on click */}
      <span className="absolute inset-0 rounded-xl bg-white/30 opacity-0 group-active:opacity-100 group-active:animate-ping" />
      
      {loading && (
        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
      )}
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </button>
  )
}
