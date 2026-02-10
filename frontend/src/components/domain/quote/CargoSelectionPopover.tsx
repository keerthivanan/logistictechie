"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Box, Container, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuoteStore } from "@/hooks/use-quote";

export function CargoSelectionPopover() {
    const { formData, updateForm } = useQuoteStore();
    const [open, setOpen] = useState(false);
    const [localUnits, setLocalUnits] = useState(1);

    // Helper to commit changes and close
    const handleConfirm = () => {
        setOpen(false);
    };

    const containerTypes = ["20'", "40'", "40'HC", "45'HC"];

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <div className="w-full cursor-pointer group">
                    <div className="flex items-center justify-between h-20 w-full rounded-none border border-white/10 bg-white/[0.01] px-8 py-4 ring-offset-background group-hover:border-white/30 transition-all shadow-none">
                        <div className="flex items-center gap-5">
                            {formData.cargoType === 'lcl' ? <Box className="w-5 h-5 text-white/40" /> : <Container className="w-5 h-5 text-white/40" />}
                            <span className="font-bold text-white tracking-widest uppercase text-xs">
                                {formData.cargoType === 'lcl'
                                    ? "LCL — LOOSE_CARGO_S"
                                    : `${localUnits} UNIT${localUnits > 1 ? 'S' : ''} • ${formData.containerSize.replace('ft', '')} FT_UNIT`
                                }
                            </span>
                        </div>
                        <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors" />
                    </div>
                </div>
            </PopoverTrigger>

            <PopoverContent className="w-[480px] p-0 bg-black border border-white/10 rounded-none shadow-[0_0_80px_rgba(0,0,0,1)] overflow-hidden" align="start">
                <Tabs defaultValue={formData.cargoType === 'lcl' ? 'loose' : 'containers'} className="w-full">
                    <div className="border-b border-white/5 p-4 bg-white/[0.01]">
                        <TabsList className="grid w-full grid-cols-2 bg-transparent h-14">
                            <TabsTrigger
                                value="loose"
                                className="data-[state=active]:bg-white data-[state=active]:text-black text-gray-600 uppercase font-bold tracking-widest rounded-none transition-all h-12 text-xs"
                                onClick={() => updateForm({ cargoType: 'lcl' })}
                            >
                                <Box className="w-3 h-3 mr-3" /> LOOSE_CARGO
                            </TabsTrigger>
                            <TabsTrigger
                                value="containers"
                                className="data-[state=active]:bg-white data-[state=active]:text-black text-gray-600 uppercase font-bold tracking-widest rounded-none transition-all h-12 text-xs"
                                onClick={() => updateForm({ cargoType: 'fcl' })}
                            >
                                <Container className="w-3 h-3 mr-3" /> FCL_UNIT_S
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Loose Cargo Content */}
                    <TabsContent value="loose" className="p-10 space-y-10">
                        <div className="text-center pb-6">
                            <span className="titan-label block mb-2">Partial Load Matrix</span>
                            <p className="text-gray-400 text-xs uppercase font-bold tracking-[0.3em]">MANUAL_CALIBRATION (LCL)</p>
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="titan-label">GROSS_MASS (KG)</label>
                                <Input
                                    type="number"
                                    value={formData.weight}
                                    onChange={(e) => updateForm({ weight: Number(e.target.value) })}
                                    className="bg-white/5 border-white/10 h-16 text-white font-bold uppercase text-xs tracking-widest focus:border-white transition-all rounded-none"
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="titan-label">VOLUMETRIC (CBM)</label>
                                <Input
                                    type="number"
                                    value={formData.volume}
                                    onChange={(e) => updateForm({ volume: Number(e.target.value) })}
                                    className="bg-white/5 border-white/10 h-16 text-white font-bold uppercase text-xs tracking-widest focus:border-white transition-all rounded-none"
                                />
                            </div>
                        </div>
                        <Button className="w-full bg-white text-black hover:bg-gray-200 h-16 font-bold uppercase tracking-[0.2em] text-xs rounded-none mt-4 transition-all" onClick={handleConfirm}>
                            CONFIRM_CALIBRATION
                        </Button>
                    </TabsContent>

                    {/* Containers Content */}
                    <TabsContent value="containers" className="p-10 space-y-12">
                        <div className="grid grid-cols-4 gap-8 items-end">
                            <div className="col-span-1 space-y-4">
                                <label className="titan-label block">COUNT</label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={localUnits}
                                    onChange={(e) => setLocalUnits(Number(e.target.value))}
                                    className="bg-white/5 border-white/10 h-16 text-white font-bold text-center text-xl focus:border-white transition-all rounded-none uppercase"
                                />
                            </div>
                            <div className="col-span-3 space-y-4">
                                <label className="titan-label block">ISO_TYPE_DATA</label>
                                <div className="flex bg-white/[0.01] p-1 border border-white/5 rounded-none" role="group">
                                    {containerTypes.map((type, idx) => {
                                        const cleanType = type.replace("'", "").replace(" ", "");
                                        const isSelected = formData.containerSize === cleanType || (cleanType === '40' && formData.containerSize === '40') || (cleanType === '20' && formData.containerSize === '20');

                                        return (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => updateForm({ containerSize: cleanType as '20' | '40' | '40HC' })}
                                                className={cn(
                                                    "px-3 py-4 text-xs font-bold uppercase tracking-widest transition-all flex-1 rounded-none",
                                                    isSelected ? "bg-white text-black" : "text-gray-400 hover:text-white"
                                                )}
                                            >
                                                {type}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4 px-2">
                            <div className="w-3 h-3 rounded-none border border-white/20 flex items-center justify-center">
                                <div className="w-1 h-1 bg-white opacity-40" />
                            </div>
                            <span className="titan-label text-gray-400">VERIFIED_HEAVYWEIGHT_CALIBRATION</span>
                        </div>

                        <div className="pt-2">
                            <Button className="w-full bg-white text-black hover:bg-gray-200 h-20 font-bold uppercase tracking-[0.3em] text-xs rounded-none shadow-none transition-all" onClick={handleConfirm}>
                                APPLY_UNIT_PROFILE
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </PopoverContent>
        </Popover>
    );
}

