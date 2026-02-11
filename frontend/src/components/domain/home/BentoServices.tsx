"use client";

import { motion } from "framer-motion";
import { Package, Globe, ShieldCheck, Zap, Cpu, BarChart3 } from "lucide-react";
import Link from "next/link";

const categories = [
    {
        title: "Vessel Schedules",
        description: "Global daily schedule updates from 50+ ocean carriers.",
        icon: Globe,
        color: "zinc-900",
        size: "col-span-2 row-span-2",
        href: "/schedules"
    },
    {
        title: "Freight Analytics",
        description: "Real-time rate benchmarks.",
        icon: BarChart3,
        color: "zinc-900",
        size: "col-span-1 row-span-1",
        href: "/market"
    },
    {
        title: "Secure Docs",
        description: "Encrypted BL handling.",
        icon: ShieldCheck,
        color: "zinc-950",
        size: "col-span-1 row-span-1",
        href: "/services"
    },
    {
        title: "Priority Link",
        description: "Instant carrier bookings via API.",
        icon: Zap,
        color: "white",
        textColor: "black",
        size: "col-span-2 row-span-1",
        href: "/quote"
    }
];

export function BentoServices() {
    return (
        <section className="py-24 bg-black">
            <div className="container max-w-7xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-16"
                >
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight uppercase italic">
                        The Infrastructure. <span className="text-zinc-800">Built for Scale.</span>
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
                    {categories.map((cat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className={`${cat.size} ${cat.color === 'white' ? 'bg-white text-black' : 'bg-zinc-950 border border-white/5'} p-12 group relative overflow-hidden flex flex-col justify-end rounded-none hover:border-white/20 transition-all`}
                        >
                            <div className={`absolute top-12 left-12 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-12`}>
                                <cat.icon className={`h-12 w-12 ${cat.color === 'white' ? 'text-black' : 'text-emerald-500'}`} />
                            </div>

                            <div className="relative z-10">
                                <h3 className="text-3xl font-black uppercase italic mb-3 tracking-tighter leading-none">{cat.title}</h3>
                                <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${cat.color === 'white' ? 'text-zinc-500' : 'text-zinc-700'}`}>{cat.description}</p>
                            </div>

                            <Link href={cat.href} className="absolute inset-0 z-10" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
