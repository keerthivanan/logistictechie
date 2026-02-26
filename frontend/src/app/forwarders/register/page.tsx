'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, CreditCard, Building2, Globe, Mail, Phone, Upload, Check, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { countries } from '@/lib/countries';
import { AsYouType, isValidPhoneNumber, CountryCode } from 'libphonenumber-js';
import LightRays from '@/components/visuals/LightRays';
import Navbar from '@/components/layout/Navbar';
import { API_URL } from '@/lib/config';

interface Country {
    name: string;
    code: string;
    dial_code: string;
}

export default function ForwarderRegisterPage() {
    const { refreshProfile } = useAuth();
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        company_name: '',
        email: '',
        country: '',
        phone: '',
        tax_id: '',
        document_url: '',
        password: '', // In a real app, we'd hash and store this properly via /auth/register
        logo_url: 'https://images.unsplash.com/photo-1586528116311-ad86d7c49988?auto=format&fit=crop&q=80&w=200'
    });
    const [phoneError, setPhoneError] = useState<string | null>(null);
    const [isPhoneValid, setIsPhoneValid] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // Smart Country Logic: Pre-fill dial code
        if (name === 'country') {
            const selectedCountry = countries.find((c: Country) => c.code === value);
            if (selectedCountry) {
                setFormData(prev => ({
                    ...prev,
                    country: value,
                    phone: selectedCountry.dial_code + ' '
                }));
                // Reset error when country changes
                setPhoneError(null);
            } else {
                setFormData(prev => ({ ...prev, [name]: value }));
            }
        }
        // Smart Phone Logic: As-You-Type Formatting + Validation
        else if (name === 'phone') {
            const countryCode = formData.country as CountryCode;

            if (!countryCode) {
                setFormData(prev => ({ ...prev, phone: value }));
                return;
            }

            // Format input using libphonenumber-js
            const formatted = new AsYouType(countryCode).input(value);
            setFormData(prev => ({ ...prev, phone: formatted }));

            // Validate
            if (value.length > 5) { // Only start validating after some typing
                try {
                    const isValid = isValidPhoneNumber(formatted, countryCode);
                    setIsPhoneValid(isValid);

                    if (!isValid) {
                        setPhoneError('Invalid number for selected country');
                    } else {
                        setPhoneError(null);
                    }
                } catch (err) {
                    // In case of parsing error during typing
                    setPhoneError(null);
                    setIsPhoneValid(false);
                }
            } else {
                setPhoneError(null);
                setIsPhoneValid(false);
            }
        }
        else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 📡 SOVEREIGN PROMOTION: Direct Backend Upgrade (Free Trial)
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/forwarders/promote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    company_name: formData.company_name,
                    email: formData.email,
                    phone: formData.phone,
                    country: formData.country,
                    tax_id: formData.tax_id,
                    document_url: formData.document_url,
                    logo_url: formData.logo_url
                })
            });

            const data = await response.json();

            if (data.success) {
                // 🚀 REFRESH ENTIRE IDENTITY VIA PROMOTION HANDSHAKE
                await refreshProfile();

                alert('🚀 Handshake Complete! Your account has been upgraded to REG-OMEGO. Redirecting to your Partner Dashboard...');
                window.location.href = '/dashboard';
            } else {
                alert(`Handshake Failed: ${data.detail || 'Internal Grid Error'}`);
            }
        } catch (error) {
            console.error(error);
            alert('Handshake failed. Please verify your connection to the Sovereign Grid.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black relative overflow-hidden">
            {/* Cinematic Light Rays Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <LightRays
                    raysOrigin="top-center"
                    raysColor="#d3c892"
                    raysSpeed={1.0}
                    lightSpread={0.05}
                    rayLength={1.5}
                    followMouse={true}
                    mouseInfluence={0.3}
                    noiseAmount={0.01}
                    distortion={0.05}
                    className="opacity-100"
                    pulsating={true}
                    fadeDistance={1}
                    saturation={1}
                />
            </div>

            <Navbar />

            <div className="max-w-6xl mx-auto px-4 pt-32 pb-16 grid lg:grid-cols-2 gap-16 items-center">

                {/* Left Column: Value Prop */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-8 relative z-10"
                >
                    <div>
                        <div className="inline-flex items-center space-x-2 bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-blue-500/20">
                            <ShieldCheck className="w-4 h-4" />
                            <span>Verified Partners Only</span>
                        </div>
                        <h1 className="text-5xl font-black mb-6 tracking-tight leading-tight text-white">
                            Join the World's Best <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Logistics Network.</span>
                        </h1>
                        <p className="text-xl text-white/90 font-medium leading-relaxed">
                            Stop chasing leads. Get hyper-targeted shipment requests delivered straight to your inbox. Close more deals with zero marketing spend.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {[
                            'Receive 50+ localized leads monthly',
                            'Smart Country Targeting (Only relevant cargo)',
                            'Instant "One-Click" Quoting',
                            'Verified Shippers & Real Cargo',
                            'Sovereign Verification Protocol (Invite-Only)'
                        ].map((item, i) => (
                            <div key={i} className="flex items-center space-x-3 text-lg text-white">
                                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                                    <Check className="w-4 h-4 text-blue-400" />
                                </div>
                                <span className="font-bold">{item}</span>
                            </div>
                        ))}
                    </div>

                    <div className="p-6 bg-black border border-white/20 rounded-2xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-white/60 uppercase tracking-widest font-black">Network Access</p>
                                <div className="flex items-baseline mt-2">
                                    <span className="text-4xl font-black text-white tracking-tighter">INVITE</span>
                                    <span className="text-white/40 ml-2 font-bold">ONLY</span>
                                </div>
                            </div>
                            <CreditCard className="w-10 h-10 text-white/20" />
                        </div>
                    </div>
                </motion.div>

                {/* Right Column: Registration Form */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-black border border-white/20 rounded-[32px] p-8 md:p-10 shadow-[0_0_50px_rgba(255,255,255,0.05)] relative z-10"
                >
                    <h2 className="text-2xl font-bold mb-8">Partner Registration</h2>

                    <form onSubmit={handleRegister} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400 flex items-center">
                                <Building2 className="w-4 h-4 mr-2" /> Company Name
                            </label>
                            <input
                                name="company_name"
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="Global Logistics Co."
                                required
                                value={formData.company_name}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400 flex items-center">
                                    <Mail className="w-4 h-4 mr-2" /> Email Address
                                </label>
                                <input
                                    name="email"
                                    type="email"
                                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    placeholder="quotes@company.com"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400 flex items-center">
                                    <Phone className="w-4 h-4 mr-2" /> Phone
                                </label>
                                <input
                                    name="phone"
                                    type="tel"
                                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                                    placeholder="+1 555 000 0000"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                    {isPhoneValid && (
                                        <div className="bg-green-500/20 p-1 rounded-full animate-in fade-in zoom-in duration-300">
                                            <Check className="w-4 h-4 text-green-400" />
                                        </div>
                                    )}
                                </div>
                                {phoneError && (
                                    <p className="text-xs text-red-400 font-medium pl-2 mt-1 flex items-center gap-1">
                                        ⚠️ {phoneError}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400 flex items-center">
                                <Globe className="w-4 h-4 mr-2" /> Operating Country
                            </label>
                            <select
                                name="country"
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                                required
                                value={formData.country}
                                onChange={handleChange}
                            >
                                <option value="">Select Country...</option>
                                {countries.map((c: Country) => (
                                    <option key={c.code} value={c.code}>
                                        {c.name} ({c.dial_code})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-4 border-t border-white/10 pt-4">
                            <h3 className="text-sm font-bold text-blue-400 flex items-center">
                                <ShieldCheck className="w-4 h-4 mr-2" /> Government Verification
                            </h3>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Tax ID / Business Reg Number</label>
                                <input
                                    name="tax_id"
                                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30"
                                    placeholder="e.g. VAT-123456"
                                    required
                                    value={formData.tax_id}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Business License URL (PDF/Image)</label>
                                <input
                                    name="document_url"
                                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30"
                                    placeholder="https://..."
                                    required
                                    value={formData.document_url}
                                    onChange={handleChange}
                                />
                                <p className="text-xs text-gray-500">Provide a direct link to your business license for verification.</p>
                            </div>
                        </div>

                        <div className="space-y-2 pt-4">
                            <label className="text-sm font-medium text-gray-400 flex items-center">
                                <Upload className="w-4 h-4 mr-2" /> Company Logo URL
                            </label>
                            <input
                                name="logo_url"
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                                placeholder="https://..."
                                value={formData.logo_url}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading || !!phoneError}
                                className="w-full bg-white text-black font-bold h-14 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : 'Register & Join Network'}
                            </button>
                            <p className="text-center text-xs text-gray-500 mt-4">
                                By joining, you agree to our Code of Conduct.
                            </p>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
