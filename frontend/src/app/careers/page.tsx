'use client'

import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function CareersPage() {
    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
            <Navbar />

            <main className="">

                {/* Hero Section */}
                <section className="relative py-40 overflow-hidden">
                    <div className="absolute inset-0">
                        <img
                            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop"
                            alt="Team Collaboration"
                            className="w-full h-full object-cover opacity-30"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black"></div>
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                        <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tighter">Join the Revolution</h1>
                        <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto font-light">
                            Help us build the operating system for global trade.
                        </p>
                    </div>
                </section>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

                    <div className="grid gap-6 max-w-4xl mx-auto">
                        {['Senior Backend Engineer', 'Product Designer', 'Sales Director (EMEA)', 'Customer Success Manager'].map((job, i) => (
                            <div key={i} className="bg-zinc-900 border border-white/10 p-6 rounded-xl flex items-center justify-between hover:bg-zinc-800 transition-all group">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">{job}</h3>
                                    <p className="text-gray-400 text-sm">Remote / Hybrid • Full-time</p>
                                </div>
                                <Link href="#" className="bg-white text-black px-6 py-2 rounded-full font-bold text-sm hover:bg-gray-200 transition-all flex items-center">
                                    Apply <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
