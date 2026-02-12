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
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
            <div className="container max-w-[1400px] mx-auto px-8 py-48">

                {/* Architectural Header */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="grid lg:grid-cols-2 gap-32 mb-64"
                >
                    <div>
                        <span className="arch-label mb-12 block">{t('dashboard.commandHub')}</span>
                        <h1 className="arch-heading">{t('dashboard.welcome')} <br /><span className="italic">{userName}</span>.</h1>
                    </div>
                    <div className="flex flex-col justify-end items-end">
                        <div className="arch-detail-line h-32 border-white flex flex-col justify-center px-12">
                            <span className="arch-label mb-2">{t('dashboard.osStatus')}</span>
                            <div className="text-4xl font-light text-white italic tracking-widest flex items-center gap-6">
                                <div className="w-3 h-3 bg-emerald-500 animate-pulse" />
                                {t('dashboard.coreOnline')}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Structured Stats Matrix */}
                <div className="grid lg:grid-cols-3 gap-0 border-y border-white/5 mb-64">
                    {stats.map((stat) => (
                        <div key={stat.id} className="p-16 border-r last:border-r-0 border-white/5 group hover:bg-zinc-950/20 transition-all duration-700">
                            <span className="arch-number text-zinc-900 group-hover:text-white transition-all block mb-12">{stat.id}</span>
                            <div className="space-y-4">
                                <span className="arch-label text-zinc-600 block mb-8">{stat.label}</span>
                                <div className="text-8xl font-light text-white tracking-tighter tabular-nums transition-all group-hover:pl-4">{stat.value}</div>
                                <div className="text-[10px] font-bold text-emerald-500 tracking-[0.6em] mt-8 uppercase">{stat.trend}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Primary Operational Grid */}
                <div className="grid lg:grid-cols-[2fr,1fr] gap-32 border-t border-white/5 pt-32">

                    {/* Left Side: Manifest Log */}
                    <div className="space-y-32">
                        <div className="flex justify-between items-end mb-16 px-4">
                            <div>
                                <span className="arch-label mb-4 block">{t('dashboard.manifest.activeOps')}</span>
                                <h2 className="text-5xl font-light text-white italic tracking-tighter">{t('dashboard.manifest.title')}</h2>
                            </div>
                            <Link href="/quote">
                                <button className="h-16 px-12 bg-white text-black font-bold uppercase tracking-[0.6em] text-[10px] transition-all hover:bg-zinc-200">
                                    {t('dashboard.manifest.newDeployment')}
                                </button>
                            </Link>
                        </div>

                        <div className="space-y-8">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-48 opacity-20">
                                    <div className="w-1 h-32 bg-white animate-pulse" />
                                    <span className="arch-label mt-8">{t('dashboard.manifest.syncingLedger')}</span>
                                </div>
                            ) : bookings.length === 0 ? (
                                <div className="py-64 flex flex-col items-center justify-center border border-white/5 bg-zinc-950/10 grayscale opacity-20">
                                    <Anchor className="w-16 h-16 mb-8" />
                                    <span className="arch-label">{t('dashboard.manifest.zeroManifests')}</span>
                                </div>
                            ) : (
                                bookings.map((b, i) => (
                                    <div key={i} className="arch-detail-line group flex items-center justify-between hover:bg-zinc-950/20 transition-all duration-700 py-12">
                                        <div className="flex items-center gap-16">
                                            <span className="arch-number text-zinc-900 group-hover:text-white transition-all">0{i + 1}</span>
                                            <div>
                                                <h3 className="text-4xl font-light text-white uppercase italic tracking-tighter transition-all group-hover:pl-4">{b.booking_reference || t('dashboard.manifest.genCargo')}</h3>
                                                <div className="flex items-center gap-8 mt-2">
                                                    <span className="text-[10px] font-bold tracking-[0.4em] text-zinc-600 uppercase">{b.origin}</span>
                                                    <ArrowRight className="w-3 h-3 text-zinc-800" />
                                                    <span className="text-[10px] font-bold tracking-[0.4em] text-zinc-600 uppercase">{b.destination}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] font-bold tracking-[1em] text-emerald-500 mb-2">{t('dashboard.manifest.active')}</div>
                                            <div className="text-xl font-bold text-zinc-800 tracking-tighter tabular-nums">{new Date(b.created_at).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right Side: High-Security Intel */}
                    <div className="space-y-32">
                        <div className="arch-detail-line border-white">
                            <span className="arch-label block mb-8">{t('dashboard.intel.marketIntel')}</span>
                            <div className="bg-zinc-950/20 p-8 border border-white/5 grayscale saturate-50 hover:grayscale-0 transition-all duration-1000">
                                <MarketTrendWidget />
                            </div>
                        </div>

                        <div className="arch-detail-line border-zinc-800 hover:border-white transition-all duration-1000">
                            <span className="arch-label block mb-8">{t('dashboard.intel.globalVessels')}</span>
                            <div className="bg-zinc-950/20 p-8 border border-white/5 grayscale">
                                <VesselTrackerWidget />
                            </div>
                        </div>

                        <div className="bg-white p-12 text-black flex flex-col justify-between h-96 group hover:translate-x-4 transition-all duration-700">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-[0.4em]">{t('dashboard.intel.securityProtocol')}</span>
                                <h4 className="text-5xl font-light italic leading-none mt-4 transition-all group-hover:pl-4 tracking-tighter">{t('dashboard.intel.encryptedLink')}</h4>
                            </div>
                            <div className="flex justify-between items-end">
                                <Zap className="w-12 h-12 fill-black" />
                                <ArrowUpRight className="w-12 h-12" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sub-footer Section */}
                <div className="mt-96 text-center border-t border-white/5 pt-48 pb-24">
                    <span className="arch-label mb-12 block">COMMAND_HUB_OS</span>
                    <h2 className="arch-heading italic mb-16">Monitor. Manage. Move.</h2>
                </div>
            </div>
        </main>
    );
}
