"use client";

import { useState } from "react";
import { PortAutocomplete } from "@/components/ui/PortAutocomplete";
import { VesselAutocomplete } from "@/components/ui/VesselAutocomplete";
import { Button } from "@/components/ui/button";
import { Calendar, Search, Ship, Clock, ArrowLeftRight, MapPin, Zap, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuoteStore } from "@/hooks/use-quote";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { CargoSelectionPopover } from "../quote/CargoSelectionPopover";
import { cn } from "@/lib/utils";

export function LogisticsSearchBar() {
    const [activeTab, setActiveTab] = useState<'rates' | 'tracking' | 'schedules'>('rates');
    const [origin, setOrigin] = useState("");
    const [destination, setDestination] = useState("");
    const router = useRouter();
    const { updateForm, formData } = useQuoteStore();
    const { t } = useLanguage();

    const handleSearch = () => {
        if (activeTab === 'rates') {
            if (!origin || !destination) return;
            updateForm({ origin, destination });
            router.push('/quote');
        } else if (activeTab === 'tracking') {
            router.push(`/tracking`);
        } else if (activeTab === 'schedules') {
            router.push(`/schedules`);
        }
    };

    return (
        <div className="w-full">
            {/* Dark Tactical Tabs */}
            <div className="flex items-center gap-2 mb-0 px-2">
                {[
                    { id: 'rates', icon: Ship, label: t('components.search_bar.tabs.rates') },
                    { id: 'tracking', icon: Search, label: t('components.search_bar.tabs.tracking') },
                    { id: 'schedules', icon: Clock, label: t('components.search_bar.tabs.schedules') }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={cn(
                            "flex items-center gap-3 px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-t-2xl transition-all",
                            activeTab === tab.id
                                ? "bg-zinc-900 text-white border-x border-t border-white/10"
                                : "bg-transparent text-white/30 hover:text-white"
                        )}
                    >
                        <tab.icon className={cn("h-4 w-4", activeTab === tab.id ? "text-white" : "text-white/20")} />
                        {tab.label}
                    </button>
                ))}

                {/* Tactical Request Link */}
                <button className="ml-auto flex items-center gap-3 px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-t-2xl transition-all">
                    <Zap className="h-4 w-4 text-white" />
                    {t('nav.getQuote')} ↗
                </button>
            </div>

            {/* High-Density Search Command Container */}
            <div className="bg-zinc-950 rounded-[32px] md:rounded-full shadow-[0_0_100px_rgba(0,0,0,1)] p-3 border border-white/10 flex flex-col md:flex-row items-center gap-2 backdrop-blur-3xl">

                {activeTab === 'rates' && (
                    <>
                        <div className="flex-[1.2] flex items-center w-full md:w-auto px-8 h-16 bg-white/5 md:bg-transparent rounded-full md:rounded-none group hover:bg-white/5 transition-all">
                            <MapPin className="h-5 w-5 text-white/20 mr-4 group-hover:text-white transition-colors" />
                            <PortAutocomplete
                                value={origin}
                                onChange={setOrigin}
                                placeholder={t('components.search_bar.placeholders.origin')}
                                minimal={true}
                                className="w-full text-sm font-bold text-white placeholder:text-white/20 bg-transparent border-none outline-none"
                            />
                        </div>

                        <div className="hidden md:block w-px h-10 bg-white/10" />
                        <ArrowLeftRight className="h-4 w-4 text-white/10 mx-4 hidden md:block" />
                        <div className="hidden md:block w-px h-10 bg-white/10" />

                        <div className="flex-[1.2] flex items-center w-full md:w-auto px-8 h-16 bg-white/5 md:bg-transparent rounded-full md:rounded-none group hover:bg-white/5 transition-all">
                            <MapPin className="h-5 w-5 text-white/20 mr-4 group-hover:text-white transition-colors" />
                            <PortAutocomplete
                                value={destination}
                                onChange={setDestination}
                                placeholder={t('components.search_bar.placeholders.destination')}
                                minimal={true}
                                className="w-full text-sm font-bold text-white placeholder:text-white/20 bg-transparent border-none outline-none"
                            />
                        </div>

                        <div className="hidden md:block w-px h-10 bg-white/10" />

                        <div className="flex-1 flex items-center w-full md:w-auto px-8 h-16 bg-white/5 md:bg-transparent rounded-full md:rounded-none group hover:bg-white/5 transition-all cursor-pointer">
                            <Calendar className="h-5 w-5 text-white/20 mr-4 group-hover:text-white transition-colors" />
                            <span className="text-sm font-bold text-white whitespace-nowrap uppercase tracking-tighter">
                                14 Feb, 2026
                            </span>
                        </div>

                        <div className="hidden md:block w-px h-10 bg-white/10" />

                        <div className="flex-1 flex items-center w-full md:w-auto px-6 md:px-8 h-16 bg-white/5 md:bg-transparent rounded-full md:rounded-none group hover:bg-white/5 transition-all">
                            <Ship className="h-5 w-5 text-white/20 mr-4 group-hover:text-white transition-colors" />
                            <CargoSelectionPopover
                                containerSize={formData.containerSize || "40"}
                                onChange={(size) => updateForm({ containerSize: size as any })}
                                className="w-full"
                            />
                        </div>
                    </>
                )}

                {/* Tracking & Schedules fallbacks */}
                {(activeTab === 'tracking' || activeTab === 'schedules') && (
                    <div className="flex-1 flex items-center w-full px-8 h-16">
                        <input
                            className="w-full h-full bg-transparent text-sm font-bold text-white placeholder:text-white/20 outline-none uppercase tracking-widest"
                            placeholder={t(`components.search_bar.placeholders.${activeTab === 'tracking' ? 'tracking_input' : 'from'}`)}
                        />
                    </div>
                )}

                <button
                    onClick={handleSearch}
                    className="h-16 w-full md:w-24 bg-white hover:bg-zinc-200 text-black rounded-full transition-all flex items-center justify-center group active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.1)]"
                >
                    <Search className="h-6 w-6 stroke-[3] group-hover:scale-110 transition-transform" />
                </button>
            </div>

            {/* Tactical Recent Searches */}
            <div className="mt-8 flex items-center gap-6 text-[10px] font-black text-white/20 px-10">
                <span className="uppercase tracking-[0.4em]">RECENT_EXTRACTIONS</span>
                <div className="flex items-center gap-4 px-6 py-2 bg-white/5 border border-white/5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer group">
                    <Clock className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform" />
                    Chennai, IN <ArrowRight className="w-3 h-3" /> Dammam, SA
                </div>
            </div>
        </div>
    );
}
