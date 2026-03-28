import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Freight Forwarders Network | Join CargoLink',
    description: 'Join CargoLink\'s verified freight forwarder network. Receive live cargo requests, submit quotes, and grow your freight business globally.',
    alternates: { canonical: 'https://cargolink.sa/forwarders' },
    openGraph: {
        title: 'Freight Forwarder Network — CargoLink',
        description: 'Verified forwarders. Live cargo requests. Grow your freight business.',
        url: 'https://cargolink.sa/forwarders',
        siteName: 'CargoLink',
    },
}

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
