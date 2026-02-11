"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { User, Mail, Building, Calendar, ArrowLeft, Shield, Globe, Zap, Phone, Camera } from "lucide-react";
import axios from "axios";
import { useLanguage } from "@/contexts/LanguageContext";
import Image from "next/image";
import { motion } from "framer-motion";

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { t, direction, language } = useLanguage();
    const isRTL = direction === 'rtl';
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<any>({});
    const [saving, setSaving] = useState(false);

    const fetchProfile = useCallback(async () => {
        if (status !== "authenticated" || !session?.user) return;
        setLoading(true);
        try {
            const token = (session.user as any).accessToken;
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await axios.get(`${apiUrl}/api/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(res.data);
            setEditData(res.data);
        } catch (e) {
            console.error("Profile Fetch Error", e);
        } finally {
            setLoading(false);
        }
    }, [status, session]);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }
        if (status === "authenticated") {
            fetchProfile();
        }
    }, [status, fetchProfile, router]);

    const handleSave = async () => {
        if (status !== "authenticated" || !session?.user) return;
        setSaving(true);
        try {
            const token = (session.user as any).accessToken;
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            await axios.put(`${apiUrl}/api/auth/update-profile`, editData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchProfile();
            setIsEditing(false);
        } catch (e) {
            console.error("Profile Update Error", e);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center bg-grid-premium">
            <Zap className="h-8 w-8 text-emerald-500 animate-pulse mb-8" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-800">SYNCHRONIZING_IDENTITY</span>
        </div>
    );

    const avatarSource = user?.avatar_url || session?.user?.image;

    return (
        <main className="min-h-screen bg-black text-white relative overflow-hidden bg-grid-premium" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none" />

            <div className="container max-w-[1400px] mx-auto px-8 pt-48 pb-48 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <Button onClick={() => router.back()} variant="ghost" className="mb-12 text-zinc-700 hover:text-white hover:bg-zinc-950 rounded-none h-12 px-6 font-black text-[10px] uppercase tracking-[0.4em]">
                        <ArrowLeft className={`h-4 w-4 ${isRTL ? 'ml-4 rotate-180' : 'mr-4'}`} /> REVERT_TO_NODE
                    </Button>

                    <div className="grid lg:grid-cols-12 gap-16 items-start">
                        {/* Identity Card */}
                        <div className="lg:col-span-8">
                            <div className="elite-card overflow-hidden group">
                                <div className="h-32 bg-zinc-950 border-b border-white/5 relative">
                                    <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,#80808012_1px,transparent_1px),linear-gradient(-45deg,#80808012_1px,transparent_1px)] bg-[size:20px_20px]" />
                                </div>
                                <div className="p-12 -mt-24 relative z-10">
                                    <div className="flex flex-col md:flex-row items-end gap-10 mb-16">
                                        <div className="relative group/avatar">
                                            <div className="h-40 w-40 bg-black border-4 border-black ring-1 ring-white/5 flex items-center justify-center overflow-hidden transition-all duration-700 group-hover/avatar:scale-105">
                                                {avatarSource ? (
                                                    <Image
                                                        src={avatarSource}
                                                        alt={user?.full_name || "Profile"}
                                                        fill
                                                        className="object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                                                    />
                                                ) : (
                                                    <span className="text-5xl font-black italic text-zinc-900">{(user?.full_name || "U").charAt(0)}</span>
                                                )}
                                            </div>
                                            {isEditing && (
                                                <div className="absolute inset-0 bg-emerald-500/80 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer">
                                                    <Camera className="h-8 w-8 text-black" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-1.5 h-1.5 bg-emerald-500 animate-pulse" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500">IDENTITY_CONFIRMED</span>
                                            </div>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    className="bg-zinc-950/40 border border-white/5 h-20 w-full px-8 text-4xl font-black text-white italic tracking-tighter uppercase focus:border-white transition-all ring-0 outline-none"
                                                    value={editData.full_name || ""}
                                                    onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                                                />
                                            ) : (
                                                <h1 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none">
                                                    {user.full_name || "LOGISTICS_OPERATOR"}
                                                </h1>
                                            )}
                                            <div className="flex items-center gap-4 text-zinc-700 text-[10px] font-black uppercase tracking-[0.4em]">
                                                <Building className="h-4 w-4 text-zinc-900" />
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        className="bg-zinc-950/40 border-b border-white/5 px-4 py-1 text-white focus:border-emerald-500 transition-all ring-0 outline-none"
                                                        value={editData.company_name || ""}
                                                        onChange={(e) => setEditData({ ...editData, company_name: e.target.value })}
                                                    />
                                                ) : (
                                                    <span>{user.company_name || "INDEPENDENT_TRADER"}</span>
                                                )}
                                                <span className="text-zinc-950">/</span>
                                                <span className="text-emerald-500">{user.role || "CORE_ACCESS"}</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            {isEditing ? (
                                                <>
                                                    <Button onClick={() => setIsEditing(false)} variant="ghost" className="h-16 px-8 rounded-none text-zinc-700 hover:text-white hover:bg-zinc-950 font-black text-[10px] uppercase tracking-[0.4em]">
                                                        {t('common.cancel')}
                                                    </Button>
                                                    <Button onClick={handleSave} disabled={saving} className="h-16 px-10 bg-white text-black hover:bg-emerald-500 transition-all rounded-none font-black text-[10px] uppercase tracking-[0.6em]">
                                                        {saving ? "SYNCING..." : "COMMIT"}
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button onClick={() => setIsEditing(true)} className="h-16 px-12 bg-white text-black hover:bg-emerald-500 transition-all rounded-none font-black text-[10px] uppercase tracking-[0.4em]">
                                                    RECONFIGURE
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {isEditing && (
                                        <div className="mb-16 p-10 bg-zinc-950/40 border border-white/5">
                                            <label className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] mb-4 block">AVATAR_TELEMETRY_STRING</label>
                                            <input
                                                type="text"
                                                placeholder="HTTPS://MANIFEST.IO/PHOTO.JPG"
                                                className="bg-transparent border-b border-white/5 w-full py-4 text-emerald-500 font-black text-[11px] uppercase tracking-widest focus:border-white transition-all ring-0 outline-none"
                                                value={editData.avatar_url || ""}
                                                onChange={(e) => setEditData({ ...editData, avatar_url: e.target.value })}
                                            />
                                        </div>
                                    )}

                                    <div className="grid gap-4 md:grid-cols-3 border-t border-white/5 pt-16">
                                        <div className="p-8 group/field hover:bg-zinc-950 transition-colors">
                                            <div className="text-[9px] font-black text-zinc-800 uppercase tracking-[0.4em] mb-4 group-hover/field:text-emerald-500 transition-colors">ACCESS_IDENTIFIER</div>
                                            <div className="flex items-center gap-4">
                                                <Mail className="h-4 w-4 text-zinc-900 group-hover/field:text-white transition-colors" />
                                                <span className="text-[11px] font-black text-zinc-600 group-hover/field:text-white transition-colors uppercase tracking-widest">{user.email}</span>
                                            </div>
                                        </div>
                                        <div className="p-8 group/field hover:bg-zinc-950 transition-colors border-l border-white/5">
                                            <div className="text-[9px] font-black text-zinc-800 uppercase tracking-[0.4em] mb-4 group-hover/field:text-emerald-500 transition-colors">COMMS_LINK</div>
                                            <div className="flex items-center gap-4">
                                                <Phone className="h-4 w-4 text-zinc-900 group-hover/field:text-white transition-colors" />
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        className="bg-transparent border-b border-white/5 text-[11px] font-black text-white uppercase tracking-widest focus:border-white transition-all ring-0 outline-none"
                                                        value={editData.phone_number || ""}
                                                        onChange={(e) => setEditData({ ...editData, phone_number: e.target.value })}
                                                    />
                                                ) : (
                                                    <span className="text-[11px] font-black text-zinc-600 group-hover/field:text-white transition-colors uppercase tracking-widest">{user.phone_number || "NULL"}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="p-8 group/field hover:bg-zinc-950 transition-colors border-l border-white/5">
                                            <div className="text-[9px] font-black text-zinc-800 uppercase tracking-[0.4em] mb-4 group-hover/field:text-emerald-500 transition-colors">TEMPORAL_ORIGIN</div>
                                            <div className="flex items-center gap-4">
                                                <Calendar className="h-4 w-4 text-zinc-900 group-hover/field:text-white transition-colors" />
                                                <span className="text-[11px] font-black text-zinc-600 group-hover/field:text-white transition-colors uppercase tracking-widest">
                                                    {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase() : "RECENT_ENTRY"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tactical Status Hub */}
                        <div className="lg:col-span-4 space-y-12">
                            <div className="elite-card p-12 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                                    <Shield className="h-24 w-24 text-white" />
                                </div>
                                <h3 className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] mb-10">OPERATIONAL_CREDENTIALS</h3>
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between group/stat">
                                        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] group-hover/stat:text-emerald-500 transition-colors">DATA_LEGITIMACY</span>
                                        <span className="text-2xl font-black italic text-emerald-500">100%</span>
                                    </div>
                                    <div className="flex items-center justify-between group/stat">
                                        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] group-hover/stat:text-blue-500 transition-colors">VERIFICATION_LVL</span>
                                        <span className="text-2xl font-black italic text-blue-500 uppercase">LVL_IV</span>
                                    </div>
                                </div>
                                <div className="mt-12 pt-8 border-t border-white/5">
                                    <p className="text-[9px] font-black text-zinc-800 uppercase tracking-[0.4em] leading-relaxed">
                                        IDENTITY_VERIFIED via SOVEREIGN_PROTOCOL_782.
                                    </p>
                                </div>
                            </div>

                            <div className="p-12 border border-white/5 bg-zinc-950/40 relative group overflow-hidden">
                                <span className="text-[9px] font-black text-zinc-900 block mb-6 tracking-[0.6em]">MISSION_SYNC</span>
                                <div className="space-y-6">
                                    <div className="flex items-center gap-6">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 group-hover:scale-150 transition-transform" />
                                        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Active Manifests: 0</span>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="w-1.5 h-1.5 bg-zinc-900" />
                                        <span className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.2em]">Completed Trajectories: 0</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
