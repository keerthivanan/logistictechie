'use client'

import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Mail, MapPin, Phone } from 'lucide-react'

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
            <Navbar />

            <main className="pt-24 pb-12">
                {/* Hero Background */}
                <div className="relative h-[400px] overflow-hidden mb-12">
                    <img
                        src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=2072&auto=format&fit=crop"
                        alt="Customer Support"
                        className="w-full h-full object-cover opacity-40"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tighter z-10">Contact Us</h1>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                    <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
                        <div className="space-y-8">
                            <div className="flex items-start space-x-4">
                                <MapPin className="w-6 h-6 text-white mt-1" />
                                <div>
                                    <h3 className="font-bold text-xl mb-2">Global Headquarters</h3>
                                    <p className="text-gray-400">King Abdullah Financial District<br />Riyadh, Saudi Arabia 13519</p>
                                    <p className="text-gray-500 text-xs mt-2">Innovation Hub: San Francisco, CA</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <Phone className="w-6 h-6 text-white mt-1" />
                                <div>
                                    <h3 className="font-bold text-xl mb-2">24/7 Support Line</h3>
                                    <p className="text-gray-400 font-mono">+966 11 460 0000</p>
                                    <p className="text-gray-500 text-sm font-mono">+1 (415) 999-0101 (US)</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <Mail className="w-6 h-6 text-white mt-1" />
                                <div>
                                    <h3 className="font-bold text-xl mb-2">Secure Channel</h3>
                                    <p className="text-gray-400 font-mono">mission@sovereign.ai</p>
                                </div>
                            </div>
                        </div>

                        <form className="space-y-4">
                            <input type="text" placeholder="Name" className="w-full bg-zinc-900 border border-white/10 p-4 rounded-lg text-white focus:outline-none focus:border-white transition-colors" />
                            <input type="email" placeholder="Email" className="w-full bg-zinc-900 border border-white/10 p-4 rounded-lg text-white focus:outline-none focus:border-white transition-colors" />
                            <textarea placeholder="Message" rows={4} className="w-full bg-zinc-900 border border-white/10 p-4 rounded-lg text-white focus:outline-none focus:border-white transition-colors"></textarea>
                            <button className="w-full bg-white text-black py-4 rounded-lg font-bold hover:bg-gray-200 transition-all">
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
