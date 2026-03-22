'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import {
    Ship, Plane, Truck, Calendar, Package, Layers,
    ShieldAlert, FileText, ArrowRight, Loader2, Info,
    MapPin, Thermometer, AlertTriangle, CheckSquare, Square
} from 'lucide-react';
import { countries } from '@/lib/countries';
import { apiFetch } from '@/lib/config';
import Navbar from '@/components/layout/Navbar';
import PortAutocomplete, { PortResult } from '@/components/forms/PortAutocomplete';
import CommodityAutocomplete from '@/components/forms/CommodityAutocomplete';
import VesselAutocomplete from '@/components/forms/VesselAutocomplete';

interface Country { name: string; code: string; dial_code: string; }

const getFlagEmoji = (code: string) => {
    if (!code) return '🌐';
    return String.fromCodePoint(...code.toUpperCase().split('').map(c => 127397 + c.charCodeAt(0)));
};

const CONTAINER_TYPES = [
    { value: '20GP', label: "20' Std" },
    { value: '40GP', label: "40' Std" },
    { value: '40HC', label: "40' HC" },
    { value: '20RF', label: "20' Reefer" },
    { value: '40RF', label: "40' Reefer" },
    { value: 'OpenTop', label: 'Open Top' },
    { value: 'FlatRack', label: 'Flat Rack' },
    { value: 'Tank', label: 'Tank' },
];

