'use client'

import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Play } from 'lucide-react'
import { API_URL } from '@/lib/config'

export default function DemoPage() {
    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
            <Navbar />

            <main className="pt-24 pb-12">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                    <h1 className="text-5xl md:text-7xl font-bold mb-8">See it in Action</h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-16">
                        Watch how Freightos simplifies global logistics in under 2 minutes.
                    </p>

                    <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
                        <div className="relative aspect-video bg-zinc-900 rounded-2xl overflow-hidden border border-white/10 shadow-2xl group cursor-pointer">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                                    <Play className="w-10 h-10 text-white fill-white ml-2" />
                                </div>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                            <div className="absolute bottom-8 left-8 text-left">
                                <h3 className="text-2xl font-bold">Platform Overview</h3>
                                <p className="text-gray-300">Walkthrough of the booking process</p>
                            </div>
                        </div>

                        <div className="bg-zinc-900/50 p-8 rounded-2xl border border-white/10 text-left">
                            <h3 className="text-2xl font-bold mb-6">Book a Live Demo</h3>
                            <form className="space-y-4" onSubmit={async (e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                const data = {
                                    name: formData.get('name'),
                                    email: formData.get('email'),
                                    company: formData.get('company'),
                                    interest: 'Live Demo'
                                };
                                try {
                                    const res = await fetch(`${API_URL}/api/dashboard/leads`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify(data)
                                    });
                                    if (res.ok) alert('Demo Request Sent! Our team will contact you shortly.');
                                } catch (err) {
                                    alert('Error sending request.');
                                }
                            }}>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                                    <input name="name" type="text" required className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="John Doe" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Work Email</label>
                                    <input name="email" type="email" required className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="john@company.com" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Company Name</label>
                                    <input name="company" type="text" required className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="Logistics Inc." />
                                </div>
                                <button type="submit" className="w-full bg-white text-black font-bold py-4 rounded-lg hover:bg-gray-200 transition-colors mt-4">
                                    Schedule Demo
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 text-left">
                        <div>
                            <div className="text-4xl font-bold mb-4 text-white/20">01</div>
                            <h3 className="text-xl font-bold mb-2">Search</h3>
                            <p className="text-gray-400">Instantly access rates from 75+ carriers globally.</p>
                        </div>
                        <div>
                            <div className="text-4xl font-bold mb-4 text-white/20">02</div>
                            <h3 className="text-xl font-bold mb-2">Compare</h3>
                            <p className="text-gray-400">Filter by price, transit time, and reliability score.</p>
                        </div>
                        <div>
                            <div className="text-4xl font-bold mb-4 text-white/20">03</div>
                            <h3 className="text-xl font-bold mb-2">Book</h3>
                            <p className="text-gray-400">Secure your spot and manage documents online.</p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
