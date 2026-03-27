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
        
        // Calm premium brand system (memories-first)
        primary: {
          50: '#edf3f8',
          100: '#d9e6f1',
          200: '#b6cfe3',
          300: '#8fb1cf',
          400: '#688eaf',
          500: '#4c7498',
          600: '#365e7f',
          700: '#284966',
          800: '#1c3a51',
          900: '#102a43',  // Brand navy
          950: '#0b1f33',  // Brand navy hover/depth
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        accent: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',  // Brand warm accent
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        }
      }
    },
  },
  plugins: [],
}

export default config

