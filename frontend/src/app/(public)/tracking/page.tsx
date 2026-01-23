"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Package, MapPin, Clock, CheckCircle2, Circle, Loader2 } from "lucide-react";
import RouteMap from "@/components/ui/RouteMap";
import { logisticsClient } from "@/lib/logistics";
import { useLanguage } from "@/contexts/LanguageContext";

export default function TrackingPage() {
    const { t } = useLanguage();
    const [id, setId] = useState("");
    const [result, setResult] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleTrack = async () => {
        setIsLoading(true);
        const data = await logisticsClient.trackContainer(id || "MSCU1234567");
        setResult(data);
        setIsLoading(false);
    };

    return (
        <main className="min-h-screen bg-black pt-24 pb-20">
            {/* Hero */}
            <section className="relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-500/20 rounded-full blur-[120px]" />

                <div className="container relative z-10 max-w-4xl mx-auto px-6 pt-8 pb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-400 mb-6">
                            <Package className="h-4 w-4 text-purple-400" />
                            <span>Real-time container tracking</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-4">
                            {t('tracking.title')}
                        </h1>
                        <p className="text-xl text-gray-400">{t('tracking.subtitle')}</p>
                    </motion.div>

                    {/* Search Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <Card className="p-6 bg-white/[0.03] border-white/[0.08] backdrop-blur-sm">
                            <div className="flex gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                    <Input
                                        placeholder={t('tracking.placeholder')}
                                        className="h-14 pl-12 bg-white/[0.03] border-white/10 text-white placeholder:text-gray-600 text-lg"
                                        value={id}
                                        onChange={(e) => setId(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
                                    />
                                </div>
                                <Button
                                    size="lg"
                                    onClick={handleTrack}
                                    disabled={isLoading}
                                    className="bg-white text-black hover:bg-gray-100 h-14 px-8 font-medium"
                                >
                                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : t('tracking.track')}
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </section>

            {/* Results */}
            {result && (
                <section className="container max-w-6xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-8"
                    >
                        {/* Map and Status Row */}
                        <div className="grid lg:grid-cols-3 gap-6">
                            {/* Map */}
                            <div className="lg:col-span-2 h-[350px] rounded-2xl overflow-hidden border border-white/[0.08]">
                                <RouteMap
                                    origin={result.events[0].loc}
                                    destination={result.events[result.events.length - 1].loc}
                                    className="w-full h-full"
                                />
                            </div>

                            {/* Status Card */}
                            <Card className="p-8 bg-white/[0.03] border-white/[0.08] flex flex-col justify-center">
                                <div className="space-y-6">
                                    <div>
                                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">{t('tracking.status')}</div>
                                        <div className="text-3xl font-bold text-white">{result.status}</div>
                                    </div>
                                    <div className="h-px bg-white/[0.05]" />
                                    <div>
                                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">{t('tracking.eta')}</div>
                                        <div className="text-3xl font-bold text-emerald-400">{result.eta}</div>
                                    </div>
                                    <div className="h-px bg-white/[0.05]" />
                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                        <Clock className="h-4 w-4" />
                                        <span>Last updated: Just now</span>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Timeline */}
                        <Card className="p-8 bg-white/[0.03] border-white/[0.08]">
                            <h3 className="text-xl font-bold text-white mb-8">Shipment Timeline</h3>
                            <div className="relative">
                                {/* Timeline line */}
                                <div className="absolute left-[7px] top-3 bottom-3 w-px bg-white/10" />

                                <div className="space-y-6">
                                    {result.events.map((ev: any, i: number) => (
                                        <div key={i} className="flex gap-6 relative">
                                            {/* Status dot */}
                                            <div className={`
                                                w-4 h-4 rounded-full flex-shrink-0 mt-1 z-10
                                                ${ev.status === 'done'
                                                    ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30'
                                                    : ev.status === 'current'
                                                        ? 'bg-blue-500 shadow-lg shadow-blue-500/30 animate-pulse'
                                                        : 'bg-gray-600'
                                                }
                                            `} />

                                            <div className="flex-1">
                                                <div className="font-semibold text-white flex items-center gap-2">
                                                    {ev.event}
                                                    {ev.status === 'done' && (
                                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {ev.loc}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">{ev.date}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </section>
            )}

            {/* Empty State */}
            {!result && (
                <section className="container max-w-4xl mx-auto px-6 mt-12">
                    <Card className="p-12 bg-white/[0.02] border-white/[0.05] text-center">
                        <Package className="h-16 w-16 text-gray-700 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Enter a Container ID</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            Track your shipment in real-time with our global container tracking network.
                        </p>
                    </Card>
                </section>
            )}
        </main>
    );
}
