import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://foroneday.app'),
  title: {
    default: 'For One Day - Legacy Letters for Fathers | Write Letters to Your Family',
    template: '%s | For One Day'
  },
  description: 'Write meaningful legacy letters to your children. Daily Bible reflections, professional letter templates, and secure vault for fathers to preserve wisdom and love for their families.',
  keywords: [
    'legacy letters',
    'fathers',
    'family',
    'christian fathers',
    'parenting',
    'bible reflections',
    'daily devotions',
    'letter to my son',
    'letter to my daughter',
    'fatherhood',
    'legacy planning',
    'family legacy'
  ],
  authors: [{ name: 'For One Day' }],
  creator: 'For One Day',
  publisher: 'For One Day',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://foroneday.app',
    siteName: 'For One Day',
    title: 'For One Day - Legacy Letters for Fathers',
    description: 'Write meaningful legacy letters to your children. Professional templates, daily reflections, and secure storage for fathers.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'For One Day - Legacy Letters for Fathers',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'For One Day - Legacy Letters for Fathers',
    description: 'Write meaningful legacy letters to your children. Daily reflections and professional templates for fathers.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

