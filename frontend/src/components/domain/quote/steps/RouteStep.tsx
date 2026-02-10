"use client";

import { useQuoteStore } from "@/hooks/use-quote";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, MapPin } from "lucide-react";
import RouteMap from "@/components/ui/RouteMap";
import { PortAutocomplete } from "@/components/ui/PortAutocomplete";

export function RouteStep() {
    const { formData, updateForm, nextStep, prevStep } = useQuoteStore();

    return (
        <div className="grid lg:grid-cols-2 gap-12 items-stretch">
            {/* Form Side */}
            <div className="flex flex-col justify-center">
                <div className="mb-8">
                    <span className="text-sm font-medium text-emerald-500 mb-2 block">Step 2 of 6</span>
                    <h2 className="text-3xl font-bold text-white mb-3">Select Your Route</h2>
                    <p className="text-zinc-400">Enter your origin and destination ports to get accurate shipping rates.</p>
                </div>

                <div className="space-y-6 mb-8">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Origin Port</label>
                        <PortAutocomplete
                            value={formData.origin}
                            onChange={(val: string) => updateForm({ origin: val })}
                            placeholder="Search for origin port..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Destination Port</label>
                        <PortAutocomplete
                            value={formData.destination}
                            onChange={(val: string) => updateForm({ destination: val })}
                            placeholder="Search for destination port..."
                        />
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={prevStep}
                        className="h-12 px-6 rounded-lg border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button
                        onClick={nextStep}
                        className="flex-1 h-12 rounded-lg bg-white text-black hover:bg-zinc-100 font-semibold transition-all"
                    >
                        Continue <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Map Side */}
            <div className="aspect-square lg:aspect-auto lg:h-full min-h-[400px] rounded-xl overflow-hidden border border-zinc-800 relative bg-zinc-900">
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-4 py-2 rounded-lg bg-black/80 backdrop-blur-sm border border-zinc-800">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-medium text-zinc-300 flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5" /> Live Route Preview
                    </span>
                </div>
                <RouteMap origin={formData.origin} destination={formData.destination} />
            </div>
        </div>
    );
}
