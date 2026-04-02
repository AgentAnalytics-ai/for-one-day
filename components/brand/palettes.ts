export type BrandPalette = {
  id: 'navy-amber' | 'charcoal-copper' | 'forest-gold' | 'midnight-lilac'
  name: string
  pitch: string
  colors: {
    canvas: string
    surface: string
    primary: string
    primaryHover: string
    accent: string
    text: string
    muted: string
    border: string
  }
}

export const BRAND_PALETTES: BrandPalette[] = [
  {
    id: 'navy-amber',
    name: 'Private Navy + Warm Amber',
    pitch: 'Most premium + most trusted. Calm, durable, “paid product” feel.',
    colors: {
      canvas: '#F8FAFC',
      surface: '#FFFFFF',
      primary: '#102A43',
      primaryHover: '#0B1F33',
      accent: '#D97706',
      text: '#0F172A',
      muted: '#475569',
      border: '#E2E8F0',
    },
  },
  {
    id: 'charcoal-copper',
    name: 'Charcoal + Bone + Copper',
    pitch: 'Most editorial / heirloom. Feels like a journal and a book.',
    colors: {
      canvas: '#FAF7F2',
      surface: '#FFFFFF',
      primary: '#111827',
      primaryHover: '#0B1220',
      accent: '#B45309',
      text: '#0F172A',
      muted: '#475569',
      border: '#E7E2DA',
    },
  },
  {
    id: 'forest-gold',
    name: 'Deep Forest + Parchment + Gold',
    pitch: 'Heritage + permanence. Family stewardship vibe without being loud.',
    colors: {
      canvas: '#FBF7EF',
      surface: '#FFFFFF',
      primary: '#0F3D2E',
      primaryHover: '#0B2E23',
      accent: '#C0841A',
      text: '#0F172A',
      muted: '#475569',
      border: '#E7E1D6',
    },
  },
  {
    id: 'midnight-lilac',
    name: 'Midnight + Soft Lilac',
    pitch: 'Modern tool energy. Slightly tech-forward, still premium.',
    colors: {
      canvas: '#F8FAFF',
      surface: '#FFFFFF',
      primary: '#0B1F33',
      primaryHover: '#071625',
      accent: '#7C3AED',
      text: '#0F172A',
      muted: '#475569',
      border: '#E2E8F0',
    },
  },
]

