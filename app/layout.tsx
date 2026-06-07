import type { Metadata, Viewport } from 'next'
import { DM_Sans, Fraunces } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { SmoothScroll } from '@/components/ui/smooth-scroll'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://foroneday.app'),
  title: {
    default: 'For One Day — Know What Matters Today',
    template: '%s | For One Day'
  },
  description:
    'Your family\'s daily plan for the kitchen wall — schedule, dinner, and lists at a glance. Save memories and keepsakes on your phone when you\'re ready. One Pro plan for your home.',
  applicationName: 'For One Day',
  alternates: {
    canonical: 'https://foroneday.app',
  },
  keywords: [
    'family daily planner',
    'kitchen family calendar',
    'household schedule app',
    'family to do list',
    'dinner planner family',
    'family memories',
    'keepsakes',
    'memory journal',
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
    title: 'For One Day — Know What Matters Today',
    description:
      'Daily plan for your home — schedule, dinner, and lists on the kitchen wall. Memories and keepsakes on your phone.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'For One Day — Your family\'s daily plan',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'For One Day — Know What Matters Today',
    description:
      'Daily plan for your home. Save memories and keepsakes when you\'re ready.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/icon', type: 'image/png', sizes: '48x48' },
      { url: '/icon', type: 'image/png', sizes: '32x32' },
    ],
    apple: '/apple-icon.png',
  },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${fraunces.variable} font-sans antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'For One Day',
              url: 'https://foroneday.app',
              logo: 'https://foroneday.app/icon',
            }),
          }}
        />
        <SmoothScroll>
          <Providers>
            {children}
          </Providers>
        </SmoothScroll>
      </body>
    </html>
  )
}

