"use client";

import Link from "next/link";
import { Ship, Linkedin, Twitter, Github } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function Footer() {
    const { t } = useLanguage();

    const footerLinks = [
        {
            title: t('footer.strategic'),
            links: [
                { label: t('footer.labels.quoteEngine'), href: '/quote' },
                { label: t('footer.labels.marketIntel'), href: '/market' },
                { label: t('footer.labels.capabilities'), href: '/services' },
            ]
        },
        {
            title: t('footer.operational'),
            links: [
                { label: t('footer.labels.globalNodes'), href: '/company' },
                { label: t('footer.labels.trackMission'), href: '/tracking' },
                { label: t('footer.labels.documentation'), href: '/help' },
            ]
        },
        {
            title: t('footer.architecture'),
            links: [
                { label: t('footer.labels.systemStatus'), href: '/health' },
                { label: t('footer.labels.supportLink'), href: '/contact' },
                { label: t('footer.labels.designPhilosophy'), href: '/company' },
            ]
        },
        {
            title: "Legal",
            links: [
                { label: t('footer.labels.coreLegal'), href: '/terms' },
                { label: t('footer.labels.dataPrivacy'), href: '/privacy' },
                { label: t('footer.labels.securityProto'), href: '/security' },
            ]
        }
    ];

    return (
        <footer className="bg-black border-t border-white/5 pt-32 pb-16 relative overflow-hidden">
            {/* Tactical Detail Line */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="container max-w-[1400px] mx-auto px-8 relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-6 gap-16 md:gap-8 mb-32">
                    {/* Branding & Extraction */}
                    <div className="col-span-2 space-y-12">
                        <Link href="/" className="flex items-center gap-4 group">
                            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center transition-all group-hover:bg-zinc-200">
                                <Ship className="h-6 w-6 text-black" />
                            </div>
                            <h1 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">
                                PHOENIX <br /><span className="text-white/20 italic font-medium text-sm tracking-[0.2em]">LOGISTICS</span>
                            </h1>
                        </Link>
                        <p className="text-sm font-bold text-white/40 max-w-xs leading-relaxed uppercase tracking-tighter">
                            {t('footer.missionDesc') || "Global supply chain synchronization through high-density intelligence and professional logistics telemetry."}
                        </p>
                        <div className="flex items-center gap-8">
                            <a href="#" className="text-white/20 hover:text-white transition-colors">
                                <Linkedin className="h-6 w-6" />
                            </a>
                            <a href="#" className="text-white/20 hover:text-white transition-colors">
                                <Twitter className="h-6 w-6" />
                            </a>
                        </div>
                    </div>

                    {/* Navigation Columns - High Density */}
                    {footerLinks.map((group, idx) => (
                        <div key={idx} className="space-y-10">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.6em] text-white underline decoration-white/20 underline-offset-8 decoration-2">{group.title}</h4>
                            <ul className="space-y-6">
                                {group.links.map((link, lIdx) => (
                                    <li key={lIdx}>
                                        <Link
                                            href={link.href}
                                            className="text-[11px] font-bold text-white/40 hover:text-white transition-colors uppercase tracking-[0.2em] block"
                                        >
                                            → {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Sub-footer Certification */}
                <div className="pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-8">
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.6em]">© 2026 PHOENIX_GLOBAL</span>
                        <div className="w-px h-4 bg-white/10 hidden md:block" />
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{t('footer.rights')}</span>
                    </div>

                    <div className="flex items-center gap-12">
                        <div className="flex items-center gap-4">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em]">{t('footer.systemStatus') || "SECURE_SYNC_ACTIVE"}</span>
                        </div>
                        <span className="text-[9px] font-black text-white/10 uppercase tracking-[0.8em]">NODE_X712_G.O.A.T.</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
