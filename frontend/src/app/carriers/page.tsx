'use client'

import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ComparisonChart from '@/components/visuals/ComparisonChart'
import Link from 'next/link'
import { ArrowRight, Container, Ship, Anchor } from 'lucide-react'

export default function CarriersPage() {
    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
            <Navbar />

            <main>
                {/* Hero */}
                <section className="relative pt-48 pb-32 overflow-hidden">
                    <div className="absolute inset-0 bg-[linear-gradient(to_bottom,black,transparent)] z-10 pointer-events-none"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800/30 via-black to-black opacity-40"></div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-20">
                        <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-tight">
                            FILL EVERY <br />
                            <span className="text-white">CONTAINER.</span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-12 font-light leading-relaxed">
                            Yield management at infinite scale. OMEGO connects your fleet directly to the demand, ignoring the middlemen.
                        </p>

                        <div className="flex justify-center space-x-4">
                            <Link href="/contact" className="bg-white text-black px-10 py-5 rounded-full text-lg font-bold hover:bg-gray-200 transition-all flex items-center gap-2 group">
                                Partner With Us <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Comparison Section */}
                <section className="py-24 bg-zinc-950 border-y border-white/10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-2 gap-16 items-center">
                            <div className="order-2 md:order-1 relative">
                                <ComparisonChart />
                            </div>
                            <div className="order-1 md:order-2">
                                <h2 className="text-4xl font-bold mb-6">Optimization is the new Standard.</h2>
                                <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                                    Empty slots are lost revenue. Our predictive engines forecast demand 12 weeks out, allowing you to price dynamically and fill capacity before it reaches port.
                                </p>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="p-6 bg-black border border-white/10 rounded-xl">
                                        <div className="text-3xl font-black text-white mb-2">98%</div>
                                        <div className="text-sm text-gray-500 uppercase font-bold">Load Factor</div>
                                    </div>
                                    <div className="p-6 bg-black border border-white/10 rounded-xl">
                                        <div className="text-3xl font-black text-white mb-2">+22%</div>
                                        <div className="text-sm text-gray-500 uppercase font-bold">Revenue / TEU</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <Footer />
            </main>
        </div>
    )
}
