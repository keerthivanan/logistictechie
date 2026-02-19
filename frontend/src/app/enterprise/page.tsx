'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Shield, Globe, Cpu, Users, Zap, BarChart, ArrowRight, Building2, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function EnterprisePage() {
    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
            <Navbar />

            <main>
                {/* Hero */}
                <section className="relative pt-48 pb-32 overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-black to-black opacity-60"></div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-md mb-8">
                            <Building2 className="w-4 h-4 text-blue-400" />
                            <span className="text-sm font-medium text-blue-200">Enterprise Solutions</span>
                        </div>

                        <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-tight translate-y-[-10px]">
                            SUPPLY CHAIN <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500">
                                RE-ENGINEERED.
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 font-light leading-relaxed">
                            The world's largest enterprises rely on OMEGO to orchestrate high-velocity global trade with zero-latency data and AI-driven precision.
                        </p>

                        <div className="flex justify-center gap-6">
                            <Link href="/contact" className="bg-white text-black px-10 py-5 rounded-full text-lg font-bold hover:bg-gray-200 transition-all flex items-center gap-2">
                                Request a Demo <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Enterprise Features */}
                <section className="py-24 bg-zinc-950 border-y border-white/5">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-3 gap-12">
                            <div className="p-8 bg-black border border-white/10 rounded-2xl hover:border-blue-500/50 transition-all">
                                <Shield className="w-10 h-10 text-blue-500 mb-6" />
                                <h3 className="text-2xl font-bold mb-4">Sovereign Security</h3>
                                <p className="text-gray-400 leading-relaxed">
                                    Bank-grade encryption, SOC2 Type II compliance, and dedicated private cloud deployments for maximum data isolation.
                                </p>
                            </div>
                            <div className="p-8 bg-black border border-white/10 rounded-2xl hover:border-blue-500/50 transition-all">
                                <Globe className="w-10 h-10 text-purple-500 mb-6" />
                                <h3 className="text-2xl font-bold mb-4">Global Resilience</h3>
                                <p className="text-gray-400 leading-relaxed">
                                    Multi-lane redundancy across 2,000+ carriers ensures your cargo moves even during geopolitical shifts or port closures.
                                </p>
                            </div>
                            <div className="p-8 bg-black border border-white/10 rounded-2xl hover:border-blue-500/50 transition-all">
                                <Cpu className="w-10 h-10 text-green-500 mb-6" />
                                <h3 className="text-2xl font-bold mb-4">API Orchestration</h3>
                                <p className="text-gray-400 leading-relaxed">
                                    Seamlessly integrate OMEGO into your SAP, Oracle, or Microsoft Dynamics ERP with our high-throughput Enterprise API.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Trust Section */}
                <section className="py-32 bg-black">
                    <div className="max-w-5xl mx-auto px-4 text-center">
                        <h2 className="text-4xl font-bold mb-16">Why Global Leaders Choose OMEGO</h2>
                        <div className="space-y-12">
                            {[
                                "99.99% Guaranteed Platform Uptime Service Level Agreement (SLA).",
                                "Dedicated Success Manager and 24/7 Priority Concierge Support.",
                                "White-label capabilities for customer-facing tracking portals.",
                                "Automated customs classification for 180+ jurisdictions."
                            ].map((text, i) => (
                                <div key={i} className="flex items-center justify-center gap-4 text-xl md:text-2xl font-light text-gray-300">
                                    <CheckCircle className="w-6 h-6 text-blue-500 flex-shrink-0" />
                                    <span>{text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
