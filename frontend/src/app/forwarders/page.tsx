'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, ShieldCheck, Truck, Plane, Globe, Mail, Phone, ExternalLink, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { API_URL } from '@/lib/config';

interface Forwarder {
    id: string;
    company_name: string;
    email: string;
    country: string;
    logo_url: string;
}

export default function ForwarderDirectoryPage() {
    const [forwarders, setForwarders] = useState<Forwarder[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        const fetchForwarders = async () => {
            try {
                const res = await fetch(`${API_URL}/api/forwarders/active`);
                const data = await res.json();
                if (data.forwarders) {
                    setForwarders(data.forwarders);
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

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black pb-20">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 py-16">

                {/* Hero */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-6"
                    >
                        <ShieldCheck className="w-4 h-4 text-green-400" />
                        <span className="text-sm font-medium text-gray-300">{forwarders.length} Verified Partners</span>
                    </motion.div>

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
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 group hover:border-white/30 transition-all hover:bg-zinc-900"
                                >
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="w-16 h-16 rounded-xl bg-white p-2 flex items-center justify-center overflow-hidden">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={forwarder.logo_url || 'https://images.unsplash.com/photo-1586528116311-ad86d7c49988?auto=format&fit=crop&q=80&w=200'}
                                                alt={forwarder.company_name}
                                                className="object-contain w-full h-full"
                                                onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1586528116311-ad86d7c49988?auto=format&fit=crop&q=80&w=200' }}
                                            />
                                        </div>
                                        <div className="bg-green-500/10 text-green-400 p-2 rounded-full">
                                            <ShieldCheck className="w-5 h-5" />
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">
                                        {forwarder.company_name}
                                    </h3>

                                    <div className="flex items-center text-gray-400 text-sm mb-6">
                                        <MapPin className="w-4 h-4 mr-1.5" />
                                        {forwarder.country}
                                    </div>

                                    <div className="space-y-3 pt-6 border-t border-white/5">
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Mail className="w-4 h-4 mr-3" />
                                            <span className="truncate">{forwarder.email}</span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Globe className="w-4 h-4 mr-3" />
                                            <span className="truncate">Verified Partner</span>
                                        </div>
                                    </div>
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
        </div>
    );
}
