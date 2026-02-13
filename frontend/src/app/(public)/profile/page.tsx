"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { User, Mail, Building, Calendar, ArrowLeft, Shield, Globe, Zap, Phone, Camera } from "lucide-react";
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
            const apiUrl = BACKEND_URL.replace('/api', '');
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
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
            <div className="w-1 h-12 bg-white animate-pulse" />
            <span className="arch-label mt-8">SYNC_IDENTITY</span>
        </div>
    );

    const avatarSource = user?.avatar_url || session?.user?.image;

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
                        <span className="arch-label mb-12 block">{t('nav.profile').toUpperCase()}</span>
                        <h1 className="arch-heading italic">{session?.user?.name?.toUpperCase() || "COMMANDER"}</h1>
                    </div>
                    <div className="flex flex-col justify-end space-y-12">
                        <div className="arch-detail-line">
                            <span className="arch-label mb-4 block">ACCOUNT_STATUS</span>
                            <div className="flex items-center gap-4">
                                <div className="w-2 h-2 bg-emerald-500" />
                                <p className="text-xl font-bold uppercase tracking-tighter text-white">Verified_Level_IV</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Identity Mesh - Architectural Pattern */}
                <div className="grid lg:grid-cols-[1fr,2fr] gap-32 border-t border-white/5 pt-32">

                    {/* Left: Avatar & Primary ID */}
                    <div className="space-y-16">
                        <div className="h-[400px] w-full bg-zinc-950 border border-white/5 relative group overflow-hidden">
                            {avatarSource ? (
                                <Image src={avatarSource} alt="Profile" fill className="object-cover grayscale transition-all duration-1000 group-hover:grayscale-0" />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-[10rem] font-light text-zinc-900 italic">
                                    {(user.full_name || "O").charAt(0)}
                                </div>
                            )}
                            {isEditing && (
                                <div className="absolute inset-0 bg-white/20 backdrop-blur-md flex items-center justify-center cursor-pointer">
                                    <Camera className="w-12 h-12 text-white" />
                                </div>
                            )}
                        </div>
                        <div className="arch-detail-line">
                            <h3 className="text-2xl font-bold text-white mb-2">{user.role || "CORE_ACCESS"}</h3>
                            <p className="text-zinc-500 uppercase tracking-widest text-[10px]">OPERATIONAL_DESIGNATION</p>
                        </div>
                    </div>

                    {/* Right: Detailed Parameters */}
                    <div className="space-y-32">
                        <div className="grid md:grid-cols-2 gap-24">
                            {[
                                { id: "01", label: "FULL_NAME", value: user.full_name, field: "full_name" },
                                { id: "02", label: "EMAIL_NODE", value: user.email, field: "email", readonly: true },
                                { id: "03", label: "COMPANY_ORG", value: user.company_name || "INDEPENDENT", field: "company_name" },
                                { id: "04", label: "COMMS_LINK", value: user.phone_number || "NULL", field: "phone_number" }
                            ].map((item) => (
                                <div key={item.id} className="arch-detail-line group">
                                    <span className="arch-number block mb-4">{item.id}</span>
                                    <span className="arch-label mb-4 block">{item.label}</span>
                                    {isEditing && !item.readonly ? (
                                        <input
                                            value={editData[item.field] || ""}
                                            onChange={(e) => setEditData({ ...editData, [item.field]: e.target.value })}
                                            className="bg-transparent border-b border-white/10 w-full py-4 text-3xl font-light text-white italic outline-none focus:border-white transition-all"
                                        />
                                    ) : (
                                        <div className="text-3xl font-light text-white leading-tight">
                                            {item.value || "NOT_SET"}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Tactical Actions */}
                        <div className="pt-24 border-t border-white/5 flex gap-8">
                            {isEditing ? (
                                <>
                                    <button onClick={() => setIsEditing(false)} className="h-20 px-12 border border-white/10 text-zinc-500 text-[11px] font-bold uppercase tracking-[0.4em] transition-all hover:text-white">
                                        CANCEL_CHANGES
                                    </button>
                                    <button onClick={handleSave} disabled={saving} className="h-20 px-16 bg-white text-black text-[11px] font-bold uppercase tracking-[0.6em] transition-all hover:bg-zinc-200">
                                        {saving ? "SYNCING..." : "COMMIT_DATA"}
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => setIsEditing(true)} className="h-20 px-16 border border-white text-white text-[11px] font-bold uppercase tracking-[0.6em] transition-all hover:bg-white hover:text-black">
                                    RECONFIGURE_PROFILE
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sub-context Metrics */}
                <div className="mt-64 grid md:grid-cols-3 gap-16 border-t border-white/5 pt-32">
                    {[
                        { label: t('profile.memberSince').toUpperCase().replace(' ', '_'), val: user.created_at ? new Date(user.created_at).getFullYear() : "2026" },
                        { label: "ACTIVE_MANIFESTS", val: "0" },
                        { label: "DATA_LEGITIMACY", val: "100%" }
                    ].map((stat, idx) => (
                        <div key={idx}>
                            <span className="arch-label mb-8 block text-zinc-800">{stat.label}</span>
                            <div className="text-5xl font-light text-white tracking-widest leading-none">
                                {stat.val}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sub-footer Section */}
            <div className="border-t border-white/5 py-32 bg-black">
                <div className="container max-w-[1400px] mx-auto px-8 flex justify-between items-center text-[10px] font-bold tracking-[0.8em] text-zinc-900 uppercase">
                    <span>IDENTITY_VERIFICATION_SECURE</span>
                    <span>V4.1.0_PRO_CORE</span>
                </div>
            </div>
        </main>
    );
}
