"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Package, MapPin, Clock, CheckCircle, Loader2, Ship } from "lucide-react";
import RouteMap from "@/components/ui/RouteMap";
import { logisticsClient } from "@/lib/logistics";

interface TrackingEvent {
    event: string;
    status: 'done' | 'current' | 'pending';
    loc: string;
    date: string;
}

interface TrackingResult {
    status: string;
    eta: string;
    events: TrackingEvent[];
}

export default function TrackingPage() {
    const [id, setId] = useState("");
    const [result, setResult] = useState<TrackingResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleTrack = async () => {
        setIsLoading(true);
        const data = await logisticsClient.trackContainer(id || "MSCU1234567");
        setResult(data);
        setIsLoading(false);
    };

    return (
        <main className="min-h-screen bg-black pt-32 pb-24">
            {/* Header */}
            <section className="container max-w-5xl mx-auto px-6 text-center mb-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="text-sm font-medium text-emerald-500 mb-4 block">Cargo Tracking</span>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Track Your Shipment
                    </h1>
                    <p className="text-zinc-400 text-lg max-w-xl mx-auto">
                        Enter your container number or bill of lading to view estimated tracking updates.
                    </p>
                </motion.div>
            </section>

            {/* Search Bar */}
            <section className="container max-w-3xl mx-auto px-6 mb-16">
                <div className="flex flex-col md:flex-row gap-3 bg-zinc-900/50 border border-zinc-800 rounded-xl p-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                        <Input
                            placeholder="Enter container number or B/L (e.g., MSCU1234567)"
                            className="h-14 pl-12 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 rounded-lg text-base focus:border-zinc-500"
                            value={id}
                            onChange={(e) => setId(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
                        />
                    </div>
                    <Button
                        onClick={handleTrack}
                        disabled={isLoading}
                        className="h-14 px-8 bg-white text-black hover:bg-zinc-100 rounded-lg font-semibold transition-all"
                    >
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Track Shipment"}
                    </Button>
                </div>
            </section>

            {/* Tracking Results */}
            {result && (
                <section className="container max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-8"
                    >
                        {/* Map and Status */}
                        <div className="grid lg:grid-cols-12 gap-6">
                            {/* Map */}
                            <div className="lg:col-span-8 h-[500px] rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 relative">
                                <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-zinc-800">
                                    <div className="h-2 w-2 bg-amber-500 rounded-full animate-pulse" />
                                    <span className="text-sm text-zinc-300">Estimated Position</span>
                                </div>
                                <RouteMap
                                    origin={result.events[0].loc}
                                    destination={result.events[result.events.length - 1].loc}
                                    className="w-full h-full"
                                />
                            </div>

                            {/* Status Cards */}
                            <div className="lg:col-span-4 space-y-4">
                                <Card className="bg-zinc-900/50 border-zinc-800 rounded-xl p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                            <Ship className="h-5 w-5 text-emerald-500" />
                                        </div>
                                        <span className="text-sm text-zinc-500">Current Status</span>
                                    </div>
                                    <div className="text-3xl font-bold text-white">{result.status}</div>
                                </Card>

                                <Card className="bg-zinc-900/50 border-zinc-800 rounded-xl p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                            <Clock className="h-5 w-5 text-blue-500" />
                                        </div>
                                        <span className="text-sm text-zinc-500">Estimated Arrival</span>
                                    </div>
                                    <div className="text-3xl font-bold text-white">{result.eta}</div>
                                </Card>

                                <Card className="bg-zinc-900/50 border-zinc-800 rounded-xl p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                                            <Package className="h-5 w-5 text-white" />
                                        </div>
                                        <span className="text-sm text-zinc-500">Container ID</span>
                                    </div>
                                    <div className="text-xl font-bold text-white font-mono">{id || "MSCU1234567"}</div>
                                </Card>
                            </div>
                        </div>

                        {/* Timeline */}
                        <Card className="bg-zinc-900/50 border-zinc-800 rounded-xl overflow-hidden">
                            <div className="p-6 border-b border-zinc-800">
                                <h3 className="text-xl font-semibold text-white">Shipment Timeline</h3>
                                <p className="text-sm text-zinc-500">Estimated tracking based on standard transit milestones</p>
                            </div>

                            <div className="p-6">
                                <div className="relative pl-8">
                                    <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-zinc-800" />

                                    <div className="space-y-6">
                                        {result.events.map((ev: TrackingEvent, i: number) => (
                                            <div key={i} className="relative">
                                                <div className={`absolute -left-5 w-4 h-4 rounded-full border-2 ${ev.status === 'done'
                                                    ? 'bg-emerald-500 border-emerald-500'
                                                    : ev.status === 'current'
                                                        ? 'bg-white border-white shadow-lg shadow-white/30'
                                                        : 'bg-zinc-900 border-zinc-700'
                                                    }`} />

                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-4 rounded-lg hover:bg-zinc-800/30 transition-colors">
                                                    <div>
                                                        <div className="font-semibold text-white">{ev.event}</div>
                                                        <div className="flex items-center gap-2 text-sm text-zinc-500 mt-1">
                                                            <MapPin className="h-3.5 w-3.5" />
                                                            {ev.loc}
                                                        </div>
                                                    </div>
                                                    <div className="text-sm text-zinc-500">{ev.date}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </section>
            )}

            {/* Empty State */}
            {!result && !isLoading && (
                <section className="container max-w-3xl mx-auto px-6">
                    <div className="py-20 text-center border-2 border-dashed border-zinc-800 rounded-xl">
                        <Package className="h-16 w-16 text-zinc-600 mx-auto mb-6" />
                        <h3 className="text-xl font-semibold text-zinc-400 mb-2">No Tracking Results</h3>
                        <p className="text-zinc-500 max-w-md mx-auto">
                            Enter a container number or bill of lading above to track your shipment in real-time.
                        </p>
                    </div>
                </section>
            )}
        </main>
    );
}
