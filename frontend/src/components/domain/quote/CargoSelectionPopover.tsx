"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Box, Container, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuoteStore } from "@/hooks/use-quote";

export function CargoSelectionPopover() {
    const { formData, updateForm } = useQuoteStore();
    const [open, setOpen] = useState(false);

    const handleConfirm = () => {
        setOpen(false);
    };

    const containerTypes = ["20'", "40'", "40'HC", "45'HC"];

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <div className="w-full cursor-pointer group">
                    <div className="flex items-center justify-between h-20 w-full rounded-none border border-white/10 bg-white/[0.01] px-8 py-4 ring-offset-background group-hover:border-white/30 transition-all hover:bg-white/[0.03] shadow-none relative overflow-hidden">
                        {/* Status Indicator */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />

                        <div className="flex items-center gap-5">
                            {formData.cargoType === 'lcl' ? (
                                <Box className="w-5 h-5 text-emerald-500" />
                            ) : (
                                <Container className="w-5 h-5 text-emerald-500" />
                            )}
                            <div className="flex flex-col text-left">
                                <span className="font-bold text-white tracking-widest uppercase text-xs">
                                    {formData.cargoType === 'lcl' ? "LOOSE_CARGO (LCL)" : "FULL_CONTAINER (FCL)"}
                                </span>
                                <span className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase mt-0.5">
                                    {formData.cargoType === 'lcl'
                                        ? `${formData.weight}KG • ${formData.volume}CBM_VOL`
                                        : `${formData.quantity} UNIT${formData.quantity > 1 ? 'S' : ''} • ${formData.containerSize} FT_UNIT`
                                    }
                                </span>
                            </div>
                        </div>
                        <ChevronDown className="h-4 w-4 text-zinc-500 group-hover:text-white transition-colors" />
                    </div>
                </div>
            </PopoverTrigger>

            <PopoverContent className="w-[calc(100vw-2rem)] md:w-[480px] p-0 bg-black border border-white/10 rounded-none shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden" align="start">
                <Tabs defaultValue={formData.cargoType === 'lcl' ? 'loose' : 'containers'} className="w-full" onValueChange={(val) => updateForm({ cargoType: val === 'loose' ? 'lcl' : 'fcl' })}>
                    <div className="border-b border-white/5 p-4 bg-white/[0.01]">
                        <TabsList className="grid w-full grid-cols-2 bg-zinc-900/50 p-1 h-14 rounded-none">
                            <TabsTrigger
                                value="loose"
                                className="data-[state=active]:bg-white data-[state=active]:text-black text-gray-500 uppercase font-bold tracking-widest rounded-none transition-all h-full text-[10px]"
                            >
                                <Box className="w-3.5 h-3.5 mr-2.5" /> LOOSE_CARGO
                            </TabsTrigger>
                            <TabsTrigger
                                value="containers"
                                className="data-[state=active]:bg-white data-[state=active]:text-black text-gray-500 uppercase font-bold tracking-widest rounded-none transition-all h-full text-[10px]"
                            >
                                <Container className="w-3.5 h-3.5 mr-2.5" /> FCL_UNIT_S
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="loose" className="p-10 space-y-10 mt-0 focus-visible:outline-none">
                        <div className="text-center border-b border-white/5 pb-8">
                            <span className="text-emerald-500 text-[10px] font-black tracking-[0.4em] uppercase block mb-3">CALIBRATION_MATRIX</span>
                            <h4 className="text-xl font-bold text-white uppercase tracking-tight">MANUAL LOAD (LCL)</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-4 group">
                                <label className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase group-focus-within:text-white transition-colors">GROSS_MASS (KG)</label>
                                <Input
                                    type="number"
                                    value={formData.weight}
                                    onChange={(e) => updateForm({ weight: Number(e.target.value) })}
                                    className="bg-zinc-900 border-white/10 h-16 text-white font-bold uppercase text-base tracking-widest focus:border-white transition-all rounded-none ring-0 placeholder:text-zinc-800"
                                />
                            </div>
                            <div className="space-y-4 group">
                                <label className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase group-focus-within:text-white transition-colors">VOLUMETRIC (CBM)</label>
                                <Input
                                    type="number"
                                    value={formData.volume}
                                    onChange={(e) => updateForm({ volume: Number(e.target.value) })}
                                    className="bg-zinc-900 border-white/10 h-16 text-white font-bold uppercase text-base tracking-widest focus:border-white transition-all rounded-none ring-0 placeholder:text-zinc-800"
                                />
                            </div>
                        </div>
                        <Button
                            className="w-full bg-emerald-500 text-black hover:bg-emerald-400 h-16 font-bold uppercase tracking-[0.3em] text-xs rounded-none transition-all shadow-[0_20px_40px_-15px_rgba(16,185,129,0.3)]"
                            onClick={handleConfirm}
                        >
                            CONFIRM_PARAMETERS
                        </Button>
                    </TabsContent>

                    <TabsContent value="containers" className="p-10 space-y-12 mt-0 focus-visible:outline-none">
                        <div className="grid grid-cols-4 gap-8 items-end">
                            <div className="col-span-1 space-y-4 group">
                                <label className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase group-focus-within:text-white transition-colors text-center block">QTY</label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={formData.quantity}
                                    onChange={(e) => updateForm({ quantity: Math.max(1, Number(e.target.value)) })}
                                    className="bg-zinc-900 border-white/10 h-16 text-white font-bold text-center text-xl focus:border-white transition-all rounded-none uppercase ring-0"
                                />
                            </div>
                            <div className="col-span-3 space-y-4">
                                <label className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase text-center block">ISO_CONTAINER_TYPE</label>
                                <div className="flex bg-zinc-900 p-1 border border-white/5 rounded-none" role="group">
                                    {containerTypes.map((type) => {
                                        const cleanType = type.replace("'", "").replace(" ", "") as any;
                                        const isSelected = formData.containerSize === cleanType;

                                        return (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => updateForm({ containerSize: cleanType })}
                                                className={cn(
                                                    "px-3 py-4 text-[10px] font-black uppercase tracking-widest transition-all flex-1 rounded-none relative outline-none",
                                                    isSelected ? "bg-white text-black" : "text-zinc-600 hover:text-white hover:bg-white/5"
                                                )}
                                            >
                                                <span className="relative z-10">{type}</span>
                                                {isSelected && (
                                                    <motion.div
                                                        layoutId="container-active"
                                                        className="absolute inset-0 bg-white"
                                                        style={{ zIndex: 0 }}
                                                    />
                                                )}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4 px-2 bg-white/[0.02] py-4 border-l-2 border-emerald-500">
                            <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            </div>
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">VERIFIED_FCL_SPECIFICATION (SOLAS)</span>
                        </div>

                        <div className="pt-2">
                            <Button
                                className="w-full bg-white text-black hover:bg-zinc-200 h-20 font-bold uppercase tracking-[0.4em] text-xs rounded-none shadow-[0_20px_50px_-15px_rgba(255,255,255,0.1)] transition-all"
                                onClick={handleConfirm}
                            >
                                ACTIVATE_UNIT_PROFILE
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </PopoverContent>
        </Popover>
    );
}
