import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AppProviders } from '@/components/AppProviders'
import { ElevenLabsWidget } from '@/components/ElevenLabsWidget'
import { Inter, Outfit } from 'next/font/google'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL('https://cargolink.io'),
  title: 'CargoLink | The Intelligent Freight Marketplace',
  description: 'CargoLink connects shippers with top freight forwarders worldwide. Get instant quotes, compare ocean & air rates, and manage your supply chain with AI-powered intelligence.',
  keywords: ['freight marketplace', 'logistics platform', 'freight forwarder', 'supply chain', 'ocean freight', 'air freight', 'cargo shipping', 'freight quotes'],
  authors: [{ name: 'CargoLink' }],
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://cargolink.io',
    siteName: 'CargoLink',
    title: 'CargoLink | The Intelligent Freight Marketplace',
    description: 'Connect with top freight forwarders. Get instant quotes and move cargo smarter.',
    images: [
      {
        url: 'https://cargolink.io/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'CargoLink Freight Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CargoLink | The Intelligent Freight Marketplace',
    description: 'The smartest way to ship cargo globally.',
    images: ['https://cargolink.io/og-image.jpg'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body>
        <AppProviders>
          {children}
        </AppProviders>

        {/* ElevenLabs AI Customer Support Widget */}
        <ElevenLabsWidget />
      </body>
    </html>
  )
}


