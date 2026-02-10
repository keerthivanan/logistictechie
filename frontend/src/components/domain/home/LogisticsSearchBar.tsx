"use client";

import { useState } from "react";
import { PortAutocomplete } from "@/components/ui/PortAutocomplete";
import { CommodityAutocomplete } from "@/components/ui/CommodityAutocomplete";
import { VesselAutocomplete } from "@/components/ui/VesselAutocomplete";
import { Button } from "@/components/ui/button";
import { Calendar, Search, Ship, Clock, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuoteStore } from "@/hooks/use-quote";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

export function LogisticsSearchBar() {
    const [activeTab, setActiveTab] = useState<'rates' | 'tracking' | 'schedules'>('rates');
    const [origin, setOrigin] = useState("");
    const [destination, setDestination] = useState("");
    const [commodity, setCommodity] = useState("");
    const [trackingInput, setTrackingInput] = useState("");
    const router = useRouter();
    const { updateForm } = useQuoteStore();
    const { t } = useLanguage();

    const handleSearch = () => {
        if (activeTab === 'rates') {
            updateForm({
                origin,
                destination,
                commodity: commodity || "General Cargo"
            });
            router.push('/quote');
        } else if (activeTab === 'tracking') {
            if (trackingInput) {
                router.push(`/tracking?id=${encodeURIComponent(trackingInput)}`);
            } else {
                router.push('/tracking');
            }
        } else if (activeTab === 'schedules') {
            const params = new URLSearchParams();
            if (origin) params.set('origin', origin);
            if (destination) params.set('dest', destination);
            router.push(`/schedules?${params.toString()}`);
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto">
            {/* Navigation Tabs - Clean Professional Style */}
            <div className="flex border-b border-zinc-800">
                {[
                    { id: 'rates', icon: Ship, label: t('components.search_bar.tabs.rates') },
                    { id: 'tracking', icon: Search, label: t('components.search_bar.tabs.tracking') },
                    { id: 'schedules', icon: Clock, label: t('components.search_bar.tabs.schedules') }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all relative ${activeTab === tab.id
                            ? 'text-white'
                            : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                    >
                        <tab.icon className="h-4 w-4" />
                        <span>{tab.label}</span>
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeTabIndicator"
                                className="absolute bottom-0 left-0 w-full h-0.5 bg-white"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Search Form - Professional Clean Design */}
            <div className="bg-zinc-900/50 border border-zinc-800 border-t-0 p-4 flex flex-col lg:flex-row items-stretch gap-3">

                {/* --- RATES TAB CONTENT --- */}
                {activeTab === 'rates' && (
                    <div className="flex-1 grid md:grid-cols-4 gap-3">
                        <div className="bg-zinc-800/50 rounded-lg flex items-center px-4 h-14 hover:bg-zinc-800 transition-colors">
                            <PortAutocomplete
                                value={origin}
                                onChange={setOrigin}
                                placeholder={t('components.search_bar.placeholders.origin')}
                                minimal={true}
                                className="h-full text-sm text-white bg-transparent border-none focus:ring-0 placeholder:text-zinc-500"
                            />
                        </div>
                        <div className="bg-zinc-800/50 rounded-lg flex items-center px-4 h-14 hover:bg-zinc-800 transition-colors">
                            <PortAutocomplete
                                value={destination}
                                onChange={setDestination}
                                placeholder={t('components.search_bar.placeholders.destination')}
                                minimal={true}
                                className="h-full text-sm text-white bg-transparent border-none focus:ring-0 placeholder:text-zinc-500"
                            />
                        </div>
                        <div className="bg-zinc-800/50 rounded-lg flex items-center px-4 h-14 gap-3 cursor-pointer hover:bg-zinc-800 transition-colors">
                            <Calendar className="h-4 w-4 text-zinc-400" />
                            <span className="text-sm text-zinc-400">{t('components.search_bar.labels.ready')}</span>
                        </div>
                        <div className="bg-zinc-800/50 rounded-lg flex items-center px-4 h-14 hover:bg-zinc-800 transition-colors">
                            <CommodityAutocomplete
                                value={commodity}
                                onChange={setCommodity}
                                placeholder={t('components.search_bar.placeholders.cargo')}
                                minimal={true}
                                className="h-full text-sm text-white bg-transparent border-none focus:ring-0 placeholder:text-zinc-500"
                            />
                        </div>
                    </div>
                )}

                {/* --- TRACKING TAB CONTENT --- */}
                {activeTab === 'tracking' && (
                    <div className="flex-1 grid md:grid-cols-3 gap-3">
                        <div className="md:col-span-2 bg-zinc-800/50 rounded-lg flex items-center px-4 h-14 hover:bg-zinc-800 transition-colors">
                            <Search className="h-4 w-4 text-zinc-400 mr-3" />
                            <input
                                className="w-full h-full bg-transparent border-none focus:ring-0 focus:outline-none text-sm text-white placeholder:text-zinc-500"
                                placeholder={t('components.search_bar.placeholders.tracking_input')}
                                value={trackingInput}
                                onChange={(e) => setTrackingInput(e.target.value)}
                            />
                        </div>
                        <div className="bg-zinc-800/50 rounded-lg flex items-center px-4 h-14 hover:bg-zinc-800 transition-colors">
                            <VesselAutocomplete
                                value=""
                                onChange={(v) => setTrackingInput(v)}
                                placeholder={t('components.search_bar.placeholders.vessel')}
                                minimal={true}
                                className="h-full text-sm text-white bg-transparent border-none focus:ring-0 placeholder:text-zinc-500"
                            />
                        </div>
                    </div>
                )}

                {/* --- SCHEDULES TAB CONTENT --- */}
                {activeTab === 'schedules' && (
                    <div className="flex-1 grid md:grid-cols-3 gap-3">
                        <div className="bg-zinc-800/50 rounded-lg flex items-center px-4 h-14 hover:bg-zinc-800 transition-colors">
                            <PortAutocomplete
                                value={origin}
                                onChange={setOrigin}
                                placeholder={t('components.search_bar.placeholders.from')}
                                minimal={true}
                                className="h-full text-sm text-white bg-transparent border-none focus:ring-0 placeholder:text-zinc-500"
                            />
                        </div>
                        <div className="bg-zinc-800/50 rounded-lg flex items-center px-4 h-14 hover:bg-zinc-800 transition-colors">
                            <PortAutocomplete
                                value={destination}
                                onChange={setDestination}
                                placeholder={t('components.search_bar.placeholders.to')}
                                minimal={true}
                                className="h-full text-sm text-white bg-transparent border-none focus:ring-0 placeholder:text-zinc-500"
                            />
                        </div>
                        <div className="bg-zinc-800/50 rounded-lg flex items-center px-4 h-14 gap-3 cursor-pointer hover:bg-zinc-800 transition-colors">
                            <Calendar className="h-4 w-4 text-zinc-400" />
                            <span className="text-sm text-zinc-400">{t('components.search_bar.labels.departure_date')}</span>
                        </div>
                    </div>
                )}

                {/* Search Button - Professional CTA */}
                <Button
                    onClick={handleSearch}
                    className="h-14 lg:w-40 bg-white hover:bg-zinc-100 text-black rounded-lg transition-all flex items-center justify-center gap-2 font-semibold"
                >
                    <span>{t('components.search_bar.action.search')}</span>
                    <ArrowRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Recent Searches - Subtle Professional Style */}
            <div className="flex items-center gap-6 text-xs text-zinc-500 px-4 py-3">
                <span className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    {t('components.search_bar.labels.recent')}
                </span>
                <div className="flex gap-4">
                    <button className="hover:text-white transition-colors">
                        Shanghai → Rotterdam
                    </button>
                    <button className="hover:text-white transition-colors">
                        Singapore → Los Angeles
                    </button>
                </div>
            </div>
        </div>
    );
}
