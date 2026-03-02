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
import Avatar from '@/components/visuals/Avatar';

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
        contact_person: '',
        email: '',
        company_email: '',
        country: '',
        phone: '',
        specializations: [] as string[],
        routes: '',
        tax_id: '',
        website: '',
        document_url: '',
        logo_url: 'https://images.unsplash.com/photo-1586528116311-ad86d7c49988?auto=format&fit=crop&q=80&w=200'
    });

    const SPECIALIZATION_OPTIONS = ['FCL', 'LCL', 'AIR', 'BREAKBULK', 'RORO', 'REEFER'];

    const toggleSpec = (spec: string) => {
        setFormData(prev => ({
            ...prev,
            specializations: prev.specializations.includes(spec)
                ? prev.specializations.filter(s => s !== spec)
                : [...prev.specializations, spec]
        }));
    };

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
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            setFormData(prev => ({ ...prev, [field]: result }));
            setUploadingField(null);
        };
        reader.readAsDataURL(file);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'country') {
            const selectedCountry = countries.find((c: Country) => c.code === value);
            if (selectedCountry) {
                setFormData(prev => ({ ...prev, country: value, phone: selectedCountry.dial_code + ' ' }));
                setPhoneError(null);
            } else {
                setFormData(prev => ({ ...prev, [name]: value }));
            }
        } else if (name === 'phone') {
            const countryCode = formData.country as CountryCode;
            if (!countryCode) { setFormData(prev => ({ ...prev, phone: value })); return; }
            const formatted = new AsYouType(countryCode).input(value);
            setFormData(prev => ({ ...prev, phone: formatted }));
            if (value.length > 5) {
                try {
                    const isValid = isValidPhoneNumber(formatted, countryCode);
                    setIsPhoneValid(isValid);
                    setPhoneError(isValid ? null : 'Invalid number for selected country');
                } catch { setPhoneError(null); setIsPhoneValid(false); }
            } else { setPhoneError(null); setIsPhoneValid(false); }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/forwarders/promote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    company_name: formData.company_name,
                    contact_person: formData.contact_person,
                    email: formData.email,
                    company_email: formData.company_email,
                    phone: formData.phone,
                    country: formData.country,
                    specializations: formData.specializations.join(','),
                    routes: formData.routes,
                    tax_id: formData.tax_id,
                    website: formData.website || '',
                    whatsapp: formData.phone,
                    document_url: formData.document_url,
                    logo_url: formData.logo_url
                })
            });
            const data = await response.json();
            if (data.success) {
                await refreshProfile();
                setSuccess(true);
            } else {
                alert(`Registration Failed: ${data.detail || 'Please try again.'}`);
            }
        } catch (error: any) {
            alert(`Error: ${error.message || 'Please check your connection.'}`);
        } finally {
            setLoading(false);
        }
    };

    const isAlreadyPartner = user?.role === 'forwarder' || user?.sovereign_id?.startsWith('REG-');

    if (isAlreadyPartner && !success) {
        return (
            <div className="min-h-screen bg-black text-white font-sans flex items-center justify-center">
                <Navbar />
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-[#0a0a0a] border border-white/10 p-12 rounded-3xl text-center">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8">
                        <ShieldCheck className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-outfit font-bold mb-4">Partner Active</h2>
                    <p className="text-white/60 mb-8">You are already registered. ID: <span className="text-white font-mono">{user?.sovereign_id}</span>.</p>
                    <Link href="/dashboard/partner" className="inline-block w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-white/90 transition-all">
                        Go to Partner Dashboard
                    </Link>
                </motion.div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-black text-white font-sans flex items-center justify-center">
                <Navbar />
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full bg-[#0a0a0a] border border-white/10 p-12 rounded-3xl text-center">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8">
                        <Check className="w-12 h-12 text-black" />
                    </div>
                    <h2 className="text-4xl font-outfit font-bold mb-6">Welcome Partner</h2>
                    <p className="text-white/60 mb-8">You are now a <span className="text-white">Registered Forwarder</span> in the OMEGO Network.</p>
                    <Link href="/dashboard/partner" className="inline-block w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-white/90 transition-all">
                        Enter Partner Dashboard
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans relative overflow-hidden">
            <Navbar />
            <div className="max-w-6xl mx-auto px-4 pt-40 pb-16 grid lg:grid-cols-2 gap-16">

                {/* Left Column: Value Prop */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="space-y-8 relative z-10">
                    <div>
                        <div className="inline-flex items-center space-x-2 bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-blue-500/20">
                            <ShieldCheck className="w-4 h-4" /><span>Verified Partners Only</span>
                        </div>
                        <h1 className="text-5xl font-black mb-6 tracking-tight leading-tight text-white">
                            Join the World&apos;s Best <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Logistics Network.</span>
                        </h1>
                        <p className="text-xl text-white/90 font-medium leading-relaxed">
                            Stop chasing leads. Get hyper-targeted shipment requests delivered straight to your inbox.
                        </p>
                    </div>
                    <div className="space-y-4">
                        {['Receive 50+ localized leads monthly', 'Smart Country Targeting', 'Instant One-Click Quoting', 'Verified Shippers & Real Cargo', 'Sovereign Verification Protocol'].map((item, i) => (
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
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
                    onSubmit={handleRegister}
                    className="bg-zinc-950 border border-white/5 rounded-[32px] p-10 space-y-6 relative z-10"
                >
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Partner Registration</h2>
                        <p className="text-gray-500 text-sm">Elevate your node to Sovereign Partner status.</p>
                    </div>

                    {/* Company Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400 flex items-center"><Building2 className="w-4 h-4 mr-2" /> Company Name</label>
                        <input name="company_name" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="Global Logistics Co." required value={formData.company_name} onChange={handleChange} />
                    </div>

                    {/* Contact Person */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400 flex items-center"><Mail className="w-4 h-4 mr-2" /> Contact Person Name</label>
                        <input name="contact_person" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="John Doe" required value={formData.contact_person} onChange={handleChange} />
                    </div>

                    {/* Emails */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400 flex items-center"><Mail className="w-4 h-4 mr-2" /> Personal Email</label>
                            <input name="email" type="email" className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-zinc-500 cursor-not-allowed focus:outline-none" value={formData.email} readOnly />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400 flex items-center"><Globe className="w-4 h-4 mr-2" /> Company Email</label>
                            <input name="company_email" type="email" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="ops@company.com" required value={formData.company_email} onChange={handleChange} />
                        </div>
                    </div>

                    {/* Country */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400 flex items-center"><Globe className="w-4 h-4 mr-2" /> Operating Country</label>
                        <select name="country" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none" required value={formData.country} onChange={handleChange}>
                            <option value="">Select Country...</option>
                            {countries.map((c: Country) => (<option key={c.code} value={c.code}>{c.name} ({c.dial_code})</option>))}
                        </select>
                    </div>

                    {/* Phone */}
                    <div className="space-y-2 relative">
                        <label className="text-sm font-medium text-gray-400 flex items-center"><Phone className="w-4 h-4 mr-2" /> Phone</label>
                        <input name="phone" type="tel" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none" placeholder="+1 555 000 0000" value={formData.phone} onChange={handleChange} />
                        {isPhoneValid && <div className="absolute right-3 top-10"><Check className="w-4 h-4 text-green-400" /></div>}
                        {phoneError && <p className="text-xs text-red-400 mt-1">⚠️ {phoneError}</p>}
                    </div>

                    {/* Specializations — CRITICAL for WF1 */}
                    <div className="space-y-3 border-t border-white/10 pt-4">
                        <h3 className="text-sm font-bold text-blue-400 flex items-center"><Globe className="w-4 h-4 mr-2" /> Cargo Specializations *</h3>
                        <p className="text-xs text-gray-500">Select all cargo types you handle. This determines which freight requests you receive.</p>
                        <div className="grid grid-cols-3 gap-3">
                            {SPECIALIZATION_OPTIONS.map(spec => {
                                const sel = formData.specializations.includes(spec);
                                return (
                                    <button key={spec} type="button" onClick={() => toggleSpec(spec)}
                                        className={`px-4 py-3 rounded-xl text-sm font-bold border transition-all ${sel ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-black border-white/10 text-white/60 hover:border-white/30'}`}>
                                        {sel && <Check className="w-3 h-3 inline mr-1" />}{spec}
                                    </button>
                                );
                            })}
                        </div>
                        {formData.specializations.length === 0 && <p className="text-xs text-amber-400">⚠️ Select at least one specialization to receive freight requests.</p>}
                    </div>

                    {/* Routes */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400 flex items-center"><Globe className="w-4 h-4 mr-2" /> Trade Lanes / Routes</label>
                        <input name="routes" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="e.g. Asia-Europe, Trans-Pacific" value={formData.routes} onChange={handleChange} />
                        <p className="text-xs text-gray-500">Enter your primary operating routes (comma-separated).</p>
                    </div>

                    {/* Verification */}
                    <div className="space-y-4 border-t border-white/10 pt-4">
                        <h3 className="text-sm font-bold text-blue-400 flex items-center"><ShieldCheck className="w-4 h-4 mr-2" /> Government Verification</h3>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Tax ID / Business Reg Number</label>
                            <input name="tax_id" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none" placeholder="e.g. VAT-123456" required value={formData.tax_id} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Company Website</label>
                            <input name="website" className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none" placeholder="e.g. www.global-logistics.com" value={formData.website} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Business License (PDF/Image)</label>
                            <div onClick={() => document.getElementById('license-upload')?.click()} className="w-full bg-black border border-dashed border-white/20 rounded-xl px-4 py-6 text-center cursor-pointer hover:border-blue-500/50 transition-all">
                                <input id="license-upload" type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'document_url')} accept=".pdf,image/*" />
                                {uploadingField === 'document_url' ? (
                                    <div className="flex flex-col items-center space-y-2"><Loader2 className="w-6 h-6 animate-spin text-blue-400" /><span className="text-xs text-blue-400">Uploading...</span></div>
                                ) : formData.document_url ? (
                                    <div className="flex flex-col items-center space-y-1"><Check className="w-6 h-6 text-green-400" /><span className="text-xs text-green-400">Uploaded</span></div>
                                ) : (
                                    <div className="flex flex-col items-center space-y-2"><Upload className="w-6 h-6 text-white/40" /><span className="text-sm text-white/60">Select from Computer</span></div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Logo */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400 flex items-center"><Upload className="w-4 h-4 mr-2" /> Company Logo</label>
                        <div onClick={() => document.getElementById('logo-upload')?.click()} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-white/[0.05] transition-all">
                            <input id="logo-upload" type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'logo_url')} accept="image/*" />
                            <div className="flex items-center space-x-3">
                                <Avatar src={formData.logo_url} name={formData.company_name} size="md" shape="square" className="border-white/10" />
                                <span className="text-sm font-medium text-white/70">{uploadingField === 'logo_url' ? 'Uploading...' : 'Upload Company Logo'}</span>
                            </div>
                            <Upload className="w-4 h-4 text-white/40" />
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="pt-4">
                        <button type="submit" disabled={loading || !!phoneError || formData.specializations.length === 0}
                            className="w-full bg-white text-black font-bold h-14 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center text-lg disabled:opacity-50 disabled:cursor-not-allowed">
                            {loading ? <Loader2 className="animate-spin" /> : 'Register & Join Network'}
                        </button>
                        <p className="text-center text-xs text-gray-500 mt-4">By joining, you agree to our Code of Conduct.</p>
                    </div>
                </motion.form>
            </div>
        </div>
    );
}
