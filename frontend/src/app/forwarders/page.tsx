'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Globe, ExternalLink, Loader2, BadgeCheck, Building2, ArrowUpRight } from 'lucide-react';
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
        <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black pb-20">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 pt-32 pb-16">

                {/* Hero */}
                <div className="text-center mb-16">


                    <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                        Global Logistics <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Directory.</span>
                    </h1>

                    <div className="max-w-2xl mx-auto relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            placeholder="Search by company name or country..."
                            className="w-full bg-zinc-900 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-white/30 transition-all text-lg"
                        />
                    </div>
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
                                    className="bg-zinc-950 border border-white/8 rounded-2xl p-6 group hover:border-white/20 hover:bg-zinc-900 transition-all duration-200 cursor-pointer"
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
                                        <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-white transition-colors leading-tight">
                                            {forwarder.company_name}
                                        </h3>
                                        <div className="flex items-center gap-1.5 text-zinc-500 text-sm">
                                            <MapPin className="w-3.5 h-3.5" />
                                            {forwarder.country}
                                        </div>
                                    </div>

                                    {/* Meta row */}
                                    <div className="flex items-center gap-3 pt-4 border-t border-white/6 mb-5">
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
                                    <button className="w-full flex items-center justify-center gap-2 bg-white text-black py-2.5 rounded-xl text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-200 active:scale-[0.98]">
                                        View Profile <ArrowUpRight className="w-4 h-4" />
                                    </button>
                                    <div className="w-full py-2.5 group-hover:hidden" />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {!loading && filteredForwarders.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
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
