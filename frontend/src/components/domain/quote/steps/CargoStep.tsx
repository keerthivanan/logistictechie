"use client";

import { useQuoteStore } from "@/hooks/use-quote";
import { CargoSelectionPopover } from "../CargoSelectionPopover";
import { Button } from "@/components/ui/button";
import { ArrowRight, Package, FileUp, Zap } from "lucide-react";
import { AIDocumentUpload } from "../AIDocumentUpload";

export function CargoStep() {
    const { nextStep } = useQuoteStore();

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-20">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-[1px] bg-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500">PROTOCOL_STEP_01</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-6 leading-none">
                    Identify. <span className="text-zinc-900 group-hover:text-white transition-colors duration-1000">Cargo.</span>
                </h2>
                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em] leading-relaxed max-w-xl">
                    Select your operational unit type or synchronize via encrypted document upload for automated intelligence extraction.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-10 mb-20">
                {/* Cargo Selection */}
                <div className="bg-zinc-950/40 border border-white/5 p-12 relative group hover:bg-zinc-950/60 transition-all duration-700">
                    <div className="flex items-center gap-6 mb-10">
                        <div className="h-16 w-16 bg-zinc-900 flex items-center justify-center transition-all duration-700 group-hover:bg-white group-hover:text-black group-hover:rotate-12">
                            <Package className="h-8 w-8" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">UNIT_SPECIFICATION</h3>
                            <p className="text-zinc-700 text-[9px] font-black uppercase tracking-[0.2em] mt-1 group-hover:text-zinc-500 transition-colors">Select dimensional parameters</p>
                        </div>
                    </div>
                    <CargoSelectionPopover />
                    <div className="absolute bottom-0 left-0 h-[1px] bg-emerald-500 w-0 group-hover:w-full transition-all duration-1000" />
                </div>

                {/* Document Sync */}
                <div className="bg-zinc-950/40 border border-white/5 p-12 relative group hover:bg-zinc-950/60 transition-all duration-700">
                    <div className="flex items-center gap-6 mb-10">
                        <div className="h-16 w-16 bg-zinc-900 flex items-center justify-center transition-all duration-700 group-hover:bg-emerald-500 group-hover:text-black group-hover:-rotate-12">
                            <FileUp className="h-8 w-8" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">NEURAL_EXTRACTION</h3>
                            <p className="text-zinc-700 text-[9px] font-black uppercase tracking-[0.2em] mt-1 group-hover:text-zinc-500 transition-colors">Auto-sync shipping data</p>
                        </div>
                    </div>
                    <AIDocumentUpload />
                    <div className="absolute bottom-0 left-0 h-[1px] bg-white w-0 group-hover:w-full transition-all duration-1000" />
                </div>
            </div>

            <div className="flex justify-end border-t border-white/5 pt-12">
                <Button
                    onClick={nextStep}
                    className="h-20 px-16 bg-white text-black hover:bg-emerald-500 rounded-none font-black text-[11px] uppercase tracking-[0.6em] transition-all duration-700 shadow-[0_20px_60px_rgba(255,255,255,0.05)] flex items-center gap-6"
                >
                    INITIALIZE_ROUTE <ArrowRight className="h-5 w-5" />
                </Button>
            </div>
        </div>
    );
}
