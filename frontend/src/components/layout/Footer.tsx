'use client'
import Link from 'next/link'
import { Mail, Globe, Linkedin } from 'lucide-react'
import { useT } from '@/lib/i18n/t'

export default function Footer() {
    const t = useT()

    const columns = [
        {
            heading: t('footer.product'),
            links: [
                { label: t('footer.shipper.portal'), href: '/search' },
                { label: t('footer.marketplace'), href: '/marketplace' },
                { label: t('footer.carrier.partners'), href: '/carriers' },
                { label: t('footer.enterprise'), href: '/services/coming-soon' },
                { label: t('footer.forwarder.portal'), href: '/forwarders' },
            ],
        },
        {
            heading: t('footer.features'),
            links: [
                { label: t('footer.search.rates'), href: '/search' },
                { label: t('footer.dashboard'), href: '/dashboard' },
                { label: t('footer.freight.calc'), href: '/tools/calculator' },
                { label: t('footer.hs.codes'), href: '/tools/hs-codes' },
                { label: t('footer.tracking'), href: '/tracking' },
            ],
        },
        {
            heading: t('footer.company'),
            links: [
                { label: t('footer.about'), href: '/about' },
                { label: t('footer.contact'), href: '/contact' },
                { label: t('footer.carriers'), href: '/carriers' },
            ],
        },
        {
            heading: t('footer.resources'),
            links: [
                { label: t('footer.help.center'), href: '/help' },
                { label: t('footer.become.partner'), href: '/forwarders/register' },
            ],
        },
        {
            heading: t('footer.legal'),
            links: [
                { label: t('footer.privacy'), href: '/legal/privacy' },
                { label: t('footer.terms'), href: '/legal/terms' },
                { label: t('footer.cookies'), href: '/legal/cookies' },
            ],
        },
    ]
    return (
        <footer className="bg-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Top — brand + tagline, centered */}
                <div className="py-16 flex flex-col items-center text-center">
                    {/* Logo — matches Navbar */}
                    <Link href="/" className="flex items-center mb-4 group">
                        <img src="/cargolink.png" alt="CargoLink" className="h-36 w-auto object-contain opacity-90 group-hover:opacity-100 transition-opacity" />
                    </Link>
                    <p className="text-sm text-zinc-500 font-inter max-w-md leading-relaxed">
                        {t('footer.tagline')}
                    </p>
                </div>

                {/* Middle — link columns */}
                <div className="py-14 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-10 border-b border-white/[0.05]">
                    {columns.map((col) => (
                        <div key={col.heading}>
                            <h4 className="text-[10px] font-semibold text-white uppercase tracking-[0.2em] font-inter mb-5">
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
                        © 2025–2026 CargoLink Technologies. {t('footer.rights')}
                    </p>

                    <div className="flex items-center gap-4">
                        <a
                            href="https://twitter.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Twitter"
                            className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-zinc-600 hover:text-white hover:border-white/20 transition-all"
                        >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.626 5.905-5.626zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
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
