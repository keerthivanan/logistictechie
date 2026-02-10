"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Ship,
    Package,
    CreditCard,
    TrendingUp,
    MapPin,
    ArrowUpRight,
    Bell,
    Plus,
    Clock,
    ArrowRight,
    CheckCircle
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import axios from "axios";
import { useLanguage } from "@/contexts/LanguageContext";
import { MarketTrendWidget } from "@/components/widgets/MarketTrendWidget";

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

interface Payment {
    id: string;
    amount: number;
    currency?: string;
    status: string;
    date: string;
}

export default function DashboardPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const { t, language } = useLanguage();
    const isRTL = language === 'ar';

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("token");
            const userId = localStorage.getItem("user_id");

            if (!token || !userId) {
                window.location.href = "/login";
                return;
            }

            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
                const bookRes = await axios.get(`${apiUrl}/api/bookings/user/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setBookings(bookRes.data.data || []);

                setPayments([
                    { id: '1', amount: 3500, status: 'COMPLETED', date: '2026-02-09', currency: 'USD' },
                    { id: '2', amount: 1250, status: 'COMPLETED', date: '2026-02-01', currency: 'USD' }
                ]);
            } catch (err) {
                console.error("Dashboard fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const stats = [
        { label: t('dashboard.activeShipments') || "Active Shipments", value: bookings.length, icon: Ship },
        { label: t('dashboard.containers') || "Containers", value: bookings.length * 2, icon: Package },
        { label: t('dashboard.totalSpend') || "Total Spend", value: `$${(bookings.length * 2000).toLocaleString()}`, icon: CreditCard },
        { label: t('dashboard.onTimeRate') || "On-Time Rate", value: "99.9%", icon: TrendingUp }
    ];

    return (
        <main className={`min-h-screen bg-black text-white pt-32 pb-24 px-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <span className="text-sm font-medium text-emerald-500 mb-2 block">{t('dashboard.title') || "Dashboard"}</span>
                        <h1 className="text-4xl md:text-5xl font-bold text-white">
                            {t('dashboard.welcomeBack') || "Welcome Back"}
                        </h1>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="h-12 w-12 rounded-lg border-zinc-700 hover:bg-zinc-800">
                            <Bell className="h-5 w-5" />
                        </Button>
                        <Link href="/quote">
                            <Button className="h-12 px-6 rounded-lg bg-white text-black hover:bg-zinc-100 font-semibold">
                                <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                {t('dashboard.newShipment') || "New Shipment"}
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Card className="p-6 bg-zinc-900/50 border-zinc-800 rounded-xl hover:border-zinc-700 transition-all">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                                        <stat.icon className="h-5 w-5 text-white" />
                                    </div>
                                </div>
                                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                                <div className="text-sm text-zinc-500">{stat.label}</div>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-12 gap-6">

                    {/* Shipments List */}
                    <Card className="lg:col-span-8 bg-zinc-900/50 border-zinc-800 rounded-xl overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                            <div>
                                <h3 className="text-xl font-semibold text-white">{t('dashboard.recentShipments') || "Recent Shipments"}</h3>
                                <p className="text-sm text-zinc-500">{t('dashboard.latestBookingsStatus') || "Your latest bookings and their status"}</p>
                            </div>
                            <Button variant="ghost" className="text-zinc-400 hover:text-white">
                                {t('dashboard.viewAll') || "View All"} <ArrowUpRight className={`h-4 w-4 ${isRTL ? 'mr-2' : 'ml-2'}`} />
                            </Button>
                        </div>

                        <div className="p-6">
                            {loading ? (
                                <div className="py-16 text-center text-zinc-500">{t('dashboard.loading') || "Loading shipments..."}</div>
                            ) : bookings.length === 0 ? (
                                <div className="py-16 text-center">
                                    <Package className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                                    <div className="text-zinc-400 mb-4">{t('dashboard.noShipments') || "No shipments yet"}</div>
                                    <Link href="/quote">
                                        <Button className="bg-white text-black hover:bg-zinc-100 rounded-lg h-10 px-6 font-semibold">
                                            {t('dashboard.bookFirst') || "Book Your First Shipment"}
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {bookings.map((b, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-lg bg-zinc-800 flex items-center justify-center">
                                                    <Ship className="h-5 w-5 text-white" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-white">{b.booking_reference}</div>
                                                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                                                        <MapPin className="h-3.5 w-3.5" />
                                                        {b.origin || "Origin"} → {b.destination || "Destination"}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${b.status === 'PENDING'
                                                    ? 'bg-amber-500/10 text-amber-400'
                                                    : 'bg-emerald-500/10 text-emerald-400'
                                                    }`}>
                                                    {b.status === 'PENDING' ? <Clock className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
                                                    {b.status === 'PENDING' ? (t('status.pending') || 'Pending') : (t('status.confirmed') || 'Confirmed')}
                                                </div>
                                                <div className="text-xs text-zinc-500 mt-1">{new Date(b.created_at).toLocaleDateString()}</div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Payments */}
                        <Card className="bg-zinc-900/50 border-zinc-800 rounded-xl p-6">
                            <h3 className="font-semibold text-white mb-4">{t('dashboard.recentPayments') || "Recent Payments"}</h3>
                            <div className="space-y-4">
                                {payments.map((p, i) => (
                                    <div key={i} className="flex items-center justify-between py-3 border-b border-zinc-800 last:border-0">
                                        <div>
                                            <div className="font-medium text-white">${p.amount.toLocaleString()}</div>
                                            <div className="text-sm text-zinc-500">{p.date}</div>
                                        </div>
                                        <div className="flex items-center gap-2 text-emerald-500 text-sm">
                                            <CheckCircle className="h-4 w-4" />
                                            {t('status.paid') || "Paid"}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button variant="outline" className="w-full mt-4 h-10 border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white rounded-lg">
                                {t('dashboard.viewAllPayments') || "View All Payments"}
                            </Button>
                        </Card>


                        {/* Market Insight Widget (AI Powered) */}
                        <div className="mt-6">
                            <MarketTrendWidget />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
