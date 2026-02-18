import Link from 'next/link'

export default function Footer() {
    return (
        <footer className="bg-black border-t border-white/10 py-20 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-16">
                    <div className="flex items-center space-x-2 mb-6">
                        <div className="w-3 h-6 bg-white rounded-sm"></div>
                        <div className="w-3 h-6 bg-white/70 rounded-sm"></div>
                        <div className="w-3 h-6 bg-white/40 rounded-sm"></div>
                        <span className="text-2xl font-bold tracking-tight text-white ml-2">OMEGO</span>
                    </div>
                    <p className="text-gray-500 max-w-xl">
                        The evolved Supply Chain & AI performance tracker for the fastest-growing teams. Scale without limits and dominate global trade.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-20">
                    <div>
                        <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Product</h3>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li><Link href="/importers-exporters" className="hover:text-white transition-colors">Rate Tracker</Link></li>
                            <li><Link href="/forwarders" className="hover:text-white transition-colors">AI Quoting</Link></li>
                            <li><Link href="/carriers" className="hover:text-white transition-colors">Yield Agent</Link></li>
                            <li><Link href="/enterprise" className="hover:text-white transition-colors">Enterprise</Link></li>
                            <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Features</h3>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li><Link href="/search" className="hover:text-white transition-colors">Search Rates</Link></li>
                            <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                            <li><Link href="/tools/calculator" className="hover:text-white transition-colors">Calculator</Link></li>
                            <li><Link href="/tools/hs-codes" className="hover:text-white transition-colors">HS Codes</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Company</h3>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                            <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Resources</h3>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                            <li><Link href="/api" className="hover:text-white transition-colors">API Docs</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Legal</h3>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li><Link href="/legal/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                            <li><Link href="/legal/terms" className="hover:text-white transition-colors">Terms</Link></li>
                            <li><Link href="/legal/security" className="hover:text-white transition-colors">Security</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10">
                    <p className="text-gray-600 text-sm">© 2011-2026 Omego Ltd. All rights reserved.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        {/* Socials placeholder */}
                        <div className="w-5 h-5 bg-white/10 rounded-full hover:bg-white/20 transition-colors"></div>
                        <div className="w-5 h-5 bg-white/10 rounded-full hover:bg-white/20 transition-colors"></div>
                        <div className="w-5 h-5 bg-white/10 rounded-full hover:bg-white/20 transition-colors"></div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
