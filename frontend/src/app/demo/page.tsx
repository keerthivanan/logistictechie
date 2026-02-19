'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Play, Search, MousePointer2, Box, CheckCircle, ArrowRight, Activity, Zap } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function DemoPage() {
    const steps = [
        {
            title: "Global Search",
            desc: "Enter your origin and destination. Our engine aggregates real-time rates from 50+ ocean and air carriers instantly.",
            icon: Search,
            color: "text-blue-500"
        },
        {
            title: "Compare & Optimize",
            desc: "Filter by price, transit time, or carbon footprint. Select the route that perfectly aligns with your supply chain strategy.",
            icon: Activity,
            color: "text-green-500"
        },
        {
            title: "Instant Booking",
            desc: "Lock in your rate with a single click. No phone calls, no emails, no waiting. Direct digital handshake with the carrier.",
            icon: MousePointer2,
            color: "text-purple-500"
        },
        {
            title: "Live Execution",
            desc: "Manage documentation, customs, and last-mile drayage from your Sovereign Command Center. Total transparency.",
            icon: Box,
            color: "text-yellow-500"
        }
    ];

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
            <Navbar />

            <main className="pt-40 pb-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-24">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-md mb-8">
                            <Zap className="w-4 h-4 text-blue-400" />
                            <span className="text-sm font-medium text-blue-200">How OMEGO Works</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8">THE 4-STEP PROTOCOL.</h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Experience the future of logistics. We've eliminated the friction from global trade.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8 mb-32">
                        {steps.map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="relative group p-8 bg-zinc-900 border border-white/5 rounded-3xl hover:border-white/20 transition-all"
                            >
                                <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${step.color}`}>
                                    <step.icon className="w-6 h-6" />
                                </div>
                                <div className="absolute top-8 right-8 text-4xl font-black text-white/5 group-hover:text-white/10 transition-colors">0{i + 1}</div>
                                <h3 className="text-xl font-bold mb-4">{step.title}</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Visual Call to Action */}
                    <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tighter">READY TO SHIP?</h2>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <Link href="/search" className="bg-white text-black px-10 py-5 rounded-full text-lg font-bold hover:bg-gray-100 transition-all">
                                    Search Live Rates
                                </Link>
                                <Link href="/signup" className="bg-transparent border border-white/40 text-white px-10 py-5 rounded-full text-lg font-bold hover:bg-white/10 transition-all">
                                    Create Free Account
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
