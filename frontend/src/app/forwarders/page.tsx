'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Loader2, Globe, ExternalLink, Building2 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Avatar from '@/components/visuals/Avatar';
import PartnerModal from '@/components/modals/PartnerModal';
import { apiFetch } from '@/lib/config';
import { useT } from '@/lib/i18n/t';

interface Forwarder {
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
}

export default function ForwarderDirectoryPage() {
    const t = useT()
    const [forwarders, setForwarders] = useState<Forwarder[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [selectedPartner, setSelectedPartner] = useState<Forwarder | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchForwarders = async () => {
            try {
                const res = await apiFetch('/api/forwarders/active');
                const data = await res.json();
                if (Array.isArray(data)) {
                    setForwarders(data);
                    console.log('Active Forwarders (Array):', data);
                } else if (data.forwarders) {
                    setForwarders(data.forwarders);
                    console.log('Active Forwarders (Object):', data.forwarders);
                }
            } catch (error) {
                console.error("Failed to load forwarders:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchForwarders();
    }, []);

    const filteredForwarders = forwarders.filter(f =>
        f.company_name.toLowerCase().includes(filter.toLowerCase()) ||
        f.country.toLowerCase().includes(filter.toLowerCase())
    );

    const handleOpenModal = (partner: Forwarder) => {
        setSelectedPartner(partner);
        setIsModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-black text-white font-inter selection:bg-white selection:text-black pb-20">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 pt-32 pb-16">

                {/* Hero */}
                <div className="text-center mb-12">
                    <h1 className="text-2xl md:text-3xl font-semibold font-outfit uppercase tracking-tight text-white mb-3">
                        {t('fwd.dir.title')}
                    </h1>
                    <p className="text-xs text-zinc-500 font-inter mb-8">{t('fwd.dir.sub')}</p>

                    <div className="max-w-2xl mx-auto relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                        <input
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            placeholder={t('fwd.dir.search')}
                            className="w-full bg-[#0a0a0a] border border-white/[0.08] rounded-xl pl-12 pr-6 py-3 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-white/20 transition-all font-inter"
                        />
                    </div>
                    {!loading && (
                        <p className="text-xs text-zinc-700 font-inter mt-3">{filteredForwarders.length} {filteredForwarders.length === 1 ? 'partner' : 'partners'} listed</p>
                    )}
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-white/20" />
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                        <AnimatePresence>
                            {filteredForwarders.map((forwarder, i) => (
                                <motion.div
                                    key={forwarder.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                                    onClick={() => handleOpenModal(forwarder)}
                                    className="bg-black border border-white/5 rounded-3xl p-8 group hover:border-white/20 transition-all duration-500 hover:bg-zinc-950 relative overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.02)] cursor-pointer"
                                >
                                    {/* Premium Light Sweep Effect */}
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_3s_infinite]" />

                                    <div className="relative z-10 h-full flex flex-col">
                                        <div className="flex items-start justify-between mb-10">
                                            <div className="relative group/logo">
                                                <div className="absolute -inset-2 bg-white/5 rounded-[28%] blur-xl opacity-0 group-hover/logo:opacity-100 transition-opacity duration-500" />
                                                <Avatar
                                                    src={forwarder.logo_url || undefined}
                                                    name={forwarder.company_name}
                                                    size="lg"
                                                    shape="square"
                                                    className="border-white/5 group-hover:border-white/10 transition-all shadow-2xl relative z-10"
                                                />
                                                <div className="absolute -top-0.5 -left-0.5 w-2.5 h-2.5 bg-white rounded-full border-2 border-black z-20 shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                                            </div>

                                            <div className="flex flex-col items-end gap-1.5">
                                                <div className="text-[8px] font-semibold text-white/40 tracking-[0.2em] font-inter uppercase">
                                                    {forwarder.forwarder_id || 'O-REG-7402'}
                                                </div>
                                                <div className="flex items-center gap-1.5 border border-white/10 px-2.5 py-1 rounded-full bg-white/[0.02]">
                                                    <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                                                    <span className="text-[8px] font-bold text-white/60 tracking-widest font-inter">{t('fwd.dir.verified')}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex-grow space-y-6">
                                            <div>
                                                <h3 className="text-2xl font-semibold mb-2 tracking-tighter font-outfit uppercase group-hover:text-white transition-colors duration-300">
                                                    {forwarder.company_name}
                                                </h3>
                                                <div className="flex items-center text-white/40 text-[9px] font-bold uppercase tracking-[0.15em] font-inter">
                                                    <MapPin className="w-3 h-3 mr-2 opacity-50" />
                                                    {forwarder.country} • {t('fwd.global.registry')}
                                                </div>
                                            </div>

                                            <div className="pt-8 border-t border-white/5 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center text-[9px] text-white/30 font-bold uppercase tracking-widest font-inter">
                                                        <Globe className="w-3.5 h-3.5 mr-3 opacity-30" />
                                                        {t('fwd.dir.status')}
                                                    </div>
                                                    <span className="text-[8px] font-semibold text-emerald-500 uppercase tracking-widest bg-emerald-500/5 px-2 py-0.5 rounded">{t('fwd.dir.active')}</span>
                                                </div>

                                                {forwarder.website && (
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center text-[9px] text-white/30 font-bold uppercase tracking-widest font-inter">
                                                            <ExternalLink className="w-3.5 h-3.5 mr-3 opacity-30" />
                                                            {t('fwd.public.node')}
                                                        </div>
                                                        <span className="text-[8px] font-bold text-white/50 group-hover:text-white/80 transition-colors max-w-[140px] truncate">
                                                            {forwarder.website.replace(/^https?:\/\//, '')}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <button className="w-full mt-10 bg-white text-black py-4 rounded-2xl text-[9px] font-semibold uppercase tracking-[0.4em] transition-all duration-500 hover:bg-zinc-200 active:scale-[0.97] shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                                            {t('fwd.dir.connect')}
                                        </button>
                                    </div>

                                    {/* Scanline Effect - Subtle Luxury Version */}
                                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[length:100%_40px] opacity-10" />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {!loading && filteredForwarders.length === 0 && (
                    <div className="text-center py-20 text-zinc-500 text-xs font-inter">
                        {t('fwd.no.match')} &quot;{filter}&quot;
                    </div>
                )}

            </div>

            <PartnerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                partner={selectedPartner}
            />
        </div>
    );
}
