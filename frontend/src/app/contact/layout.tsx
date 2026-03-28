import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Contact Us | CargoLink — Freight Marketplace',
    description: 'Get in touch with CargoLink. Reach our freight experts for shipping quotes, support, or partnership inquiries. Available 24/7 via email, phone, or our contact form.',
    alternates: {
        canonical: 'https://cargolink.sa/contact',
    },
    openGraph: {
        title: 'Contact CargoLink | AI-Powered Freight Marketplace',
        description: 'Connect with our freight experts. Get support, request a demo, or ask about shipping your cargo globally.',
        url: 'https://cargolink.sa/contact',
        siteName: 'CargoLink',
    },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
