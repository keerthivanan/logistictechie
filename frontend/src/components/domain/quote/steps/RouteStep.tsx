"use client";

import { useQuoteStore } from "@/hooks/use-quote";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowRight, ArrowLeft, MapPin } from "lucide-react";
import { PortAutocomplete } from "@/components/ui/PortAutocomplete";

export function RouteStep() {
    const { formData, updateForm, nextStep, prevStep } = useQuoteStore();
    const { t } = useLanguage();

    return (
        <div className="grid lg:grid-cols-2 gap-20 items-stretch">
            {/* Command Interface Side */}
            <div className="flex flex-col justify-center">
                <div className="mb-24">
                    <div className="flex items-center gap-6 mb-8">
                        <div className="w-16 h-[1px] bg-white/40" />
                        <span className="text-[10px] font-black uppercase tracking-[0.6em] text-white/40">{t('quote.wizard.route.protocolStep')}</span>
                    </div>
                    <h2 className="text-7xl md:text-[120px] font-black text-white uppercase tracking-tighter mb-8 leading-[0.8] italic">
                        {t('quote.wizard.route.defineTrajectory').split('.')[0]}. <br />
                        <span className="text-white/20 select-none">{t('quote.wizard.route.defineTrajectory').split('.')[1]}</span>
                    </h2>
                    <p className="text-white text-3xl font-black uppercase tracking-tighter leading-[0.9] max-w-xl italic">
                        {t('quote.wizard.route.trajectoryDesc')}
                    </p>
                </div>

                <div className="space-y-12 mb-24">
                    <div className="space-y-6 group">
                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">{t('quote.wizard.route.originNode')}</label>
                        <div className="relative">
                            <PortAutocomplete
                                value={formData.origin}
                                onChange={(val: string) => updateForm({ origin: val })}
                                placeholder={t('quote.wizard.route.searchOrigin')}
                            />
                        </div>
                    </div>

                    <div className="space-y-6 group">
                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">{t('quote.wizard.route.targetDest')}</label>
                        <div className="relative">
                            <PortAutocomplete
                                value={formData.destination}
                                onChange={(val: string) => updateForm({ destination: val })}
                                placeholder={t('quote.wizard.route.searchDest')}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex gap-8 pt-16 border-t border-white/10">
                    <button
                        onClick={prevStep}
                        className="h-32 px-16 rounded-full border border-white/10 bg-white/5 text-white hover:bg-white hover:text-black transition-all font-black text-[10px] uppercase tracking-[0.6em] active:scale-95"
                    >
                        <ArrowLeft className="mr-6 h-6 w-6" /> {t('quote.wizard.route.revert')}
                    </button>
                    <button
                        onClick={nextStep}
                        className="flex-1 h-32 bg-white text-black hover:bg-zinc-200 rounded-full font-black text-[14px] uppercase tracking-[1em] transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-8"
                    >
                        {t('quote.wizard.route.commenceDetails')} <ArrowRight className="h-8 w-8" />
                    </button>
                </div>
            </div>

            {/* Orbital Visualization Side - Static */}
            <div className="min-h-[700px] border border-white/10 bg-zinc-950/40 rounded-[64px] relative overflow-hidden backdrop-blur-3xl">
                {/* Tactical HUD Overlay */}
                <div className="absolute top-12 left-12 z-20 flex items-center gap-6 bg-black/80 backdrop-blur-3xl px-12 py-6 border border-white/10 rounded-full">
                    <div className="h-3 w-3 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.6em] text-white flex items-center gap-6">
                        <MapPin className="w-5 h-5 text-white" /> {t('quote.wizard.route.liveTrajectory')}
                    </span>
                </div>

                {/* Visual Voids */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none" />
                <div className="absolute bottom-16 right-16 text-[180px] font-black italic text-white/[0.03] select-none pointer-events-none uppercase tracking-tighter leading-none">
                    {t('quote.wizard.steps.route')}
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.05]">
                    <div className="w-[600px] h-[600px] border border-white/20 rounded-full" />
                    <div className="absolute w-[400px] h-[400px] border border-white/20 rounded-full" />
                </div>
            </div>
        </div>
    );
}
