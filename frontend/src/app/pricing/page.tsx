'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Check, ArrowRight, Zap, Building, Crown } from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
            <Navbar />

            <main className="pt-40 pb-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-20">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">TRANSPARENT VALUE.</h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        High-performance logistics shouldn't have hidden costs. Choose the tier that matches your operational velocity.
                    </p>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-8">
                    {/* Basic */}
                    <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-8 flex flex-col hover:border-white/30 transition-all">
                        <div className="flex items-center gap-3 mb-8">
                            <Zap className="w-6 h-6 text-gray-400" />
                            <h3 className="text-xl font-bold">Standard</h3>
                        </div>
                        <div className="mb-8">
                            <span className="text-5xl font-black">$0</span>
                            <span className="text-gray-500 ml-2">/ month</span>
                        </div>
                        <p className="text-gray-400 mb-8 text-sm">Perfect for individuals and small merchants starting their global journey.</p>
                        <ul className="space-y-4 mb-12 flex-1">
                            {['Live Spot Rates', 'Basic Tracking', 'Email Support', '1 User Account'].map((item) => (
                                <li key={item} className="flex items-center gap-3 text-sm">
                                    <Check className="w-4 h-4 text-green-500" /> {item}
                                </li>
                            ))}
                        </ul>
                        <Link href="/signup" className="w-full py-4 bg-white/5 border border-white/10 rounded-xl font-bold text-center hover:bg-white/10 transition-all text-sm">
                            Get Started
                        </Link>
                    </div>

                    {/* Pro */}
                    <div className="bg-white text-black rounded-3xl p-8 flex flex-col transform md:scale-105 shadow-[0_0_50px_rgba(255,255,255,0.1)] relative z-10 border border-white/10">
                        <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                            Most Popular
                        </div>
                        <div className="flex items-center gap-3 mb-8">
                            <Building className="w-6 h-6 text-blue-600" />
                            <h3 className="text-xl font-bold">Pro Operations</h3>
                        </div>
                        <div className="mb-8">
                            <span className="text-5xl font-black">$499</span>
                            <span className="text-gray-500 ml-2">/ month</span>
                        </div>
                        <p className="text-gray-600 mb-8 text-sm">Engineered for growing teams that need scale and efficiency.</p>
                        <ul className="space-y-4 mb-12 flex-1">
                            {[
                                'Priority Allocations',
                                'Real-time AIS Tracking',
                                'Capital Credit Line',
                                'Up to 10 User Accounts',
                                'Customs Automation (Beta)'
                            ].map((item) => (
                                <li key={item} className="flex items-center gap-3 text-sm font-bold">
                                    <Check className="w-4 h-4 text-blue-600" /> {item}
                                </li>
                            ))}
                        </ul>
                        <Link href="/signup" className="w-full py-4 bg-black text-white rounded-xl font-bold text-center hover:bg-zinc-800 transition-all text-sm flex items-center justify-center gap-2">
                            Select Pro <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* Enterprise */}
                    <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-8 flex flex-col hover:border-white/30 transition-all">
                        <div className="flex items-center gap-3 mb-8">
                            <Crown className="w-6 h-6 text-yellow-500" />
                            <h3 className="text-xl font-bold">Enterprise</h3>
                        </div>
                        <div className="mb-8 font-black text-3xl">CUSTOM</div>
                        <p className="text-gray-400 mb-8 text-sm">For global organizations requiring mission-critical infrastructure.</p>
                        <ul className="space-y-4 mb-12 flex-1">
                            {[
                                'Unlimited Scale',
                                'Dedicated Success Manager',
                                'Enterprise API Access',
                                'Global Redundancy Protocol',
                                'SOC2 Implementation'
                            ].map((item) => (
                                <li key={item} className="flex items-center gap-3 text-sm">
                                    <Check className="w-4 h-4 text-yellow-500" /> {item}
                                </li>
                            ))}
                        </ul>
                        <Link href="/contact" className="w-full py-4 bg-white/5 border border-white/10 rounded-xl font-bold text-center hover:bg-white/10 transition-all text-sm">
                            Contact Sales
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
