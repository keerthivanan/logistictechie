'use client'

import Navbar from '@/components/layout/Navbar'

const sections = [
    {
        num: '01',
        title: 'Introduction',
        body: 'CargoLink ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and protect your personal information when you use our platform.',
    },
    {
        num: '02',
        title: 'Information We Collect',
        body: 'We collect information you provide directly to us, including: account information (name, email, password), company details (address, tax ID), shipment history and logistics data, and shipment details (origin, destination, cargo description).',
    },
    {
        num: '03',
        title: 'How We Use Your Information',
        body: 'We use your data to provide our logistics services, match shippers with freight forwarders, process bookings, send service-related communications, and improve platform performance. We do not sell your personal data to third parties.',
    },
    {
        num: '04',
        title: 'Data Sharing',
        body: 'We share your information with freight forwarders and carriers only as necessary to fulfill a booking. We may also share data with service providers who operate under strict confidentiality agreements on our behalf.',
    },
    {
        num: '05',
        title: 'Data Security',
        body: 'We implement industry-standard security measures including encryption in transit and at rest, strict access controls, and regular security audits to protect your information from unauthorized access.',
    },
    {
        num: '06',
        title: 'Your Rights',
        body: 'You have the right to access, correct, or delete your personal data at any time. You may also request data portability or withdraw consent. To exercise these rights, contact us at privacy@cargolink.io.',
    },
    {
        num: '07',
        title: 'Data Retention',
        body: 'We retain your personal data for as long as your account is active or as needed to provide services. You may request deletion at any time, subject to legal and contractual obligations.',
    },
    {
        num: '08',
        title: 'Changes to This Policy',
        body: 'We may update this Privacy Policy from time to time. We will notify you of material changes by email or by posting a notice on the platform. Continued use of the platform constitutes acceptance of the updated policy.',
    },
]

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-black text-white font-inter selection:bg-white selection:text-black">
            <Navbar />

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">

                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-2xl font-semibold font-outfit uppercase tracking-tight text-white mb-2">
                        Privacy Policy
                    </h1>
                    <p className="text-xs text-zinc-500 font-inter">How CargoLink collects, uses, and protects your personal information.</p>
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
                    <a href="mailto:privacy@cargolink.io" className="text-zinc-500 hover:text-white transition-colors underline">privacy@cargolink.io</a>
                </p>
                <div className="flex justify-center mt-8">
                    <img src="/cargolink.png" alt="CargoLink" className="h-10 w-auto object-contain opacity-30" />
                </div>
            </div>
        </div>
    )
}
