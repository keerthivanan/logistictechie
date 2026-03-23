'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Globe, Mail, Phone, ExternalLink, BadgeCheck, Star, Truck } from 'lucide-react';
import Avatar from '@/components/visuals/Avatar';
import { useT } from '@/lib/i18n/t';

interface PartnerModalProps {
    isOpen: boolean;
    onClose: () => void;
    partner: {
        id: string;
        forwarder_id?: string;
        company_name: string;
        email: string;
        country: string;
        logo_url: string;
        website?: string;
        phone?: string;
        reliability_score?: number;
        specializations?: string;
        routes?: string;
    } | null;
}

export default function PartnerModal({ isOpen, onClose, partner }: PartnerModalProps) {
    const t = useT();
    if (!partner) return null;

    const specializations = partner.specializations
        ? partner.specializations.split(',').map(s => s.trim()).filter(Boolean)
        : [];

    const routes = partner.routes
        ? partner.routes.split(',').map(r => r.trim()).filter(Boolean)
        : [];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 12 }}
                        transition={{ duration: 0.2 }}
                        className="relative w-full max-w-md bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                    >
                        {/* Close */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-full text-zinc-500 hover:text-white transition-colors z-20"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Header */}
                        <div className="p-6 pb-5 border-b border-white/8">
                            <div className="flex items-start gap-4">
                                <Avatar
                                    src={partner.logo_url || undefined}
                                    name={partner.company_name}
                                    size="xl"
                                    shape="square"
                                    className="rounded-xl border border-white/10 flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0 pt-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h2 className="text-xl font-semibold text-white leading-tight truncate">
                                            {partner.company_name}
                                        </h2>
                                        <BadgeCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                    </div>
                                    <div className="flex items-center gap-1.5 text-zinc-500 text-sm mb-2">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {partner.country}
                                    </div>
                                    {partner.reliability_score && (
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-3.5 h-3.5 ${i < Math.round(partner.reliability_score!) ? 'text-amber-400 fill-amber-400' : 'text-zinc-700'}`}
                                                />
                                            ))}
                                            <span className="text-xs text-zinc-500 ml-1">{partner.reliability_score}/5</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-5">

                            {/* Contact info */}
                            <div className="space-y-2.5">
                                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{t('modal.contact')}</p>
                                <div className="space-y-2">
                                    <a href={`mailto:${partner.email}`} className="flex items-center gap-3 text-sm text-zinc-300 hover:text-white transition-colors group">
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                            <Mail className="w-4 h-4 text-zinc-500" />
                                        </div>
                                        {partner.email}
                                    </a>
                                    {partner.phone && (
                                        <div className="flex items-center gap-3 text-sm text-zinc-300">
                                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                                <Phone className="w-4 h-4 text-zinc-500" />
                                            </div>
                                            {partner.phone}
                                        </div>
                                    )}
                                    {partner.website && (
                                        <a
                                            href={partner.website.startsWith('http') ? partner.website : `https://${partner.website}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 text-sm text-zinc-300 hover:text-white transition-colors group"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                                <Globe className="w-4 h-4 text-zinc-500" />
                                            </div>
                                            {partner.website.replace(/^https?:\/\//, '')}
                                            <ExternalLink className="w-3 h-3 text-zinc-600 ml-auto" />
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Specializations */}
                            {specializations.length > 0 && (
                                <div className="space-y-2.5">
                                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{t('modal.specializations')}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {specializations.map((s) => (
                                            <span key={s} className="flex items-center gap-1.5 bg-white/5 border border-white/8 text-zinc-300 text-xs px-2.5 py-1 rounded-lg">
                                                <Truck className="w-3 h-3 text-zinc-500" />
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Routes */}
                            {routes.length > 0 && (
                                <div className="space-y-2.5">
                                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{t('modal.routes')}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {routes.map((r) => (
                                            <span key={r} className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs px-2.5 py-1 rounded-lg">
                                                {r}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ID */}
                            <div className="text-xs text-zinc-700 font-mono pt-1">
                                ID: {partner.forwarder_id || partner.id}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 pb-6">
                            <a
                                href={`mailto:${partner.email}?subject=Quote Request`}
                                className="w-full flex items-center justify-center gap-2 bg-white text-black py-3 rounded-xl text-sm font-medium hover:bg-zinc-100 transition-colors active:scale-[0.98]"
                            >
                                <Mail className="w-4 h-4" />
                                {t('modal.send.quote')}
                            </a>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
