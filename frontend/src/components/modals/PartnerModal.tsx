'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Globe, ShieldCheck, ExternalLink, Ship, Package, Calendar } from 'lucide-react';
import Avatar from '@/components/visuals/Avatar';

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
    } | null;
}

export default function PartnerModal({ isOpen, onClose, partner }: PartnerModalProps) {
    if (!partner) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg bg-[#050505] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)]"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-8 right-8 p-2 hover:bg-white/5 rounded-full text-zinc-500 hover:text-white transition-all z-20 group"
                        >
                            <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                        </button>

                        {/* Holographic Signal Glow */}
                        <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/5 blur-[80px] pointer-events-none" />
                        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-500/5 blur-[80px] pointer-events-none" />

                        <div className="p-12 flex flex-col items-center text-center relative z-10">
                            {/* Logo Section (Reference Sync) */}
                            <div className="mb-10 relative">
                                <div className="absolute inset-0 bg-white/5 rounded-full blur-2xl opacity-20 animate-pulse" />
                                <Avatar
                                    src={partner.logo_url || undefined}
                                    name={partner.company_name}
                                    size="2xl"
                                    className="border-white/10 shadow-2xl relative z-10"
                                />
                                <div className="absolute -bottom-2 -right-2 bg-black border border-white/20 p-2 rounded-full shadow-xl">
                                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                </div>
                            </div>

                            {/* Company Name (Reference Sync) */}
                            <h2 className="text-4xl font-black font-outfit text-white mb-4 tracking-tighter uppercase leading-tight max-w-sm">
                                {partner.company_name}
                            </h2>

                            {/* Address/Registry Block (Reference Sync) */}
                            <div className="space-y-1 mb-12">
                                <div className="flex items-center justify-center gap-2 text-zinc-500 font-bold uppercase tracking-[0.2em] text-[10px] font-inter">
                                    <MapPin className="w-3.5 h-3.5 text-emerald-500/50" />
                                    <span>26A1 {partner.country} Registry, Node 100000</span>
                                </div>
                                <div className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest font-inter">
                                    Master ID: {partner.forwarder_id || 'REGISTERED_CITIZEN'}
                                </div>
                            </div>

                            {/* Trust Badge / Metrics (Reference Sync) */}
                            <div className="w-full space-y-4">
                                <button className="w-full bg-transparent border-2 border-emerald-500/30 text-emerald-400 py-4 rounded-full text-sm font-black uppercase tracking-[0.2em] hover:bg-emerald-500/10 transition-all font-inter flex items-center justify-center gap-3 group relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                    50+ Sovereign Shipments Verified
                                </button>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/[0.02] border border-white/5 p-5 rounded-[1.5rem] flex flex-col items-center group/card hover:border-white/20 transition-all">
                                        <Ship className="w-5 h-5 text-zinc-500 mb-2 group-hover/card:text-white transition-colors" />
                                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Ocean Reliability</span>
                                        <span className="text-lg font-black font-outfit text-white uppercase tracking-tighter">98% A+</span>
                                    </div>
                                    <div className="bg-white/[0.02] border border-white/5 p-5 rounded-[1.5rem] flex flex-col items-center group/card hover:border-white/20 transition-all">
                                        <Package className="w-5 h-5 text-zinc-500 mb-2 group-hover/card:text-white transition-colors" />
                                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Dossier Status</span>
                                        <span className="text-lg font-black font-outfit text-white uppercase tracking-tighter">Verified</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="mt-12 w-full pt-12 border-t border-white/5 flex flex-col gap-4">
                                <button className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-[0_10px_40px_rgba(255,255,255,0.1)]">
                                    Initiate Connection Protocol <Globe className="w-4 h-4" />
                                </button>
                                {partner.website && (
                                    <a
                                        href={partner.website.startsWith('http') ? partner.website : `https://${partner.website}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[9px] font-black text-zinc-600 hover:text-white uppercase tracking-[0.3em] transition-colors flex items-center justify-center gap-1.5 py-2"
                                    >
                                        Inspect Public Node <ExternalLink className="w-3 h-3" />
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Scanline Finish */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%),linear-gradient(90deg,rgba(255,0,0,0.005),rgba(0,255,0,0.003),rgba(0,0,255,0.005))] bg-[length:100%_2px,3px_100%] opacity-20" />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
