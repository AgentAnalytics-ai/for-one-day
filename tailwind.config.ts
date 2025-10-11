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
        primary: {
          50: '#fef7f0',
          100: '#fdeede',
          200: '#fad9b8',
          300: '#f7bf87',
          400: '#f39c54',
          500: '#f08030',
          600: '#e16426',
          700: '#bb4b1f',
          800: '#953d20',
          900: '#78341d',
          950: '#41180c',
        }
      }
    },
  },
  plugins: [],
}

export default config

