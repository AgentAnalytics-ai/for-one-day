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
    font-semibold rounded-xl transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    group overflow-hidden
  `

  const variants = {
    primary: `
      bg-gradient-to-r from-blue-900 to-green-800
      hover:from-blue-800 hover:to-green-700
      text-white shadow-lg shadow-blue-500/25
      hover:shadow-xl hover:shadow-blue-500/40
      focus:ring-blue-500
      before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-200
    `,
    secondary: `
      bg-white border-2 border-green-200
      hover:border-green-300 hover:bg-green-50
      text-green-800 shadow-md
      focus:ring-green-500
    `,
    ghost: `
      bg-transparent hover:bg-blue-50
      text-blue-900 hover:text-blue-800
      focus:ring-blue-500
    `,
    danger: `
      bg-gradient-to-r from-red-500 to-pink-500
      hover:from-red-600 hover:to-pink-600
      text-white shadow-lg shadow-red-500/25
      hover:shadow-xl hover:shadow-red-500/40
      focus:ring-red-500
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
