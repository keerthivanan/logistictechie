'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Loader2, BadgeCheck, Building2, ArrowUpRight, Globe } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Avatar from '@/components/visuals/Avatar';
import PartnerModal from '@/components/modals/PartnerModal';
import { apiFetch } from '@/lib/config';

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
                    <h1 className="text-2xl md:text-3xl font-black font-outfit uppercase tracking-tight text-white mb-3">
                        Global Logistics Directory
                    </h1>
                    <p className="text-xs text-zinc-500 font-inter mb-8">Browse verified freight forwarders from around the world.</p>

                    <div className="max-w-2xl mx-auto relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                        <input
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            placeholder="Search by company name or country..."
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
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => handleOpenModal(forwarder)}
                                    className="bg-[#0a0a0a] border border-white/[0.06] rounded-2xl p-6 group hover:border-white/[0.15] hover:bg-zinc-950 transition-all duration-200 cursor-pointer"
                                >
                                    {/* Top row: avatar + verified badge */}
                                    <div className="flex items-start justify-between mb-5">
                                        <Avatar
                                            src={forwarder.logo_url || undefined}
                                            name={forwarder.company_name}
                                            size="lg"
                                            shape="square"
                                            className="rounded-xl border border-white/10"
                                        />
                                        <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium px-2.5 py-1 rounded-full">
                                            <BadgeCheck className="w-3.5 h-3.5" />
                                            Verified
                                        </div>
                                    </div>

                                    {/* Company name + location */}
                                    <div className="mb-4">
                                        <h3 className="text-sm font-black font-inter text-white mb-1 leading-tight">
                                            {forwarder.company_name}
                                        </h3>
                                        <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
                                            <MapPin className="w-3.5 h-3.5" />
                                            {forwarder.country}
                                        </div>
                                    </div>

                                    {/* Meta row */}
                                    <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06] mb-5">
                                        <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
                                            <Building2 className="w-3.5 h-3.5" />
                                            <span className="font-mono text-zinc-600">{forwarder.forwarder_id || '—'}</span>
                                        </div>
                                        {forwarder.website && (
                                            <div className="flex items-center gap-1 text-zinc-500 text-xs ml-auto">
                                                <Globe className="w-3.5 h-3.5" />
                                                <span className="truncate max-w-[100px]">{forwarder.website.replace(/^https?:\/\//, '')}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* CTA */}
                                    <button className="w-full flex items-center justify-center gap-2 bg-white text-black py-3 rounded-xl text-xs font-black uppercase tracking-widest font-inter opacity-0 group-hover:opacity-100 transition-all duration-200 active:scale-[0.98]">
                                        View Profile <ArrowUpRight className="w-3.5 h-3.5" />
                                    </button>
                                    <div className="w-full py-2.5 group-hover:hidden" />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {!loading && filteredForwarders.length === 0 && (
                    <div className="text-center py-20 text-zinc-500 text-xs font-inter">
                        No forwarders found matching &quot;{filter}&quot;
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
