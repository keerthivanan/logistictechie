'use client'

import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
            <Navbar />

            <main className="pt-24 pb-12">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
                    <p className="text-gray-400 mb-8">Last updated: February 16, 2026</p>

                    <div className="space-y-8 text-gray-300">
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                            <p>By accessing or using the Sovereign platform, you agree to be bound by these Terms of Service.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">2. User Accounts</h2>
                            <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">3. Booking & Payments</h2>
                            <p>All bookings made through the platform are subject to carrier availability. Payments must be made in accordance with the agreed payment terms.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">4. Liability</h2>
                            <p>Sovereign acts as an intermediary. We are not liable for cargo loss or damage, which is subject to the carrier's terms and applicable international conventions.</p>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
