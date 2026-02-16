'use client'

import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function BlogPage() {
    const posts = [
        {
            title: "The Future of Digital Freight",
            excerpt: "How AI and automation are transforming the logistics landscape in 2026.",
            date: "Feb 15, 2026",
            readTime: "5 min read"
        },
        {
            title: "Understanding Incoterms 2026",
            excerpt: "A comprehensive guide to the latest international commercial terms.",
            date: "Feb 10, 2026",
            readTime: "8 min read"
        },
        {
            title: "Sustainable Shipping Practices",
            excerpt: "Reducing carbon footprint in your supply chain without innovative solutions.",
            date: "Feb 05, 2026",
            readTime: "6 min read"
        }
    ]

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
            <Navbar />

            <main className="pt-24 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <h1 className="text-5xl md:text-7xl font-bold mb-16 text-center">Logistics Insights</h1>

                    <div className="grid md:grid-cols-3 gap-8">
                        {posts.map((post, i) => (
                            <div key={i} className="bg-zinc-900 border border-white/10 rounded-xl overflow-hidden hover:border-white/30 transition-all group cursor-pointer">
                                <div className="aspect-video bg-zinc-800"></div>
                                <div className="p-8">
                                    <div className="text-xs text-gray-500 mb-2">{post.date} • {post.readTime}</div>
                                    <h3 className="text-xl font-bold mb-3 group-hover:text-gray-300 transition-colors">{post.title}</h3>
                                    <p className="text-gray-400 mb-6 text-sm line-clamp-2">{post.excerpt}</p>
                                    <div className="flex items-center text-sm font-bold text-white group-hover:translate-x-2 transition-transform">
                                        Read More <ArrowRight className="w-4 h-4 ml-2" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
