"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { User, Mail, Building, Calendar, ArrowLeft, Shield, Globe, Zap, Phone, Camera, ArrowRight } from "lucide-react";
import axios from "axios";
import { BACKEND_URL } from "@/lib/logistics";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
    const { t } = useLanguage();
    const { data: session, status } = useSession();
    const router = useRouter();
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
            const apiUrl = BACKEND_URL.replace('/api', '');
            const res = await axios.get(`${apiUrl}/api/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(res.data);
            setEditData(res.data);
        } catch (e) {
            console.error("DATA_SYNC_ERROR:", e);
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
            const apiUrl = BACKEND_URL.replace('/api', '');
            await axios.put(`${apiUrl}/api/auth/update-profile`, editData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchProfile();
            setIsEditing(false);
        } catch (e) {
            console.error("PROFILE_COMMIT_ERROR:", e);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
            <div className="w-[2px] h-32 bg-white animate-pulse" />
            <span className="text-[10px] font-black text-white uppercase tracking-[1em] mt-12">IDENTITY_SYNC_ACTIVE</span>
        </div>
    );

    const avatarSource = user?.avatar_url || session?.user?.image;

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
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-[1em] mb-8 block">{t('nav.profile').toUpperCase()}_METRICS</span>
                        <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase group-hover:italic transition-all duration-700 leading-none">
                            {session?.user?.name?.toUpperCase() || "COMMANDER"} <br /><span className="text-white/20 italic">Operative.</span>
                        </h1>
                    </div>
                    <div className="flex flex-col justify-end">
                        <div className="bg-zinc-950/40 border border-white/5 rounded-[48px] p-10 backdrop-blur-3xl group-hover:border-white/10 transition-all duration-700">
                            <span className="text-[10px] font-black text-white/20 uppercase tracking-[1em] mb-6 block">SECURE_CLEARANCE_STATUS</span>
                            <div className="flex items-center gap-6">
                                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                                <p className="text-3xl font-black uppercase tracking-tighter text-white italic">Verified_Level_IV</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Identity Mesh - Tactical Matrix */}
                <div className="grid lg:grid-cols-[1fr,2fr] gap-16 md:gap-32 border-t border-white/5 pt-32 relative group/mesh">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/[0.01] blur-[150px] rounded-full pointer-events-none" />

                    {/* Left: Avatar & Identity Node */}
                    <div className="space-y-16">
                        <div className="h-[500px] w-full bg-zinc-950/40 border border-white/5 rounded-[64px] relative group overflow-hidden backdrop-blur-3xl shadow-2xl hover:border-white/20 transition-all duration-1000">
                            {avatarSource ? (
                                <Image src={avatarSource} alt="Profile" fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-[12rem] font-black text-white/[0.02] italic tracking-tighter group-hover:text-white/5 transition-all">
                                    {(user.full_name || "O").charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="absolute inset-x-0 bottom-0 p-12 bg-gradient-to-t from-black via-black/80 to-transparent">
                                <h3 className="text-4xl font-black text-white uppercase tracking-tighter group-hover:italic transition-all leading-none mb-2">{user.role || "CORE_LOGISTICS_ACCESS"}</h3>
                                <p className="text-white/20 uppercase tracking-[0.6em] text-[10px] font-black">OPERATIONAL_DESIGNATION_NODE</p>
                            </div>
                            {isEditing && (
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center cursor-pointer group-hover:bg-black/40 transition-all">
                                    <div className="flex flex-col items-center gap-6">
                                        <Camera className="w-16 h-16 text-white" />
                                        <span className="text-[10px] font-black text-white uppercase tracking-[1em]">UPDATE_VISUAL_ID</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Detailed Parameters - Tactical Form */}
                    <div className="space-y-32">
                        <div className="grid md:grid-cols-2 gap-12">
                            {[
                                { id: "01", label: "FULL_NAME_IDENTIFIER", value: user.full_name, field: "full_name" },
                                { id: "02", label: "SECURE_EMAIL_COMMS", value: user.email, field: "email", readonly: true },
                                { id: "03", label: "ENTITY_AFFILIATION", value: user.company_name || "INDEPENDENT_OPERATIVE", field: "company_name" },
                                { id: "04", label: "MOBILE_COMMS_LINK", value: user.phone_number || "NO_TEL_SYNCED", field: "phone_number" }
                            ].map((item) => (
                                <div key={item.id} className="bg-zinc-950/40 rounded-[48px] border border-white/5 p-10 hover:bg-white/[0.02] hover:border-white/10 transition-all duration-700 group/item backdrop-blur-3xl">
                                    <span className="text-5xl font-black text-white/[0.03] group-hover/item:text-white/10 transition-colors tracking-tighter tabular-nums leading-none block mb-6">{item.id}</span>
                                    <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-4 block group-hover/item:text-white/40">{item.label}</span>
                                    {isEditing && !item.readonly ? (
                                        <input
                                            value={editData[item.field] || ""}
                                            onChange={(e) => setEditData({ ...editData, [item.field]: e.target.value })}
                                            className="bg-transparent border-b border-white/10 w-full py-4 text-3xl font-black text-white italic outline-none focus:border-white transition-all uppercase tracking-tighter placeholder:text-white/5"
                                        />
                                    ) : (
                                        <div className="text-3xl font-black text-white leading-tight uppercase tracking-tighter group-hover/item:pl-4 group-hover/item:italic transition-all duration-700">
                                            {item.value || "NOT_ASSIGNED"}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Tactical Actions - Command Array */}
                        <div className="pt-24 border-t border-white/5 flex flex-wrap gap-8">
                            {isEditing ? (
                                <>
                                    <button onClick={() => setIsEditing(false)} className="h-24 px-16 border border-white/10 text-white/40 text-[11px] font-black uppercase tracking-[0.6em] transition-all hover:text-white rounded-full">
                                        CANCEL_PROTOCOL
                                    </button>
                                    <button onClick={handleSave} disabled={saving} className="h-24 px-20 bg-white text-black text-[11px] font-black uppercase tracking-[1em] transition-all hover:bg-zinc-200 rounded-full shadow-2xl active:scale-95">
                                        {saving ? "SYNCING..." : "COMMIT_IDENTITY_CHANGES"}
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => setIsEditing(true)} className="h-24 px-20 bg-white text-black text-[11px] font-black uppercase tracking-[1em] transition-all hover:bg-zinc-200 rounded-full shadow-2xl active:scale-95">
                                    RECONFIGURE_OPERATIVE_PROFILE
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sub-context Metrics Matrix */}
                <div className="mt-64 grid md:grid-cols-3 gap-0 border-y border-white/5 bg-zinc-950/20 backdrop-blur-3xl">
                    {[
                        { label: t('profile.memberSince').toUpperCase().replace(' ', '_'), val: user.created_at ? new Date(user.created_at).getFullYear() : "2026" },
                        { label: "ACTIVE_MANIFESTS", val: "0" },
                        { label: "DATA_LEGITIMACY_INDEX", val: "100%" }
                    ].map((stat, idx) => (
                        <div key={idx} className="p-10 md:p-16 border-r last:border-r-0 border-white/5 group hover:bg-white/5 transition-all duration-700">
                            <span className="text-[10px] font-black text-white/20 uppercase tracking-[1em] mb-12 block group-hover:text-white/40">{stat.label}</span>
                            <div className="text-7xl font-black text-white tracking-widest leading-none tabular-nums transition-all group-hover:pl-4 group-hover:italic">
                                {stat.val}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Industrial Status Marker */}
                <div className="mt-64 text-center border-t border-white/5 pt-48 pb-32 group relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-[1em] mb-12 block">IDENTITY_VERIFICATION_SECURE</span>
                    <h2 className="text-4xl md:text-8xl font-black text-white mb-16 uppercase tracking-tighter group-hover:italic transition-all duration-700 leading-none">V4.1.0_PRO_CORE_SHIELD</h2>
                </div>
            </div>
        </main>
    );
}
