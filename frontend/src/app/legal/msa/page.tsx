'use client'

import Navbar from '@/components/layout/Navbar'

const provisions = [
    {
        num: '01',
        title: 'Service Scope',
        body: 'CargoLink provides a digital platform for requesting, comparing, and booking international freight forwarding services. The platform connects shippers with verified freight forwarders and carriers.',
    },
    {
        num: '02',
        title: 'Service Availability',
        body: 'Platform access is subject to network availability and scheduled maintenance windows. We target 99.9% uptime and will provide advance notice of planned downtime where possible.',
    },
    {
        num: '03',
        title: 'User Obligations',
        body: 'Users agree to provide accurate shipment information, comply with all applicable laws and regulations, and not use the platform for prohibited or unlawful cargo.',
    },
    {
        num: '04',
        title: 'Confidentiality',
        body: 'Both parties agree to protect each other\'s proprietary and confidential information. Pricing, business data, and cargo information shall not be disclosed to unauthorized third parties.',
    },
    {
        num: '05',
        title: 'Payment Terms',
        body: 'All fees are billed in accordance with the rate schedule agreed at the time of booking. CargoLink charges a service fee on completed bookings, clearly disclosed before confirmation.',
    },
    {
        num: '06',
        title: 'Liability Limitation',
        body: 'CargoLink\'s liability is limited to direct damages arising from platform errors. CargoLink is not liable for cargo loss, damage, or delay caused by carriers or freight forwarders.',
    },
    {
        num: '07',
        title: 'Termination',
        body: 'Either party may terminate this agreement with 30 days written notice. CargoLink reserves the right to suspend accounts for violations of these terms without prior notice.',
    },
    {
        num: '08',
        title: 'Governing Law',
        body: 'This agreement shall be governed by applicable international commercial law. Disputes shall be resolved through binding arbitration under standard commercial arbitration rules.',
    },
]

export default function MSAPage() {
    return (
        <div className="min-h-screen bg-black text-white font-inter selection:bg-white selection:text-black">
            <Navbar />

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">

                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-2xl font-black font-outfit uppercase tracking-tight text-white mb-2">
                        Master Service Agreement
                    </h1>
                    <p className="text-xs text-zinc-500 font-inter">The terms governing use of the CargoLink platform for all shippers, forwarders, and carriers.</p>
                    <p className="text-xs text-zinc-700 font-mono mt-2">Last updated: February 16, 2026</p>
                </div>

                {/* Download notice */}
                <div className="bg-[#0a0a0a] border border-white/[0.05] rounded-2xl p-5 mb-6 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-inter mb-1">Full MSA Document</p>
                        <p className="text-xs text-zinc-500 font-inter">Contact our team to receive the full executed MSA document.</p>
                    </div>
                    <a
                        href="mailto:legal@cargolink.io?subject=MSA Request"
                        className="bg-white text-black px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest font-inter hover:bg-zinc-100 transition-colors flex-shrink-0"
                    >
                        Request Document
                    </a>
                </div>

                {/* Provisions */}
                <div className="bg-[#0a0a0a] border border-white/[0.05] rounded-2xl divide-y divide-white/[0.05]">
                    {provisions.map(({ num, title, body }) => (
                        <div key={num} className="p-6">
                            <div className="flex items-start gap-4">
                                <span className="text-[10px] font-mono text-zinc-700 mt-0.5 flex-shrink-0">{num}</span>
                                <div>
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-inter mb-2">{title}</p>
                                    <p className="text-sm text-zinc-400 font-inter leading-relaxed">{body}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <p className="text-xs text-zinc-700 font-inter text-center mt-8">
                    Legal inquiries:{' '}
                    <a href="mailto:legal@cargolink.io" className="text-zinc-500 hover:text-white transition-colors underline">legal@cargolink.io</a>
                </p>
            </div>
        </div>
    )
}
