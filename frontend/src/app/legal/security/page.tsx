'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Lock, ShieldCheck, Heart, EyeOff, Key, Database, Server, ScrollText } from 'lucide-react';

export default function SecurityPage() {
    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
            <Navbar />

            <main className="pt-40 pb-32">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-20 text-center">
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">ZERO TRUST.</h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                            Security isn't a feature; it's our foundation. OMEGO is built on a Sovereign Encryption Protocol designed to protect global trade data at all costs.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 mb-20">
                        <div className="space-y-4">
                            <Lock className="w-12 h-12 text-blue-500 mb-4" />
                            <h3 className="text-2xl font-bold">End-to-End Encryption</h3>
                            <p className="text-gray-400 leading-relaxed">
                                All shipment data, commercial invoices, and financial documents are encrypted at rest using AES-256 and in transit via TLS 1.3.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <ShieldCheck className="w-12 h-12 text-green-500 mb-4" />
                            <h3 className="text-2xl font-bold">ISO & SOC Compliance</h3>
                            <p className="text-gray-400 leading-relaxed">
                                We maintain SOC2 Type II, ISO 27001, and GDPR compliance. Our infrastructure is audited quarterly by tier-1 security firms.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <Database className="w-12 h-12 text-purple-500 mb-4" />
                            <h3 className="text-2xl font-bold">Data Residency</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Choose where your data lives. OMEGO supports regional residency across US, EU, and Middle East (KSA/UAE) hubs.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <Key className="w-12 h-12 text-yellow-500 mb-4" />
                            <h3 className="text-2xl font-bold">Identity Guard</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Sovereign ID provides biometric-backed authentication and granular role-based access control (RBAC) for every team member.
                            </p>
                        </div>
                    </div>

                    <div className="bg-zinc-900 border border-white/10 rounded-3xl p-10 text-center">
                        <ScrollText className="w-12 h-12 text-white mx-auto mb-6 opacity-30" />
                        <h3 className="text-2xl font-bold mb-4">Security Whitepaper</h3>
                        <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                            Read our deep dive into the OMEGO Sovereign Network architecture and how we protect the global supply chain ledger.
                        </p>
                        <button className="bg-white text-black px-10 py-3 rounded-full font-bold hover:bg-gray-200 transition-all">
                            Download PDF
                        </button>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
