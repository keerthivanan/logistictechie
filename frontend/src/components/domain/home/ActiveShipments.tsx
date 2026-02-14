"use client";

import { motion } from "framer-motion";
import { Ship, Anchor, Clock, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";

const routes = {
    lcl: [
        { from: "Tokyo", fromCode: "JP", to: "Manzanillo", toCode: "MX", time: "3 hours" },
        { from: "Rio De Jan...", fromCode: "BR", to: "Kailua", toCode: "US", time: "9 hours" },
        { from: "Hamburg", fromCode: "DE", to: "Alexandria", toCode: "EG", time: "12 hours" },
        { from: "Itajai", fromCode: "BR", to: "Cartagena", toCode: "CO", time: "19 hours" },
    ],
    fcl: [
        { from: "Alexandria", fromCode: "EG", to: "Latakia", toCode: "SY", time: "10 hours" },
        { from: "Genoa", fromCode: "IT", to: "New York", toCode: "US", time: "12 hours" },
        { from: "Bandar Ma...", fromCode: "IR", to: "Mumbai", toCode: "IN", time: "13 hours" },
        { from: "Ningbo", fromCode: "CN", to: "Annaba", toCode: "DZ", time: "17 hours" },
    ],
    special: [
        { from: "Pollachi", fromCode: "IN", to: "Bandar Ab...", toCode: "IR", time: "2 days" },
        { from: "Calcutta", fromCode: "IN", to: "Misurata", toCode: "LY", time: "2 days" },
        { from: "Mundra", fromCode: "IN", to: "Genova", toCode: "IT", time: "2 days" },
        { from: "Mombasa", fromCode: "KE", to: "Bratislava", toCode: "SK", time: "3 days" },
    ]
};

const Flag = ({ code }: { code: string }) => (
    <img
        src={`https://flagcdn.com/w20/${code.toLowerCase()}.png`}
        alt={code}
        className="w-4 h-3 object-cover rounded-[1px] shadow-sm"
    />
);

export function ActiveShipments() {
    const { t } = useLanguage();

    return (
        <section className="py-48 bg-black relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent" />

            <div className="container max-w-[1400px] mx-auto px-6 relative z-10">
                <div className="text-center mb-32 group">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[1em] mb-8 block">LOGISTICS_TELEMETRY</span>
                    <h2 className="text-4xl md:text-7xl font-black text-white mb-8 uppercase tracking-tighter group-hover:italic transition-all duration-700">
                        Active_Monitor.
                    </h2>
                    <p className="text-white/40 max-w-2xl mx-auto mb-16 text-[12px] font-bold uppercase tracking-widest leading-relaxed">
                        {t('home.active_shipments.subtitle')}
                    </p>
                    <button className="h-16 px-12 bg-white text-black font-black text-[10px] uppercase tracking-[0.6em] rounded-full hover:bg-zinc-200 transition-all active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                        {t('home.active_shipments.cta')}
                    </button>
                </div>

                <div className="grid md:grid-cols-3 gap-12">
                    {/* LCL */}
                    <ShipmentCard
                        title={t('home.active_shipments.lcl')}
                        icon={<Ship className="w-6 h-6" />}
                        data={routes.lcl}
                    />
                    {/* FCL */}
                    <ShipmentCard
                        title={t('home.active_shipments.fcl')}
                        icon={<Anchor className="w-6 h-6" />}
                        data={routes.fcl}
                    />
                    {/* Special */}
                    <ShipmentCard
                        title={t('home.active_shipments.special')}
                        icon={<Clock className="w-6 h-6" />}
                        data={routes.special}
                    />
                </div>
            </div>
        </section>
    );
}

function ShipmentCard({ title, icon, data }: { title: string, icon: React.ReactNode, data: any[] }) {
    return (
        <div className="bg-zinc-950/50 rounded-[40px] border border-white/5 p-10 hover:border-white/20 transition-all duration-700 group backdrop-blur-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
                {icon}
            </div>

            <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-all duration-500">
                        {icon}
                    </div>
                    <h3 className="font-black text-white text-lg uppercase tracking-tighter">{title}</h3>
                </div>
                <ArrowRight className="w-5 h-5 text-white/10 group-hover:text-white transition-colors" />
            </div>

            <div className="space-y-8">
                {data.map((route, idx) => (
                    <div key={idx} className="flex items-center justify-between group/row cursor-pointer border-b border-white/5 pb-6 last:border-0 last:pb-0">
                        <div className="flex items-center gap-5">
                            <div className="flex items-center gap-3">
                                <Flag code={route.fromCode} />
                                <span className="text-[12px] font-black text-white/40 group-hover/row:text-white transition-colors uppercase truncate w-20">{route.from}</span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-white/5 group-hover/row:translate-x-1 transition-transform" />
                            <div className="flex items-center gap-3">
                                <Flag code={route.toCode} />
                                <span className="text-[12px] font-black text-white/40 group-hover/row:text-white transition-colors uppercase truncate w-20">{route.to}</span>
                            </div>
                        </div>
                        <span className="text-[10px] font-black text-white/20 group-hover/row:text-white uppercase tracking-widest">{route.time}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
