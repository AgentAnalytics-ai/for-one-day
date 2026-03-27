import Link from 'next/link'
import type { ReactNode } from 'react'

interface PageHeaderProps {
  eyebrow?: ReactNode
  title: ReactNode
  subtitle?: ReactNode
  backHref?: string
  backLabel?: string
  align?: 'left' | 'center'
  className?: string
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  backHref,
  backLabel,
  align = 'left',
  className = '',
}: PageHeaderProps) {
  const isCenter = align === 'center'

  return (
    <header className={className}>
      {backHref && backLabel && (
        <Link href={backHref} className="mb-4 inline-block text-sm text-blue-800 hover:underline">
          {backLabel}
        </Link>
      )}
      <div className={isCenter ? 'text-center' : ''}>
        {eyebrow ? <div className={`page-eyebrow ${isCenter ? 'mx-auto' : ''}`}>{eyebrow}</div> : null}
        <h1 className="page-title mt-2">{title}</h1>
        {subtitle ? (
          <p className={`page-subtitle ${isCenter ? 'mx-auto max-w-2xl' : ''}`}>{subtitle}</p>
        ) : null}
      </div>
    </header>
  )
}
