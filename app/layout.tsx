import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { SmoothScroll } from '@/components/ui/smooth-scroll'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://foroneday.app'),
  title: {
    default: 'For One Day - Capture Memories for People You Love',
    template: '%s | For One Day'
  },
  description: 'Capture meaningful memories for people you love. Save notes and photos, stay consistent with daily prompts, and unlock Pro AI writing tools when you are ready.',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: 'cover', // For iPhone notch support
  },
  keywords: [
    'memory journal app',
    'capture memories',
    'family memories',
    'daily memory prompts',
    'memory timeline',
    'save notes and photos',
    'loved ones memories',
    'ai writing assistant',
    'pro writing tools',
    'private memory vault'
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
    title: 'For One Day - Capture Memories for People You Love',
    description: 'Capture notes and photos that matter, organized by person, with optional Pro AI writing tools.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'For One Day - Capture Memories for People You Love',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Capture Memories for People You Love',
    description: 'Capture notes and photos that matter, organized by person, with optional Pro AI writing tools.',
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
        <SmoothScroll>
          <Providers>
            {children}
          </Providers>
        </SmoothScroll>
      </body>
    </html>
  )
}

