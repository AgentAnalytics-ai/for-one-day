'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type RevealOnScrollProps = {
  children: ReactNode
  className?: string
  stagger?: 0 | 1 | 2 | 3
}

/**
 * Lightweight scroll reveal — CSS animation, IntersectionObserver, reduced-motion safe.
 */
export function RevealOnScroll({ children, className, stagger = 0 }: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      node.classList.add('is-visible')
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          node.classList.add('is-visible')
          observer.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const staggerClass =
    stagger === 1 ? 'reveal-stagger-1' :
    stagger === 2 ? 'reveal-stagger-2' :
    stagger === 3 ? 'reveal-stagger-3' : ''

  return (
    <div ref={ref} className={cn('reveal-on-scroll', staggerClass, className)}>
      {children}
    </div>
  )
}
