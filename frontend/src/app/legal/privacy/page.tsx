'use client'

import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
            <Navbar />

            <main className="pt-24 pb-12">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
                    <p className="text-gray-400 mb-8">Last updated: February 16, 2026</p>

                    <div className="space-y-8 text-gray-300">
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
                            <p>Sovereign Intelligence ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and share your personal information.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
                            <p className="mb-4">We collect information you provide directly to us, including:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Account information (name, email, password)</li>
                                <li>Company details (address, tax ID)</li>
                                <li>Payment information (processed securely by Stripe)</li>
                                <li>Shipment data (origin, destination, goods description)</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Data</h2>
                            <p>We use your data to provide our logistics services, process payments, and improve our platform. We do not sell your personal data to third parties.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">4. Data Security</h2>
                            <p>We implement industry-standard security measures, including encryption and access controls, to protect your information.</p>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
