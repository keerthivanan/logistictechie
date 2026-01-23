"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { UserPlus, Loader2 } from "lucide-react";
import Link from "next/link";
import Hyperspeed from "@/components/ui/Hyperspeed";
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
        <main className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-black/60 z-10" />
                <Hyperspeed
                    effectOptions={{
                        onSpeedUp: () => { },
                        onSlowDown: () => { },
                        distortion: 'turbulentDistortion',
                        length: 400,
                        roadWidth: 10,
                        islandWidth: 2,
                        lanesPerRoad: 3,
                        fov: 90,
                        fovSpeedUp: 150,
                        speedUp: 2,
                        carLightsFade: 0.4,
                        totalSideLightSticks: 20,
                        lightPairsPerRoadWay: 40,
                        shoulderLinesWidthPercentage: 0.05,
                        brokenLinesWidthPercentage: 0.1,
                        brokenLinesLengthPercentage: 0.5,
                        lightStickWidth: [0.12, 0.5],
                        lightStickHeight: [1.3, 1.7],
                        movingAwaySpeed: [60, 80],
                        movingCloserSpeed: [-120, -160],
                        carLightsLength: [400 * 0.03, 400 * 0.2],
                        carLightsRadius: [0.05, 0.14],
                        carWidthPercentage: [0.3, 0.5],
                        carShiftX: [-0.8, 0.8],
                        carFloorSeparation: [0, 5],
                        colors: {
                            roadColor: 0x080808,
                            islandColor: 0x0a0a0a,
                            background: 0x000000,
                            shoulderLines: 0x131318,
                            brokenLines: 0x131318,
                            leftCars: [0xd856bf, 0x6750a2, 0xc247ac],
                            rightCars: [0x03b3c3, 0x0e5ea5, 0x324555],
                            sticks: 0x03b3c3
                        }
                    }}
                />
            </div>

            <div className="relative z-10 w-full max-w-md px-4 my-10">
                <Card className="p-8 space-y-6 border-white/10 bg-black/50 backdrop-blur-xl shadow-2xl">
                    <div className="text-center space-y-2">
                        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-blue-500 mb-4 shadow-lg shadow-purple-500/30">
                            <UserPlus className="h-7 w-7 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">{t('signup.title')}</h1>
                        <p className="text-gray-400">{t('signup.subtitle')}</p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('signup.name')}</label>
                            <Input
                                placeholder="John Doe"
                                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-11 focus:border-purple-500 focus:ring-purple-500/20 rtl:text-right"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('signup.email')}</label>
                            <Input
                                type="email"
                                placeholder="john@company.com"
                                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-11 focus:border-purple-500 focus:ring-purple-500/20 rtl:text-right"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('signup.password')}</label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-11 focus:border-purple-500 focus:ring-purple-500/20 rtl:text-right"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('signup.confirm_password')}</label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-11 focus:border-purple-500 focus:ring-purple-500/20 rtl:text-right"
                            />
                        </div>

                        <Button
                            onClick={handleSignup}
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 text-white h-12 font-bold shadow-lg shadow-purple-900/30 transition-all active:scale-[0.98] mt-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t('signup.creating')}
                                </>
                            ) : t('signup.create')}
                        </Button>
                    </div>

                    <div className="text-center text-sm text-gray-500 pt-4 border-t border-white/5">
                        <span className="mr-2">{t('signup.has_account')}</span>
                        <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                            {t('signup.sign_in')}
                        </Link>
                    </div>
                </Card>
            </div>
        </main>
    );
}
