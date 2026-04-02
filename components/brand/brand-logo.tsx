import type { ReactNode } from 'react'
import {
  MarkOneDot,
  MarkOneDotOpticalA,
  MarkOneDotOpticalB,
  MarkOneDotOpticalC,
  MarkOneDotOpticalD,
  MarkHorizonDot,
  MarkHorizonDotA,
  MarkHorizonDotB,
  MarkHorizonDotC,
  MarkLetterHandoff,
  MarkLetterHandoffA,
  MarkBookmarkDot,
  MarkMonogram,
} from './logo-variants'

interface BrandLogoProps {
  className?: string
  markClassName?: string
  textClassName?: string
  showText?: boolean
  text?: ReactNode
  mark?: 'one-dot' | 'one-dot-a' | 'one-dot-b' | 'one-dot-c' | 'one-dot-d' | 'horizon' | 'horizon-a' | 'horizon-b' | 'horizon-c' | 'handoff' | 'handoff-a' | 'bookmark' | 'monogram'
}

export function BrandLogo({
  className = '',
  markClassName = 'h-6 w-6',
  textClassName = 'font-serif font-light tracking-tight text-slate-900',
  showText = true,
  text = 'For One Day',
  mark = 'horizon-a',
}: BrandLogoProps) {
  const markMap = {
    'one-dot': MarkOneDot,
    'one-dot-a': MarkOneDotOpticalA,
    'one-dot-b': MarkOneDotOpticalB,
    'one-dot-c': MarkOneDotOpticalC,
    'one-dot-d': MarkOneDotOpticalD,
    horizon: MarkHorizonDot,
    'horizon-a': MarkHorizonDotA,
    'horizon-b': MarkHorizonDotB,
    'horizon-c': MarkHorizonDotC,
    handoff: MarkLetterHandoff,
    'handoff-a': MarkLetterHandoffA,
    bookmark: MarkBookmarkDot,
    monogram: MarkMonogram,
  } as const

  const Mark = markMap[mark] ?? MarkOneDot

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Mark className={markClassName} />
      {showText ? <span className={textClassName}>{text}</span> : null}
    </span>
  )
}

