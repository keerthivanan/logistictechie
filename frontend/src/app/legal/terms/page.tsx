'use client'

import Navbar from '@/components/layout/Navbar'

const sections = [
    {
        num: '01',
        title: 'Acceptance of Terms',
        body: 'By accessing or using the CargoLink platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this platform.',
    },
    {
        num: '02',
        title: 'User Accounts',
        body: 'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.',
    },
    {
        num: '03',
        title: 'Booking & Services',
        body: 'All bookings made through the platform are subject to carrier availability and carrier verification. Fulfillment is governed by the agreed logistics service terms between you and the selected carrier or freight forwarder.',
    },
    {
        num: '04',
        title: 'Payments & Fees',
        body: 'Quoted prices are estimates and may vary based on final cargo dimensions, weight, and applicable surcharges. CargoLink charges a service fee on completed bookings. All fees are clearly disclosed before confirmation.',
    },
    {
        num: '05',
        title: 'Liability',
        body: 'CargoLink acts as an intermediary between shippers and freight forwarders. We are not liable for cargo loss, damage, or delay, which is subject to the carrier\'s terms and applicable international conventions including the Hague-Visby Rules.',
    },
    {
        num: '06',
        title: 'Privacy',
        body: 'Your use of the platform is also governed by our Privacy Policy, which is incorporated into these Terms by reference. We collect and process personal data in accordance with applicable data protection laws.',
    },
    {
        num: '07',
        title: 'Termination',
        body: 'CargoLink reserves the right to suspend or terminate your account at any time for violation of these terms. You may also terminate your account at any time by contacting our support team.',
    },
    {
        num: '08',
        title: 'Governing Law',
        body: 'These Terms shall be governed by and construed in accordance with applicable international commercial law. Any disputes shall be resolved through binding arbitration in accordance with standard commercial arbitration rules.',
    },
]

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-black text-white font-inter selection:bg-white selection:text-black">
            <Navbar />

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">

                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-2xl font-black font-outfit uppercase tracking-tight text-white mb-2">
                        Terms of Service
                    </h1>
                    <p className="text-xs text-zinc-500 font-inter">Please read these terms carefully before using CargoLink.</p>
                    <p className="text-xs text-zinc-700 font-mono mt-2">Last updated: February 16, 2026</p>
                </div>

                {/* Sections */}
                <div className="bg-[#0a0a0a] border border-white/[0.05] rounded-2xl divide-y divide-white/[0.05]">
                    {sections.map(({ num, title, body }) => (
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
                    Questions? Contact us at{' '}
                    <a href="mailto:legal@cargolink.io" className="text-zinc-500 hover:text-white transition-colors underline">legal@cargolink.io</a>
                </p>
            </div>
        </div>
    )
}
