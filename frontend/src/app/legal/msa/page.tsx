'use client'

import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { FileText, Download } from 'lucide-react'

export default function MSAPage() {
    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
            <Navbar />

            <main className="pt-24 pb-12">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <h1 className="text-4xl font-bold mb-8">Master Service Agreement (MSA)</h1>

                    <div className="bg-zinc-900 border border-white/10 p-8 rounded-2xl mb-12 text-center">
                        <FileText className="w-16 h-16 text-white mx-auto mb-6" />
                        <h2 className="text-2xl font-bold mb-4">Download the Full MSA</h2>
                        <p className="text-gray-400 mb-8">
                            Our Master Service Agreement governs the use of the Sovereign marketplace for all shippers and carriers.
                        </p>
                        <button
                            onClick={() => alert("⬇️ DOWNLOADING SECURE ASSET...\n\nFILE: SOVEREIGN_MSA_v2.4.pdf\nSIZE: 4.2 MB\nSTATUS: ENCRYPTED")}
                            className="bg-white text-black px-8 py-4 rounded-full font-bold hover:bg-gray-200 transition-all flex items-center justify-center mx-auto hover:scale-105 active:scale-95"
                        >
                            Download PDF <Download className="w-5 h-5 ml-2" />
                        </button>
                    </div>

                    <div className="space-y-8 text-gray-300">
                        <h2 className="text-2xl font-bold text-white">Key Provisions Summary</h2>
                        <ul className="list-disc pl-6 space-y-4">
                            <li><strong className="text-white">Service Scope:</strong> We provide a digital platform for booking international freight.</li>
                            <li><strong className="text-white">Service Availability:</strong> Logistics nodes and vessel access are subject to current network capacity and sovereign synchronization.</li>
                            <li><strong className="text-white">Confidentiality:</strong> Both parties agree to protect proprietary information.</li>
                            <li><strong className="text-white">Termination:</strong> Either party may terminate with 30 days written notice.</li>
                        </ul>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
