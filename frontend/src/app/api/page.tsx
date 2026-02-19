'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Code2, Terminal, Cpu, Share2, BookOpen, Key, Link as LinkIcon, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ApiDocsPage() {
    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
            <Navbar />

            <main className="pt-40 pb-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-20">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-md mb-8">
                            <Code2 className="w-4 h-4 text-blue-400" />
                            <span className="text-sm font-medium text-blue-200 uppercase tracking-widest">Developer Hub</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">SOVEREIGN API.</h1>
                        <p className="text-xl text-gray-400 max-w-2xl">
                            Integrate OMEGO directly into your internal tools. Our high-throughput API provides real-time access to rates, tracking, and compliance data.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 mb-20">
                        <div className="bg-zinc-900 border border-white/10 rounded-2xl p-8 group hover:border-white/30 transition-all">
                            <Terminal className="w-10 h-10 text-white mb-6" />
                            <h3 className="text-2xl font-bold mb-4">Quickstart Guide</h3>
                            <p className="text-gray-400 mb-8">Ready to ship? Our API gets you from authentication to your first booking in under 10 minutes.</p>
                            <Link href="#" className="flex items-center gap-2 text-blue-400 font-bold hover:text-white transition-colors">
                                View Documentation <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="bg-zinc-900 border border-white/10 rounded-2xl p-8 group hover:border-white/30 transition-all">
                            <Key className="w-10 h-10 text-white mb-6" />
                            <h3 className="text-2xl font-bold mb-4">API Management</h3>
                            <p className="text-gray-400 mb-8">Generate and manage your production keys. Available for Pro and Enterprise accounts.</p>
                            <Link href="/login" className="flex items-center gap-2 text-blue-400 font-bold hover:text-white transition-colors">
                                Access Dashboard <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Code Snippet Preview */}
                    <div className="bg-[#0a0c10] border border-white/10 rounded-3xl overflow-hidden mb-20 shadow-2xl">
                        <div className="flex justify-between items-center px-6 py-4 border-b border-white/5 bg-[#11141a]">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                            </div>
                            <span className="text-xs font-mono text-gray-500">GET /api/v1/rates/search</span>
                        </div>
                        <div className="p-8 font-mono text-sm leading-relaxed overflow-x-auto">
                            <pre className="text-blue-400">
                                {`curl --request GET \\
  --url 'https://api.omego.com/v1/rates' \\
  --header 'Authorization: Bearer <YOUR_API_KEY>' \\
  --data-urlencode 'origin=CNSHA' \\
  --data-urlencode 'destination=SARKD' \\
  --data-urlencode 'container=40HC'`}
                            </pre>
                            <div className="mt-4 text-gray-500">
                                # Response returns real-time Maersk, MSC, & aggregator data
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
