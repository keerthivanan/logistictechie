"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Ship, Plane, Clock, Activity, MapPin, Bell, Info, ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function DashboardPage() {
    const { t } = useLanguage();

    const stats = [
        { icon: Ship, value: "—", label: t('dashboard.stats.active'), color: "text-blue-400", bg: "bg-blue-500/10" },
        { icon: Activity, value: "—", label: t('dashboard.stats.quotes'), color: "text-emerald-400", bg: "bg-emerald-500/10" },
        { icon: Clock, value: "—", label: t('dashboard.stats.transit'), color: "text-amber-400", bg: "bg-amber-500/10" },
        { icon: MapPin, value: "—", label: t('dashboard.stats.routes'), color: "text-purple-400", bg: "bg-purple-500/10" },
    ];

    const quickActions = [
        { icon: Package, title: t('dashboard.quick_actions.quote_title'), desc: t('dashboard.quick_actions.quote_desc'), href: "/quote", gradient: "from-blue-500/20 to-cyan-500/10", iconColor: "text-blue-400", borderColor: "border-blue-500/30 hover:border-blue-500" },
        { icon: MapPin, title: t('dashboard.quick_actions.track_title'), desc: t('dashboard.quick_actions.track_desc'), href: "/tracking", gradient: "from-purple-500/20 to-pink-500/10", iconColor: "text-purple-400", borderColor: "border-purple-500/30 hover:border-purple-500" },
        { icon: Plane, title: t('dashboard.quick_actions.services_title'), desc: t('dashboard.quick_actions.services_desc'), href: "/services", gradient: "from-amber-500/20 to-orange-500/10", iconColor: "text-amber-400", borderColor: "border-amber-500/30 hover:border-amber-500" },
    ];

    return (
        <main className="min-h-screen bg-black pt-24 pb-20">
            <div className="container max-w-7xl mx-auto px-6">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col md:flex-row md:items-center md:justify-between mb-12 gap-6"
                >
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">
                            {t('dashboard.welcome')}{' '}
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                                {t('dashboard.command_center')}
                            </span>
                        </h1>
                        <p className="text-gray-500">{t('dashboard.subtitle')}</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="border-white/10 text-gray-400 hover:bg-white/5 hover:text-white">
                            <Bell className="mr-2 h-4 w-4" /> {t('dashboard.notifications')}
                        </Button>
                        <Link href="/quote">
                            <Button className="bg-white text-black hover:bg-gray-100 font-medium">
                                <Plus className="mr-2 h-4 w-4" /> {t('dashboard.new_shipment')}
                            </Button>
                        </Link>
                    </div>
                </motion.div>

                {/* Welcome Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                >
                    <Card className="p-8 bg-gradient-to-r from-blue-500/10 to-cyan-500/5 border-blue-500/20 rounded-2xl mb-8">
                        <div className="flex items-start gap-4">
                            <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                <Info className="h-6 w-6 text-blue-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-white text-lg mb-2">{t('dashboard.ready_title')}</h3>
                                <p className="text-gray-400 mb-4 max-w-2xl">
                                    {t('dashboard.ready_desc')}
                                </p>
                                <Link href="/quote">
                                    <Button className="bg-blue-600 hover:bg-blue-500 text-white">
                                        {t('dashboard.get_quote')} <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Stats Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
                >
                    {stats.map((stat, idx) => (
                        <Card key={idx} className="p-6 bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04] transition-all">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${stat.bg}`}>
                                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-white">{stat.value}</div>
                                    <div className="text-sm text-gray-500">{stat.label}</div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </motion.div>

                {/* Empty Shipments State */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mb-12"
                >
                    <h2 className="text-xl font-bold text-white mb-4">{t('dashboard.shipments_title')}</h2>
                    <Card className="p-16 bg-white/[0.02] border-white/[0.05] text-center rounded-2xl">
                        <Package className="h-16 w-16 text-gray-700 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">{t('dashboard.no_shipments_title')}</h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            {t('dashboard.no_shipments_desc')}
                        </p>
                        <Link href="/quote">
                            <Button className="bg-white text-black hover:bg-gray-100">
                                {t('dashboard.get_quote')}
                            </Button>
                        </Link>
                    </Card>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        {quickActions.map((action, idx) => (
                            <Link key={idx} href={action.href}>
                                <Card className={`p-6 bg-gradient-to-br ${action.gradient} border ${action.borderColor} rounded-2xl transition-all cursor-pointer group h-full`}>
                                    <action.icon className={`h-8 w-8 ${action.iconColor} mb-4 group-hover:scale-110 transition-transform`} />
                                    <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors mb-1">{action.title}</h3>
                                    <p className="text-sm text-gray-500">{action.desc}</p>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </motion.div>

            </div>
        </main>
    );
}
