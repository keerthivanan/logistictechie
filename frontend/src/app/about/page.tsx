'use client'

import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Rocket, Shield, Globe, Cpu, History, Target, Zap } from 'lucide-react'

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
            <Navbar />
            <main className="">
                {/* Hero */}
                <section className="relative pt-32 pb-32 overflow-hidden">
                    <div className="absolute inset-0">
                        <img
                            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop"
                            alt="Global Connectivity"
                            className="w-full h-full object-cover opacity-30 animate-pulse-slow"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-zinc-950"></div>
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">

                        <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter">
                            ORCHESTRATING <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                                EARTH&apos;S CARGO.
                            </span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-16 font-light leading-relaxed">
                            We aren&apos;t just moving boxes. We are rewriting the physics of global trade with
                            <span className="text-white font-bold"> artificial intelligence </span>
                            and absolute precision.
                        </p>
                    </div>
                </section>

                {/* The Vision Grid */}
                <section className="py-24 border-y border-white/5 bg-zinc-950">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-3 gap-12">
                            <div className="text-center group">
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:bg-white/10 transition-colors">
                                    <Globe className="w-10 h-10 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">Total Connectivity</h3>
                                <p className="text-gray-400 leading-relaxed">
                                    A single neural network connecting 10,000+ importers, airlines, and ocean liners. No silos. No friction.
                                </p>
                            </div>
                            <div className="text-center group">
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:bg-white/10 transition-colors">
                                    <Cpu className="w-10 h-10 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">Silicon Intelligence</h3>
                                <p className="text-gray-400 leading-relaxed">
                                    Replacing instinct with algorithms. Our AI core predicts disruptions before they happen.
                                </p>
                            </div>
                            <div className="text-center group">
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:bg-white/10 transition-colors">
                                    <Rocket className="w-10 h-10 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">Infinite Scale</h3>
                                <p className="text-gray-400 leading-relaxed">
                                    Built to handle the GDP of nations. From one pallet to a million TEUs, our platform never blinks.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Timeline / History */}
                <section className="py-32">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-4xl font-bold mb-16 text-center">The Timeline of Innovation</h2>

                        <div className="relative border-l border-white/10 ml-8 md:ml-1/2 space-y-16">
                            {[
                                { year: "2024", title: "Project Alpha", desc: "The code was written. A new intelligence was born to solve the fragmentation of global trade." },
                                { year: "2025", title: "The Neural Network", desc: "Sovereign connected 100+ major ports into a single, real-time nervous system." },
                                { year: "2026", title: "Global Dominance", desc: "Today, we process billions in cargo value with zero human error. The standard has been set." },
                                { year: "FUTURE", title: "Autonomous Logistics", desc: "Self-correcting supply chains. The engine that runs the world." }
                            ].map((item, i) => (
                                <div key={i} className="relative pl-12">
                                    <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 bg-white rounded-full ring-4 ring-black"></div>
                                    <span className="text-sm font-mono text-gray-500 mb-2 block">{item.year}</span>
                                    <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                                    <p className="text-gray-400 max-w-md">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <Footer />
            </main>
        </div>
    )
}
