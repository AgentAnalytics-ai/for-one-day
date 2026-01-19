'use client'

import { ReactNode } from 'react'

interface PremiumCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  gradient?: boolean
}

export function PremiumCard({ 
  children, 
  className = '', 
  hover = true,
  gradient = false 
}: PremiumCardProps) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl
        ${gradient 
          ? 'bg-gradient-to-br from-white via-primary-50/30 to-primary-50/30' 
          : 'bg-white'
        }
        shadow-lg shadow-primary-500/5 border-2 border-primary-100/50
        ${hover ? 'hover:shadow-xl hover:shadow-primary-500/10 hover:-translate-y-1 hover:border-primary-200' : ''}
        transition-all duration-300 ease-out
        backdrop-blur-sm
        ${className}
      `}
    >
      {gradient && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-primary-500/5 pointer-events-none" />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

interface StatCardProps {
  icon: ReactNode
  value: string | number | ReactNode
  label: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  className?: string
}

export function StatCard({ 
  icon, 
  value, 
  label, 
  trend, 
  trendValue,
  className = '' 
}: StatCardProps) {
  const trendColors = {
    up: 'text-emerald-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  }

  const trendIcons = {
    up: '↗',
    down: '↘',
    neutral: '→'
  }

  return (
    <PremiumCard className={`p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 text-primary-700 shadow-sm">
            {icon}
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-sm text-gray-600">{label}</div>
          </div>
        </div>
        {trend && trendValue && (
          <div className={`text-sm font-medium ${trendColors[trend]}`}>
            <span className="text-lg">{trendIcons[trend]}</span>
            {trendValue}
          </div>
        )}
      </div>
    </PremiumCard>
  )
}
