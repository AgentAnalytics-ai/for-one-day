import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://foroneday.app'),
  title: {
    default: 'For One Day - Your Personal Legacy Vault | Document Your Life & Final Wishes',
    template: '%s | For One Day'
  },
  description: 'Document your life, preserve your final wishes, and create your legacy. Secure personal vault for journaling, storing important documents, and scheduled delivery to loved ones.',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: 'cover', // For iPhone notch support
  },
  keywords: [
    'personal legacy vault',
    'document final wishes',
    'secure life documentation',
    'personal archive',
    'legacy planning',
    'document your life',
    'preserve legacy',
    'secure vault',
    'life documentation',
    'final wishes storage',
    'scheduled delivery',
    'legacy letters'
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
    title: 'For One Day - Your Personal Legacy Vault',
    description: 'Document your life, preserve your wishes, and deliver your legacy—on your timeline.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'For One Day - Your Personal Legacy Vault',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Your Personal Legacy Vault',
    description: 'Document your life, preserve your wishes, and deliver your legacy—on your timeline.',
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

