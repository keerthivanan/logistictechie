"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export default function PrivacyPage() {
    const { t } = useLanguage();

    return (
        <main className="min-h-screen bg-black pt-32 pb-24 px-6 text-white">
            <div className="container max-w-4xl mx-auto space-y-12">
                <h1 className="text-5xl font-bold">{t('legal.privacy.title')}</h1>
                <p className="text-zinc-400 text-lg">
                    {t('legal.privacy.subtitle')}
                </p>
                <div className="prose prose-invert max-w-none space-y-6 text-zinc-300">
                    <p>
                        {t('legal.privacy.intro')}
                    </p>
                    <h3 className="text-2xl font-bold text-white">{t('legal.privacy.collection_title')}</h3>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>{t('legal.privacy.collection_list.0')}</li>
                        <li>{t('legal.privacy.collection_list.1')}</li>
                        <li>{t('legal.privacy.collection_list.2')}</li>
                    </ul>
                    <h3 className="text-2xl font-bold text-white">{t('legal.privacy.security_title')}</h3>
                    <p>
                        {t('legal.privacy.security_text')}
                    </p>
                </div>
            </div>
        </main>
    );
}
