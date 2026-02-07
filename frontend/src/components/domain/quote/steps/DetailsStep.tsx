"use client";

import { useQuoteStore } from "@/hooks/use-quote";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Box } from "lucide-react";

import { useLanguage } from "@/contexts/LanguageContext";

export function DetailsStep() {
    const { t } = useLanguage();
    const { nextStep, prevStep, formData, updateForm } = useQuoteStore();

    return (
        <div className="max-w-3xl mx-auto space-y-12">
            <div className="text-center space-y-4">
                <p className="text-xs font-black text-gray-500 uppercase tracking-[0.3em]">Step 03 — Cargo Calibration</p>
                <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-white uppercase leading-[0.9]">
                    Shipment Details
                </h2>
                <p className="text-gray-500 font-light text-xl max-w-xl mx-auto">{t('quote.wizard.details.subtitle')}</p>
            </div>

            <Card className="p-10 space-y-10 bg-white/[0.02] backdrop-blur-3xl border-white/10 rounded-3xl shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Ready Date */}
                    <div className="space-y-3">
                        <Label className="text-xs font-black uppercase tracking-widest text-gray-400">{t('quote.wizard.details.ready_date')}</Label>
                        <Input
                            type="date"
                            className="bg-black/40 border-white/10 h-14 rounded-xl focus:border-white transition-all invert brightness-200"
                            value={formData.readyDate}
                            onChange={(e) => updateForm({ readyDate: e.target.value })}
                        />
                    </div>

                    {/* Incoterms */}
                    <div className="space-y-3">
                        <Label className="text-xs font-black uppercase tracking-widest text-gray-400">{t('quote.wizard.details.incoterms')}</Label>
                        <Select
                            defaultValue={formData.incoterm}
                            onValueChange={(val: string) => updateForm({ incoterm: val as 'EXW' | 'FCA' | 'FOB' | 'CFR' | 'CIF' | 'DAP' | 'DDP' })}
                        >
                            <SelectTrigger className="bg-black/40 border-white/10 h-14 rounded-xl focus:border-white transition-all text-white rtl:flex-row-reverse">
                                <SelectValue placeholder={t('quote.wizard.details.select_incoterms')} />
                            </SelectTrigger>
                            <SelectContent className="bg-black border-white/20 text-white rounded-xl overflow-hidden" align="end">
                                <SelectItem value="FOB" className="hover:bg-white/10 focus:bg-white/10 transition-colors">{t('quote.wizard.details.incoterm_opts.fob')}</SelectItem>
                                <SelectItem value="EXW" className="hover:bg-white/10 focus:bg-white/10 transition-colors">{t('quote.wizard.details.incoterm_opts.exw')}</SelectItem>
                                <SelectItem value="CIF" className="hover:bg-white/10 focus:bg-white/10 transition-colors">{t('quote.wizard.details.incoterm_opts.cif')}</SelectItem>
                                <SelectItem value="DDP" className="hover:bg-white/10 focus:bg-white/10 transition-colors">{t('quote.wizard.details.incoterm_opts.ddp')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Commodity */}
                    <div className="col-span-2 space-y-3">
                        <Label className="text-xs font-black uppercase tracking-widest text-gray-400">{t('quote.wizard.details.commodity')}</Label>
                        <div className="relative">
                            <Input
                                placeholder={t('quote.wizard.details.commodity_placeholder')}
                                className="bg-black/40 border-white/10 h-14 rounded-xl pl-12 focus:border-white transition-all text-white rtl:text-right"
                                value={formData.commodity}
                                onChange={(e) => updateForm({ commodity: e.target.value })}
                            />
                            <Box className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        </div>
                    </div>

                    {/* Total Weight */}
                    <div className="space-y-3">
                        <Label className="text-xs font-black uppercase tracking-widest text-gray-400">{t('quote.wizard.details.weight')}</Label>
                        <Input
                            type="number"
                            placeholder="1000"
                            className="bg-black/40 border-white/10 h-14 rounded-xl focus:border-white transition-all text-white rtl:text-right"
                            value={formData.weight}
                            onChange={(e) => updateForm({ weight: Number(e.target.value) })}
                        />
                    </div>

                    {/* Total Volume */}
                    <div className="space-y-3">
                        <Label className="text-xs font-black uppercase tracking-widest text-gray-400">{t('quote.wizard.details.volume')}</Label>
                        <Input
                            type="number"
                            placeholder="2.5"
                            className="bg-black/40 border-white/10 h-14 rounded-xl focus:border-white transition-all text-white rtl:text-right"
                            value={formData.volume}
                            onChange={(e) => updateForm({ volume: Number(e.target.value) })}
                        />
                    </div>
                </div>
            </Card>

            <div className="flex justify-between items-center pt-8">
                <Button onClick={prevStep} variant="ghost" className="text-gray-500 hover:text-white uppercase font-black tracking-tighter">
                    ← Back to Route
                </Button>
                <Button onClick={nextStep} size="lg" className="bg-white text-black hover:bg-gray-200 h-16 px-12 rounded-2xl uppercase font-black tracking-tighter text-xl shadow-[0_0_50px_rgba(255,255,255,0.05)] border-2 border-white">
                    Fetch Real Rates →
                </Button>
            </div>
        </div>
    );
}

