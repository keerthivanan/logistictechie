"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowRight, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const articles = [
    {
        image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800",
        category: "Innovations",
        date: "Feb 13, 2026",
        title: "Phoenix Logistics Updates - Week 7, 2026",
    },
    {
        image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=800",
        category: "Shipping & Logistics",
        date: "Feb 12, 2026",
        title: "Lunar New Year 2026: How to Avoid Delays and Surprises",
    },
    {
        image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800",
        category: "Offers",
        date: "Feb 10, 2026",
        title: "Phoenix Vessel Tracking: Real-Time Intelligence in Action",
    }
];

export function NewsSection() {
    const { t } = useLanguage();

    return (
        <section className="py-48 bg-black relative">
            <div className="container max-w-[1400px] mx-auto px-6">
                <div className="flex flex-col md:flex-row items-center justify-between mb-32 group">
                    <div className="mb-12 md:mb-0">
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-[1em] mb-8 block">LOGISTICS_INTELLIGENCE</span>
                        <h2 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter group-hover:italic transition-all duration-700">
                            Node_Updates.
                        </h2>
                    </div>
                    <button className="h-16 px-16 bg-white text-black font-black text-[10px] uppercase tracking-[0.6em] rounded-full hover:bg-zinc-200 transition-all active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                        {t('home.news.cta')}
                    </button>
                </div>

                <div className="grid md:grid-cols-3 gap-12">
                    {articles.map((article, idx) => (
                        <div key={idx} className="bg-zinc-950/40 rounded-[48px] overflow-hidden border border-white/5 hover:border-white/20 transition-all duration-700 group cursor-pointer backdrop-blur-3xl">
                            <div className="aspect-[16/10] overflow-hidden relative">
                                <img
                                    src={article.image}
                                    alt={article.title}
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale group-hover:grayscale-0"
                                />
                                <div className="absolute top-8 left-8">
                                    <div className="bg-black/80 backdrop-blur-xl border border-white/10 px-6 py-2 rounded-full shadow-2xl">
                                        <span className="text-[10px] font-black text-white uppercase tracking-[0.4em]">{article.category}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-12">
                                <div className="flex items-center gap-6 text-[11px] font-black text-white/20 uppercase tracking-[0.4em] mb-8">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-4 h-4" />
                                        {article.date}
                                    </div>
                                </div>
                                <h3 className="text-2xl font-black text-white leading-[1.1] uppercase tracking-tighter group-hover:text-white/60 transition-colors">
                                    {article.title}
                                </h3>

                                <div className="mt-12 flex items-center gap-4 text-white/0 group-hover:text-white transition-all duration-700 translate-x-[-20px] group-hover:translate-x-0">
                                    <span className="text-[10px] font-black uppercase tracking-[0.6em]">READ_FULL_INTEL</span>
                                    <ArrowRight className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tactical Detail Overlay */}
            <div className="absolute bottom-0 left-0 w-full h-[300px] bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />
        </section>
    );
}
