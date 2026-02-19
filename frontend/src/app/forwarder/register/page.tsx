'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, CreditCard, Building2, Globe, Mail, Phone, Upload, Check, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { countries } from '@/lib/countries';
import { AsYouType, isValidPhoneNumber, CountryCode } from 'libphonenumber-js';
import Prism from '@/components/visuals/Prism';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { API_URL } from '@/lib/config';

export default function ForwarderRegisterPage() {
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
            const selectedCountry = countries.find(c => c.code === value);
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
            // 1. Register Forwarder in DB (Status: Pending Approval)
            const res = await fetch(`${API_URL}/api/forwarders/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (data.success) {
                // SUCCESS: Immediate Listing
                alert(`Welcome Aboard, ${formData.company_name}!\n\nYou have been successfully registered and added to our Global Directory.`);
                window.location.href = '/forwarders'; // Redirect to directory to see themselves
            } else {
                alert('Registration failed: ' + data.message || 'Unknown error');
            }
        } catch (error) {
            console.error(error);
            alert('Registration failed. Please check your data.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 z-0 opacity-100 mix-blend-screen pointer-events-none">
                <Prism />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-zinc-950 pointer-events-none"></div>

            <Navbar />

            <div className="max-w-6xl mx-auto px-4 py-16 grid lg:grid-cols-2 gap-16 items-center">

                {/* Left Column: Value Prop */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8"
                >
                    <div>
                        <div className="inline-flex items-center space-x-2 bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-blue-500/20">
                            <ShieldCheck className="w-4 h-4" />
                            <span>Verified Partners Only</span>
                        </div>
                        <h1 className="text-5xl font-bold mb-6 tracking-tight leading-tight">
                            Join the World's Best <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Logistics Network.</span>
                        </h1>
                        <p className="text-xl text-gray-400 leading-relaxed">
                            Stop chasing leads. Get hyper-targeted shipment requests delivered straight to your inbox. Close more deals with zero marketing spend.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {[
                            'Receive 50+ localized leads monthly',
                            'Smart Country Targeting (Only relevant cargo)',
                            'Instant "One-Click" Quoting',
                            'Verified Shippers & Real Cargo',
                            'No Commission. Just Subscription.'
                        ].map((item, i) => (
                            <div key={i} className="flex items-center space-x-3 text-lg">
                                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <Check className="w-4 h-4 text-green-400" />
                                </div>
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>

                    <div className="p-6 bg-zinc-900 border border-white/10 rounded-2xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400 uppercase tracking-widest font-bold">Monthly Subscription</p>
                                <div className="flex items-baseline mt-2">
                                    <span className="text-4xl font-bold text-white">$15</span>
                                    <span className="text-gray-500 ml-2">/ month</span>
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
                    className="bg-zinc-900/50 border border-white/10 rounded-3xl p-8 md:p-10 backdrop-blur-xl shadow-2xl"
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
                                {countries.map((c) => (
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
            <Footer />
        </div>
    );
}
