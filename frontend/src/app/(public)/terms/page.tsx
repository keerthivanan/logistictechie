"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export default function TermsPage() {
    const { t } = useLanguage();

    return (
        <main className="min-h-screen bg-black pt-32 pb-24 px-6">
            <div className="container max-w-4xl mx-auto space-y-12">
                <h1 className="text-5xl font-bold text-white">{t('legal.terms.title')}</h1>
                <p className="text-zinc-400 text-lg">
                    {t('legal.terms.updated')}
                </p>
                <div className="prose prose-invert max-w-none space-y-6">
                    <p className="text-zinc-300 text-lg leading-relaxed">
                        {t('legal.terms.intro')}
                    </p>
                    <p className="text-zinc-400">
                        {t('legal.terms.contact')}
                    </p>
                </div>
            </div>
        </main>
    );
}
