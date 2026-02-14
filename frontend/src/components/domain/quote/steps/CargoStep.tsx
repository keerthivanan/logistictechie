"use client";

import { useQuoteStore } from "@/hooks/use-quote";
import { useLanguage } from "@/contexts/LanguageContext";
import { CargoSelectionPopover } from "../CargoSelectionPopover";
import { ArrowRight, Package, FileUp } from "lucide-react";
import { AIDocumentUpload } from "../AIDocumentUpload";

export function CargoStep() {
    const { formData, updateForm, nextStep } = useQuoteStore();
    const { t } = useLanguage();

    return (
        <div className="max-w-[1400px] mx-auto">
            <div className="mb-24">
                <div className="flex items-center gap-6 mb-8">
                    <div className="w-16 h-[1px] bg-white/40" />
                    <span className="text-[10px] font-black uppercase tracking-[0.6em] text-white/40">{t('quote.wizard.cargo.protocolStep')}</span>
                </div>
                <h2 className="text-7xl md:text-[120px] font-black text-white uppercase tracking-tighter mb-8 leading-[0.8] italic">
                    {t('quote.wizard.cargo.identifyCargo').split('.')[0]}. <br />
                    <span className="text-white/20 select-none">{t('quote.wizard.cargo.identifyCargo').split('.')[1]}</span>
                </h2>
                <p className="text-white text-3xl font-black uppercase tracking-tighter leading-[0.9] max-w-3xl italic">
                    {t('quote.wizard.cargo.cargoDesc')}
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 mb-32">
                {/* Cargo Selection */}
                <div className="bg-zinc-950/40 rounded-[48px] border border-white/10 p-16 relative overflow-hidden backdrop-blur-3xl">
                    <div className="flex items-center gap-8 mb-12">
                        <div className="h-24 w-24 rounded-[32px] bg-white text-black flex items-center justify-center shadow-2xl">
                            <Package className="h-10 w-10" />
                        </div>
                        <div>
                            <h3 className="text-4xl font-black uppercase tracking-[0.02em] text-white italic">{t('quote.wizard.cargo.unitSpec')}</h3>
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em] mt-2">{t('quote.wizard.cargo.dimParams')}</p>
                        </div>
                    </div>
                    <CargoSelectionPopover
                        containerSize={formData.containerSize || "40"}
                        onChange={(size) => updateForm({ containerSize: size as any })}
                    />
                </div>

                {/* Document Sync */}
                <div className="bg-zinc-950/40 rounded-[48px] border border-white/10 p-16 relative overflow-hidden backdrop-blur-3xl">
                    <div className="flex items-center gap-8 mb-12">
                        <div className="h-24 w-24 rounded-[32px] bg-white text-black flex items-center justify-center shadow-2xl">
                            <FileUp className="h-10 w-10" />
                        </div>
                        <div>
                            <h3 className="text-4xl font-black uppercase tracking-[0.02em] text-white italic">{t('quote.wizard.cargo.neuralExtraction')}</h3>
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em] mt-2">{t('quote.wizard.cargo.autoSync')}</p>
                        </div>
                    </div>
                    <AIDocumentUpload />
                </div>
            </div>

            <div className="flex justify-end border-t border-white/10 pt-16">
                <button
                    onClick={nextStep}
                    className="h-32 px-24 bg-white text-black font-black text-[14px] uppercase tracking-[1em] transition-all hover:bg-zinc-200 rounded-full shadow-2xl active:scale-95 flex items-center gap-8"
                >
                    {t('quote.wizard.cargo.initRoute')} <ArrowRight className="h-8 w-8" />
                </button>
            </div>
        </div >
    );
}
