"use client";

import { QuoteWizard } from "@/components/domain/quote/QuoteWizard";
import { useLanguage } from "@/contexts/LanguageContext";

export default function QuotePage() {
    const { t } = useLanguage();

    return (
        <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
            <div className="container max-w-[1400px] mx-auto px-8 py-32 md:py-48">

                {/* Tactical Header - Monumental static typography */}
                <div className="grid lg:grid-cols-2 gap-16 md:gap-32 mb-16 md:mb-32 group">
                    <div>
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-[1em] mb-8 block">QUOTE_INITIALIZATION_PROTOCOL</span>
                        <h1 className="text-7xl md:text-[180px] font-black text-white tracking-tighter uppercase leading-[0.8] italic">
                            {t('quotePage.title')} <br />
                            <span className="text-white/20 select-none">{t('quotePage.engine') || "Engine."}</span>
                        </h1>
                    </div>
                    <div className="flex flex-col justify-end">
                        <p className="text-3xl md:text-5xl font-black text-white leading-[0.9] max-w-xl md:text-right md:ml-auto uppercase tracking-tighter italic">
                            {t('quotePage.configure')}
                        </p>
                    </div>
                </div>

                {/* Full-Page Protocol Interface - Static */}
                <div className="border-t border-white/10 pt-16 relative">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/[0.02] blur-[150px] rounded-full pointer-events-none" />

                    {/* Quote Wizard Protocol - Static Node */}
                    <div className="bg-zinc-950/40 rounded-[64px] border border-white/10 p-8 md:p-24 shadow-2xl backdrop-blur-3xl relative overflow-hidden">
                        <QuoteWizard />
                    </div>
                </div>

                {/* Sub-footer Section - Monumental Static */}
                <div className="mt-32 text-center border-t border-white/10 pt-32 pb-32 group relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-white/20" />
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-[1em] mb-12 block">{t('quotePage.protocolReady')}</span>
                    <h2 className="text-6xl md:text-[180px] font-black text-white/10 mb-12 uppercase tracking-tighter leading-[0.8]">{t('quotePage.forgeLinkMove')}</h2>
                </div>
            </div>
        </main>
    );
}
