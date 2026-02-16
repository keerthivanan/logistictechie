'use client'

import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Search, MessageCircle, FileText, HelpCircle } from 'lucide-react'

export default function HelpPage() {
    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
            <Navbar />

            <main className="pt-24 pb-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <h1 className="text-4xl md:text-6xl font-bold mb-8 text-center">How can we help?</h1>

                    <div className="relative mb-16">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search for answers..."
                            className="w-full bg-zinc-900 border border-white/10 py-4 pl-12 pr-4 rounded-xl text-white focus:outline-none focus:border-white transition-colors"
                        />
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 mb-16">
                        <div className="bg-zinc-900 border border-white/10 p-6 rounded-xl hover:border-white/30 transition-all cursor-pointer">
                            <FileText className="w-8 h-8 text-white mb-4" />
                            <h3 className="font-bold mb-2">Documentation</h3>
                            <p className="text-gray-400 text-sm">Guides on how to use the platform.</p>
                        </div>
                        <div className="bg-zinc-900 border border-white/10 p-6 rounded-xl hover:border-white/30 transition-all cursor-pointer">
                            <MessageCircle className="w-8 h-8 text-white mb-4" />
                            <h3 className="font-bold mb-2">Live Chat</h3>
                            <p className="text-gray-400 text-sm">Talk to our support team 24/7.</p>
                        </div>
                        <div className="bg-zinc-900 border border-white/10 p-6 rounded-xl hover:border-white/30 transition-all cursor-pointer">
                            <HelpCircle className="w-8 h-8 text-white mb-4" />
                            <h3 className="font-bold mb-2">FAQs</h3>
                            <p className="text-gray-400 text-sm">Common questions answered.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold mb-4">Popular Articles</h2>
                        {['How to track a shipment', 'Understanding customs duties', 'Payment methods accepted', 'API Integration Guide'].map((article, i) => (
                            <div key={i} className="bg-black border border-white/10 p-4 rounded-lg flex items-center justify-between hover:bg-zinc-900 cursor-pointer">
                                <span>{article}</span>
                                <HelpCircle className="w-4 h-4 text-gray-500" />
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
