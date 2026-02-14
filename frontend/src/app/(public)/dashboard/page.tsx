"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
    Ship,
    Package,
    TrendingUp,
    MapPin,
    ArrowUpRight,
    Bell,
    Plus,
    Globe,
    Zap,
    Anchor,
    ArrowRight
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import axios from "axios";
import { useLanguage } from "@/contexts/LanguageContext";
import { BACKEND_URL } from "@/lib/logistics";
import { MarketTrendWidget } from "@/components/widgets/MarketTrendWidget";
import { VesselTrackerWidget } from "@/components/widgets/VesselTrackerWidget";
import { BookingOfficeLocator } from "@/components/widgets/BookingOfficeLocator";

interface Booking {
    id: string;
    ref: string;
    booking_reference?: string;
    origin: string;
    destination: string;
    status: string;
    price: number;
    created_at: string;
}

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const { language, t } = useLanguage();
    const [statsData, setStatsData] = useState({ active_shipments: 0, containers: 0, on_time_rate: "99.9%" });

    const userName = (session?.user?.name || "OPERATIVE").split(' ')[0].toUpperCase();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }

        if (status === "authenticated" && session?.user) {
            const fetchData = async () => {
                try {
                    const token = (session.user as any).accessToken;
                    const userId = (session.user as any).id;
                    const apiUrl = BACKEND_URL.replace('/api', '');

                    const [bookRes, statsRes] = await Promise.all([
                        axios.get(`${apiUrl}/api/bookings/user/${userId}`, {
                            headers: { Authorization: `Bearer ${token}` }
                        }),
                        axios.get(`${apiUrl}/api/dashboard/stats/${userId}`, {
                            headers: { Authorization: `Bearer ${token}` }
                        })
                    ]);

                    setBookings(bookRes.data.data || []);
                    if (statsRes.data.success) {
                        setStatsData({
                            active_shipments: statsRes.data.active_shipments,
                            containers: statsRes.data.containers,
                            on_time_rate: statsRes.data.on_time_rate
                        });
                    }
                } catch (err) {
                    console.error("DATA_SYNC_ISSUE:", err);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [status, session, router]);

    const stats = [
        { id: "01", label: t('dashboard.stats.activeShipments'), value: statsData.active_shipments, trend: t('dashboard.stats.optimal') },
        { id: "02", label: t('dashboard.stats.globalInventory'), value: statsData.containers, trend: t('dashboard.stats.synced') },
        { id: "03", label: t('dashboard.stats.systemReliability'), value: statsData.on_time_rate, trend: t('dashboard.stats.elite') }
    ];

    return (
        <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
            <div className="container max-w-[1400px] mx-auto px-8 py-32 md:py-48">

                {/* Tactical Header */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="grid lg:grid-cols-2 gap-16 md:gap-32 mb-32 md:mb-64 group"
                >
                    <div>
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-[1em] mb-8 block">{t('dashboard.commandHub')}</span>
                        <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase group-hover:italic transition-all duration-700 leading-none">
                            {t('dashboard.welcome')} <br /><span className="text-white/20 italic">{userName}.</span>
                        </h1>
                    </div>
                    <div className="flex flex-col justify-end">
                        <div className="bg-zinc-950/40 border border-white/5 rounded-[48px] p-10 md:p-12 backdrop-blur-3xl group-hover:border-white/10 transition-all duration-700 flex flex-col justify-center">
                            <span className="text-[10px] font-black text-white/20 uppercase tracking-[1em] mb-4">{t('dashboard.osStatus')}</span>
                            <div className="text-3xl md:text-5xl font-black text-white italic tracking-tighter flex items-center gap-8">
                                <div className="w-3.5 h-3.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                                {t('dashboard.coreOnline')}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Structured Stats Matrix */}
                <div className="grid lg:grid-cols-3 gap-0 border-y border-white/5 bg-zinc-950/20 backdrop-blur-3xl mb-64">
                    {stats.map((stat) => (
                        <div key={stat.id} className="p-10 md:p-20 border-r last:border-r-0 border-white/5 group hover:bg-white/5 transition-all duration-700">
                            <span className="text-6xl font-black text-white/5 group-hover:text-white/10 transition-all block mb-12 tabular-nums">0{stat.id}</span>
                            <div className="space-y-6">
                                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.6em] block group-hover:text-white transition-colors">{stat.label}</span>
                                <div className="text-7xl md:text-9xl font-black text-white tracking-tighter tabular-nums transition-all group-hover:pl-4 group-hover:italic leading-none">{stat.value}</div>
                                <div className="text-[10px] font-black text-emerald-400 tracking-[0.8em] mt-12 uppercase">{stat.trend}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Primary Operational Grid */}
                <div className="grid lg:grid-cols-[2fr,1fr] gap-16 md:gap-32 border-t border-white/5 pt-32">

                    {/* Left Side: Manifest Log */}
                    <div className="space-y-32">
                        <div className="flex justify-between items-end mb-16 px-6">
                            <div>
                                <span className="text-[10px] font-black text-white/20 uppercase tracking-[1em] mb-4 block">{t('dashboard.manifest.activeOps')}</span>
                                <h2 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter group hover:italic transition-all duration-700">{t('dashboard.manifest.title')}</h2>
                            </div>
                            <Link href="/quote">
                                <button className="h-20 px-16 bg-white text-black font-black uppercase tracking-[0.8em] text-[10px] transition-all hover:bg-zinc-200 rounded-full active:scale-95 shadow-2xl">
                                    {t('dashboard.manifest.newDeployment')}
                                </button>
                            </Link>
                        </div>

                        <div className="space-y-8">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-48 opacity-20">
                                    <div className="w-[1px] h-32 bg-white animate-pulse" />
                                    <span className="text-[10px] font-black text-white uppercase tracking-[1em] mt-12">{t('dashboard.manifest.syncingLedger')}</span>
                                </div>
                            ) : bookings.length === 0 ? (
                                <div className="py-64 flex flex-col items-center justify-center border border-white/5 bg-zinc-950/10 rounded-[64px] shadow-inner opacity-20 group">
                                    <Anchor className="w-24 h-24 mb-12 text-white/10 group-hover:text-white transition-all" />
                                    <span className="text-[10px] font-black text-white uppercase tracking-[1em]">{t('dashboard.manifest.zeroManifests')}</span>
                                </div>
                            ) : (
                                bookings.map((b, i) => (
                                    <div key={i} className="bg-zinc-950/20 rounded-[48px] border border-white/5 group flex items-center justify-between hover:bg-white/5 hover:border-white/20 transition-all duration-700 p-10 backdrop-blur-xl">
                                        <div className="flex items-center gap-16">
                                            <span className="text-5xl font-black text-white/5 group-hover:text-white/10 transition-all tabular-nums leading-none">0{i + 1}</span>
                                            <div>
                                                <h3 className="text-3xl font-black text-white uppercase tracking-tighter transition-all group-hover:pl-6 group-hover:italic leading-none">{b.booking_reference || t('dashboard.manifest.genCargo')}</h3>
                                                <div className="flex items-center gap-8 mt-4">
                                                    <span className="text-[10px] font-black tracking-[0.6em] text-white/20 uppercase group-hover:text-white/40">{b.origin}</span>
                                                    <ArrowRight className="w-4 h-4 text-white/10" />
                                                    <span className="text-[10px] font-black tracking-[0.6em] text-white/20 uppercase group-hover:text-white/40">{b.destination}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right pr-4">
                                            <div className="text-[9px] font-black tracking-[1.2em] text-emerald-400 mb-2 uppercase">{t('dashboard.manifest.active')}</div>
                                            <div className="text-2xl font-black text-white/20 group-hover:text-white transition-all tabular-nums italic tracking-tighter">{new Date(b.created_at).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right Side: High-Security Intel */}
                    <div className="space-y-32">
                        <div className="bg-zinc-950/40 rounded-[64px] border border-white/5 p-8 backdrop-blur-3xl group hover:border-white/10 transition-all duration-700">
                            <span className="text-[10px] font-black text-white/20 uppercase tracking-[1em] block mb-12 ml-4">{t('dashboard.intel.marketIntel')}</span>
                            <div className="grayscale saturate-50 hover:grayscale-0 transition-all duration-1000 p-4">
                                <MarketTrendWidget />
                            </div>
                        </div>

                        <div className="bg-zinc-950/40 rounded-[64px] border border-white/5 p-8 backdrop-blur-3xl group hover:border-white/10 transition-all duration-700">
                            <span className="text-[10px] font-black text-white/20 uppercase tracking-[1em] block mb-12 ml-4">{t('dashboard.intel.globalVessels')}</span>
                            <div className="grayscale hover:grayscale-0 transition-all duration-1000 p-4">
                                <VesselTrackerWidget />
                            </div>
                        </div>

                        <div className="bg-white p-16 text-black rounded-[48px] flex flex-col justify-between h-[450px] group hover:scale-[1.02] transition-all duration-700 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none italic text-8xl font-black tracking-tighter">SECURE</div>
                            <div>
                                <span className="text-[11px] font-black uppercase tracking-[0.6em] text-black/40">{t('dashboard.intel.securityProtocol')}</span>
                                <h4 className="text-6xl font-black italic leading-none mt-8 transition-all group-hover:pl-6 tracking-tighter uppercase">{t('dashboard.intel.encryptedLink')}</h4>
                            </div>
                            <div className="flex justify-between items-end">
                                <Zap className="w-16 h-16 fill-black" />
                                <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center text-white group-hover:translate-x-4 transition-transform">
                                    <ArrowUpRight className="w-10 h-10" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Industrial Status Marker */}
                <div className="mt-64 text-center border-t border-white/5 pt-48 pb-32 group relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-[1em] mb-12 block">COMMAND_HUB_OS</span>
                    <h2 className="text-4xl md:text-8xl font-black text-white mb-12 uppercase tracking-tighter group-hover:italic transition-all duration-700 leading-none">Monitor. Manage. Move.</h2>
                </div>
            </div>
        </main>
    );
}
