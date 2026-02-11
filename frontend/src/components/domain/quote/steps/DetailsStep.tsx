"use client";

import { useQuoteStore } from "@/hooks/use-quote";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Box, ArrowRight, ArrowLeft, Calendar, Scale, Ruler, Shield } from "lucide-react";

export function DetailsStep() {
    const { nextStep, prevStep, formData, updateForm } = useQuoteStore();

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-20">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-[1px] bg-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500">PROTOCOL_STEP_03</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-6 leading-none">
                    Define. <span className="text-zinc-900 group-hover:text-white transition-colors duration-1000">Manifest.</span>
                </h2>
                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em] leading-relaxed max-w-xl">
                    Calibrate technical cargo specifications to establish high-fidelity logistic synchronization across all global nodes.
                </p>
            </div>

            <div className="space-y-12 mb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Ready Date */}
                    <div className="space-y-4 group">
                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 group-focus-within:text-emerald-500 transition-colors">CARGO_READY_DATE</label>
                        <div className="relative">
                            <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-800 group-focus-within:text-white transition-colors" />
                            <Input
                                type="date"
                                className="pl-16 bg-zinc-950/40 border-white/5 h-20 rounded-none text-white font-black uppercase tracking-[0.3em] focus:border-white transition-all ring-0 outline-none"
                                value={formData.readyDate}
                                onChange={(e) => updateForm({ readyDate: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Incoterms */}
                    <div className="space-y-4 group">
                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 group-focus-within:text-emerald-500 transition-colors">LOGISTIC_TERMS (INCO)</label>
                        <Select
                            defaultValue={formData.incoterm}
                            onValueChange={(val: string) => updateForm({ incoterm: val as any })}
                        >
                            <SelectTrigger className="bg-zinc-950/40 border-white/5 h-20 rounded-none text-white font-black uppercase tracking-[0.3em] focus:border-white transition-all ring-0 outline-none">
                                <SelectValue placeholder="SELECT_TERM" />
                            </SelectTrigger>
                            <SelectContent className="bg-black border-white/10 text-white rounded-none shadow-[0_30px_60px_rgba(0,0,0,1)]">
                                {['FOB', 'EXW', 'CIF', 'DDP', 'FCA', 'CFR', 'DAP'].map(term => (
                                    <SelectItem key={term} value={term} className="py-4 px-6 focus:bg-white focus:text-black uppercase font-black tracking-widest text-[11px]">
                                        {term} — {term === 'FOB' ? 'FREE_ON_BOARD' : term === 'EXW' ? 'EX_WORKS' : term === 'CIF' ? 'COST_INS_FREIGHT' : term === 'DDP' ? 'DELIV_DUTY_PAID' : 'STANDARD_LOGISTIC_TERM'}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Commodity */}
                <div className="space-y-4 group">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 group-focus-within:text-emerald-500 transition-colors">COMMODITY_DESCRIPTION</label>
                    <div className="relative">
                        <Box className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-800 group-focus-within:text-white transition-colors" />
                        <Input
                            placeholder="E.G. TITANIUM_ALLOYS, RARE_EARTH_METALS"
                            className="pl-16 bg-zinc-950/40 border-white/5 h-20 rounded-none text-white font-black uppercase tracking-[0.3em] placeholder:text-zinc-900 focus:border-white transition-all ring-0 outline-none"
                            value={formData.commodity}
                            onChange={(e) => updateForm({ commodity: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Weight */}
                    <div className="space-y-4 group">
                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 group-focus-within:text-emerald-500 transition-colors">TOTAL_GROSS_MASS (KG)</label>
                        <div className="relative">
                            <Scale className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-800 group-focus-within:text-white transition-colors" />
                            <Input
                                type="number"
                                placeholder="1000"
                                className="pl-16 bg-zinc-950/40 border-white/5 h-20 rounded-none text-white font-black uppercase tracking-[0.3em] placeholder:text-zinc-900 focus:border-white transition-all ring-0 outline-none"
                                value={formData.weight || ""}
                                onChange={(e) => updateForm({ weight: Number(e.target.value) })}
                            />
                        </div>
                    </div>

                    {/* Volume */}
                    <div className="space-y-4 group">
                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 group-focus-within:text-emerald-500 transition-colors">TOTAL_VOLUMETRIC (CBM)</label>
                        <div className="relative">
                            <Ruler className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-800 group-focus-within:text-white transition-colors" />
                            <Input
                                type="number"
                                placeholder="2.5"
                                step="0.1"
                                className="pl-16 bg-zinc-950/40 border-white/5 h-20 rounded-none text-white font-black uppercase tracking-[0.3em] placeholder:text-zinc-900 focus:border-white transition-all ring-0 outline-none"
                                value={formData.volume || ""}
                                onChange={(e) => updateForm({ volume: Number(e.target.value) })}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex gap-6 border-t border-white/5 pt-12">
                <Button
                    onClick={prevStep}
                    variant="outline"
                    className="h-20 px-10 rounded-none border-white/5 bg-transparent text-zinc-600 hover:text-white hover:bg-zinc-950 transition-all font-black text-[10px] uppercase tracking-[0.4em]"
                >
                    <ArrowLeft className="mr-4 h-4 w-4" /> REVERT
                </Button>
                <Button
                    onClick={nextStep}
                    className="flex-1 h-20 rounded-none bg-white text-black hover:bg-emerald-500 transition-all font-black uppercase tracking-[0.6em] text-[11px] shadow-[0_20px_50px_-15px_rgba(255,255,255,0.05)] flex items-center justify-center gap-6"
                >
                    INITIATE_PROCUREMENT <ArrowRight className="h-5 w-5" />
                </Button>
            </div>
        </div>
    );
}
