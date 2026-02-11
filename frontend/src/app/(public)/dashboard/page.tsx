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
    Anchor
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
    const { language } = useLanguage();
    const [statsData, setStatsData] = useState({ active_shipments: 0, containers: 0, on_time_rate: "99.9%" });

    const userName = (session?.user?.name || "COMMAND_USER").split(' ')[0];
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
        { label: "Active_Shipments", value: statsData.active_shipments, icon: Ship, trend: "+12.4%" },
        { label: "Global_Inventory", value: statsData.containers, icon: Package, trend: "Optimal" },
        { label: "Transit_Reliability", value: statsData.on_time_rate, icon: TrendingUp, trend: "Elite" }
    ];

    return (
        <main className="min-h-screen bg-black text-white relative overflow-hidden bg-grid-premium">
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none" />

            <div className="container max-w-[1400px] mx-auto px-8 pt-32 pb-48 relative z-10">

                {/* Cinematic Header */}
                <div className="flex flex-col mb-32">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-[1px] bg-emerald-500" />
                            <span className="text-[10px] font-black uppercase tracking-[0.8em] text-emerald-500">OPERATIONAL_INITIALIZED</span>
                        </div>
                        <h1 className="titan-text mb-4">
                            Welcome Back, <br />
                            <span className="text-zinc-900 group">{userName}.</span>
                        </h1>
                        <p className="text-zinc-600 text-xs font-black uppercase tracking-[0.4em] mt-8 flex items-center gap-4">
                            <Zap className="w-4 h-4 text-emerald-500" />
                            All systems operating at maximum efficiency.
                        </p>
                    </motion.div>
                </div>

                {/* Elite Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-0 mb-32 border-t border-white/5">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                            className="p-12 border-l border-b border-white/5 relative group hover:bg-zinc-950/40 transition-colors cursor-default"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 group-hover:text-emerald-500 transition-colors">
                                    {stat.label}
                                </div>
                                <stat.icon className="w-5 h-5 text-zinc-800 group-hover:text-white transition-all transform group-hover:rotate-12" />
                            </div>
                            <div className="text-7xl font-black italic tracking-tighter mb-4">{stat.value}</div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-emerald-500/50">
                                Status: {stat.trend}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Operational Interface */}
                <div className="grid lg:grid-cols-12 gap-16 mb-32">

                    {/* Primary Control Log */}
                    <div className="lg:col-span-8">
                        <div className="flex items-end justify-between mb-12">
                            <div>
                                <h2 className="text-4xl font-black italic uppercase italic-heading text-white tracking-widest leading-none mb-4">
                                    Operational_Manifest
                                </h2>
                                <div className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em]">Real-time Cargo telemetry synchronization</div>
                            </div>
                            <Link href="/quote">
                                <Button className="h-14 px-10 rounded-none bg-white text-black font-black uppercase tracking-[0.3em] text-[10px] hover:bg-emerald-500 hover:scale-105 transition-all">
                                    NEW_DEPLOYMENT
                                </Button>
                            </Link>
                        </div>

                        <div className="space-y-2">
                            {loading ? (
                                <div className="py-32 text-center text-zinc-800 font-black uppercase tracking-[1em] animate-pulse">Synchronizing_Neural_Link...</div>
                            ) : bookings.length === 0 ? (
                                <div className="py-48 flex flex-col items-center justify-center border border-white/5 bg-zinc-950/20">
                                    <Anchor className="w-16 h-16 text-zinc-900 mb-8" />
                                    <div className="text-zinc-800 font-black uppercase tracking-[0.5em] mb-12">No manifests detected in active sector.</div>
                                    <Link href="/quote">
                                        <Button className="h-16 px-16 border border-white/10 bg-transparent text-white font-black uppercase tracking-[0.4em] text-[10px] hover:bg-white hover:text-black transition-all">
                                            INITIATE_FIRST_MANIFEST
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                bookings.map((b, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="group p-8 flex items-center justify-between bg-zinc-950/20 border border-white/5 hover:border-white/20 hover:bg-zinc-950/40 transition-all cursor-pointer"
                                    >
                                        <div className="flex items-center gap-12">
                                            <div className="w-16 h-16 bg-zinc-900 flex items-center justify-center group-hover:bg-white group-hover:rotate-12 transition-all duration-500">
                                                <Ship className="w-8 h-8 text-zinc-600 group-hover:text-black" />
                                            </div>
                                            <div>
                                                <div className="text-2xl font-black italic uppercase tracking-tighter text-white group-hover:text-emerald-500 transition-colors mb-2">
                                                    {b.booking_reference || "GEN_CARGO_01"}
                                                </div>
                                                <div className="flex items-center gap-4 text-[9px] font-black text-zinc-700 uppercase tracking-widest">
                                                    <MapPin className="w-3 h-3 text-emerald-500" />
                                                    {b.origin} <span className="text-zinc-900 mx-2">{">>"}</span> {b.destination}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-2">
                                                STATUS_ACTIVE
                                            </div>
                                            <div className="text-[10px] font-black text-zinc-800 uppercase tracking-widest">
                                                {new Date(b.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Elite Intelligence Widgets */}
                    <div className="lg:col-span-4 flex flex-col gap-12">
                        <div className="p-8 bg-zinc-950/40 border border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-5 italic font-black text-6xl text-white pointer-events-none">
                                INTEL
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-emerald-500 mb-6">Market_Intelligence</h3>
                                <MarketTrendWidget />
                            </div>
                        </div>

                        <div className="p-8 bg-zinc-950/40 border border-white/5">
                            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-700 mb-6 px-2">Global_Vessel_Tracking</h3>
                            <VesselTrackerWidget />
                        </div>

                        <div className="p-8 bg-white text-black group hover:bg-emerald-500 transition-colors duration-700 cursor-pointer">
                            <div className="flex justify-between items-start mb-8">
                                <h3 className="text-xs font-black uppercase tracking-[0.4em] leading-none">Security_Protocol_Active</h3>
                                <Zap className="w-5 h-5 fill-black" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest leading-loose mb-12">
                                Encrypted neural link established between all global logistics nodes. Deployment status: SECURE.
                            </p>
                            <ArrowUpRight className="w-8 h-8 transform group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
