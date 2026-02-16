'use client'

import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function CookiePage() {
    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
            <Navbar />

            <main className="pt-24 pb-12">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <h1 className="text-4xl font-bold mb-8">Cookie Policy</h1>

                    <div className="space-y-8 text-gray-300">
                        <p>This policy explains how we use cookies and similar technologies on our website.</p>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">What are cookies?</h2>
                            <p>Cookies are small text files stored on your device that help us remember your preferences and improve your experience.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">Types of Cookies We Use</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong className="text-white">Essential Cookies:</strong> Necessary for the website to function (e.g., login sessions).</li>
                                <li><strong className="text-white">Analytics Cookies:</strong> Help us understand how visitors use our site (e.g., Google Analytics).</li>
                                <li><strong className="text-white">Marketing Cookies:</strong> Used to track visitors across websites to display relevant ads.</li>
                            </ul>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
