'use client'

import Navbar from '@/components/layout/Navbar'

const sections = [
    {
        num: '01',
        title: 'What Are Cookies',
        body: 'Cookies are small text files stored on your device when you visit a website. They help us remember your preferences, keep you signed in, and understand how you use the platform.',
    },
    {
        num: '02',
        title: 'Essential Cookies',
        body: 'These cookies are required for the platform to function. They enable core features like user authentication, session management, and security. You cannot opt out of essential cookies.',
    },
    {
        num: '03',
        title: 'Analytics Cookies',
        body: 'We use analytics cookies (e.g. Google Analytics) to understand how visitors use our site — which pages are visited, how long sessions last, and where traffic comes from. This helps us improve the platform.',
    },
    {
        num: '04',
        title: 'Preference Cookies',
        body: 'These cookies remember your settings and preferences such as language, region, and display options, so you don\'t have to reconfigure them on each visit.',
    },
    {
        num: '05',
        title: 'Marketing Cookies',
        body: 'Marketing cookies track your browsing activity across websites to deliver relevant advertisements. We use these only with your explicit consent.',
    },
    {
        num: '06',
        title: 'Managing Cookies',
        body: 'You can control cookies through your browser settings. Note that disabling certain cookies may affect the functionality of the platform. Most browsers allow you to view, delete, or block cookies from specific sites.',
    },
    {
        num: '07',
        title: 'Third-Party Services',
        body: 'Some features on our platform use third-party services (e.g. payment processors, analytics providers) that may set their own cookies. These are governed by their respective privacy policies.',
    },
    {
        num: '08',
        title: 'Contact',
        body: 'If you have questions about our use of cookies, please contact us at privacy@cargolink.io. We are committed to transparency and will respond within 5 business days.',
    },
]

export default function CookiePage() {
    return (
        <div className="min-h-screen bg-black text-white font-inter selection:bg-white selection:text-black">
            <Navbar />

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">

                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-2xl font-black font-outfit uppercase tracking-tight text-white mb-2">
                        Cookie Policy
                    </h1>
                    <p className="text-xs text-zinc-500 font-inter">How CargoLink uses cookies and similar tracking technologies.</p>
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
            </div>
        </div>
    )
}
