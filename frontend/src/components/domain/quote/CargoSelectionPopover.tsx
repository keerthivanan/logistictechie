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
                    {/* Trigger UI imitating the screenshot's 'Load' input field */}
                    <Label className="text-[10px] font-black text-gray-500 mb-2 block uppercase tracking-widest">Master Load</Label>
                    <div className="flex items-center justify-between h-14 w-full rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2 text-sm ring-offset-background group-hover:border-white/30 transition-all shadow-xl">
                        <div className="flex items-center gap-3">
                            {formData.cargoType === 'lcl' ? <Box className="w-5 h-5 text-white" /> : <Container className="w-5 h-5 text-white" />}
                            <span className="font-extrabold text-white tracking-tight uppercase">
                                {formData.cargoType === 'lcl'
                                    ? "LCL — Loose Cargo"
                                    : `${localUnits} UNIT${localUnits > 1 ? 'S' : ''} • ${formData.containerSize.replace('ft', '')} FT`
                                }
                            </span>
                        </div>
                        <ChevronDown className="h-4 w-4 text-gray-500 group-hover:text-white transition-colors" />
                    </div>
                </div>
            </PopoverTrigger>

            <PopoverContent className="w-[480px] p-0 bg-black border border-white/20 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden" align="start">
                <Tabs defaultValue={formData.cargoType === 'lcl' ? 'loose' : 'containers'} className="w-full">
                    {/* Header Tabs */}
                    <div className="border-b border-white/10 p-2 bg-white/[0.02]">
                        <TabsList className="grid w-full grid-cols-2 bg-transparent h-12">
                            <TabsTrigger
                                value="loose"
                                className="data-[state=active]:bg-white data-[state=active]:text-black text-gray-500 uppercase font-black tracking-tighter rounded-xl transition-all h-10 mx-1"
                                onClick={() => updateForm({ cargoType: 'lcl' })}
                            >
                                <Box className="w-4 h-4 mr-2" /> Loose
                            </TabsTrigger>
                            <TabsTrigger
                                value="containers"
                                className="data-[state=active]:bg-white data-[state=active]:text-black text-gray-500 uppercase font-black tracking-tighter rounded-xl transition-all h-10 mx-1"
                                onClick={() => updateForm({ cargoType: 'fcl' })}
                            >
                                <Container className="w-4 h-4 mr-2" /> FCL Unit
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Loose Cargo Content */}
                    <TabsContent value="loose" className="p-8 space-y-6">
                        <div className="text-center pb-4">
                            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-1">Partial Load Matrix</h4>
                            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Individual crates or pallets (LCL)</p>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Gross Mass (kg)</Label>
                                <Input
                                    type="number"
                                    value={formData.weight}
                                    onChange={(e) => updateForm({ weight: Number(e.target.value) })}
                                    className="bg-white/5 border-white/10 h-12 text-white font-mono focus:border-white transition-all rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Volume (CBM)</Label>
                                <Input
                                    type="number"
                                    value={formData.volume}
                                    onChange={(e) => updateForm({ volume: Number(e.target.value) })}
                                    className="bg-white/5 border-white/10 h-12 text-white font-mono focus:border-white transition-all rounded-xl"
                                />
                            </div>
                        </div>
                        <Button className="w-full bg-white text-black hover:bg-gray-200 h-14 font-black uppercase tracking-tighter text-base rounded-xl mt-4" onClick={handleConfirm}>Confirm Loose Calibration</Button>
                    </TabsContent>

                    {/* Containers Content */}
                    <TabsContent value="containers" className="p-8 space-y-8">
                        <div className="grid grid-cols-4 gap-6 items-end">
                            <div className="col-span-1 space-y-2">
                                <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Unit Count</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={localUnits}
                                    onChange={(e) => setLocalUnits(Number(e.target.value))}
                                    className="bg-white/5 border-white/10 h-14 text-white font-black text-center text-lg focus:border-white transition-all rounded-xl"
                                />
                            </div>
                            <div className="col-span-3 space-y-2">
                                <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">ISO Standard Type</Label>
                                <div className="flex bg-white/[0.03] p-1 rounded-2xl border border-white/5" role="group">
                                    {containerTypes.map((type, idx) => {
                                        const cleanType = type.replace("'", "").replace(" ", "");
                                        const isSelected = formData.containerSize === cleanType || (cleanType === '40' && formData.containerSize === '40') || (cleanType === '20' && formData.containerSize === '20');

                                        return (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => updateForm({ containerSize: cleanType as '20' | '40' | '40HC' })}
                                                className={cn(
                                                    "px-3 py-3 text-[10px] font-black uppercase tracking-tighter transition-all flex-1 rounded-xl",
                                                    isSelected ? "bg-white text-black shadow-lg" : "text-gray-500 hover:text-white"
                                                )}
                                            >
                                                {type}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3 px-1">
                            <div className="w-4 h-4 rounded border-2 border-white/20 flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-sm opacity-0 group-data-[state=checked]:opacity-100" />
                            </div>
                            <Label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Verified Heavyweight Payload</Label>
                        </div>

                        <div className="pt-2">
                            <Button className="w-full bg-white text-black hover:bg-gray-200 h-16 font-black uppercase tracking-tighter text-xl rounded-2xl shadow-2xl" onClick={handleConfirm}>
                                Apply Unit Profile
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </PopoverContent>
        </Popover>
    );
}
