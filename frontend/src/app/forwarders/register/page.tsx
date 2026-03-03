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
                        <div className="inline-flex items-center space-x-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-full text-[10px] font-bold tracking-[0.2em] mb-6 border border-emerald-500/20 uppercase font-inter">
                            <ShieldCheck className="w-3.5 h-3.5" /><span>Verified Forwarders Only</span>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black mb-4 tracking-tighter leading-[1.1] text-white font-outfit uppercase">
                            Access Global <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">Shipping Leads.</span>
                        </h1>
                        <p className="text-sm text-zinc-400 font-medium leading-relaxed font-inter uppercase tracking-wide max-w-md">
                            Stop chasing unqualified RFQs. Register your forwarding business to automatically receive verified, high-volume shipping requests directly in your company inbox.
                        </p>
                    </div>
                    <div className="space-y-4">
                        {[
                            'Instant Email Alerts for New Cargo Requests',
                            'Quote Instantly via Direct Email Reply',
                            'Automated Filtering by Your Specialization',
                            '100% KYC-Verified Shippers (No Fake Leads)',
                            'Partner Dashboard to Track Active Bids'
                        ].map((item, i) => (
                            <div key={i} className="flex items-center space-x-4 text-sm text-zinc-300 font-inter">
                                <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                </div>
                                <span className="font-bold tracking-wide uppercase text-[10px]">{item}</span>
                            </div>
                        ))}
                    </div>
                    <div className="p-6 bg-white/[0.01] border border-white/5 rounded-2xl max-w-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold font-inter">Marketplace Access</p>
                                <div className="flex items-baseline mt-1">
                                    <span className="text-2xl font-black text-white tracking-widest font-outfit uppercase">Invite Only</span>
                                </div>
                            </div>
                            <CreditCard className="w-8 h-8 text-white/10" />
                        </div>
                    </div>
                </motion.div>

                {/* Right Column: Registration Form */}
                <motion.form
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
                    onSubmit={handleRegister}
                    className="bg-white/[0.01] border border-white/5 rounded-2xl p-6 md:p-8 space-y-8 relative z-10"
                >
                    <div>
                        <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] font-outfit text-white mb-1">Partner Registration</h2>
                        <p className="text-[9px] text-zinc-500 font-medium font-inter tracking-tight">Elevate your node to Sovereign Partner status.</p>
                    </div>

                    {/* Company Name */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-inter mb-1.5 flex items-center"><Building2 className="w-4 h-4 mr-2" /> Company Name</label>
                        <input name="company_name" className="w-full bg-black border border-white/5 rounded-lg px-3 py-2.5 text-[10px] font-bold text-white focus:border-emerald-500/50 outline-none transition-colors font-inter" placeholder="Global Logistics Co." required value={formData.company_name} onChange={handleChange} />
                    </div>

                    {/* Contact Person */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-inter mb-1.5 flex items-center"><Mail className="w-4 h-4 mr-2" /> Contact Person Name</label>
                        <input name="contact_person" className="w-full bg-black border border-white/5 rounded-lg px-3 py-2.5 text-[10px] font-bold text-white focus:border-emerald-500/50 outline-none transition-colors font-inter" placeholder="John Doe" required value={formData.contact_person} onChange={handleChange} />
                    </div>

                    {/* Emails */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-inter mb-1.5 flex items-center"><Mail className="w-4 h-4 mr-2" /> Personal Email</label>
                            <input name="email" type="email" className="w-full bg-zinc-900 border border-white/5 rounded-lg px-3 py-2.5 text-[10px] font-bold text-zinc-500 cursor-not-allowed outline-none font-inter" value={formData.email} readOnly />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-inter mb-1.5 flex items-center"><Globe className="w-4 h-4 mr-2" /> Company Email</label>
                            <input name="company_email" type="email" className="w-full bg-black border border-white/5 rounded-lg px-3 py-2.5 text-[10px] font-bold text-white focus:border-emerald-500/50 outline-none transition-colors font-inter" placeholder="ops@company.com" required value={formData.company_email} onChange={handleChange} />
                        </div>
                    </div>

                    {/* Country */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-inter mb-1.5 flex items-center"><Globe className="w-4 h-4 mr-2" /> Operating Country</label>
                        <select name="country" className="w-full bg-black border border-white/5 rounded-lg px-3 py-2.5 text-[10px] font-bold text-white focus:border-emerald-500/50 outline-none font-inter" required value={formData.country} onChange={handleChange}>
                            <option value="">Select Country...</option>
                            {countries.map((c: Country) => (<option key={c.code} value={c.code}>{c.name} ({c.dial_code})</option>))}
                        </select>
                    </div>

                    {/* Phone */}
                    <div className="space-y-2 relative">
                        <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-inter mb-1.5 flex items-center"><Phone className="w-4 h-4 mr-2" /> Phone</label>
                        <input name="phone" type="tel" className="w-full bg-black border border-white/5 rounded-lg px-3 py-2.5 text-[10px] font-bold text-white focus:border-emerald-500/50 outline-none font-inter" placeholder="+1 555 000 0000" value={formData.phone} onChange={handleChange} />
                        {isPhoneValid && <div className="absolute right-3 top-10"><Check className="w-4 h-4 text-green-400" /></div>}
                        {phoneError && <p className="text-[9px] text-red-500 font-bold uppercase tracking-widest font-inter mt-1 absolute -bottom-4 mt-1">⚠️ {phoneError}</p>}
                    </div>

                    {/* Specializations — CRITICAL for WF1 */}
                    <div className="space-y-3 border-t border-white/10 pt-4">
                        <h3 className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.2em] flex items-center font-outfit"><Globe className="w-4 h-4 mr-2" /> Cargo Specializations *</h3>
                        <p className="text-[9px] text-zinc-500 font-inter mb-3">Select all cargo types you handle. This determines which freight requests you receive.</p>
                        <div className="grid grid-cols-3 gap-3">
                            {SPECIALIZATION_OPTIONS.map(spec => {
                                const sel = formData.specializations.includes(spec);
                                return (
                                    <button key={spec} type="button" onClick={() => toggleSpec(spec)}
                                        className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all font-inter ${sel ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-black border-white/5 text-zinc-500 hover:border-white/20'}`}>
                                        {sel && <Check className="w-3 h-3 inline mr-1" />}{spec}
                                    </button>
                                );
                            })}
                        </div>
                        {formData.specializations.length === 0 && <p className="text-[9px] text-amber-500 font-bold uppercase tracking-widest font-inter mt-3 block">⚠️ Select at least one specialization to receive freight requests.</p>}
                    </div>

                    {/* Routes */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-inter mb-1.5 flex items-center"><Globe className="w-4 h-4 mr-2" /> Trade Lanes / Routes</label>
                        <input name="routes" className="w-full bg-black border border-white/5 rounded-lg px-3 py-2.5 text-[10px] font-bold text-white focus:border-emerald-500/50 outline-none transition-colors font-inter" placeholder="e.g. Asia-Europe, Trans-Pacific" value={formData.routes} onChange={handleChange} />
                        <p className="text-[9px] text-zinc-500 font-inter mb-3">Enter your primary operating routes (comma-separated).</p>
                    </div>

                    {/* Verification */}
                    <div className="space-y-4 border-t border-white/10 pt-4">
                        <h3 className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.2em] flex items-center font-outfit"><ShieldCheck className="w-4 h-4 mr-2" /> Government Verification</h3>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-inter mb-1.5">Tax ID / Business Reg Number</label>
                            <input name="tax_id" className="w-full bg-black border border-white/5 rounded-lg px-3 py-2.5 text-[10px] font-bold text-white focus:border-emerald-500/50 outline-none font-inter" placeholder="e.g. VAT-123456" required value={formData.tax_id} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-inter mb-1.5">Company Website</label>
                            <input name="website" className="w-full bg-black border border-white/5 rounded-lg px-3 py-2.5 text-[10px] font-bold text-white focus:border-emerald-500/50 outline-none font-inter" placeholder="e.g. www.global-logistics.com" value={formData.website} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-inter mb-1.5">Business License (PDF/Image)</label>
                            <div onClick={() => document.getElementById('license-upload')?.click()} className="w-full bg-black border border-dashed border-white/10 rounded-lg px-4 py-6 text-center cursor-pointer hover:border-emerald-500/50 transition-all">
                                <input id="license-upload" type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'document_url')} accept=".pdf,image/*" />
                                {uploadingField === 'document_url' ? (
                                    <div className="flex flex-col items-center space-y-2"><Loader2 className="w-6 h-6 animate-spin text-blue-400" /><span className="text-xs text-blue-400">Uploading...</span></div>
                                ) : formData.document_url ? (
                                    <div className="flex flex-col items-center space-y-1"><Check className="w-6 h-6 text-green-400" /><span className="text-xs text-green-400">Uploaded</span></div>
                                ) : (
                                    <div className="flex flex-col items-center space-y-2"><Upload className="w-6 h-6 text-white/40" /><span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-inter mt-2 block">Select from Computer</span></div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Logo */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-inter mb-1.5 flex items-center"><Upload className="w-4 h-4 mr-2" /> Company Logo</label>
                        <div onClick={() => document.getElementById('logo-upload')?.click()} className="w-full bg-black border border-white/5 rounded-lg px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-white/[0.05] transition-all">
                            <input id="logo-upload" type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'logo_url')} accept="image/*" />
                            <div className="flex items-center space-x-3">
                                <Avatar src={formData.logo_url} name={formData.company_name} size="md" shape="square" className="border-white/10" />
                                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 font-inter">{uploadingField === 'logo_url' ? 'Uploading...' : 'Upload Company Logo'}</span>
                            </div>
                            <Upload className="w-4 h-4 text-white/40" />
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="pt-4">
                        <button type="submit" disabled={loading || !!phoneError || formData.specializations.length === 0}
                            className="w-full bg-white text-black py-3 rounded-lg text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all font-inter active:scale-95 disabled:opacity-50 mt-4 flex items-center justify-center">
                            {loading ? <Loader2 className="animate-spin" /> : 'Register & Join Network'}
                        </button>
                        <p className="text-center text-[9px] text-zinc-500 font-inter mb-3 mt-4">By joining, you agree to our Code of Conduct.</p>
                    </div>
                </motion.form>
            </div>
        </div>
    );
}
