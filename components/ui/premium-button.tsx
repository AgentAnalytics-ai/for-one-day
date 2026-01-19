'use client'

import { ReactNode } from 'react'
import { LoadingSpinner } from './loading-spinner'

interface PremiumButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  className?: string
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

export function PremiumButton({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}: PremiumButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const baseClasses = `
    relative inline-flex items-center justify-center
    font-bold rounded-xl transition-all duration-300 ease-out
    focus:outline-none focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    group overflow-hidden
  `

  const variants = {
    primary: `
      bg-gradient-to-r from-primary-700 via-primary-800 to-primary-900
      hover:from-primary-600 hover:via-primary-700 hover:to-primary-800
      text-white shadow-lg shadow-primary-500/25
      hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-0.5
      focus:ring-4 focus:ring-primary-300
      active:scale-95
      before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-200
    `,
    secondary: `
      bg-white border-2 border-secondary-200
      hover:border-secondary-300 hover:bg-secondary-50
      text-secondary-800 shadow-md hover:shadow-lg
      focus:ring-4 focus:ring-secondary-300
      active:scale-95
    `,
    ghost: `
      bg-transparent hover:bg-primary-50
      text-primary-900 hover:text-primary-800
      focus:ring-4 focus:ring-primary-300
      active:scale-95
    `,
    danger: `
      bg-gradient-to-r from-red-500 to-red-600
      hover:from-red-600 hover:to-red-700
      text-white shadow-lg shadow-red-500/25
      hover:shadow-xl hover:shadow-red-500/40 hover:-translate-y-0.5
      focus:ring-4 focus:ring-red-300
      active:scale-95
    `
  }

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
      aria-disabled={disabled || loading}
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <LoadingSpinner size="sm" className="mr-2" />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  )
}
