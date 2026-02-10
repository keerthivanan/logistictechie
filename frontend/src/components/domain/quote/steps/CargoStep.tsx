"use client";

import { useQuoteStore } from "@/hooks/use-quote";
import { CargoSelectionPopover } from "../CargoSelectionPopover";
import { Button } from "@/components/ui/button";
import { ArrowRight, Package, FileUp } from "lucide-react";
import { AIDocumentUpload } from "../AIDocumentUpload";

export function CargoStep() {
    const { nextStep } = useQuoteStore();

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-8 text-center">
                <span className="text-sm font-medium text-emerald-500 mb-2 block">Step 1 of 6</span>
                <h2 className="text-3xl font-bold text-white mb-3">What are you shipping?</h2>
                <p className="text-zinc-400">Select your cargo type or upload shipping documents for automatic detection.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
                {/* Cargo Selection */}
                <div className="bg-zinc-800/30 border border-zinc-800 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                            <Package className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Cargo Type</h3>
                            <p className="text-zinc-500 text-sm">Select container size and type</p>
                        </div>
                    </div>
                    <CargoSelectionPopover />
                </div>

                {/* Document Upload */}
                <div className="bg-zinc-800/30 border border-zinc-800 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                            <FileUp className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Upload Documents</h3>
                            <p className="text-zinc-500 text-sm">We'll extract details automatically</p>
                        </div>
                    </div>
                    <AIDocumentUpload />
                </div>
            </div>

            <div className="flex justify-center">
                <Button
                    onClick={nextStep}
                    className="h-12 px-8 rounded-lg bg-white text-black hover:bg-zinc-100 font-semibold transition-all"
                >
                    Continue to Route <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
