import Link from 'next/link'
import { Mail, Globe, Twitter, Linkedin } from 'lucide-react'

const columns = [
    {
        heading: 'Product',
        links: [
            { label: 'Shipper Portal', href: '/search' },
            { label: 'AI Quoting', href: '/marketplace' },
            { label: 'Carrier Partners', href: '/carriers' },
            { label: 'Enterprise', href: '/services/coming-soon' },
            { label: 'Live Demo', href: '/demo' },
        ],
    },
    {
        heading: 'Features',
        links: [
            { label: 'Search Rates', href: '/search' },
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Freight Calculator', href: '/tools/calculator' },
            { label: 'HS Codes', href: '/tools/hs-codes' },
            { label: 'Shipment Tracking', href: '/tracking' },
        ],
    },
    {
        heading: 'Company',
        links: [
            { label: 'About Us', href: '/about' },
            { label: 'Contact', href: '/contact' },
            { label: 'Carriers', href: '/carriers' },
        ],
    },
    {
        heading: 'Resources',
        links: [
            { label: 'Help Center', href: '/help' },
            { label: 'API Docs', href: '/services/coming-soon' },
            { label: 'Become a Partner', href: '/forwarders/register' },
        ],
    },
    {
        heading: 'Legal',
        links: [
            { label: 'Privacy Policy', href: '/legal/privacy' },
            { label: 'Terms of Service', href: '/legal/terms' },
            { label: 'Cookie Policy', href: '/legal/cookies' },
        ],
    },
]

export default function Footer() {
    return (
        <footer className="bg-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Top — brand + tagline, centered */}
                <div className="py-16 flex flex-col items-center text-center">
                    {/* Logo — matches Navbar */}
                    <Link href="/" className="flex items-center gap-2.5 mb-4">
                        <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center shrink-0">
                            <span className="text-black text-xs font-black font-inter">C</span>
                        </div>
                        <span className="text-sm font-black tracking-widest text-white font-outfit">CARGOLINK</span>
                    </Link>
                    <p className="text-sm text-zinc-500 font-inter max-w-md leading-relaxed">
                        The intelligent freight marketplace connecting shippers and forwarders globally.
                        Move cargo smarter, faster, and with full transparency.
                    </p>
                </div>

                {/* Middle — link columns */}
                <div className="py-14 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-10 border-b border-white/[0.05]">
                    {columns.map((col) => (
                        <div key={col.heading}>
                            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em] font-inter mb-5">
                                {col.heading}
                            </h4>
                            <ul className="space-y-3">
                                {col.links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-xs text-zinc-500 font-inter hover:text-white transition-colors duration-200"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom — copyright + socials */}
                <div className="py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-zinc-600 font-inter">
                        © 2025–2026 CargoLink Technologies. All rights reserved.
                    </p>

                    <div className="flex items-center gap-4">
                        <a
                            href="https://twitter.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Twitter"
                            className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-zinc-600 hover:text-white hover:border-white/20 transition-all"
                        >
                            <Twitter className="w-3.5 h-3.5" />
                        </a>
                        <a
                            href="https://linkedin.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="LinkedIn"
                            className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-zinc-600 hover:text-white hover:border-white/20 transition-all"
                        >
                            <Linkedin className="w-3.5 h-3.5" />
                        </a>
                        <a
                            href="/contact"
                            aria-label="Website"
                            className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-zinc-600 hover:text-white hover:border-white/20 transition-all"
                        >
                            <Globe className="w-3.5 h-3.5" />
                        </a>
                        <a
                            href="mailto:support@cargolink.io"
                            aria-label="Email"
                            className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-zinc-600 hover:text-white hover:border-white/20 transition-all"
                        >
                            <Mail className="w-3.5 h-3.5" />
                        </a>
                    </div>
                </div>

            </div>
        </footer>
    )
}
