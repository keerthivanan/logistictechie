"use client";

import { useQuoteStore } from "@/hooks/use-quote";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Box, ArrowRight, ArrowLeft, Calendar, Scale, Ruler } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function DetailsStep() {
    const { nextStep, prevStep, formData, updateForm } = useQuoteStore();
    const { t } = useLanguage();

    return (
        <div className="max-w-[1400px] mx-auto">
            <div className="mb-24">
                <div className="flex items-center gap-6 mb-8">
                    <div className="w-16 h-[1px] bg-white/40" />
                    <span className="text-[10px] font-black uppercase tracking-[0.6em] text-white/40">PROTOCOL_STEP_03</span>
                </div>
                <h2 className="text-7xl md:text-[120px] font-black text-white uppercase tracking-tighter mb-8 leading-[0.8] italic">
                    Define. <br />
                    <span className="text-white/20 select-none">Manifest.</span>
                </h2>
                <p className="text-white text-3xl font-black uppercase tracking-tighter leading-[0.9] max-w-3xl italic">
                    Calibrate technical cargo specifications to establish high-fidelity logistic synchronization across all global nodes.
                </p>
            </div>

            <div className="space-y-16 mb-32">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Ready Date */}
                    <div className="space-y-6 group">
                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">{t('quote.wizard.details.readyDate') || "CARGO_READY_DATE"}</label>
                        <div className="relative">
                            <Calendar className="absolute left-8 top-1/2 -translate-y-1/2 h-6 w-6 text-white" />
                            <Input
                                type="date"
                                className="pl-20 bg-zinc-950/40 border-white/10 h-32 rounded-full text-white font-black uppercase tracking-[0.4em] focus:border-white transition-all ring-0 outline-none backdrop-blur-3xl text-lg"
                                value={formData.readyDate}
                                onChange={(e) => updateForm({ readyDate: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Incoterms */}
                    <div className="space-y-6 group">
                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">{t('quote.wizard.details.incoterms') || "LOGISTIC_TERMS (INCO)"}</label>
                        <Select
                            defaultValue={formData.incoterm}
                            onValueChange={(val: string) => updateForm({ incoterm: val as any })}
                        >
                            <SelectTrigger className="bg-zinc-950/40 border-white/10 h-32 rounded-full text-white font-black uppercase tracking-[0.4em] focus:border-white transition-all ring-0 outline-none backdrop-blur-3xl px-12 text-lg">
                                <SelectValue placeholder="SELECT_TERM" />
                            </SelectTrigger>
                            <SelectContent className="bg-black border-white/10 text-white rounded-[48px] shadow-2xl backdrop-blur-3xl p-4">
                                {['FOB', 'EXW', 'CIF', 'DDP', 'FCA', 'CFR', 'DAP'].map(term => (
                                    <SelectItem key={term} value={term} className="py-6 px-12 focus:bg-white focus:text-black uppercase font-black tracking-[0.2em] text-[13px] rounded-full my-2">
                                        {term} — {term === 'FOB' ? 'FREE_ON_BOARD' : term === 'EXW' ? 'EX_WORKS' : term === 'CIF' ? 'COST_INS_FREIGHT' : term === 'DDP' ? 'DELIV_DUTY_PAID' : 'STANDARD_LOGISTIC_TERM'}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Commodity */}
                <div className="space-y-6 group">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">{t('quote.wizard.details.commodity') || "COMMODITY_DESCRIPTION"}</label>
                    <div className="relative">
                        <Box className="absolute left-8 top-1/2 -translate-y-1/2 h-6 w-6 text-white" />
                        <Input
                            placeholder="E.G. TITANIUM_ALLOYS, RARE_EARTH_METALS"
                            className="pl-20 bg-zinc-950/40 border-white/10 h-32 rounded-full text-white font-black uppercase tracking-[0.4em] placeholder:text-white/10 focus:border-white transition-all ring-0 outline-none backdrop-blur-3xl text-lg"
                            value={formData.commodity}
                            onChange={(e) => updateForm({ commodity: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Weight */}
                    <div className="space-y-6 group">
                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">{t('quote.wizard.details.weight') || "TOTAL_GROSS_MASS (KG)"}</label>
                        <div className="relative">
                            <Scale className="absolute left-8 top-1/2 -translate-y-1/2 h-6 w-6 text-white" />
                            <Input
                                type="number"
                                placeholder="1000"
                                className="pl-20 bg-zinc-950/40 border-white/10 h-32 rounded-full text-white font-black uppercase tracking-[0.4em] placeholder:text-white/10 focus:border-white transition-all ring-0 outline-none backdrop-blur-3xl text-lg"
                                value={formData.weight || ""}
                                onChange={(e) => updateForm({ weight: Number(e.target.value) })}
                            />
                        </div>
                    </div>

                    {/* Volume */}
                    <div className="space-y-6 group">
                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">{t('quote.wizard.details.volume') || "TOTAL_VOLUMETRIC (CBM)"}</label>
                        <div className="relative">
                            <Ruler className="absolute left-8 top-1/2 -translate-y-1/2 h-6 w-6 text-white" />
                            <Input
                                type="number"
                                placeholder="2.5"
                                step="0.1"
                                className="pl-20 bg-zinc-950/40 border-white/10 h-32 rounded-full text-white font-black uppercase tracking-[0.4em] placeholder:text-white/10 focus:border-white transition-all ring-0 outline-none backdrop-blur-3xl text-lg"
                                value={formData.volume || ""}
                                onChange={(e) => updateForm({ volume: Number(e.target.value) })}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex gap-8 border-t border-white/10 pt-16">
                <button
                    onClick={prevStep}
                    className="h-32 px-16 rounded-full border border-white/10 bg-white/5 text-white hover:bg-white hover:text-black transition-all font-black text-[10px] uppercase tracking-[0.6em] active:scale-95"
                >
                    <ArrowLeft className="mr-6 h-6 w-6" /> REVERT
                </button>
                <button
                    onClick={nextStep}
                    className="flex-1 h-32 bg-white text-black hover:bg-zinc-200 rounded-full font-black text-[14px] uppercase tracking-[1em] transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-8"
                >
                    INITIATE_PROCUREMENT <ArrowRight className="h-8 w-8" />
                </button>
            </div>
        </div>
    );
}
