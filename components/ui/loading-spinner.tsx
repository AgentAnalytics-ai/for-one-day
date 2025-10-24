'use client'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <div
        className={`
          ${sizes[size]}
          animate-spin rounded-full border-2 border-gray-300 border-t-purple-600
        `}
      />
    </div>
  )
}

export function LoadingButton({ 
  children, 
  loading, 
  className = '',
  ...props 
}: {
  children: React.ReactNode
  loading: boolean
  className?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`
        relative inline-flex items-center justify-center
        px-4 py-2 rounded-lg font-medium transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {loading && (
        <LoadingSpinner size="sm" className="mr-2" />
      )}
      {children}
    </button>
  )
}
