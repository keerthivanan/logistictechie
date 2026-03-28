import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'About CargoLink | AI-Powered Freight Marketplace',
    description: 'CargoLink is the Middle East\'s leading AI-powered freight marketplace, connecting shippers with verified freight forwarders for smarter, faster global shipping.',
    alternates: { canonical: 'https://cargolink.sa/about' },
    openGraph: {
        title: 'About CargoLink',
        description: 'The AI-powered freight marketplace built for the modern supply chain.',
        url: 'https://cargolink.sa/about',
        siteName: 'CargoLink',
    },
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
