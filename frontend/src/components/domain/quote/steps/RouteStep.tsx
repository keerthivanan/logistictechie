"use client";

import { useQuoteStore } from "@/hooks/use-quote";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, MapPin, Globe, Shield } from "lucide-react";
import RouteMap from "@/components/ui/RouteMap";
import { PortAutocomplete } from "@/components/ui/PortAutocomplete";
import { cn } from "@/lib/utils";

export function RouteStep() {
    const { formData, updateForm, nextStep, prevStep } = useQuoteStore();

    return (
        <div className="grid lg:grid-cols-2 gap-20 items-stretch">
            {/* Command Interface Side */}
            <div className="flex flex-col justify-center">
                <div className="mb-16">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-[1px] bg-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500">PROTOCOL_STEP_02</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-6 leading-none">
                        Define. <span className="text-zinc-900">Trajectory.</span>
                    </h2>
                    <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em] leading-relaxed max-w-xl">
                        Designate operational origin and destination nodes to synchronize carrier schedules and high-fidelity freight intelligence.
                    </p>
                </div>

                <div className="space-y-10 mb-16">
                    <div className="space-y-4 group">
                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 group-focus-within:text-emerald-500 transition-colors">Origin_Node</label>
                        <div className="relative">
                            <PortAutocomplete
                                value={formData.origin}
                                onChange={(val: string) => updateForm({ origin: val })}
                                placeholder="SEARCH_ORIGIN_PORT..."
                            />
                        </div>
                    </div>

                    <div className="space-y-4 group">
                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 group-focus-within:text-emerald-500 transition-colors">Target_Destination</label>
                        <div className="relative">
                            <PortAutocomplete
                                value={formData.destination}
                                onChange={(val: string) => updateForm({ destination: val })}
                                placeholder="SEARCH_DESTINATION_PORT..."
                            />
                        </div>
                    </div>
                </div>

                <div className="flex gap-6 pt-12 border-t border-white/5">
                    <Button
                        variant="outline"
                        onClick={prevStep}
                        className="h-20 px-10 rounded-none border-white/5 bg-transparent text-zinc-600 hover:text-white hover:bg-zinc-950 transition-all font-black text-[10px] uppercase tracking-[0.4em]"
                    >
                        <ArrowLeft className="mr-4 h-4 w-4" /> REVERT
                    </Button>
                    <Button
                        onClick={nextStep}
                        className="flex-1 h-20 bg-white text-black hover:bg-emerald-500 rounded-none font-black text-[11px] uppercase tracking-[0.6em] transition-all duration-700 shadow-[0_20px_60px_rgba(255,255,255,0.05)] flex items-center justify-center gap-6"
                    >
                        COMMENCE_DETAILS <ArrowRight className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Orbital Visualization Side */}
            <div className="min-h-[600px] border border-white/5 bg-zinc-950/40 relative overflow-hidden group">
                {/* Tactical HUD Overlay */}
                <div className="absolute top-8 left-8 z-20 flex items-center gap-4 bg-black/90 backdrop-blur-2xl px-8 py-4 border border-white/5">
                    <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white flex items-center gap-4">
                        <MapPin className="w-3.5 h-3.5 text-emerald-500" /> LIVE_TRAJECTORY_PREVIEW
                    </span>
                </div>

                {/* Secondary Indicators */}
                <div className="absolute top-8 right-8 z-20 flex gap-4">
                    <div className="w-12 h-12 bg-black border border-white/5 flex items-center justify-center">
                        <Globe className="w-4 h-4 text-zinc-800" />
                    </div>
                </div>

                <div className={cn(
                    "w-full h-full transition-all duration-[3000ms]",
                    !formData.origin && !formData.destination
                        ? "grayscale invert opacity-30 contrast-150 saturate-0 scale-105"
                        : "grayscale-0 invert-0 opacity-100 contrast-100 saturate-100 scale-100"
                )}>
                    <RouteMap origin={formData.origin} destination={formData.destination} />
                </div>

                {/* Visual Voids */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />
                <div className="absolute bottom-10 right-10 text-9xl font-black italic opacity-[0.03] select-none pointer-events-none uppercase">
                    Route
                </div>
            </div>
        </div>
    );
}
