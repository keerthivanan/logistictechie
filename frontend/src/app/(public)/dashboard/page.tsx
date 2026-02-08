"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Ship, Plane, Clock, Activity, MapPin, Bell, Info, ArrowRight, Plus, Crown, Shield } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function DashboardPage() {
    const { t } = useLanguage();

    const stats = [
        { icon: Activity, value: "14%", label: "Geopolitical Risk" },
        { icon: Ship, value: "3.2k", label: "Fleet Carbon (kg)" },
        { icon: Plane, value: "98.2", label: "Route Health Index" },
        { icon: Clock, value: "0ms", label: "Sync Latency" },
    ];

    const quickActions = [
        { icon: Package, title: t('dashboard.quick_actions.quote_title'), desc: "Execute King-Level corridor analysis.", href: "/quote" },
        { icon: MapPin, title: t('dashboard.quick_actions.track_title'), desc: "Real-time 3D telemetry tracking.", href: "/tracking" },
        { icon: Crown, title: "Sovereign Audit", desc: "Predictive risk & compliance reporting.", href: "/tools" },
    ];

    return (
        <main className="min-h-screen bg-black pt-24 pb-20 bg-mesh-dark">
            <div className="container max-w-7xl mx-auto px-6">

                {/* 🚨 Sovereign Alert Banner */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-12 bg-white/[0.03] border-2 border-white/20 p-6 rounded-3xl flex items-center justify-between shadow-2xl overflow-hidden relative"
                >
                    <div className="absolute top-0 left-0 h-full w-1 bg-white shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
                    <div className="flex items-center gap-6">
                        <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center animate-pulse">
                            <Shield className="h-6 w-6 text-black" />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-white uppercase tracking-tighter italic">Sovereign Intel: Suez Corridor Health</h4>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Status: SECURE | Congestion: LOW | Risk: 12%</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white hover:text-black font-black uppercase tracking-widest text-[9px]">View Detail Intelligence →</Button>
                </motion.div>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col md:flex-row md:items-center md:justify-between mb-16 gap-8 border-b border-white/5 pb-12"
                >
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-white uppercase tracking-[0.3em] mb-6 holographic-glow">
                            Security Verified
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-4 uppercase italic">
                            {t('dashboard.welcome')}{' '}
                            <span className="text-gray-500 not-italic">
                                {t('dashboard.command_center')}
                            </span>
                        </h1>
                        <p className="text-gray-500 text-xl font-light tracking-tight">{t('dashboard.subtitle')}</p>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="outline" className="h-14 px-8 border-white/10 text-white hover:bg-white hover:text-black transition-all rounded-2xl font-black uppercase tracking-tighter shadow-2xl">
                            <Bell className="mr-3 h-5 w-5" /> {t('dashboard.notifications')}
                        </Button>
                        <Link href="/quote">
                            <Button className="h-14 px-10 bg-white text-black hover:bg-gray-100 font-black uppercase tracking-tighter rounded-2xl border-2 border-white shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                                <Plus className="mr-3 h-5 w-5" /> {t('dashboard.new_shipment')}
                            </Button>
                        </Link>
                    </div>
                </motion.div>

                {/* Welcome Banner - Monochrome Ultra */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                >
                    <Card className="p-12 bg-white/[0.02] border-white/10 rounded-[40px] mb-12 flex flex-col md:flex-row items-center gap-10 ultra-card transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.03] rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />

                        <div className="h-20 w-20 rounded-3xl bg-white flex items-center justify-center flex-shrink-0 shadow-[0_0_40px_rgba(255,255,255,0.2)] group-hover:rotate-[360deg] transition-all duration-700">
                            <Info className="h-10 w-10 text-black" />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h3 className="font-black text-white text-3xl mb-3 uppercase tracking-tighter italic">{t('dashboard.ready_title')}</h3>
                            <p className="text-gray-500 mb-8 max-w-3xl leading-relaxed text-lg font-medium">
                                {t('dashboard.ready_desc')}
                            </p>
                            <Link href="/quote">
                                <Button className="bg-white hover:bg-gray-100 text-black font-black h-14 px-10 rounded-2xl uppercase tracking-tighter shadow-2xl group/btn">
                                    {t('dashboard.get_quote')} <ArrowRight className="ml-3 h-5 w-5 group-hover/btn:translate-x-2 transition-transform" />
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </motion.div>

                {/* Stats Grid - Ultra Monochrome */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
                >
                    {stats.map((stat, idx) => (
                        <Card key={idx} className="p-10 bg-white/[0.01] border border-white/5 hover:border-white/20 transition-all rounded-[32px] ultra-card group">
                            <div className="flex flex-col gap-6">
                                <div className="flex items-center gap-4 text-gray-500 group-hover:text-white transition-colors">
                                    <stat.icon className="h-6 w-6" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.25em]">{stat.label}</span>
                                </div>
                                <div className="text-6xl font-black text-white tracking-tighter italic h-14 flex items-center">{stat.value}</div>
                            </div>
                        </Card>
                    ))}
                </motion.div>

                {/* Empty Shipments State */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mb-16"
                >
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">{t('dashboard.shipments_title')}</h2>
                    </div>

                    <Card className="p-24 bg-black border border-dashed border-white/10 text-center rounded-[40px] ultra-card hover:border-white/30 transition-all relative overflow-hidden group">
                        <div className="absolute inset-0 bg-white/[0.01] opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-white/[0.03] mb-8 group-hover:scale-110 transition-transform">
                            <Package className="h-12 w-12 text-gray-700" />
                        </div>
                        <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter italic">{t('dashboard.no_shipments_title')}</h3>
                        <p className="text-gray-500 mb-10 max-w-md mx-auto font-bold uppercase tracking-widest text-[10px] leading-relaxed">
                            {t('dashboard.no_shipments_desc')}
                        </p>
                        <Link href="/quote">
                            <Button className="bg-white text-black hover:bg-gray-100 font-black h-14 px-12 rounded-2xl uppercase tracking-tighter shadow-2xl">
                                {t('dashboard.get_quote')}
                            </Button>
                        </Link>
                    </Card>
                </motion.div>

                {/* Quick Actions - High Resolution */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <h2 className="text-3xl font-black text-white mb-8 uppercase tracking-tighter italic">Quick Actions</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {quickActions.map((action, idx) => (
                            <Link key={idx} href={action.href}>
                                <Card className="p-10 bg-white/[0.02] border border-white/5 rounded-[32px] transition-all cursor-pointer group h-full hover:bg-white/[0.05] hover:border-white/20 ultra-card">
                                    <div className="h-16 w-16 bg-white text-black rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-[360deg] transition-all duration-700 shadow-2xl">
                                        <action.icon className="h-8 w-8" />
                                    </div>
                                    <h3 className="font-black text-white text-2xl mb-4 uppercase tracking-tighter">{action.title}</h3>
                                    <p className="text-sm font-medium text-gray-500 leading-relaxed uppercase tracking-widest text-[10px]">{action.desc}</p>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </motion.div>

            </div>
        </main>
    );
}
