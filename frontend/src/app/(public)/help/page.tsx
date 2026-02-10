"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { HelpCircle, MessageSquare, Phone } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function HelpPage() {
    const { t } = useLanguage();

    return (
        <main className="min-h-screen bg-black pt-32 pb-24 px-6 text-white">
            <div className="container max-w-4xl mx-auto space-y-12">
                <div className="text-center space-y-6">
                    <h1 className="text-5xl font-bold">{t('support.help.title')}</h1>
                    <p className="text-zinc-400 text-xl max-w-2xl mx-auto">
                        {t('support.help.subtitle')}
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mt-12">
                    <div className="bg-zinc-900/50 p-8 rounded-xl border border-zinc-800 text-center space-y-4">
                        <HelpCircle className="w-12 h-12 mx-auto text-emerald-500" />
                        <h3 className="text-xl font-bold">{t('support.help.cards.faq.title')}</h3>
                        <p className="text-zinc-400 text-sm">{t('support.help.cards.faq.desc')}</p>
                        <Button variant="outline" className="w-full">{t('support.help.cards.faq.btn')}</Button>
                    </div>
                    <div className="bg-zinc-900/50 p-8 rounded-xl border border-zinc-800 text-center space-y-4">
                        <MessageSquare className="w-12 h-12 mx-auto text-emerald-500" />
                        <h3 className="text-xl font-bold">{t('support.help.cards.chat.title')}</h3>
                        <p className="text-zinc-400 text-sm">{t('support.help.cards.chat.desc')}</p>
                        <Button variant="outline" className="w-full">{t('support.help.cards.chat.btn')}</Button>
                    </div>
                    <div className="bg-zinc-900/50 p-8 rounded-xl border border-zinc-800 text-center space-y-4">
                        <Phone className="w-12 h-12 mx-auto text-emerald-500" />
                        <h3 className="text-xl font-bold">{t('support.help.cards.phone.title')}</h3>
                        <p className="text-zinc-400 text-sm">{t('support.help.cards.phone.desc')}</p>
                        <Button variant="outline" className="w-full">{t('support.help.cards.phone.btn')}</Button>
                    </div>
                </div>

                <div className="mt-20 space-y-8">
                    <h2 className="text-3xl font-bold">{t('support.help.common_qs_title')}</h2>
                    <div className="space-y-4">
                        {[0, 1, 2, 3].map((i) => (
                            <div key={i} className="bg-zinc-900/30 p-6 rounded-lg border border-zinc-800 flex justify-between items-center hover:bg-zinc-900/60 cursor-pointer transition-colors">
                                <span className="font-medium text-lg">{t(`support.help.qs.${i}`)}</span>
                                <span className="text-emerald-500 text-xl font-bold">+</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
