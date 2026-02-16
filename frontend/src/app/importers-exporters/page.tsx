'use client'

import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { Search, Clock, CreditCard, ArrowRight, Globe, Shield, Zap, TrendingUp, Anchor, Box } from 'lucide-react'
import ComparisonChart from '@/components/visuals/ComparisonChart'
import MetricsGrid from '@/components/visuals/MetricsGrid'

export default function ImportersExportersPage() {
    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
            <Navbar />

            <main className="">
                {/* Hero Section */}
                <section className="relative pt-48 pb-32 overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black opacity-40"></div>
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 animate-pulse"></div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-md mb-8">
                            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                            <span className="text-sm font-medium text-blue-200">Global Trade OS v2.0</span>
                        </div>

                        <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-tight">
                            GLOBAL DOMINANCE <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500">
                                STARTS HERE.
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 font-light leading-relaxed">
                            Stop guessing. Start orchestrating. OMEGO gives importers and exporters the
                            <span className="text-white font-bold"> god-mode view </span>
                            of their entire supply chain.
                        </p>

                        <div className="flex justify-center space-x-4">
                            <Link href="/search" className="bg-white text-black px-10 py-5 rounded-full text-lg font-bold hover:bg-gray-200 transition-all flex items-center gap-2 group">
                                Compare Rates Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* The Problem / Solution Grid */}
                <section className="py-24 bg-zinc-950 border-y border-white/5">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-2 gap-16 items-center">
                            <div>
                                <h2 className="text-4xl font-bold mb-6">Legacy freight is opaque.</h2>
                                <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                                    Spreadsheets, emails, and phone calls. The old way of managing logistics is a black box that costs you money and time.
                                    You can't optimize what you can't see.
                                </p>
                                <MetricsGrid />
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-2xl blur-2xl"></div>
                                <ComparisonChart />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="py-32">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-20">
                            <h2 className="text-5xl font-bold mb-6">Orchestrate Everything.</h2>
                            <p className="text-xl text-gray-400">Complete command over your global operations.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="p-8 bg-zinc-900/30 border border-white/10 rounded-2xl hover:bg-zinc-900/50 transition-all group">
                                <Search className="w-10 h-10 text-white mb-6 group-hover:text-blue-400 transition-colors" />
                                <h3 className="text-2xl font-bold mb-4">Instant Spot Quotes</h3>
                                <p className="text-gray-400 leading-relaxed">
                                    Compare live rates from over 75 carriers and forwarders instantly. Book the best price or fastest route in one click.
                                </p>
                            </div>
                            <div className="p-8 bg-zinc-900/30 border border-white/10 rounded-2xl hover:bg-zinc-900/50 transition-all group">
                                <Box className="w-10 h-10 text-white mb-6 group-hover:text-blue-400 transition-colors" />
                                <h3 className="text-2xl font-bold mb-4">Container Intelligence</h3>
                                <p className="text-gray-400 leading-relaxed">
                                    Know exactly what is in every container. Digital packing lists and SKU-level visibility for inventory planning.
                                </p>
                            </div>
                            <div className="p-8 bg-zinc-900/30 border border-white/10 rounded-2xl hover:bg-zinc-900/50 transition-all group">
                                <CreditCard className="w-10 h-10 text-white mb-6 group-hover:text-blue-400 transition-colors" />
                                <h3 className="text-2xl font-bold mb-4">Capital Efficiency</h3>
                                <p className="text-gray-400 leading-relaxed">
                                    Pay freight charges later. Unlock working capital with our embedded trade finance solutions.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <Footer />
            </main>
        </div>
    )
}
