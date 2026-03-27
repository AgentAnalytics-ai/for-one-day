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
    font-semibold rounded-xl transition-all duration-200 ease-out
    focus:outline-none focus:ring-offset-2 focus:ring-offset-white
    disabled:opacity-50 disabled:cursor-not-allowed
    group
  `

  const variants = {
    primary: `
      bg-primary-900 hover:bg-primary-800
      text-white shadow-sm hover:shadow-md
      focus:ring-4 focus:ring-primary-300
      active:scale-[0.98]
    `,
    secondary: `
      bg-white border border-slate-300
      hover:border-slate-400 hover:bg-slate-50
      text-slate-800 shadow-sm hover:shadow
      focus:ring-4 focus:ring-slate-200
      active:scale-[0.98]
    `,
    ghost: `
      bg-transparent hover:bg-primary-50
      text-primary-900 hover:text-primary-800
      focus:ring-4 focus:ring-primary-300
      active:scale-[0.98]
    `,
    danger: `
      bg-red-600 hover:bg-red-700
      text-white shadow-sm hover:shadow-md
      focus:ring-4 focus:ring-red-300
      active:scale-[0.98]
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
