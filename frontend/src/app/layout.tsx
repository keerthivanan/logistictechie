import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AppProviders } from '@/components/AppProviders'
import { Inter, Outfit, Cairo } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })
const cairo = Cairo({ subsets: ['arabic', 'latin'], variable: '--font-cairo' })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL('https://cargolink.sa'),
  title: 'CargoLink | AI-Powered Freight Marketplace',
  description: 'CargoLink connects shippers with top freight forwarders worldwide. Get instant quotes, compare ocean & air rates, and manage your supply chain with AI-powered intelligence.',
  keywords: ['freight marketplace', 'logistics platform', 'freight forwarder', 'شحن بضائع', 'supply chain', 'ocean freight', 'air freight', 'cargo shipping', 'freight quotes', 'Saudi Arabia logistics'],
  authors: [{ name: 'CargoLink' }],
  robots: 'index, follow',
  alternates: {
    canonical: 'https://cargolink.sa',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://cargolink.sa',
    siteName: 'CargoLink',
    title: 'CargoLink | AI-Powered Freight Marketplace',
    description: 'Connect with top freight forwarders. Get instant quotes and move cargo smarter.',
    images: [
      {
        url: 'https://cargolink.sa/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'CargoLink Freight Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CargoLink | AI-Powered Freight Marketplace',
    description: 'The smartest way to ship cargo globally.',
    images: ['https://cargolink.sa/og-image.jpg'],
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
    <html lang="en" className={`${inter.variable} ${outfit.variable} ${cairo.variable}`}>
      <body>
        <AppProviders>
          {children}
        </AppProviders>

      </body>
    </html>
  )
}


