'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, CreditCard, Building2, Globe, Mail, Phone, Upload, Check, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { countries } from '@/lib/countries';
import { AsYouType, isValidPhoneNumber, CountryCode } from 'libphonenumber-js';
import Navbar from '@/components/layout/Navbar';
import { API_URL } from '@/lib/config';

interface Country {
    name: string;
    code: string;
    dial_code: string;
}

export default function ForwarderRegisterPage() {
    const { user, refreshProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        company_name: '',
        email: '',
        company_email: '',
        country: '',
        phone: '',
        tax_id: '',
        document_url: '',
        password: '', // In a real app, we'd hash and store this properly via /auth/register
        logo_url: 'https://images.unsplash.com/photo-1586528116311-ad86d7c49988?auto=format&fit=crop&q=80&w=200'
    });

    // Auto-sync Personal Email from Session
    useEffect(() => {
        if (user?.email) {
            setFormData(prev => ({ ...prev, email: user.email }));
        }
    }, [user]);
    const [phoneError, setPhoneError] = useState<string | null>(null);
    const [isPhoneValid, setIsPhoneValid] = useState(false);
    const [uploadingField, setUploadingField] = useState<string | null>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'document_url' | 'logo_url') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingField(field);

        // 🧠 SOVEREIGN SIMULATION: Mocking an ultra-secure upload to the Grid
        setTimeout(() => {
            const mockUrl = `https://storage.omego.online/partner/${field}/${file.name.replace(/\s+/g, '_')}`;
            setFormData(prev => ({ ...prev, [field]: mockUrl }));
            setUploadingField(null);
        }, 1500);
    };

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
            const response = await fetch(`${API_URL}/api/forwarders/promote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    company_name: formData.company_name,
                    email: formData.email,
                    company_email: formData.company_email,
                    phone: formData.phone,
                    country: formData.country,
                    tax_id: formData.tax_id,
                    website: (formData as any).website || "",
                    whatsapp: (formData as any).whatsapp || formData.phone,
                    document_url: formData.document_url,
                    logo_url: formData.logo_url
                })
            });

            const data = await response.json();

            if (data.success) {
                // 🚀 REFRESH ENTIRE IDENTITY VIA PROMOTION HANDSHAKE
                await refreshProfile();
                setSuccess(true);
            } else {
                alert(`Handshake Failed: ${data.detail || 'Internal Grid Error'}`);
            }
        } catch (error: any) {
            console.error('Registration Error:', error);
            alert(`Handshake failed. ${error.message || 'Please verify your connection to the Sovereign Grid.'}`);
        } finally {
            setLoading(false);
        }
    };

    const isAlreadyPartner = user?.role === 'forwarder' || user?.sovereign_id?.startsWith('REG-');

    if (isAlreadyPartner && !success) {
        return (
            <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black flex items-center justify-center">
                <Navbar />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-[#0a0a0a] border border-white/10 p-12 rounded-3xl text-center"
                >
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 text-white">
                        <ShieldCheck className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-outfit font-bold mb-4">Partner Active</h2>
                    <p className="text-white/60 mb-8">
                        You are already a registered forwarder in the OMEGO Global Network.
                        Your Sovereign ID is <span className="text-white font-mono">{user?.sovereign_id}</span>.
                    </p>
                    <Link
                        href="/dashboard/partner"
                        className="inline-block w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-white/90 transition-all"
                    >
                        Go to Partner Dashboard
                    </Link>
                </motion.div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black flex items-center justify-center">
                <Navbar />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full bg-[#0a0a0a] border border-white/10 p-12 rounded-3xl text-center"
                >
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(255,255,255,0.2)]">
                        <Check className="w-12 h-12 text-black" />
                    </div>
                    <h2 className="text-4xl font-outfit font-bold mb-6">Welcome Partner</h2>
                    <p className="text-white/60 mb-8 leading-relaxed">
                        Your identity has been synchronized. You are now a <span className="text-white">Registered Forwarder</span> (REG-OMEGO).
                        The global marketplace is now yours to command.
                    </p>
                    <Link
                        href="/dashboard/partner"
                        className="inline-block w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-white/90 shadow-xl transition-all"
                    >
                        Enter Marketplace Dashboard
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black relative overflow-hidden">
            <Navbar />

            <div className="max-w-6xl mx-auto px-4 pt-40 pb-16 grid lg:grid-cols-2 gap-16">

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
                <motion.form
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    onSubmit={handleRegister}
                    className="bg-zinc-950 border border-white/5 rounded-[32px] p-10 space-y-8 relative z-10"
                >
                    <h2 className="text-2xl font-bold mb-2">Partner Registration</h2>
                    <p className="text-gray-500 text-sm mb-8">Elevate your node to Sovereign Partner status.</p>
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
                                <Mail className="w-4 h-4 mr-2" /> Personal Email (Static)
                            </label>
                            <input
                                name="email"
                                type="email"
                                className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-zinc-500 cursor-not-allowed focus:outline-none"
                                value={formData.email}
                                readOnly
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400 flex items-center">
                                <Globe className="w-4 h-4 mr-2" /> Company Email Address
                            </label>
                            <input
                                name="company_email"
                                type="email"
                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="ops@company.com"
                                required
                                value={formData.company_email}
                                onChange={handleChange}
                            />
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

                    <div className="space-y-2 relative">
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
                            <label className="text-sm font-medium text-gray-400">Business License (PDF/Image)</label>
                            <div
                                onClick={() => document.getElementById('license-upload')?.click()}
                                className="w-full bg-black border border-dashed border-white/20 rounded-xl px-4 py-6 text-center cursor-pointer hover:border-blue-500/50 hover:bg-white/[0.02] transition-all group"
                            >
                                <input
                                    id="license-upload"
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => handleFileUpload(e, 'document_url')}
                                    accept=".pdf,image/*"
                                />
                                {uploadingField === 'document_url' ? (
                                    <div className="flex flex-col items-center space-y-2">
                                        <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                                        <span className="text-xs text-blue-400 font-bold tracking-widest uppercase">Uploading to Grid...</span>
                                    </div>
                                ) : formData.document_url ? (
                                    <div className="flex flex-col items-center space-y-1">
                                        <Check className="w-6 h-6 text-green-400" />
                                        <span className="text-xs text-green-400 font-bold">{formData.document_url.split('/').pop()}</span>
                                        <span className="text-[10px] text-white/40 uppercase tracking-tighter">Click to replace</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center space-y-2">
                                        <Upload className="w-6 h-6 text-white/40 group-hover:text-blue-400 transition-colors" />
                                        <span className="text-sm font-medium text-white/60">Select from Computer</span>
                                        <span className="text-[10px] text-white/30 uppercase tracking-widest">PDF or Images accepted</span>
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-gray-500">Provide your business license for verification.</p>
                        </div>
                    </div>

                    <div className="space-y-2 pt-4">
                        <label className="text-sm font-medium text-gray-400 flex items-center">
                            <Upload className="w-4 h-4 mr-2" /> Company Logo
                        </label>
                        <div
                            onClick={() => document.getElementById('logo-upload')?.click()}
                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-white/[0.05] transition-all"
                        >
                            <input
                                id="logo-upload"
                                type="file"
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, 'logo_url')}
                                accept="image/*"
                            />
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-lg bg-white/5 overflow-hidden flex items-center justify-center border border-white/10">
                                    {uploadingField === 'logo_url' ? (
                                        <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                                    ) : formData.logo_url ? (
                                        <img src={formData.logo_url} className="w-full h-full object-cover" alt="Logo" />
                                    ) : (
                                        <Building2 className="w-5 h-5 text-white/20" />
                                    )}
                                </div>
                                <span className="text-sm font-medium text-white/70">
                                    {uploadingField === 'logo_url' ? 'Uploading...' : formData.logo_url ? 'Change Logo' : 'Select Logo File'}
                                </span>
                            </div>
                            <Upload className="w-4 h-4 text-white/40" />
                        </div>
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
                </motion.form>
            </div>
        </div>
    );
}
