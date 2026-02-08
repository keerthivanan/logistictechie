"use client";

import { useQuoteStore } from "@/hooks/use-quote";
import { CargoSelectionPopover } from "../CargoSelectionPopover";
import { Button } from "@/components/ui/button";
import { ArrowRight, PackageOpen } from "lucide-react";
import { AIDocumentUpload } from "../AIDocumentUpload";

export function CargoStep() {
    // const { t } = useLanguage();
    const { nextStep } = useQuoteStore();

    return (
        <div className="max-w-4xl mx-auto py-12">
            <div className="text-center mb-16">
                <h2 className="text-5xl font-black tracking-tighter text-white uppercase mb-4">Cargo Profile</h2>
                <p className="text-gray-500 font-light text-lg">Define your shipment load to access guaranteed carrier rates.</p>
            </div>

            <div className="bg-white/[0.02] p-10 rounded-2xl border border-white/10 shadow-2xl">
                <div className="grid md:grid-cols-2 gap-10 items-end">

                    {/* The New Popover Interaction */}
                    <div className="space-y-4">
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Shipment Matrix</label>
                        <CargoSelectionPopover />
                        <p className="text-[10px] text-gray-600 uppercase font-bold tracking-widest mt-2 px-1">Select dimensions & load type for precision results.</p>
                    </div>

                    {/* Zero-Manual Action - High Resolution */}
                    <div className="space-y-4">
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Autonomous Entry</label>
                        <AIDocumentUpload />
                    </div>
                </div>

                <div className="mt-12 flex justify-end">
                    <Button
                        size="lg"
                        onClick={nextStep}
                        className="bg-white hover:bg-gray-200 text-black font-black uppercase tracking-tighter px-10 h-14 rounded-xl text-lg shadow-[0_0_30px_rgba(255,255,255,0.05)]"
                    >
                        Access Routes <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
