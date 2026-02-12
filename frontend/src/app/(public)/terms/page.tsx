"use client";

import { motion } from "framer-motion";

export default function TermsPage() {
    const sections = [
        { id: "01", title: "Operational Use", content: "By accessing the Phoenix OS, you agree to comply with all global maritime and terrestrial logistics regulations." },
        { id: "02", title: "Data Integrity", content: "All data submitted must be legitimate. Any intentional corruption of the manifests will result in immediate link termination." },
        { id: "03", title: "Intellectual Property", content: "The architectural design, neural logic, and operational frameworks are sovereign property of Phoenix Logistics Firm." },
        { id: "04", title: "Liability", content: "Phoenix OS provides high-fidelity data streams but is not responsible for physical vessel delays caused by climate or geopolitical flux." },
        { id: "05", title: "Security Protocols", content: "Users are responsible for the confidentiality of their access keys. Any unauthorized node entry must be reported within milliseconds." }
    ];

    return (
        <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
            <div className="container max-w-[1400px] mx-auto px-8 py-48">

                {/* Architectural Header */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="grid lg:grid-cols-2 gap-32 mb-64"
                >
                    <div>
                        <span className="arch-label mb-12 block">LEGAL_CORE</span>
                        <h1 className="arch-heading">Terms of <br />Engagement</h1>
                    </div>
                    <div className="flex flex-col justify-end">
                        <p className="text-3xl font-light text-zinc-400 leading-tight max-w-xl text-right ml-auto">
                            The following protocols govern your <strong className="text-white">synced interaction</strong> with the Phoenix Logistics OS.
                        </p>
                    </div>
                </motion.div>

                {/* Structured Sections */}
                <div className="space-y-32">
                    {sections.map((section) => (
                        <div key={section.id} className="grid lg:grid-cols-[1fr,3fr] gap-32 border-t border-white/5 pt-32">
                            <div className="flex items-start gap-8">
                                <span className="arch-number">0{section.id}</span>
                                <h3 className="arch-label mt-4">{section.title}</h3>
                            </div>
                            <p className="text-3xl font-light text-zinc-500 leading-relaxed max-w-4xl italic">
                                "{section.content}"
                            </p>
                        </div>
                    ))}
                </div>

                {/* Sub-footer Section */}
                <div className="mt-96 text-center border-t border-white/5 pt-48 pb-24">
                    <span className="arch-label mb-12 block">PROTOCOL_V4.1.0</span>
                    <h2 className="arch-heading italic mb-16">Legitimate. Secure.</h2>
                </div>
            </div>
        </main>
    );
}
