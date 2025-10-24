/**
 * 🎨 For One Day - Design System
 * Masculine Leadership Color Psychology & Component Standards
 */

export const colors = {
  // Primary: Navy Blue - Authority, leadership, trust
  primary: {
    50: '#eff6ff',   // Lightest blue
    100: '#dbeafe',  // Very light blue
    200: '#bfdbfe',  // Light blue
    300: '#93c5fd',  // Medium light blue
    400: '#60a5fa',  // Medium blue
    500: '#3b82f6',  // Base blue
    600: '#2563eb',  // Dark blue
    700: '#1d4ed8',  // Darker blue
    800: '#1e40af',  // Darker blue
    900: '#1e3a8a',  // Main brand navy (Authority)
    950: '#172554',  // Ultra dark navy
  },
  
  // Secondary: Forest Green - Family protection, growth, stability
  secondary: {
    50: '#f0fdf4',   // Lightest green
    100: '#dcfce7',  // Very light green
    200: '#bbf7d0',  // Light green
    300: '#86efac',  // Medium light green
    400: '#4ade80',  // Medium green
    500: '#22c55e',  // Base green
    600: '#16a34a',  // Dark green
    700: '#15803d',  // Darker green
    800: '#166534',  // Main forest green (Family protection)
    900: '#14532d',  // Darkest green
    950: '#052e16',  // Ultra dark green
  },
  
  // Accent: Bronze/Gold - Legacy achievement, value, warmth
  accent: {
    50: '#fffbeb',   // Lightest amber
    100: '#fef3c7',  // Very light amber
    200: '#fde68a',  // Light amber
    300: '#fcd34d',  // Medium light amber
    400: '#fbbf24',  // Medium amber
    500: '#f59e0b',  // Base amber
    600: '#d97706',  // Dark amber
    700: '#b45309',  // Main bronze (Legacy achievement)
    800: '#92400e',  // Darker amber
    900: '#78350f',  // Darkest amber
    950: '#451a03',  // Ultra dark amber
  },
  
  // Neutral: Gray - Stability, timelessness
  neutral: {
    50: '#f9fafb',   // Lightest gray
    100: '#f3f4f6',  // Very light gray
    200: '#e5e7eb',  // Light gray
    300: '#d1d5db',  // Medium light gray
    400: '#9ca3af',  // Medium gray
    500: '#6b7280',  // Base gray
    600: '#4b5563',  // Dark gray
    700: '#374151',  // Darker gray
    800: '#1f2937',  // Darkest gray
    900: '#111827',  // Ultra dark gray
    950: '#030712',  // Black
  }
}

export const backgrounds = {
  // Page-specific masculine psychological backgrounds
  landing: 'from-blue-900 via-gray-50 to-green-800',       // Strong leadership foundation with family protection
  auth: 'from-blue-800 via-gray-50 to-blue-900',           // Secure, trustworthy leadership platform
  dashboard: 'from-green-50 via-gray-50 to-blue-50',       // Family protection with strong leadership
  devotional: 'from-blue-50 via-gray-50 to-green-50',      // Strong spiritual foundation with family growth
  vault: 'from-blue-900 via-green-800 to-blue-900',        // Timeless leadership legacy with family protection
  reflections: 'from-blue-900 via-white to-green-50',      // Leadership authority with family growth
}

export const gradients = {
  // Card gradients for different content types
  devotional: 'from-blue-50 to-green-50',         // Leadership to family protection
  family: 'from-green-50 to-amber-50',            // Family protection to legacy achievement
  legacy: 'from-blue-900 to-green-800',           // Authority to family protection
  reflection: 'from-green-50 to-blue-50',         // Family growth to leadership
  premium: 'from-amber-50 to-blue-50',            // Legacy achievement to leadership
}

export const buttons = {
  primary: 'bg-blue-900 hover:bg-blue-800 text-white',        // Navy authority
  secondary: 'bg-green-800 hover:bg-green-700 text-white',    // Family protection
  accent: 'bg-amber-700 hover:bg-amber-600 text-white',       // Legacy achievement
  outline: 'border-2 border-blue-900 text-blue-900 hover:bg-blue-50',
  ghost: 'text-blue-900 hover:bg-blue-50',
}

export const cards = {
  base: 'bg-white/80 backdrop-blur-sm border border-neutral-200/50',
  devotional: 'bg-gradient-to-br from-blue-50 to-green-50 border-blue-200',
  family: 'bg-gradient-to-br from-green-50 to-amber-50 border-green-200',
  legacy: 'bg-gradient-to-br from-blue-900 to-green-800 border-blue-800',
  premium: 'bg-gradient-to-br from-amber-50 to-blue-50 border-amber-200',
}

export const status = {
  success: 'text-green-600 bg-green-50 border-green-200',
  warning: 'text-amber-600 bg-amber-50 border-amber-200',
  error: 'text-red-600 bg-red-50 border-red-200',
  info: 'text-blue-600 bg-blue-50 border-blue-200',
}

export const typography = {
  heading: 'font-serif text-neutral-900',
  body: 'font-sans text-neutral-700',
  caption: 'font-sans text-neutral-500 text-sm',
  link: 'text-blue-900 hover:text-blue-800 font-medium',
}

// Component-specific color mappings
export const components = {
  subscription: {
    free: 'from-green-50 to-emerald-50 border-green-200 text-green-800',
    pro: 'from-blue-50 to-green-50 border-blue-200 text-blue-800',
    lifetime: 'from-amber-50 to-blue-50 border-amber-200 text-amber-800',
  },
  
  navigation: {
    active: 'text-blue-900 bg-blue-50',
    inactive: 'text-neutral-600 hover:text-neutral-900',
  },
  
  stats: {
    devotion: 'text-blue-900 bg-blue-50',
    family: 'text-green-800 bg-green-50',
    legacy: 'text-amber-700 bg-amber-50',
  }
}

const designSystem = {
  colors,
  backgrounds,
  gradients,
  buttons,
  cards,
  status,
  typography,
  components,
}

export default designSystem
