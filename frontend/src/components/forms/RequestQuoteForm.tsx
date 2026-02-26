'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import {
    Ship, Plane, Truck, Calendar, Package, Layers,
    ShieldAlert, FileText, Anchor, ArrowRight, Loader2, Info
} from 'lucide-react';
import { countries } from '@/lib/countries';
import { API_URL } from '@/lib/config';
import Navbar from '@/components/layout/Navbar';

interface Country {
    name: string;
    code: string;
    dial_code: string;
}

// --- Helpers ---
const getFlagEmoji = (countryCode: string) => {
    if (!countryCode) return '🌐';
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}

export default function RequestQuoteForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    // Advanced Form State (Matches Screenshot Logic)
    const [formData, setFormData] = useState({
        // Identity
        phone: '',

        // Mode
        mode: 'Ocean',

        // Origin
        origin_country: 'CN',
        origin_district: '',
        origin_type: 'Port', // Port, Door, CFS

        // Destination
        dest_country: 'US',
        dest_district: '',
        dest_type: 'Door', // Porte, Door, CFS

        // Timing & Product
        process_date: '', // "Select arrival date"
        commodity: '', // "What is the cargo?"

        // Specs
        packing_type: 'Pallets', // "How is your cargo packed"
        incoterms: 'FOB',
        quantity: '',

        // Weight
        weight: '',
        weight_unit: 'KGM',

        // Dims
        length: '',
        width: '',
        height: '',
        dim_unit: 'CM',

        // Options
        is_stackable: false,
        is_hazardous: false,
        needs_insurance: false,

        notes: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        // Handle Checkboxes
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!user) {
                alert("Please log in to submit a request.");
                setLoading(false);
                return;
            }

            // Pack the rich data into 'cargo_details' as a JSON string
            // This preserves the schema while allowing infinite flexibility.
            const cargoPayload = {
                mode: formData.mode,
                origin: {
                    country: formData.origin_country,
                    district: formData.origin_district,
                    type: formData.origin_type
                },
                destination: {
                    country: formData.dest_country,
                    district: formData.dest_district,
                    type: formData.dest_type
                },
                specs: {
                    commodity: formData.commodity,
                    packing: formData.packing_type,
                    incoterms: formData.incoterms,
                    quantity: formData.quantity,
                    weight: `${formData.weight} ${formData.weight_unit}`,
                    dims: `${formData.length}x${formData.width}x${formData.height} ${formData.dim_unit}`
                },
                options: {
                    stackable: formData.is_stackable,
                    hazardous: formData.is_hazardous,
                    insurance: formData.needs_insurance
                },
                target_date: formData.process_date,
                notes: formData.notes
            };

            const payload = {
                user_id: user.id,
                sovereign_id: user.sovereign_id || '',
                name: user.name || user.email || 'Client',
                email: user.email,
                phone: formData.phone || '',
                origin: `${formData.origin_district || ''} ${formData.origin_country}`.trim(),
                destination: `${formData.dest_district || ''} ${formData.dest_country}`.trim(),
                cargo_type: formData.mode,
                weight: parseFloat(formData.weight) || 0,
                weight_unit: formData.weight_unit || 'KGM',
                dimensions: `${formData.length}x${formData.width}x${formData.height}`,
                dim_unit: formData.dim_unit || 'CM',
                special_requirements: `Commodity: ${formData.commodity} | Packing: ${formData.packing_type} | Hazard: ${formData.is_hazardous} | Stack: ${formData.is_stackable} | Notes: ${formData.notes}`,
                incoterms: formData.incoterms || 'FOB',
                currency: 'USD'
            };

            const res = await fetch(`${API_URL}/api/marketplace/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (data.success) {
                router.push(`/marketplace/${data.uniqueId}`);
            } else {
                const errorMsg = data.detail || data.message || 'Unknown Error';
                alert('Submission Rejected: ' + errorMsg);
            }
        } catch (error) {
            console.error(error);
            alert('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 py-32">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <h1 className="text-3xl font-bold mb-2 tracking-tight font-outfit uppercase">Operational Request</h1>
                    <p className="text-zinc-500 font-medium font-inter">Index a new quote request into the Sovereign Logistics Network.</p>
                </motion.div>

                <motion.form
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    onSubmit={handleSubmit}
                    className="bg-zinc-950 border border-white/5 rounded-[32px] p-8 md:p-12 shadow-2xl space-y-10"
                >
                    {/* 1. Mode Selection */}
                    <div className="space-y-4">
                        <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-inter">Transport Protocol *</label>
                        <div className="relative">
                            <Ship className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <select
                                name="mode"
                                value={formData.mode}
                                onChange={handleChange}
                                className="w-full bg-black border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-white appearance-none focus:border-white/20 outline-none transition-all font-inter"
                            >
                                <option value="Ocean">Ocean Freight (FCL/LCL)</option>
                                <option value="Air">Air Freight</option>
                                <option value="Truck">Road Freight (FTL/LTL)</option>
                            </select>
                        </div>
                    </div>

                    <div className="h-px bg-white/5" />

                    {/* 2. Route Details (Grid) */}
                    <div className="grid md:grid-cols-2 gap-12">
                        {/* Origin */}
                        <div className="space-y-6">
                            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] font-outfit text-zinc-400 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Origin Node
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[8px] font-bold text-zinc-600 uppercase tracking-widest mb-2 font-inter">Territory Control</label>
                                    <select
                                        name="origin_country"
                                        value={formData.origin_country}
                                        onChange={handleChange}
                                        className="w-full bg-black border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white focus:border-white/20 appearance-none cursor-pointer outline-none font-inter"
                                    >
                                        {countries.map((c: Country) => <option key={c.code} value={c.code} className="bg-zinc-900">{getFlagEmoji(c.code)} {c.name}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="block text-[8px] font-bold text-zinc-600 uppercase tracking-widest font-inter">District</label>
                                        <input
                                            name="origin_district"
                                            value={formData.origin_district}
                                            onChange={handleChange}
                                            placeholder="Shanghai"
                                            className="w-full bg-black border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white focus:border-white/20 outline-none font-inter"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-[8px] font-bold text-zinc-600 uppercase tracking-widest font-inter">Terminal Type</label>
                                        <select
                                            name="origin_type"
                                            value={formData.origin_type}
                                            onChange={handleChange}
                                            className="w-full bg-black border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white focus:border-white/20 appearance-none cursor-pointer outline-none font-inter"
                                        >
                                            <option value="Port" className="bg-zinc-900">Port / Airport</option>
                                            <option value="Door" className="bg-zinc-900">Factory / Door</option>
                                            <option value="CFS" className="bg-zinc-900">Container Station</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Destination */}
                        <div className="space-y-6">
                            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] font-outfit text-zinc-400 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500"></span> Destination Node
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[8px] font-bold text-zinc-600 uppercase tracking-widest mb-2 font-inter">Target Territory</label>
                                    <select
                                        name="dest_country"
                                        value={formData.dest_country}
                                        onChange={handleChange}
                                        className="w-full bg-black border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white focus:border-white/20 appearance-none cursor-pointer outline-none font-inter"
                                    >
                                        {countries.map((c: Country) => <option key={c.code} value={c.code} className="bg-zinc-900">{getFlagEmoji(c.code)} {c.name}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="block text-[8px] font-bold text-zinc-600 uppercase tracking-widest font-inter">District</label>
                                        <input
                                            name="dest_district"
                                            value={formData.dest_district}
                                            onChange={handleChange}
                                            placeholder="Los Angeles"
                                            className="w-full bg-black border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white focus:border-white/20 outline-none font-inter"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-[8px] font-bold text-zinc-600 uppercase tracking-widest font-inter">Terminal Type</label>
                                        <select
                                            name="dest_type"
                                            value={formData.dest_type}
                                            onChange={handleChange}
                                            className="w-full bg-black border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white focus:border-white/20 appearance-none cursor-pointer outline-none font-inter"
                                        >
                                            <option value="Door" className="bg-zinc-900">Door / Warehouse</option>
                                            <option value="Port" className="bg-zinc-900">Port / Airport</option>
                                            <option value="CFS" className="bg-zinc-900">Container Station</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-white/5" />

                    {/* 3. Shipment Specs */}
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <label className="block text-[9px] font-bold text-zinc-600 uppercase tracking-widest font-inter">Operational Window (Target Date) *</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <input
                                    type="date"
                                    name="process_date"
                                    value={formData.process_date}
                                    onChange={handleChange}
                                    className="w-full bg-black border border-white/5 rounded-xl pl-12 pr-4 py-3 text-xs font-bold text-white focus:border-white/20 outline-none font-inter"
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="block text-[9px] font-bold text-zinc-600 uppercase tracking-widest font-inter">Cargo Specification *</label>
                            <div className="relative">
                                <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <input
                                    type="text"
                                    name="commodity"
                                    value={formData.commodity}
                                    onChange={handleChange}
                                    placeholder="e.g. Lithium-Ion Modules"
                                    className="w-full bg-black border border-white/5 rounded-xl pl-12 pr-4 py-3 text-xs font-bold text-white focus:border-white/20 outline-none font-inter"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <label className="block text-[9px] font-bold text-zinc-600 uppercase tracking-widest font-inter">Packaging Unit</label>
                                <select
                                    name="packing_type"
                                    value={formData.packing_type}
                                    onChange={handleChange}
                                    className="w-full bg-black border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white focus:border-white/20 appearance-none cursor-pointer outline-none font-inter"
                                >
                                    <option value="Pallets" className="bg-zinc-900">Pallets</option>
                                    <option value="Boxes" className="bg-zinc-900">Boxes / Cartons</option>
                                    <option value="Crates" className="bg-zinc-900">Crates</option>
                                    <option value="Loose" className="bg-zinc-900">Loose / Bulk</option>
                                </select>
                            </div>
                            <div className="space-y-4">
                                <label className="block text-[9px] font-bold text-zinc-600 uppercase tracking-widest font-inter">Operational Quantity</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    placeholder="100"
                                    className="w-full bg-black border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white focus:border-white/20 outline-none font-inter"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <label className="block text-[9px] font-bold text-zinc-600 uppercase tracking-widest font-inter">Incoterms Strategy</label>
                                <select
                                    name="incoterms"
                                    value={formData.incoterms}
                                    onChange={handleChange}
                                    className="w-full bg-black border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white focus:border-white/20 appearance-none cursor-pointer outline-none font-inter"
                                >
                                    <option value="FOB" className="bg-zinc-900">FOB</option>
                                    <option value="EXW" className="bg-zinc-900">EXW</option>
                                    <option value="CIF" className="bg-zinc-900">CIF</option>
                                    <option value="DDP" className="bg-zinc-900">DDP</option>
                                </select>
                            </div>
                            <div className="space-y-4">
                                <label className="block text-[9px] font-bold text-zinc-600 uppercase tracking-widest font-inter">Mass Allocation</label>
                                <div className="flex">
                                    <input
                                        type="number"
                                        name="weight"
                                        value={formData.weight}
                                        onChange={handleChange}
                                        placeholder="500"
                                        className="w-full bg-black border border-white/5 border-r-0 rounded-l-xl px-4 py-3 text-xs font-bold text-white focus:border-white/20 outline-none font-inter"
                                    />
                                    <select
                                        name="weight_unit"
                                        value={formData.weight_unit}
                                        onChange={handleChange}
                                        className="bg-zinc-900 border border-white/5 border-l-0 rounded-r-xl px-3 text-[10px] font-bold text-zinc-500 focus:outline-none font-inter"
                                    >
                                        <option value="KGM">KG</option>
                                        <option value="LBS">LB</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 4. Measurements */}
                    <div className="space-y-4">
                        <label className="block text-[9px] font-bold text-zinc-600 uppercase tracking-widest font-inter">Volumetric Protocol (L x W x H)</label>
                        <div className="flex gap-4">
                            <input
                                type="number" name="length" placeholder="L"
                                value={formData.length} onChange={handleChange}
                                className="w-full bg-black border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white focus:border-white/20 outline-none text-center font-inter"
                            />
                            <input
                                type="number" name="width" placeholder="W"
                                value={formData.width} onChange={handleChange}
                                className="w-full bg-black border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white focus:border-white/20 outline-none text-center font-inter"
                            />
                            <input
                                type="number" name="height" placeholder="H"
                                value={formData.height} onChange={handleChange}
                                className="w-full bg-black border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white focus:border-white/20 outline-none text-center font-inter"
                            />
                            <select
                                name="dim_unit"
                                value={formData.dim_unit}
                                onChange={handleChange}
                                className="bg-zinc-900 border border-white/5 rounded-xl px-4 text-[10px] font-bold text-zinc-500 focus:outline-none font-inter"
                            >
                                <option value="CM">CM</option>
                                <option value="IN">IN</option>
                            </select>
                        </div>
                    </div>

                    {/* 5. Options (Checkboxes) */}
                    <div className="space-y-4">
                        <label className="block text-[9px] font-bold text-zinc-600 uppercase tracking-widest font-inter">Additional Telemetry</label>
                        <div className="grid md:grid-cols-3 gap-4">
                            <label className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-2xl cursor-pointer hover:bg-white/[0.04] transition-all group">
                                <input
                                    type="checkbox"
                                    name="is_stackable"
                                    checked={formData.is_stackable}
                                    onChange={handleChange}
                                    className="w-4 h-4 accent-emerald-500"
                                />
                                <span className="text-[10px] font-bold font-inter text-zinc-500 group-hover:text-white flex items-center gap-2 uppercase tracking-widest"><Layers className="w-3.5 h-3.5 opacity-50" /> Stackable?</span>
                            </label>
                            <label className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-2xl cursor-pointer hover:bg-white/[0.04] transition-all group">
                                <input
                                    type="checkbox"
                                    name="is_hazardous"
                                    checked={formData.is_hazardous}
                                    onChange={handleChange}
                                    className="w-4 h-4 accent-red-500"
                                />
                                <span className="text-[10px] font-bold font-inter text-zinc-500 group-hover:text-white flex items-center gap-2 uppercase tracking-widest"><ShieldAlert className="w-3.5 h-3.5 opacity-50" /> Hazardous?</span>
                            </label>
                            <label className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-2xl cursor-pointer hover:bg-white/[0.04] transition-all group">
                                <input
                                    type="checkbox"
                                    name="needs_insurance"
                                    checked={formData.needs_insurance}
                                    onChange={handleChange}
                                    className="w-4 h-4 accent-emerald-500"
                                />
                                <span className="text-[10px] font-bold font-inter text-zinc-500 group-hover:text-white flex items-center gap-2 uppercase tracking-widest"><FileText className="w-3.5 h-3.5 opacity-50" /> Insurance?</span>
                            </label>
                        </div>
                    </div>

                    {/* 6. Notes */}
                    <div className="space-y-4">
                        <label className="block text-[9px] font-bold text-zinc-600 uppercase tracking-widest font-inter">Strategic Handling Notes</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            placeholder="Add specific operational instructions..."
                            className="w-full bg-black border border-white/5 rounded-2xl px-6 py-4 text-xs font-bold text-white focus:border-white/20 outline-none min-h-[120px] font-inter"
                        />
                        <p className="text-[8px] text-zinc-700 font-bold uppercase tracking-widest flex items-center gap-2">
                            <Info className="w-3 h-3 text-emerald-500" /> Identity signals will be automatically appended to the request packet.
                        </p>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-white text-black font-bold h-16 rounded-2xl hover:bg-zinc-200 transition-all flex items-center justify-center text-xs tracking-[0.2em] font-inter uppercase disabled:opacity-50 shadow-xl active:scale-[0.98]"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin mr-3" />
                                Indexing...
                            </>
                        ) : (
                            <>
                                Commit Quote Request <ArrowRight className="w-5 h-5 ml-3" />
                            </>
                        )}
                    </button>

                </motion.form>
            </div>
        </div>
    );
}
