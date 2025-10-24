import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Custom colors from CSS variables
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        'primary-foreground': 'hsl(var(--primary-foreground))',
        'secondary-foreground': 'hsl(var(--secondary-foreground))',
        'accent-foreground': 'hsl(var(--accent-foreground))',
        
        // Masculine Leadership Color System
        primary: {
          50: '#eff6ff',   // Blue-50
          100: '#dbeafe',  // Blue-100
          200: '#bfdbfe',  // Blue-200
          300: '#93c5fd',  // Blue-300
          400: '#60a5fa',  // Blue-400
          500: '#3b82f6',  // Blue-500
          600: '#2563eb',  // Blue-600
          700: '#1d4ed8',  // Blue-700
          800: '#1e40af',  // Blue-800
          900: '#1e3a8a',  // Blue-900 - Main brand color (Authority)
          950: '#172554',  // Blue-950
        },
        secondary: {
          50: '#f0fdf4',   // Green-50
          100: '#dcfce7',  // Green-100
          200: '#bbf7d0',  // Green-200
          300: '#86efac',  // Green-300
          400: '#4ade80',  // Green-400
          500: '#22c55e',  // Green-500
          600: '#16a34a',  // Green-600
          700: '#15803d',  // Green-700
          800: '#166534',  // Green-800 - Family protection
          900: '#14532d',  // Green-900
          950: '#052e16',  // Green-950
        },
        accent: {
          50: '#fffbeb',   // Amber-50
          100: '#fef3c7',  // Amber-100
          200: '#fde68a',  // Amber-200
          300: '#fcd34d',  // Amber-300
          400: '#fbbf24',  // Amber-400
          500: '#f59e0b',  // Amber-500
          600: '#d97706',  // Amber-600
          700: '#b45309',  // Amber-700 - Legacy achievement
          800: '#92400e',  // Amber-800
          900: '#78350f',  // Amber-900
          950: '#451a03',  // Amber-950
        }
      }
    },
  },
  plugins: [],
}

export default config

