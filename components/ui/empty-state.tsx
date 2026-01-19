'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description: string
  action?: ReactNode
  className?: string
}

/**
 * Beautiful Empty State Component
 * Professional empty states with helpful guidance
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className
}: EmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-12 px-4 text-center',
      className
    )}>
      {icon && (
        <div className="mb-6 w-20 h-20 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center shadow-lg">
          {icon}
        </div>
      )}
      <h3 className="text-2xl font-serif font-bold text-gray-900 mb-3">
        {title}
      </h3>
      <p className="text-lg text-gray-600 mb-6 max-w-md leading-relaxed">
        {description}
      </p>
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </div>
  )
}

/**
 * Empty State with Illustration
 */
export function EmptyStateIllustration({
  title,
  description,
  action,
  illustration
}: {
  title: string
  description: string
  action?: ReactNode
  illustration: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-8 w-48 h-48 text-primary-200">
        {illustration}
      </div>
      <h3 className="text-3xl font-serif font-bold text-gray-900 mb-4">
        {title}
      </h3>
      <p className="text-xl text-gray-600 mb-8 max-w-lg leading-relaxed">
        {description}
      </p>
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  )
}