const INCOTERMS = ['EXW', 'FCA', 'FOB', 'CFR', 'CIF', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP'];
const IMO_CLASSES = ['1 – Explosives', '2 – Gases', '3 – Flammable Liquids', '4 – Flammable Solids', '5 – Oxidizers', '6 – Toxic & Infectious', '7 – Radioactive', '8 – Corrosives', '9 – Misc Dangerous'];
const PACKING_GROUPS = ['PG I – High Danger', 'PG II – Medium Danger', 'PG III – Low Danger'];

export default function RequestQuoteForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState('');
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        // Shipment Type
        mode: 'FCL',            // FCL | LCL | Air | Truck
        // Route
        origin_country: 'CN',
        origin_district: '',
        origin_locode: '',      // UNLOCODE e.g. "CNSHA"
        origin_type: 'CY',      // CY | CFS | Door
        dest_country: 'US',
        dest_district: '',
        dest_locode: '',        // UNLOCODE e.g. "USLAX"
        dest_type: 'CY',        // CY | CFS | Door
        incoterms: 'FOB',
        // Cargo
        commodity: '',
        hs_code: '',
        cargo_specification: 'General Cargo',
        packing_type: 'Pallets',
        quantity: '1',
        // FCL specific
        container_type: '',
        container_count: '1',
        // Weight & Volume (LCL/Air)
        weight: '',
        weight_unit: 'KGM',
        total_volume_cbm: '',
        length: '',
        width: '',
        height: '',
        dim_unit: 'CM',
        // Properties
        is_stackable: true,
        is_hazardous: false,
        is_reefer: false,
        // Hazardous extras
        imo_class: '',
        un_number: '',
        packing_group: '',
        // Reefer extras
        temp_min: '',
        temp_max: '',
        // Services
        needs_insurance: false,
        customs_origin: false,
        customs_dest: false,
        // Timeline
        pickup_ready_date: '',
        delivery_date: '',
        // Contact & Notes
        phone: '',
        vessel: '',
        notes: '',
    });

    const set = (key: string, val: any) => setFormData(prev => ({ ...prev, [key]: val }));

    const handleAutocompleteChange = (name: string, value: string) => set(name, value);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            set(name, (e.target as HTMLInputElement).checked);
        } else if (name === 'origin_type' && !['CY', 'CFS'].includes(value)) {
            // Switching to Door — clear port field and locode
            setFormData(prev => ({ ...prev, origin_type: value, origin_district: '', origin_locode: '' }));
        } else if (name === 'dest_type' && !['CY', 'CFS'].includes(value)) {
            // Switching to Door — clear port field and locode
            setFormData(prev => ({ ...prev, dest_type: value, dest_district: '', dest_locode: '' }));
        } else {
            set(name, value);
        }
    };

    // Called when PortAutocomplete selects a result — captures UNLOCODE
    const handlePortSelect = (field: 'origin' | 'dest') => (result: PortResult) => {
        const display = result.code ? `${result.city} (${result.code})` : result.city;
        if (field === 'origin') {
            setFormData(prev => ({ ...prev, origin_district: display, origin_locode: result.code }));
        } else {
            setFormData(prev => ({ ...prev, dest_district: display, dest_locode: result.code }));
        }
    };

    // Called when CommodityAutocomplete selects — auto-fills HS code
    const handleCommoditySelect = (_name: string, hsCode: string) => {
        if (hsCode) set('hs_code', hsCode);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        setLoading(true);
        try {
            if (!user) { setFormError('You must be logged in to submit a request.'); setLoading(false); return; }
            if (!formData.origin_district.trim()) { setFormError('Origin port or address is required.'); setLoading(false); return; }
            if (!formData.dest_district.trim()) { setFormError('Destination port or address is required.'); setLoading(false); return; }
            if (!formData.commodity.trim()) { setFormError('Commodity is required — forwarders need this to quote accurately.'); setLoading(false); return; }
            if (formData.mode === 'FCL' && !formData.container_type) { setFormError('Please select a container type.'); setLoading(false); return; }
            if (!formData.weight || parseFloat(formData.weight) <= 0) {
                setFormError('Please enter a valid gross weight.'); setLoading(false); return;
            }

            const originC = countries.find((c: Country) => c.code === formData.origin_country);
            const destC = countries.find((c: Country) => c.code === formData.dest_country);
            const dialCode = originC?.dial_code || '';

            // Build special_requirements to include extra logistics fields
            const extras = [
                formData.hs_code && `HS Code: ${formData.hs_code}`,
                formData.is_hazardous && `IMO Class: ${formData.imo_class} | UN: ${formData.un_number} | PG: ${formData.packing_group}`,
                formData.is_reefer && `Temp Range: ${formData.temp_min}°C to ${formData.temp_max}°C`,
                formData.customs_origin && 'Origin customs clearance required',
                formData.customs_dest && 'Destination customs clearance required',
                formData.delivery_date && `Required delivery by: ${formData.delivery_date}`,
                formData.notes,
            ].filter(Boolean).join(' | ');

            const payload = {
                user_id: user.id,
                sovereign_id: user.sovereign_id || '',
                name: user.name || user.email || 'Client',
                email: user.email,
                phone: `${dialCode} ${formData.phone}`.trim(),
                origin: formData.origin_district || (originC?.name || formData.origin_country),
                origin_locode: formData.origin_locode,
                origin_type: formData.origin_type,
                destination: formData.dest_district || (destC?.name || formData.dest_country),
                destination_locode: formData.dest_locode,
                destination_type: formData.dest_type,
                cargo_type: formData.mode === 'FCL' ? 'FCL' : formData.mode === 'LCL' ? 'LCL' : formData.mode === 'Air' ? 'AIR' : 'TRUCK',
                commodity: formData.commodity,
                hs_code: formData.hs_code,
                cargo_specification: formData.cargo_specification,
                packing_type: formData.packing_type.toUpperCase(),
                quantity: parseInt(formData.quantity) || 1,
                weight: parseFloat(formData.weight) || 0,
                weight_unit: formData.weight_unit,
                total_volume_cbm: parseFloat(formData.total_volume_cbm) || null,
                container_count: formData.mode === 'FCL' ? (parseInt(formData.container_count) || 1) : null,
                container_type: formData.mode === 'FCL' ? formData.container_type : '',
                dimensions: `${formData.length}x${formData.width}x${formData.height}`,
                dim_unit: formData.dim_unit,
                is_stackable: formData.is_stackable,
                is_hazardous: formData.is_hazardous,
                needs_insurance: formData.needs_insurance,
                pickup_ready_date: formData.pickup_ready_date || null,
                target_date: formData.delivery_date || null,
                special_requirements: extras,
                vessel: formData.vessel,
                incoterms: formData.incoterms,
                currency: 'USD',
            };

            const token = localStorage.getItem('token');
            const res = await apiFetch('/api/marketplace/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (data.success) router.push(`/marketplace/${data.uniqueId}`);
            else setFormError(data.detail || data.message || 'Unknown error. Please try again.');
        } catch { setFormError('Network error. Please check your connection.'); }
        finally { setLoading(false); }
    };

    const originC = countries.find((c: Country) => c.code === formData.origin_country);
    const destC2 = countries.find((c: Country) => c.code === formData.dest_country);
    const uiDialCode = originC?.dial_code || '';

    const iOcean = formData.mode === 'FCL' || formData.mode === 'LCL';
    const isFCL = formData.mode === 'FCL';

    const CARGO_SPECS: Record<string, string[]> = {
        FCL: ['General Cargo', 'Dry Bulk', 'Reefer', 'Hazardous (DG)', 'Oversized / OOG', 'Ro-Ro', 'Break Bulk'],
        LCL: ['General Cargo', 'Dry Bulk', 'Liquid Bulk', 'Reefer', 'Hazardous (DG)', 'Oversized / OOG'],
        Air: ['General Cargo', 'Valuable (VAL)', 'Vulnerable (VUN)', 'Perishable (PER)', 'Cold-chain (COL)', 'Live Animals (AVI)', 'Dangerous Goods (DGR)'],
        Truck: ['General Cargo', 'FTL – Full Truckload', 'LTL – Part Load', 'Hazardous', 'Oversized / OOG', 'Refrigerated'],
    };

    const card = 'bg-[#0a0a0a] border border-white/[0.06] rounded-2xl p-6 space-y-5';
    const lbl = 'block text-[10px] font-semibold text-zinc-500 uppercase tracking-[0.15em] mb-2 font-inter';
    const inp = 'w-full bg-black border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-700 font-inter';
    const sel = 'w-full bg-black border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white appearance-none font-inter cursor-pointer';
    const hdr = 'flex items-center gap-2.5 pb-1';

    // Static color map — Tailwind can't detect dynamically constructed class names
    const TOGGLE_COLORS: Record<string, { wrap: string; check: string; icon: string; text: string }> = {
        emerald: { wrap: 'border-emerald-500/30 bg-emerald-500/[0.06]', check: 'text-emerald-400', icon: 'text-emerald-400', text: 'text-emerald-300' },
        red:     { wrap: 'border-red-500/30 bg-red-500/[0.06]',         check: 'text-red-400',     icon: 'text-red-400',     text: 'text-red-300' },
        blue:    { wrap: 'border-blue-500/30 bg-blue-500/[0.06]',       check: 'text-blue-400',    icon: 'text-blue-400',    text: 'text-blue-300' },
        amber:   { wrap: 'border-amber-500/30 bg-amber-500/[0.06]',     check: 'text-amber-400',   icon: 'text-amber-400',   text: 'text-amber-300' },
    };

    const ToggleCard = ({ name, checked, label, icon: Icon, color = 'emerald' }: { name: string; checked: boolean; label: string; icon: any; color?: string }) => {
        const c = TOGGLE_COLORS[color] || TOGGLE_COLORS.emerald;
        return (
            <button type="button" onClick={() => set(name, !checked)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${checked ? c.wrap : 'border-white/[0.06] hover:border-white/15'}`}>
                {checked
                    ? <CheckSquare className={`w-4 h-4 ${c.check} flex-shrink-0`} />
                    : <Square className="w-4 h-4 text-zinc-600 flex-shrink-0" />}
                <div className="flex items-center gap-2">
                    <Icon className={`w-3.5 h-3.5 ${checked ? c.icon : 'text-zinc-600'}`} />
                    <span className={`text-xs font-semibold font-inter ${checked ? c.text : 'text-zinc-500'}`}>{label}</span>
                </div>
            </button>
        );
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
            <Navbar />

            <div className="max-w-3xl mx-auto px-4 py-28 pb-20">
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                    <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-[0.2em] mb-3 font-inter">Freight Request</p>
                    <h1 className="text-3xl font-bold tracking-tight font-outfit mb-2">Request a Quote</h1>
                    <p className="text-sm text-zinc-500 font-inter">Verified forwarders respond with competitive quotes — usually within hours.</p>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* ── 1. SHIPMENT TYPE ── */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }} className={card}>
                        <div className={hdr}>
                            <Ship className="w-3.5 h-3.5 text-emerald-500" />
                            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 font-inter">Shipment Type</h2>
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                            {[
                                { value: 'FCL', label: 'FCL', sub: 'Full Container', icon: Ship },
                                { value: 'LCL', label: 'LCL', sub: 'Shared Container', icon: Package },
                                { value: 'Air', label: 'Air', sub: 'Air Freight', icon: Plane },
                                { value: 'Truck', label: 'Road', sub: 'FTL / LTL', icon: Truck },
                            ].map(({ value, label, sub, icon: Icon }) => (
                                <button key={value} type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, mode: value, cargo_specification: 'General Cargo', container_type: '' }))}
                                    className={`flex flex-col items-center gap-1.5 py-4 px-2 rounded-xl border transition-all ${formData.mode === value ? 'bg-white text-black border-white' : 'border-white/[0.08] text-zinc-500 hover:border-white/20 hover:text-zinc-300'}`}>
                                    <Icon className="w-5 h-5" />
                                    <span className="text-xs font-bold font-inter">{label}</span>
                                    <span className={`text-[9px] font-inter ${formData.mode === value ? 'text-zinc-500' : 'text-zinc-700'}`}>{sub}</span>
                                </button>
                            ))}
                        </div>

                        {/* FCL Container Type */}
                        {isFCL && (
                            <div>
                                <label className={lbl}>Container Type *</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {CONTAINER_TYPES.map(ct => (
                                        <button key={ct.value} type="button"
                                            onClick={() => set('container_type', formData.container_type === ct.value ? '' : ct.value)}
                                            className={`py-2.5 rounded-xl border text-[10px] font-semibold font-inter transition-all ${formData.container_type === ct.value ? 'bg-white text-black border-white' : 'border-white/[0.08] text-zinc-600 hover:border-white/20 hover:text-zinc-400'}`}>
                                            {ct.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* FCL: container count | LCL+Air: weight/vol/dims */}
                        {isFCL ? (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={lbl}>Number of Containers</label>
                                    <input type="number" min="1" name="container_count" value={formData.container_count} onChange={handleChange}
                                        onWheel={e => (e.target as HTMLElement).blur()} placeholder="1" className={inp} />
                                </div>
                                <div>
                                    <label className={lbl}>Gross Weight (per container)</label>
                                    <div className="flex">
                                        <input type="number" min="0" name="weight" value={formData.weight} onChange={handleChange}
                                            onWheel={e => (e.target as HTMLElement).blur()} placeholder="e.g. 18000"
                                            className="flex-1 bg-black border border-white/[0.06] border-r-0 rounded-l-xl px-4 py-3 text-sm text-white placeholder-zinc-700 font-inter" />
                                        <select name="weight_unit" value={formData.weight_unit} onChange={handleChange}
                                            className="bg-zinc-900 border border-white/[0.06] border-l-0 rounded-r-xl px-3 text-xs font-bold text-zinc-400 font-inter cursor-pointer">
                                            <option value="KGM">KG</option>
                                            <option value="LBS">LB</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={lbl}>Gross Weight *</label>
                                        <div className="flex">
                                            <input type="number" min="0" name="weight" value={formData.weight} onChange={handleChange}
                                                onWheel={e => (e.target as HTMLElement).blur()} placeholder="e.g. 500"
                                                className="flex-1 bg-black border border-white/[0.06] border-r-0 rounded-l-xl px-4 py-3 text-sm text-white placeholder-zinc-700 font-inter" />
                                            <select name="weight_unit" value={formData.weight_unit} onChange={handleChange}
                                                className="bg-zinc-900 border border-white/[0.06] border-l-0 rounded-r-xl px-3 text-xs font-bold text-zinc-400 font-inter cursor-pointer">
                                                <option value="KGM">KG</option>
                                                <option value="LBS">LB</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className={lbl}>Total Volume (CBM)</label>
                                        <input type="number" step="0.01" min="0" name="total_volume_cbm" value={formData.total_volume_cbm}
                                            onChange={handleChange} onWheel={e => (e.target as HTMLElement).blur()} placeholder="e.g. 3.5" className={inp} />
                                    </div>
                                </div>
                                <div>
                                    <label className={lbl}>Dimensions per Piece (L × W × H)</label>
                                    <div className="flex gap-2">
                                        {['length', 'width', 'height'].map((dim, i) => (
                                            <input key={dim} type="number" min="0" name={dim}
                                                value={formData[dim as keyof typeof formData] as string}
                                                onChange={handleChange} onWheel={e => (e.target as HTMLElement).blur()}
                                                placeholder={['L', 'W', 'H'][i]}
                                                className="flex-1 bg-black border border-white/[0.06] rounded-xl px-3 py-3 text-sm text-white placeholder-zinc-700 font-inter text-center" />
                                        ))}
                                        <select name="dim_unit" value={formData.dim_unit} onChange={handleChange}
                                            className="h-full bg-zinc-900 border border-white/[0.06] rounded-xl px-3 py-3 text-xs font-bold text-zinc-400 font-inter cursor-pointer min-w-[56px]">
                                            <option value="CM">CM</option>
                                            <option value="IN">IN</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* ── 2. ROUTE ── */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className={card}>
                        <div className={hdr}>
                            <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 font-inter">Route</h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Origin */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    <span className="text-xs font-semibold text-zinc-300 font-inter">Origin</span>
                                </div>
                                <div>
                                    <label className={lbl}>Country</label>
                                    <select name="origin_country" value={formData.origin_country} onChange={handleChange} className={sel}>
                                        {countries.map((c: Country) => <option key={c.code} value={c.code} className="bg-zinc-900">{getFlagEmoji(c.code)} {c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={lbl}>Port / City / Address *</label>
                                    {['CY', 'CFS'].includes(formData.origin_type)
                                        ? <PortAutocomplete name="origin_district" value={formData.origin_district} onChange={handleAutocompleteChange} onSelect={handlePortSelect('origin')} placeholder="Search port or terminal..." countryCode={formData.origin_country} countryName={originC?.name} termType={formData.origin_type} />
                                        : <input type="text" name="origin_district" value={formData.origin_district} onChange={handleChange} placeholder="Factory / warehouse address" className={inp} />}
                                </div>
                                <div>
                                    <label className={lbl}>Pickup Type</label>
                                    <select name="origin_type" value={formData.origin_type} onChange={handleChange} className={sel}>
                                        <option value="CY" className="bg-zinc-900">CY – Container Yard (Port)</option>
                                        <option value="CFS" className="bg-zinc-900">CFS – Container Freight Station</option>
                                        <option value="Door" className="bg-zinc-900">Door – Factory / Warehouse</option>
                                    </select>
                                </div>
                            </div>
                            {/* Destination */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                                    <span className="text-xs font-semibold text-zinc-300 font-inter">Destination</span>
                                </div>
                                <div>
                                    <label className={lbl}>Country</label>
                                    <select name="dest_country" value={formData.dest_country} onChange={handleChange} className={sel}>
                                        {countries.map((c: Country) => <option key={c.code} value={c.code} className="bg-zinc-900">{getFlagEmoji(c.code)} {c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={lbl}>Port / City / Address *</label>
                                    {['CY', 'CFS'].includes(formData.dest_type)
                                        ? <PortAutocomplete name="dest_district" value={formData.dest_district} onChange={handleAutocompleteChange} onSelect={handlePortSelect('dest')} placeholder="Search port or terminal..." countryCode={formData.dest_country} countryName={destC2?.name} termType={formData.dest_type} />
                                        : <input type="text" name="dest_district" value={formData.dest_district} onChange={handleChange} placeholder="Warehouse / delivery address" className={inp} />}
                                </div>
                                <div>
                                    <label className={lbl}>Delivery Type</label>
                                    <select name="dest_type" value={formData.dest_type} onChange={handleChange} className={sel}>
                                        <option value="Door" className="bg-zinc-900">Door – Warehouse / Address</option>
                                        <option value="CY" className="bg-zinc-900">CY – Container Yard (Port)</option>
                                        <option value="CFS" className="bg-zinc-900">CFS – Container Freight Station</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className={lbl}>Incoterms *</label>
                            <div className="grid grid-cols-5 gap-2">
                                {INCOTERMS.map(t => (
                                    <button key={t} type="button" onClick={() => set('incoterms', t)}
                                        className={`py-2 rounded-xl border text-xs font-bold font-inter transition-all ${formData.incoterms === t ? 'bg-white text-black border-white' : 'border-white/[0.08] text-zinc-600 hover:border-white/20 hover:text-zinc-400'}`}>
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* ── 3. CARGO ── */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className={card}>
                        <div className={hdr}>
                            <Package className="w-3.5 h-3.5 text-zinc-400" />
                            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 font-inter">Cargo Details</h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-5">
                            <div>
                                <label className={lbl}>Commodity / Product *</label>
                                <CommodityAutocomplete name="commodity" value={formData.commodity} onChange={handleAutocompleteChange} onSelectItem={handleCommoditySelect} placeholder="e.g. Lithium-Ion Batteries" />
                                <div className="mt-2 flex items-center gap-2">
                                    <input type="text" name="hs_code" value={formData.hs_code} onChange={handleChange}
                                        placeholder="HS Code (e.g. 8507.60)"
                                        className="flex-1 bg-black border border-white/[0.06] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-700 font-mono font-inter" />
                                    <a href="/tools/hs-codes" target="_blank" className="text-[9px] text-zinc-600 hover:text-zinc-300 uppercase tracking-widest font-inter whitespace-nowrap transition-colors">Look up →</a>
                                </div>
                            </div>
                            <div>
                                <label className={lbl}>Cargo Handling Type</label>
                                <div className="grid grid-cols-2 gap-1.5">
                                    {(CARGO_SPECS[formData.mode] || ['General Cargo']).map(opt => (
                                        <button key={opt} type="button" onClick={() => set('cargo_specification', opt)}
                                            className={`text-left px-3 py-2 rounded-lg border text-[10px] font-inter transition-all ${formData.cargo_specification === opt ? 'bg-white/[0.06] border-white/20 text-white' : 'border-white/[0.05] text-zinc-600 hover:text-zinc-400 hover:border-white/15'}`}>
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                            <div>
                                <label className={lbl}>Packing Type</label>
                                <select name="packing_type" value={formData.packing_type} onChange={handleChange} className={sel}>
                                    {['Pallets', 'Boxes / Cartons', 'Crates', 'Drums', 'Bags', 'Loose / Bulk', 'Rolls'].map(p => (
                                        <option key={p} className="bg-zinc-900">{p}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={lbl}>Number of Pieces</label>
                                <input type="number" min="0" name="quantity" value={formData.quantity} onChange={handleChange}
                                    onWheel={e => (e.target as HTMLElement).blur()} placeholder="e.g. 50" className={inp} />
                            </div>
                            {iOcean && (
                                <div>
                                    <label className={lbl}>Preferred Vessel</label>
                                    <VesselAutocomplete name="vessel" value={formData.vessel} onChange={handleAutocompleteChange} placeholder="IMO or ship name..." />
                                </div>
                            )}
                        </div>

                        {/* Cargo Flags */}
                        <div>
                            <label className={lbl}>Cargo Properties</label>
                            <div className="grid grid-cols-3 gap-2">
                                <ToggleCard name="is_stackable" checked={formData.is_stackable} label="Stackable" icon={Layers} color="emerald" />
                                <ToggleCard name="is_hazardous" checked={formData.is_hazardous} label="Hazardous DG" icon={ShieldAlert} color="red" />
                                <ToggleCard name="is_reefer" checked={formData.is_reefer} label="Temperature Controlled" icon={Thermometer} color="blue" />
                            </div>
                        </div>

                        {/* Hazardous fields */}
                        {formData.is_hazardous && (
                            <div className="bg-red-500/[0.03] border border-red-500/15 rounded-xl p-4 space-y-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                                    <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest font-inter">Dangerous Goods Details</span>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className={lbl}>IMO Class</label>
                                        <select name="imo_class" value={formData.imo_class} onChange={handleChange} className={sel}>
                                            <option value="">Select class...</option>
                                            {IMO_CLASSES.map(c => <option key={c} className="bg-zinc-900">{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={lbl}>UN Number</label>
                                        <input type="text" name="un_number" value={formData.un_number} onChange={handleChange}
                                            placeholder="e.g. UN3480" className={inp} />
                                    </div>
                                    <div>
                                        <label className={lbl}>Packing Group</label>
                                        <select name="packing_group" value={formData.packing_group} onChange={handleChange} className={sel}>
                                            <option value="">Select...</option>
                                            {PACKING_GROUPS.map(p => <option key={p} className="bg-zinc-900">{p}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Reefer fields */}
                        {formData.is_reefer && (
                            <div className="bg-blue-500/[0.03] border border-blue-500/15 rounded-xl p-4 space-y-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <Thermometer className="w-3.5 h-3.5 text-blue-400" />
                                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest font-inter">Temperature Requirements</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={lbl}>Min Temp (°C)</label>
                                        <input type="number" name="temp_min" value={formData.temp_min} onChange={handleChange}
                                            placeholder="e.g. -18" className={inp} />
                                    </div>
                                    <div>
                                        <label className={lbl}>Max Temp (°C)</label>
                                        <input type="number" name="temp_max" value={formData.temp_max} onChange={handleChange}
                                            placeholder="e.g. -15" className={inp} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* ── 4. SERVICES & TIMELINE ── */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className={card}>
                        <div className={hdr}>
                            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 font-inter">Services & Timeline</h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-5">
                            <div>
                                <label className={lbl}>Cargo Ready Date *</label>
                                <input type="date" name="pickup_ready_date" value={formData.pickup_ready_date} onChange={handleChange} style={{ colorScheme: 'dark' }} className={inp} />
                            </div>
                            <div>
                                <label className={lbl}>Required Delivery By</label>
                                <input type="date" name="delivery_date" value={formData.delivery_date} onChange={handleChange} style={{ colorScheme: 'dark' }} className={inp} />
                            </div>
                        </div>

                        <div>
                            <label className={lbl}>Additional Services Needed</label>
                            <div className="grid grid-cols-3 gap-2">
                                <ToggleCard name="needs_insurance" checked={formData.needs_insurance} label="Cargo Insurance" icon={FileText} color="emerald" />
                                <ToggleCard name="customs_origin" checked={formData.customs_origin} label="Origin Customs Clearance" icon={FileText} color="amber" />
                                <ToggleCard name="customs_dest" checked={formData.customs_dest} label="Destination Customs Clearance" icon={FileText} color="amber" />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-5">
                            <div>
                                <label className={lbl}>Contact Number</label>
                                <div className="flex bg-black border border-white/[0.06] rounded-xl overflow-hidden">
                                    <div className="flex items-center justify-center pl-4 pr-3 py-3 text-xs font-bold text-zinc-500 font-inter bg-white/[0.03] border-r border-white/[0.06] whitespace-nowrap select-none">
                                        {uiDialCode || '+'}
                                    </div>
                                    <input name="phone" type="tel" value={formData.phone}
                                        onChange={e => {
                                            let val = e.target.value.replace(/\D/g, '');
                                            val = formData.origin_country === 'IN' ? val.slice(0, 10) : val.slice(0, 15);
                                            set('phone', val);
                                        }}
                                        placeholder={formData.origin_country === 'IN' ? '10-digit number' : 'Phone number'}
                                        className="flex-1 bg-transparent px-3 py-3 text-sm text-white placeholder-zinc-700 font-inter" />
                                </div>
                            </div>
                            <div>
                                <label className={lbl}>Special Instructions</label>
                                <textarea name="notes" value={formData.notes} onChange={handleChange} rows={2}
                                    placeholder="Any special handling, delivery windows, or notes..."
                                    className="w-full bg-black border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-700 font-inter resize-none" />
                            </div>
                        </div>

                        <p className="text-[10px] text-zinc-600 font-inter flex items-center gap-1.5">
                            <Info className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                            Your contact details are shared only with forwarders who respond to your request.
                        </p>
                    </motion.div>

                    {formError && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-xs text-red-400 font-inter">
                            {formError}
                        </div>
                    )}

                    <motion.button type="submit" disabled={loading}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                        className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-zinc-100 transition-all flex items-center justify-center gap-3 text-sm tracking-wide font-inter disabled:opacity-50 shadow-2xl active:scale-[0.99]">
                        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <>Submit to Forwarder Network <ArrowRight className="w-4 h-4" /></>}
                    </motion.button>

                </form>

                {/* ── Trust / How it works ── */}
                <div className="mt-16 space-y-10 pb-10">
                    {/* How it works */}
                    <div>
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-6 font-inter">How it works</p>
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { step: '01', title: 'Submit Your Request', desc: 'Fill in your cargo details — route, container type, weight, and timeline.' },
                                { step: '02', title: 'Forwarders Compete', desc: 'Verified freight forwarders matched to your trade lane respond with competitive quotes.' },
                                { step: '03', title: 'Book & Track', desc: 'Accept the best offer and manage your shipment from one dashboard.' },
                            ].map(item => (
                                <div key={item.step} className="bg-[#0a0a0a] border border-white/[0.06] rounded-2xl p-5 space-y-3">
                                    <span className="text-[10px] font-mono font-bold text-emerald-500">{item.step}</span>
                                    <h3 className="text-sm font-bold text-white font-inter leading-snug">{item.title}</h3>
                                    <p className="text-xs text-zinc-500 font-inter leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Trust badges */}
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { value: '100+', label: 'Verified Forwarders' },
                            { value: '195',  label: 'Countries Covered' },
                            { value: '< 4h', label: 'Avg. First Response' },
                        ].map(stat => (
                            <div key={stat.label} className="bg-[#0a0a0a] border border-white/[0.06] rounded-2xl p-5 text-center">
                                <p className="text-2xl font-bold text-white font-mono">{stat.value}</p>
                                <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-inter mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Testimonial */}
                    <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-2xl p-6 space-y-4">
                        <p className="text-sm text-zinc-300 font-inter leading-relaxed">
                            &ldquo;We got 6 quotes within 3 hours for a 40HC container from Shanghai to Rotterdam. CargoLink saved us 18% compared to our usual forwarder.&rdquo;
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-white">A</div>
                            <div>
                                <p className="text-xs font-bold text-white font-inter">Arjun S.</p>
                                <p className="text-[10px] text-zinc-600 font-inter">Import Manager, Mumbai</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
