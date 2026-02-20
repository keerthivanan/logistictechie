'use client';

import Link from 'next/link';
import { Ship, Plane, Box, Warehouse, Anchor, Globe, BarChart, ShieldCheck, ArrowRight } from 'lucide-react';

const solutions = [
    {
        icon: Ship,
        title: 'Ocean Freight',
        desc: 'FCL & LCL shipping with guaranteed capacity on all major trade lanes. Real-time tracking down to the container level.',
        image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2070&auto=format&fit=crop',
        href: '/services/ocean-freight'
    },
    {
        icon: Plane,
        title: 'Air Freight',
        desc: 'Time-critical air cargo solutions. Next-flight-out options and chartered services for urgent global deliveries.',
        image: 'https://images.unsplash.com/photo-1524592714635-d77511a4834d?q=80&w=3870&auto=format&fit=crop',
        href: '/services/air-freight'
    },
    {
        icon: ShieldCheck,
        title: 'Customs Compliance',
        desc: 'AI-powered clearance reduces documentation errors by 99%. Automated HS code classification and duty optimization.',
        image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=3870&auto=format&fit=crop',
        href: '/services/customs-compliance'
    },
    {
        icon: Warehouse,
        title: 'Smart Warehousing',
        desc: 'Network of 500+ tech-enabled fulfillment centers. On-demand storage and automated picking/packing.',
        image: 'https://images.unsplash.com/photo-1589792923962-537704632910?q=80&w=3870&auto=format&fit=crop',
        href: '/services/smart-warehousing'
    },
    {
        icon: Anchor,
        title: 'Port Drayage',
        desc: 'Seamless first/last mile port connections. Digital booking for chassis and drayage trucks to avoid demurrage.',
        image: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?q=80&w=3870&auto=format&fit=crop',
        href: '/services/port-drayage'
    },
    {
        icon: BarChart,
        title: 'Supply Chain Tower',
        desc: 'End-to-end visibility control tower. Predictive analytics to foresee disruptions before they impact inventory.',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=3870&auto=format&fit=crop',
        href: '/services/supply-chain-tower'
    }
];

export default function SolutionsGrid() {
    return (
        <section className="py-32 bg-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">Comprehensive Logistics Solutions</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                        From raw material to final mile, Sovereign orchestrates every step of your journey with military-grade precision.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {solutions.map((item, i) => (
                        <Link href={item.href} key={i} className="group h-[400px] relative rounded-2xl overflow-hidden border border-white/10 hover:border-blue-500/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] block">
                            {/* Background Image */}
                            <div className="absolute inset-0">
                                <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-50" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                            </div>

                            <div className="absolute inset-0 p-8 flex flex-col justify-end">
                                <div className="absolute inset-0 p-10 flex flex-col justify-end">
                                    <h3 className="text-3xl font-bold mb-4 text-white group-hover:text-blue-400 transition-colors tracking-tighter">{item.title}</h3>
                                    <p className="text-zinc-400 leading-relaxed text-sm opacity-80 group-hover:opacity-100 transition-all duration-300">
                                        {item.desc}
                                    </p>

                                    <div className="mt-8 flex items-center text-xs font-black uppercase tracking-[0.2em] text-blue-500 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                                        Explore Protocol <ArrowRight className="ml-2 w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}

