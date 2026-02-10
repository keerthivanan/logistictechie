"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Mail, Phone } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ContactPage() {
    const { t } = useLanguage();

    return (
        <main className="min-h-screen bg-black pt-32 pb-24 px-6 text-white">
            <div className="container max-w-6xl mx-auto grid lg:grid-cols-2 gap-20">

                {/* Contact Info */}
                <div className="space-y-12">
                    <div className="space-y-6">
                        <h1 className="text-5xl font-bold">{t('support.contact.title')}</h1>
                        <p className="text-zinc-400 text-lg leading-relaxed">
                            {t('support.contact.intro')}
                        </p>
                    </div>

                    <div className="space-y-8">
                        <div className="flex items-start gap-6">
                            <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800 shrink-0">
                                <MapPin className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">{t('support.contact.hq.title')}</h3>
                                <p className="text-zinc-400">{t('support.contact.hq.line1')}</p>
                                <p className="text-zinc-400">{t('support.contact.hq.line2')}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-6">
                            <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800 shrink-0">
                                <Mail className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">{t('support.contact.email')}</h3>
                                <p className="text-zinc-400">hello@phoenixos.com</p>
                                <p className="text-zinc-400">support@phoenixos.com</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-6">
                            <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800 shrink-0">
                                <Phone className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">{t('support.contact.phone.title')}</h3>
                                <p className="text-zinc-400">{t('support.contact.phone.number')}</p>
                                <p className="text-zinc-400">{t('support.contact.phone.hours')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="bg-zinc-900/30 p-10 rounded-2xl border border-zinc-800">
                    <form className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-400">{t('support.contact.form.fname')}</label>
                                <Input className="bg-black border-zinc-800 h-12" placeholder="John" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-400">{t('support.contact.form.lname')}</label>
                                <Input className="bg-black border-zinc-800 h-12" placeholder="Doe" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400">{t('support.contact.form.email')}</label>
                            <Input className="bg-black border-zinc-800 h-12" placeholder="john@company.com" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400">{t('support.contact.form.message')}</label>
                            <Textarea className="bg-black border-zinc-800 min-h-[150px]" placeholder={t('support.contact.title')} />
                        </div>

                        <Button className="w-full h-12 text-black font-bold bg-white hover:bg-zinc-200">
                            {t('support.contact.form.submit')}
                        </Button>
                    </form>
                </div>

            </div>
        </main>
    );
}
