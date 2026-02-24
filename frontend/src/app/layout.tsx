import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AppProviders } from '@/components/AppProviders'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL('https://omego.logistics'),
  title: 'SOVEREIGN | The Global Logistics OS (G.O.A.T. Build)',
  description: 'The world\'s most advanced digital freight marketplace. Compare ocean/air rates, automate tenders, and orchestrate global trade with Sovereign AI.',
  keywords: ['logistics', 'freight forwarding', 'supply chain', 'AI logistics', 'ocean freight', 'air freight', 'digital marketplace'],
  authors: [{ name: 'Sovereign Intelligence' }],
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://omego.logistics',
    siteName: 'SOVEREIGN',
    title: 'SOVEREIGN | The Global Logistics OS',
    description: 'Universal trade orchestration powered by Sovereign Intelligence.',
    images: [
      {
        url: 'https://omego.logistics/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'SOVEREIGN Command Center',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SOVEREIGN | The Global Logistics OS',
    description: 'The "True Ocean" Protocol for Global Trade.',
    images: ['https://omego.logistics/og-image.jpg'],
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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  )
}
