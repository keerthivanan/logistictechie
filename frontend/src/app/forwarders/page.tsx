'use client'

import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import AiChatVisual from '@/components/visuals/AiChatVisual'
import MetricsGrid from '@/components/visuals/MetricsGrid'
import Link from 'next/link'
import { ArrowRight, Globe, Zap, Users } from 'lucide-react'

export default function ForwardersPage() {
    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
            <Navbar />

            <main>
                {/* Hero */}
                <section className="relative pt-48 pb-32 overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/40 via-black to-black opacity-60"></div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <div>
                                <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-tight">
                                    DIGITIZE <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-white">
                                        OR DIE.
                                    </span>
                                </h1>
                                <p className="text-xl text-gray-400 mb-10 font-light leading-relaxed">
                                    The era of manual quoting is over. Use OMEGO&apos;s AI to automate your sales, operations, and customer service.
                                </p>
                                <div className="flex gap-4">
                                    <Link href="/signup" className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold hover:bg-blue-500 transition-all flex items-center gap-2 group">
                                        Join the Network <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>

                            <div className="relative">
                                <AiChatVisual />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Metrics Section */}
                <section className="py-24 bg-zinc-950 border-y border-white/10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-2 gap-16 items-center">
                            <div>
                                <MetricsGrid />
                            </div>
                            <div>
                                <h2 className="text-4xl font-bold mb-6">Sales on Autopilot.</h2>
                                <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                                    Stop chasing leads. Our platform connects you with 10,000+ verified importers actively searching for quotes.
                                    Your team focuses on closing; we handle the prospecting.
                                </p>
                                <ul className="space-y-4">
                                    <li className="flex items-center gap-3 font-medium text-white">
                                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center"><Users className="w-4 h-4 text-blue-400" /></div>
                                        Instant Access to Shippers
                                    </li>
                                    <li className="flex items-center gap-3 font-medium text-white">
                                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center"><Zap className="w-4 h-4 text-blue-400" /></div>
                                        Automated Spot Quotes
                                    </li>
                                    <li className="flex items-center gap-3 font-medium text-white">
                                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center"><Globe className="w-4 h-4 text-blue-400" /></div>
                                        Global Payment Processing
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                <Footer />
            </main>
        </div>
    )
}
