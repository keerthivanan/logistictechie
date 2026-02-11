"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { HelpCircle, MessageSquare, Phone } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function HelpPage() {
    const { t } = useLanguage();

    return (
        <main className="min-h-screen bg-black pt-32 pb-48 px-6 text-white">
            <div className="container max-w-7xl mx-auto space-y-32">
                <div className="space-y-10">
                    <span className="text-[10px] font-black uppercase tracking-[0.6em] text-emerald-500 block">Support Infrastructure</span>
                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.9]">
                        Operational. <br />
                        <span className="text-zinc-800">Assistance.</span>
                    </h1>
                    <p className="text-zinc-500 text-lg font-bold uppercase tracking-tight max-w-xl">
                        Comprehensive documentation and direct support channels for the Phoenix Logistics OS.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { icon: HelpCircle, title: "Knowledge Base", desc: "Access the full technical specifications.", btn: "READ DOCS" },
                        { icon: MessageSquare, title: "Tactical Chat", desc: "Direct link to our operations team.", btn: "OPEN LINK" },
                        { icon: Phone, title: "Voice Call", desc: "24/7 global emergency support line.", btn: "INITIATE" }
                    ].map((card, i) => (
                        <div key={i} className="bg-zinc-950 border border-white/5 p-12 hover:border-white/20 transition-all group flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-white flex items-center justify-center mb-10 group-hover:-rotate-12 transition-transform duration-500">
                                <card.icon className="w-8 h-8 text-black" />
                            </div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] mb-6">{card.title}</h3>
                            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed mb-10 flex-1">{card.desc}</p>
                            <Button className="w-full h-14 bg-white/5 border-none text-white hover:bg-emerald-500 hover:text-black rounded-none font-black text-[10px] uppercase tracking-[0.3em] transition-all">
                                {card.btn}
                            </Button>
                        </div>
                    ))}
                </div>

                <div className="space-y-16">
                    <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">
                        Frequent. <span className="text-zinc-800">Queries.</span>
                    </h2>
                    <div className="grid gap-2">
                        {[0, 1, 2, 3].map((i) => (
                            <div key={i} className="bg-zinc-950 border border-white/5 p-10 flex justify-between items-center group cursor-pointer hover:bg-zinc-900 transition-colors">
                                <span className="font-black text-[10px] uppercase tracking-[0.2em] text-zinc-400 group-hover:text-white">{t(`support.help.qs.${i}`)}</span>
                                <div className="h-2 w-2 bg-emerald-500 group-hover:scale-150 transition-transform" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
