'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Globe, Mail, Phone, Upload, Check, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { countries } from '@/lib/countries';
import { AsYouType, isValidPhoneNumber, CountryCode } from 'libphonenumber-js';
import Navbar from '@/components/layout/Navbar';
import { apiFetch } from '@/lib/config';
import Avatar from '@/components/visuals/Avatar';
import { useRouter } from 'next/navigation';

interface Country {
    name: string;
    code: string;
    dial_code: string;
}

export default function ForwarderRegisterPage() {
    const { user, refreshProfile } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [appStatus, setAppStatus] = useState<string | null>(null); // NOT_APPLIED | PENDING | ACTIVE | REJECTED
    const [statusLoading, setStatusLoading] = useState(true);

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

    // Redirect to login if not authenticated; fetch application status
    useEffect(() => {
        if (user === null) { router.push('/login?redirect=/forwarders/register'); return; }
        if (!user) return;
        const token = localStorage.getItem('token');
        apiFetch('/api/forwarders/my-status', { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json())
            .then(d => setAppStatus(d.status || 'NOT_APPLIED'))
            .catch(() => setAppStatus('NOT_APPLIED'))
            .finally(() => setStatusLoading(false));
    }, [user, router]);

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
            const response = await apiFetch(`/api/forwarders/promote`, {
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

    // Loading status check
    if (statusLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-zinc-600" />
            </div>
        );
    }

    // Already approved partner
    if ((user?.role === 'forwarder' || appStatus === 'ACTIVE') && !success) {
        return (
            <div className="min-h-screen bg-black text-white font-sans flex items-center justify-center">
                <Navbar />
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-[#0a0a0a] border border-white/5 p-10 rounded-2xl text-center">
                    <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h2 className="text-xl font-black font-outfit uppercase tracking-tight mb-3">Already a Partner</h2>
                    <p className="text-sm text-zinc-500 font-inter mb-2">Your company is a verified CargoLink partner.</p>
                    <p className="text-xs text-zinc-600 font-mono mb-8">{user?.email}</p>
                    <Link href="/dashboard/partner" className="inline-flex items-center justify-center w-full bg-white text-black font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl hover:bg-zinc-200 transition-all font-inter">
                        Go to Partner Dashboard
                    </Link>
                </motion.div>
            </div>
        );
    }

    // Already has a PENDING application — block resubmission
    if (appStatus === 'PENDING' && !success) {
        return (
            <div className="min-h-screen bg-black text-white font-sans flex items-center justify-center">
                <Navbar />
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-[#0a0a0a] border border-white/5 p-10 rounded-2xl text-center">
                    <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
                    </div>
                    <h2 className="text-xl font-black font-outfit uppercase tracking-tight mb-3">Application Under Review</h2>
                    <p className="text-sm text-zinc-400 font-inter mb-2">Your partner application has been submitted and is awaiting admin approval.</p>
                    <p className="text-xs text-zinc-600 font-inter mb-8">You will receive an email once your account is approved. This usually takes 24–48 hours.</p>
                    <p className="text-xs text-zinc-700 font-mono mb-6">{user?.email}</p>
                    <Link href="/dashboard" className="inline-flex items-center justify-center w-full bg-white text-black font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl hover:bg-zinc-200 transition-all font-inter">
                        Go to Dashboard
                    </Link>
                </motion.div>
            </div>
        );
    }

    // Rejected — allow reapplication
    if (appStatus === 'REJECTED') {
        // Fall through to show the form again so they can reapply
    }

    // Just submitted — show pending confirmation
    if (success) {
        return (
            <div className="min-h-screen bg-black text-white font-sans flex items-center justify-center">
                <Navbar />
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full bg-[#0a0a0a] border border-white/5 p-10 rounded-2xl text-center">
                    <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="w-7 h-7 text-amber-400" />
                    </div>
                    <h2 className="text-xl font-black font-outfit uppercase tracking-tight mb-3">Application Submitted</h2>
                    <p className="text-sm text-zinc-400 font-inter mb-2">Your application is under review by our team.</p>
                    <p className="text-xs text-zinc-600 font-inter mb-8">You'll receive an email once your account is approved. This usually takes 24–48 hours.</p>
                    <Link href="/dashboard" className="inline-flex items-center justify-center w-full bg-white text-black font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl hover:bg-zinc-200 transition-all font-inter">
                        Go to Dashboard
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
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="space-y-8 relative z-10 lg:sticky lg:top-32 lg:self-start">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-white/[0.04] text-zinc-400 px-4 py-2 rounded-full text-xs font-bold tracking-widest mb-6 border border-white/5 uppercase font-inter">
                            Freight Forwarder Network
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black mb-4 tracking-tighter leading-[1.1] text-white font-outfit uppercase">
                            Access Global <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">Shipping Leads.</span>
                        </h1>
                        <p className="text-sm text-zinc-400 font-medium leading-relaxed font-inter max-w-md">
                            Stop chasing unqualified RFQs. Register your forwarding business to automatically receive verified, high-value shipping requests matched to your specialization and trade lanes.
                        </p>
                    </div>

                    <div className="space-y-3.5">
                        {[
                            { title: 'Instant email alerts',        desc: 'Get notified the moment a matching shipment request is posted.' },
                            { title: 'Quote by email reply',        desc: 'Submit competitive bids directly — no complex portal required.' },
                            { title: 'Matched to your lanes',       desc: 'Only receive requests that match your specializations and routes.' },
                            { title: 'KYC-verified shippers',       desc: 'Every shipper on the platform is identity-verified. No fake leads.' },
                            { title: 'Partner dashboard',           desc: 'Track all your bids, contracts, and earnings in one place.' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-4">
                                <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 flex-shrink-0 mt-0.5">
                                    <Check className="w-3 h-3 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white font-inter leading-none">{item.title}</p>
                                    <p className="text-xs text-zinc-500 font-inter mt-0.5 leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-2">
                        {[
                            { value: '100+', label: 'Active Forwarders' },
                            { value: '195',  label: 'Countries' },
                            { value: 'Free', label: 'To Join' },
                        ].map(stat => (
                            <div key={stat.label} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center">
                                <p className="text-xl font-black text-white font-mono">{stat.value}</p>
                                <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-inter mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Testimonial */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-3">
                        <p className="text-sm text-zinc-300 font-inter leading-relaxed">
                            &ldquo;CargoLink doubled our quote volume in the first month. The lead quality is far better than cold outreach.&rdquo;
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-black text-white">R</div>
                            <div>
                                <p className="text-xs font-bold text-white font-inter">Rajan M.</p>
                                <p className="text-[10px] text-zinc-600 font-inter">Operations Director, Chennai Freight Co.</p>
                            </div>
                        </div>
                    </div>

                    <p className="text-xs text-zinc-700 font-inter">
                        Already registered?{' '}
                        <a href="/login" className="text-zinc-400 hover:text-white transition-colors underline">Sign in to your account</a>
                    </p>
                </motion.div>

                {/* Right Column: Registration Form */}
                <motion.form
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
                    onSubmit={handleRegister}
                    className="bg-white/[0.01] border border-white/5 rounded-2xl p-6 md:p-8 space-y-8 relative z-10"
                >
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-widest font-outfit text-white mb-1">Partner Registration</h2>
                        <p className="text-xs text-zinc-500 font-inter">Become a verified CargoLink partner.</p>
                    </div>

                    {/* Company Name */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-600 uppercase tracking-widest font-inter flex items-center gap-2"><Building2 className="w-3.5 h-3.5" /> Company Name</label>
                        <input name="company_name" className="w-full bg-black border border-white/5 rounded-lg px-3 py-2.5 text-sm text-white focus:border-white/20 outline-none transition-colors font-inter" placeholder="Global Logistics Co." required value={formData.company_name} onChange={handleChange} />
                    </div>

                    {/* Contact Person */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-600 uppercase tracking-widest font-inter flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> Contact Person</label>
                        <input name="contact_person" className="w-full bg-black border border-white/5 rounded-lg px-3 py-2.5 text-sm text-white focus:border-white/20 outline-none transition-colors font-inter" placeholder="John Doe" required value={formData.contact_person} onChange={handleChange} />
                    </div>

                    {/* Emails */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-600 uppercase tracking-widest font-inter flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> Personal Email</label>
                            <input name="email" type="email" className="w-full bg-zinc-900 border border-white/5 rounded-lg px-3 py-2.5 text-sm text-zinc-500 cursor-not-allowed outline-none font-inter" value={formData.email} readOnly />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-600 uppercase tracking-widest font-inter flex items-center gap-2"><Globe className="w-3.5 h-3.5" /> Company Email</label>
                            <input name="company_email" type="email" className="w-full bg-black border border-white/5 rounded-lg px-3 py-2.5 text-sm text-white focus:border-white/20 outline-none transition-colors font-inter" placeholder="ops@company.com" required value={formData.company_email} onChange={handleChange} />
                        </div>
                    </div>

                    {/* Country */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-600 uppercase tracking-widest font-inter flex items-center gap-2"><Globe className="w-3.5 h-3.5" /> Operating Country</label>
                        <select name="country" className="w-full bg-black border border-white/5 rounded-lg px-3 py-2.5 text-sm text-white focus:border-white/20 outline-none font-inter" required value={formData.country} onChange={handleChange}>
                            <option value="">Select Country...</option>
                            {countries.map((c: Country) => (<option key={c.code} value={c.code}>{c.name} ({c.dial_code})</option>))}
                        </select>
                    </div>

                    {/* Phone */}
                    <div className="space-y-2 relative">
                        <label className="text-xs font-bold text-zinc-600 uppercase tracking-widest font-inter flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> Phone</label>
                        <input name="phone" type="tel" className="w-full bg-black border border-white/5 rounded-lg px-3 py-2.5 text-sm text-white focus:border-white/20 outline-none font-inter" placeholder="+1 555 000 0000" value={formData.phone} onChange={handleChange} />
                        {isPhoneValid && <div className="absolute right-3 top-9"><Check className="w-4 h-4 text-emerald-400" /></div>}
                        {phoneError && <p className="text-xs text-red-400 font-inter mt-1">⚠️ {phoneError}</p>}
                    </div>

                    {/* Specializations */}
                    <div className="space-y-3 border-t border-white/5 pt-4">
                        <div>
                            <h3 className="text-xs font-bold text-white uppercase tracking-widest font-inter">Cargo Specializations</h3>
                            <p className="text-xs text-zinc-500 font-inter mt-1">Select all cargo types you handle — this determines which freight requests you receive.</p>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {SPECIALIZATION_OPTIONS.map(spec => {
                                const sel = formData.specializations.includes(spec);
                                return (
                                    <button key={spec} type="button" onClick={() => toggleSpec(spec)}
                                        className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border transition-all font-inter ${sel ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-black border-white/5 text-zinc-500 hover:border-white/20'}`}>
                                        {sel && <Check className="w-3 h-3 inline mr-1" />}{spec}
                                    </button>
                                );
                            })}
                        </div>
                        {formData.specializations.length === 0 && <p className="text-xs text-amber-500 font-inter">Select at least one specialization to receive freight requests.</p>}
                    </div>

                    {/* Routes */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-600 uppercase tracking-widest font-inter flex items-center gap-2"><Globe className="w-3.5 h-3.5" /> Trade Lanes / Routes</label>
                        <input name="routes" className="w-full bg-black border border-white/5 rounded-lg px-3 py-2.5 text-sm text-white focus:border-white/20 outline-none transition-colors font-inter" placeholder="e.g. Asia-Europe, Trans-Pacific" value={formData.routes} onChange={handleChange} />
                        <p className="text-xs text-zinc-600 font-inter">Enter your primary operating routes (comma-separated).</p>
                    </div>

                    {/* Business Verification */}
                    <div className="space-y-4 border-t border-white/5 pt-4">
                        <h3 className="text-xs font-bold text-white uppercase tracking-widest font-inter">Business Verification</h3>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-600 uppercase tracking-widest font-inter">Tax ID / Business Reg Number</label>
                            <input name="tax_id" className="w-full bg-black border border-white/5 rounded-lg px-3 py-2.5 text-sm text-white focus:border-white/20 outline-none font-inter" placeholder="e.g. VAT-123456" required value={formData.tax_id} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-600 uppercase tracking-widest font-inter">Company Website</label>
                            <input name="website" className="w-full bg-black border border-white/5 rounded-lg px-3 py-2.5 text-sm text-white focus:border-white/20 outline-none font-inter" placeholder="www.yourcompany.com" value={formData.website} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-600 uppercase tracking-widest font-inter">Business License (PDF / Image)</label>
                            <div onClick={() => document.getElementById('license-upload')?.click()} className="w-full bg-black border border-dashed border-white/10 rounded-lg px-4 py-5 text-center cursor-pointer hover:border-white/20 transition-all">
                                <input id="license-upload" type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'document_url')} accept=".pdf,image/*" />
                                {uploadingField === 'document_url' ? (
                                    <div className="flex flex-col items-center gap-2"><Loader2 className="w-5 h-5 animate-spin text-zinc-400" /><span className="text-xs text-zinc-500 font-inter">Uploading...</span></div>
                                ) : formData.document_url ? (
                                    <div className="flex flex-col items-center gap-1"><Check className="w-5 h-5 text-emerald-400" /><span className="text-xs text-emerald-400 font-inter">Uploaded</span></div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2"><Upload className="w-5 h-5 text-zinc-600" /><span className="text-xs text-zinc-500 font-inter mt-1">Click to upload</span></div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Logo */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-600 uppercase tracking-widest font-inter flex items-center gap-2"><Upload className="w-3.5 h-3.5" /> Company Logo</label>
                        <div onClick={() => document.getElementById('logo-upload')?.click()} className="w-full bg-black border border-white/5 rounded-lg px-3 py-2.5 flex items-center justify-between cursor-pointer hover:bg-white/[0.03] transition-all">
                            <input id="logo-upload" type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'logo_url')} accept="image/*" />
                            <div className="flex items-center gap-3">
                                <Avatar src={formData.logo_url} name={formData.company_name} size="md" shape="square" className="border-white/10" />
                                <span className="text-xs text-zinc-500 font-inter">{uploadingField === 'logo_url' ? 'Uploading...' : 'Upload company logo'}</span>
                            </div>
                            <Upload className="w-4 h-4 text-zinc-600" />
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="pt-2">
                        <button type="submit" disabled={loading || !!phoneError || formData.specializations.length === 0}
                            className="w-full bg-white text-black py-3.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-zinc-200 transition-all font-inter active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Register & Join Network'}
                        </button>
                        <p className="text-center text-xs text-zinc-600 font-inter mt-3">By joining, you agree to our Code of Conduct.</p>
                    </div>
                </motion.form>
            </div>
        </div>
    );
}
