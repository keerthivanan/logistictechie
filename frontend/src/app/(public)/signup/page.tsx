"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { UserPlus, Loader2 } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function SignupPage() {
    const { t } = useLanguage();
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSignup = () => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            router.push('/dashboard');
        }, 1500);
    };

    return (
        <main className="min-h-screen w-full flex items-center justify-center bg-black relative overflow-hidden">
            {/* Minimalist Background */}
            <div className="absolute inset-0 bg-black">
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
            </div>

            <div className="relative z-10 w-full max-w-md px-4 my-10">
                <Card className="p-8 space-y-6 border-white/10 bg-black border shadow-2xl rounded-xl">
                    <div className="text-center space-y-2">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white mb-4">
                            <UserPlus className="h-6 w-6 text-black" />
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-tighter">{t('signup.title')}</h1>
                        <p className="text-gray-400 font-light">{t('signup.subtitle')}</p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t('signup.name')}</label>
                            <Input
                                placeholder="John Doe"
                                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-11 focus:border-white focus:ring-0 rtl:text-right rounded-lg"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t('signup.email')}</label>
                            <Input
                                type="email"
                                placeholder="john@company.com"
                                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-11 focus:border-white focus:ring-0 rtl:text-right rounded-lg"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t('signup.password')}</label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-11 focus:border-white focus:ring-0 rtl:text-right rounded-lg"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t('signup.confirm_password')}</label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-11 focus:border-white focus:ring-0 rtl:text-right rounded-lg"
                            />
                        </div>

                        <Button
                            onClick={handleSignup}
                            disabled={isLoading}
                            className="w-full bg-white hover:bg-gray-200 text-black h-12 font-bold transition-all active:scale-[0.98] mt-2 rounded-lg"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-black" />
                                    {t('signup.creating')}
                                </>
                            ) : t('signup.create')}
                        </Button>
                    </div>

                    <div className="text-center text-sm text-gray-600 pt-6 border-t border-white/10">
                        <span className="mr-2">{t('signup.has_account')}</span>
                        <Link href="/login" className="text-white hover:text-gray-300 font-bold transition-colors">
                            {t('signup.sign_in')}
                        </Link>
                    </div>
                </Card>
            </div>
        </main>
    );
}
