'use client';

import Link from 'next/link';
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

export default function RequestQuoteForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    // Advanced Form State (Matches Screenshot Logic)
    const [formData, setFormData] = useState({
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
                // Flatten core fields for indexability if needed, 
                // but mostly we rely on the JSON blob.
                origin_city: formData.origin_district || formData.origin_country,
                origin_country: formData.origin_country,
                dest_city: formData.dest_district || formData.dest_country,
                dest_country: formData.dest_country,
                cargo_type: formData.mode,

                // Core fields expected by backend filter
                weight_kg: formData.weight,
                volume_cbm: '0', // Calculated or Optional

                cargo_details: JSON.stringify(cargoPayload), // THE WISE MOVE
                user_id: user.id
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
        <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black pb-20">
            {/* Navbar Placeholder */}
            <nav className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="font-bold text-2xl tracking-tighter">OMEGO</Link>
                </div>
            </nav>

            <div className="max-w-5xl mx-auto px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                >
                    <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">Request a Quote</h1>
                    <p className="text-gray-400">Complete the form below to receive competitive rates from verified forwarders.</p>
                </motion.div>

                <motion.form
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    onSubmit={handleSubmit}
                    className="bg-white text-black rounded-3xl p-6 md:p-10 shadow-2xl space-y-8"
                >
                    {/* 1. Mode Selection */}
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-tight">Shipping Mode *</label>
                        <div className="relative">
                            <Ship className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                                name="mode"
                                value={formData.mode}
                                onChange={handleChange}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-4 text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                            >
                                <option value="Ocean">Ocean Freight (FCL/LCL)</option>
                                <option value="Air">Air Freight</option>
                                <option value="Truck">Road Freight (FTL/LTL)</option>
                            </select>
                        </div>
                    </div>

                    <div className="h-px bg-gray-100" />

                    {/* 2. Route Details (Grid) */}
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Origin */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span> Origin
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Country *</label>
                                    <select
                                        name="origin_country"
                                        value={formData.origin_country}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 text-gray-900 focus:outline-none focus:border-blue-500"
                                    >
                                        {countries.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">City / District</label>
                                        <input
                                            name="origin_district"
                                            value={formData.origin_district}
                                            onChange={handleChange}
                                            placeholder="Shanghai"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 text-gray-900 focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Type *</label>
                                        <select
                                            name="origin_type"
                                            value={formData.origin_type}
                                            onChange={handleChange}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 text-gray-900 focus:outline-none focus:border-blue-500"
                                        >
                                            <option value="Port">Port / Airport</option>
                                            <option value="Door">Factory / Door</option>
                                            <option value="CFS">Container Station</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Destination */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-purple-500"></span> Destination
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Country *</label>
                                    <select
                                        name="dest_country"
                                        value={formData.dest_country}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 text-gray-900 focus:outline-none focus:border-blue-500"
                                    >
                                        {countries.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">City / District</label>
                                        <input
                                            name="dest_district"
                                            value={formData.dest_district}
                                            onChange={handleChange}
                                            placeholder="Los Angeles"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 text-gray-900 focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Type *</label>
                                        <select
                                            name="dest_type"
                                            value={formData.dest_type}
                                            onChange={handleChange}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 text-gray-900 focus:outline-none focus:border-blue-500"
                                        >
                                            <option value="Door">Door / Warehouse</option>
                                            <option value="Port">Port / Airport</option>
                                            <option value="CFS">Container Station</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-gray-100" />

                    {/* 3. Shipment Specs */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-tight mb-2">Arrival Date *</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="date"
                                    name="process_date"
                                    value={formData.process_date}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-tight mb-2">What is the Cargo? *</label>
                            <input
                                type="text"
                                name="commodity"
                                value={formData.commodity}
                                onChange={handleChange}
                                placeholder="Describe the cargo (e.g. Chairs)"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-tight mb-2">Packaging *</label>
                            <select
                                name="packing_type"
                                value={formData.packing_type}
                                onChange={handleChange}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500"
                            >
                                <option value="Pallets">Pallets</option>
                                <option value="Boxes">Boxes / Cartons</option>
                                <option value="Crates">Crates</option>
                                <option value="Loose">Loose / Bulk</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 uppercase tracking-tight mb-2">Incoterms</label>
                                <select
                                    name="incoterms"
                                    value={formData.incoterms}
                                    onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500"
                                >
                                    <option value="FOB">FOB</option>
                                    <option value="EXW">EXW</option>
                                    <option value="CIF">CIF</option>
                                    <option value="DDP">DDP</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 uppercase tracking-tight mb-2">Quantity *</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    placeholder="100"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 4. Measurements */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-tight mb-2">Total Weight *</label>
                            <div className="flex">
                                <input
                                    type="number"
                                    name="weight"
                                    value={formData.weight}
                                    onChange={handleChange}
                                    placeholder="500"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-l-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500"
                                />
                                <select
                                    name="weight_unit"
                                    value={formData.weight_unit}
                                    onChange={handleChange}
                                    className="bg-gray-100 border-y border-r border-gray-200 rounded-r-xl px-3 text-sm font-bold text-gray-600 focus:outline-none"
                                >
                                    <option value="KGM">KGs</option>
                                    <option value="LBS">LBs</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-tight mb-2">Dimensions (L x W x H)</label>
                            <div className="flex gap-2">
                                <input
                                    type="number" name="length" placeholder="L"
                                    value={formData.length} onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-gray-900 focus:outline-none focus:border-blue-500 text-center"
                                />
                                <input
                                    type="number" name="width" placeholder="W"
                                    value={formData.width} onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-gray-900 focus:outline-none focus:border-blue-500 text-center"
                                />
                                <input
                                    type="number" name="height" placeholder="H"
                                    value={formData.height} onChange={handleChange}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-gray-900 focus:outline-none focus:border-blue-500 text-center"
                                />
                                <select
                                    name="dim_unit"
                                    value={formData.dim_unit}
                                    onChange={handleChange}
                                    className="bg-gray-100 border border-gray-200 rounded-xl px-2 text-sm font-bold text-gray-600 focus:outline-none"
                                >
                                    <option value="CM">CM</option>
                                    <option value="IN">IN</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* 5. Options (Checkboxes) */}
                    <div className="space-y-4">
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-tight">Additional Items</label>
                        <div className="grid md:grid-cols-3 gap-4">
                            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                                <input
                                    type="checkbox"
                                    name="is_stackable"
                                    checked={formData.is_stackable}
                                    onChange={handleChange}
                                    className="w-5 h-5 accent-blue-600"
                                />
                                <span className="font-medium flex items-center gap-2"><Layers className="w-4 h-4 text-gray-400" /> Stackable?</span>
                            </label>
                            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                                <input
                                    type="checkbox"
                                    name="is_hazardous"
                                    checked={formData.is_hazardous}
                                    onChange={handleChange}
                                    className="w-5 h-5 accent-red-600"
                                />
                                <span className="font-medium flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-gray-400" /> Hazardous?</span>
                            </label>
                            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                                <input
                                    type="checkbox"
                                    name="needs_insurance"
                                    checked={formData.needs_insurance}
                                    onChange={handleChange}
                                    className="w-5 h-5 accent-green-600"
                                />
                                <span className="font-medium flex items-center gap-2"><FileText className="w-4 h-4 text-gray-400" /> Cargo Insurance?</span>
                            </label>
                        </div>
                    </div>

                    {/* 6. Notes */}
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-tight">Additional Notes</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            placeholder="Please include any specific handling instructions..."
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500 min-h-[100px]"
                        />
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Info className="w-3 h-3" /> Your contact details will be automatically added to the request when you submit.
                        </p>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white font-bold h-16 rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center text-lg disabled:opacity-50 shadow-lg shadow-blue-500/30"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                                Processing Request...
                            </>
                        ) : (
                            <>
                                SUBMIT QUOTE REQUEST <ArrowRight className="w-6 h-6 ml-2" />
                            </>
                        )}
                    </button>

                </motion.form>
            </div>
        </div>
    );
}
