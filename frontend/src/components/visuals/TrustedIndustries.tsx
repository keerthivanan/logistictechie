'use client';

import { Factory, Cog, ShoppingBag, Stethoscope, Car, Plane } from 'lucide-react';

const industries = [
    { name: 'Automotive', icon: Car },
    { name: 'Pharma & Healthcare', icon: Stethoscope },
    { name: 'Retail & E-commerce', icon: ShoppingBag },
    { name: 'Manufacturing', icon: Factory },
    { name: 'Aerospace', icon: Plane },
    { name: 'Industrial', icon: Cog },
];

export default function TrustedIndustries() {
    return (
        <section className="py-20 bg-black overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black z-10 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Powering Complex Supply Chains Across</h3>
            </div>

            <div className="flex gap-20 animate-infinite-scroll">
                {[...industries, ...industries, ...industries].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 text-gray-400 hover:text-white transition-colors group cursor-pointer whitespace-nowrap">
                        <item.icon className="w-8 h-8 group-hover:scale-110 transition-transform" />
                        <span className="text-xl font-bold">{item.name}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}
