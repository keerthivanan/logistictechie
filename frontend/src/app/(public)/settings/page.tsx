"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Bell, Lock, Globe, Shield, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function SettingsPage() {
    const router = useRouter();
    const { language, setLanguage, t, direction } = useLanguage();
    const isRTL = direction === 'rtl';
    const [loading, setLoading] = useState(false);

    return (
        <main className="min-h-screen bg-black text-white pt-24 px-6" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="max-w-4xl mx-auto">
                <Button onClick={() => router.back()} variant="ghost" className="mb-6 text-zinc-400 hover:text-white">
                    <ArrowLeft className={`h-4 w-4 ${isRTL ? 'ml-2 rotate-180' : 'mr-2'}`} /> {t('settings.back')}
                </Button>

                <h1 className="text-3xl font-bold text-white mb-8">{t('settings.title')}</h1>

                <div className="grid gap-6">
                    {/* Language & Region */}
                    <Card className="bg-zinc-900/50 border-zinc-800 p-6 rounded-xl">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                <Globe className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-white">{t('settings.language.title')}</h2>
                                <p className="text-sm text-zinc-400">{t('settings.language.desc')}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg">
                            <div>
                                <div className="font-medium text-white mb-1">{t('settings.language.interface')}</div>
                                <div className="text-xs text-zinc-500">{t('settings.language.select')}</div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant={language === 'en' ? "default" : "outline"}
                                    onClick={() => setLanguage('en')}
                                    className={`h-8 ${language === 'en' ? 'bg-white text-black' : 'border-zinc-700 text-zinc-400'}`}
                                >
                                    {t('settings.language.en')}
                                </Button>
                                <Button
                                    variant={language === 'ar' ? "default" : "outline"}
                                    onClick={() => setLanguage('ar')}
                                    className={`h-8 ${language === 'ar' ? 'bg-white text-black' : 'border-zinc-700 text-zinc-400'}`}
                                >
                                    {t('settings.language.ar')}
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* Security */}
                    <Card className="bg-zinc-900/50 border-zinc-800 p-6 rounded-xl">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                                <Lock className="h-5 w-5 text-red-500" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-white">{t('settings.security.title')}</h2>
                                <p className="text-sm text-zinc-400">{t('settings.security.desc')}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <label className="text-sm text-zinc-400">{t('settings.security.currentPwd')}</label>
                                <Input type="password" placeholder="••••••••" className="bg-zinc-800/50 border-zinc-700 h-10" />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm text-zinc-400">{t('settings.security.newPwd')}</label>
                                <Input type="password" placeholder="••••••••" className="bg-zinc-800/50 border-zinc-700 h-10" />
                            </div>
                            <div className="flex justify-end mt-4">
                                <Button className="bg-white text-black hover:bg-zinc-200">{t('settings.security.update')}</Button>
                            </div>
                        </div>
                    </Card>

                    {/* Notifications */}
                    <Card className="bg-zinc-900/50 border-zinc-800 p-6 rounded-xl">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                <Bell className="h-5 w-5 text-amber-500" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-white">{t('settings.notifications.title')}</h2>
                                <p className="text-sm text-zinc-400">{t('settings.notifications.desc')}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-zinc-300">{t('settings.notifications.email')}</span>
                                <Switch defaultChecked className="data-[state=checked]:bg-emerald-500" />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-zinc-300">{t('settings.notifications.shipment')}</span>
                                <Switch defaultChecked className="data-[state=checked]:bg-emerald-500" />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-zinc-300">{t('settings.notifications.marketing')}</span>
                                <Switch className="data-[state=checked]:bg-emerald-500" />
                            </div>
                        </div>
                    </Card>

                </div>
            </div>
        </main>
    );
}
