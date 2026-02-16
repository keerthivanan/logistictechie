'use client'

import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Search, Loader2, Sparkles, AlertCircle, CheckCircle2, Info, ArrowRight, Hash, Layers, Book, Database, Code } from 'lucide-react'
import { API_URL } from '@/lib/config'

export default function HSCodesPage() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<any[]>([])
    const [searching, setSearching] = useState(false)

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!query) return
        setSearching(true)
        try {
            const res = await fetch(`${API_URL}/api/ai/hs-discovery`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query })
            })
            const data = await res.json()
            if (data.success) {
                setResults(data.results)
            }
        } catch (e) {
            console.error('HS Search failed', e)
        } finally {
            setSearching(false)
        }
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
            <Navbar />

            <main className="pt-32 pb-20">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 mb-6">
                                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                                <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Global Taxonomy v4.1</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4">
                                Intelligent <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">HS Code</span> <br />Discovery
                            </h1>
                            <p className="text-xl text-gray-400 max-w-xl">
                                Classify goods with 99.9% accuracy using our semantic search engine.
                            </p>
                        </div>

                        <div className="flex gap-8 text-right">
                            <div>
                                <div className="text-3xl font-bold font-mono text-white">217k+</div>
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Classifications</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold font-mono text-white">195</div>
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Countries</div>
                            </div>
                        </div>
                    </div>

                    {/* Search Interface */}
                    <form onSubmit={handleSearch} className="bg-zinc-900/50 border border-white/10 rounded-3xl p-2 mb-12 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                        <div className="flex flex-col md:flex-row items-center">
                            <div className="p-4 hidden md:block">
                                <Search className="w-6 h-6 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Describe your product (e.g. 'Lithium batteries for EV cars')..."
                                className="w-full bg-transparent p-4 text-white focus:outline-none placeholder-gray-500 font-medium text-lg h-16"
                            />
                            <button
                                type="submit"
                                disabled={searching}
                                className="w-full md:w-auto bg-white text-black px-10 py-4 rounded-2xl font-bold m-2 hover:bg-gray-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {searching ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Identify Code <ArrowRight className="w-4 h-4" /></>}
                            </button>
                        </div>
                    </form>

                    {/* Results Grid */}
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="col-span-1 md:col-span-2 space-y-4">
                            <h3 className="text-gray-400 text-sm font-bold uppercase mb-2">
                                {results.length > 0 ? `Showing ${results.length} Predictions` : query ? 'Ready to analyze...' : 'Sample Results'}
                            </h3>

                            {(results.length > 0 ? results : [
                                { code: '8507.60', title: 'Lithium-ion Accumulators', desc: 'Electrical machinery and equipment and parts thereof; sound recorders and reproducers...', prob: '98%' },
                                { code: '8548.90', title: 'Electrical Parts of Machinery', desc: 'Waste and scrap of primary cells, primary batteries and electric accumulators...', prob: '45%' },
                            ]).map((item, i) => (
                                <div key={i} className="bg-black border border-white/10 p-6 rounded-2xl hover:bg-zinc-900 transition-all cursor-pointer group relative overflow-hidden">
                                    <div className="absolute right-0 top-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowRight className="w-5 h-5 text-white -rotate-45" />
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="bg-zinc-900 p-3 rounded-xl border border-white/5">
                                            <Hash className="w-6 h-6 text-purple-400" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="text-2xl font-mono font-bold text-white">{item.code}</span>
                                                <span className="px-2 py-0.5 rounded bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold">{item.prob} Match</span>
                                            </div>
                                            <h4 className="font-bold text-gray-200 mb-1">{item.title}</h4>
                                            <p className="text-sm text-gray-500 line-clamp-2">{item.desc}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Sidebar Stats */}
                        <div className="space-y-6">
                            <div className="bg-zinc-900/30 border border-white/10 p-6 rounded-2xl">
                                <h3 className="text-gray-400 text-sm font-bold uppercase mb-4">Taxonomy Engine</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400">01</div>
                                        <div className="text-sm text-gray-300">Chapter</div>
                                    </div>
                                    <div className="w-0.5 h-4 bg-white/10 ml-4"></div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-xs font-bold text-purple-400">02</div>
                                        <div className="text-sm text-gray-300">Heading</div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-indigo-900/20 to-blue-900/20 border border-white/10 p-6 rounded-2xl">
                                <Layers className="w-8 h-8 text-blue-400 mb-4" />
                                <h3 className="font-bold text-white mb-2">Duty Optimizer</h3>
                                <p className="text-sm text-gray-400 mb-4">
                                    Did you know? Incorrect classification costs businesses $4B+ annually in overpaid duties.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
