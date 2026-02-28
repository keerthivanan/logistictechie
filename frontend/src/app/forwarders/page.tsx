'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, ShieldCheck, Truck, Plane, Globe, Mail, Phone, ExternalLink, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Avatar from '@/components/visuals/Avatar';
import PartnerModal from '@/components/modals/PartnerModal';
import { API_URL } from '@/lib/config';

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
                const res = await fetch(`${API_URL}/api/forwarders/active`);
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
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredForwarders.map((forwarder, i) => (
                                <motion.div
                                    key={forwarder.id}
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => handleOpenModal(forwarder)}
                                    className="bg-black border border-white/10 rounded-2xl p-6 group hover:border-white/30 transition-all hover:bg-zinc-950 relative overflow-hidden shadow-2xl cursor-pointer"
                                >
                                    {/* Holographic Subtle Glow */}
                                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 blur-[50px] pointer-events-none group-hover:bg-emerald-500/20 transition-colors" />

                                    <div className="relative z-10">
                                        <div className="flex items-start justify-between mb-8">
                                            <div className="relative group/logo">
                                                <Avatar
                                                    src={forwarder.logo_url || undefined}
                                                    name={forwarder.company_name}
                                                    size="lg"
                                                    shape="square"
                                                    className="border-white/10 group-hover:border-white/20 transition-all shadow-inner bg-white/[0.03]"
                                                />
                                                <div className="absolute -top-1 -left-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black animate-pulse" />
                                            </div>

                                            <div className="flex flex-col items-end gap-2">
                                                <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                                                    <ShieldCheck className="w-3.5 h-3.5" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest font-outfit">Verified</span>
                                                </div>
                                                <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest font-inter">Node ID: {forwarder.forwarder_id || 'TBD'}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <h3 className="text-xl font-black mb-1 group-hover:text-emerald-400 transition-colors font-outfit uppercase tracking-tighter">
                                                    {forwarder.company_name}
                                                </h3>
                                                <div className="flex items-center text-zinc-500 text-[10px] font-bold uppercase tracking-widest font-inter">
                                                    <MapPin className="w-3.5 h-3.5 mr-1.5 text-emerald-500/50" />
                                                    {forwarder.country} Registry
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-3 pt-6 border-t border-white/5 relative">
                                                <div className="flex items-center justify-between group/info">
                                                    <div className="flex items-center text-[10px] text-zinc-400 font-bold uppercase tracking-widest font-inter">
                                                        <Globe className="w-4 h-4 mr-3 text-emerald-500" />
                                                        Sovereign Network
                                                    </div>
                                                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active</span>
                                                </div>

                                                {forwarder.website && (
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center text-[10px] text-zinc-400 font-bold uppercase tracking-widest font-inter">
                                                            <ExternalLink className="w-4 h-4 mr-3 text-zinc-600" />
                                                            Public Node
                                                        </div>
                                                        <span className="text-[10px] font-bold text-zinc-500 hover:text-white transition-colors cursor-pointer truncate max-w-[120px]">
                                                            {forwarder.website.replace(/^https?:\/\//, '')}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <button className="w-full mt-6 bg-white/[0.03] border border-white/10 group-hover:bg-white text-zinc-400 group-hover:text-black py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] transition-all font-inter active:scale-[0.98]">
                                                Initiate Connection
                                            </button>
                                        </div>
                                    </div>

                                    {/* Scanline Effect */}
                                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.01),rgba(0,255,0,0.005),rgba(0,0,255,0.01))] bg-[length:100%_2px,3px_100%] opacity-20" />
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
            <Footer />

            <PartnerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                partner={selectedPartner}
            />
        </div>
    );
}
