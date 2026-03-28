import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Freight Marketplace | Get Quotes from Top Forwarders — CargoLink',
    description: 'Post your freight request and receive competitive quotes from verified freight forwarders within 24 hours. FCL, LCL, air freight and more.',
    alternates: { canonical: 'https://cargolink.sa/marketplace' },
    openGraph: {
        title: 'Freight Marketplace — CargoLink',
        description: 'Post a request. Get 3 competitive quotes. Book the best rate. Powered by AI.',
        url: 'https://cargolink.sa/marketplace',
        siteName: 'CargoLink',
    },
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
