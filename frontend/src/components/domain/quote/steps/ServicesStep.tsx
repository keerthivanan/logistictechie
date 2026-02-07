"use client";

import { useQuoteStore } from "@/hooks/use-quote";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Anchor, ShieldCheck, Zap } from "lucide-react";

export function ServicesStep() {
    // const { t } = useLanguage();
    const { formData, updateForm, nextStep, prevStep } = useQuoteStore();

    return (
        <div className="space-y-10">
            {/* Header Summary (Matching Screenshot) - Classic Theme */}
            <div className="bg-white/[0.03] rounded-2xl border border-white/10 p-6 flex flex-wrap gap-12 items-center text-sm shadow-2xl">
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Origin Network</span>
                    <span className="font-extrabold text-white flex items-center gap-2 text-base tracking-tighter">
                        <Anchor className="w-4 h-4 text-white" />
                        {formData.origin.split(',')[0]}
                    </span>
                </div>
                <div className="w-[1px] h-10 bg-white/10" />
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Destination Gateway</span>
                    <span className="font-extrabold text-white flex items-center gap-2 text-base tracking-tighter">
                        <Anchor className="w-4 h-4 text-white" />
                        {formData.destination.split(',')[0]}
                    </span>
                </div>
                <div className="w-[1px] h-10 bg-white/10" />
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Package Calibration</span>
                    <span className="font-extrabold text-white text-base tracking-tighter italic">1 x {formData.containerSize}&apos; HC Unit</span>
                </div>
            </div>

            <div className="bg-white/[0.02] p-10 rounded-3xl border border-white/10 shadow-3xl">
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <p className="text-xs font-black text-gray-500 uppercase tracking-[0.3em]">Step 04 — Compliance & Logistics</p>
                        <div className="h-px bg-white/10 flex-1" />
                    </div>
                    <h2 className="text-5xl font-black text-white tracking-tighter uppercase mb-2">Ancillary Services</h2>
                    <p className="text-gray-500 text-lg font-light">Verified compliance services to ensure 100% clearing and coverage.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-16">
                    {/* Left Column */}
                    <div className="space-y-12">
                        {/* Port Charges */}
                        <div className="space-y-6">
                            <h3 className="font-black text-white uppercase tracking-widest text-xs flex items-center gap-2">
                                <Zap className="w-4 h-4" /> Transit Port Charges
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4 bg-black/40 p-5 rounded-2xl border border-white/5 hover:border-white/20 transition-all group">
                                    <Switch
                                        id="agent-charges"
                                        checked={formData.portChargesCoveredBy === 'agent'}
                                        onCheckedChange={(c) => c && updateForm({ portChargesCoveredBy: 'agent' })}
                                        className="data-[state=checked]:bg-white"
                                    />
                                    <Label htmlFor="agent-charges" className="text-sm font-medium text-gray-400 group-hover:text-white cursor-pointer transition-colors leading-relaxed">
                                        Agent Settlement — My delivery agent will cover any supplier charges
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-4 bg-black/40 p-5 rounded-2xl border border-white/5 hover:border-white/20 transition-all group">
                                    <Switch
                                        id="supplier-charges"
                                        checked={formData.portChargesCoveredBy === 'supplier'}
                                        onCheckedChange={(c) => c && updateForm({ portChargesCoveredBy: 'supplier' })}
                                        className="data-[state=checked]:bg-white"
                                    />
                                    <Label htmlFor="supplier-charges" className="text-sm font-medium text-gray-400 group-hover:text-white cursor-pointer transition-colors leading-relaxed">
                                        Supplier Settlement — My supplier will cover delivery agent charges
                                    </Label>
                                </div>
                            </div>
                        </div>

                        {/* Insurance */}
                        <div className="space-y-6">
                            <h3 className="font-black text-white uppercase tracking-widest text-xs flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4" /> Global Risk Mitigation
                            </h3>
                            <div className="flex items-start space-x-4 bg-white/[0.03] p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all group">
                                <Switch
                                    id="insurance"
                                    checked={formData.needsInsurance}
                                    onCheckedChange={(c) => updateForm({ needsInsurance: c })}
                                    className="data-[state=checked]:bg-white mt-1"
                                />
                                <div>
                                    <Label htmlFor="insurance" className="text-lg font-black text-white cursor-pointer flex items-center gap-2 uppercase tracking-tighter">
                                        Verified Cargo Insurance
                                    </Label>
                                    <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                                        Comprehensive coverage up to $500k. Automated claim processing via Smart-Contract logic.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-12">
                        {/* Customs Brokerage */}
                        <div className="space-y-6">
                            <h3 className="font-black text-white uppercase tracking-widest text-xs">Customs Logic</h3>
                            <div className="flex items-start space-x-4 bg-white/[0.03] p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all group">
                                <Switch
                                    id="customs"
                                    checked={formData.needsCustomsBrokerage}
                                    onCheckedChange={(c) => updateForm({ needsCustomsBrokerage: c })}
                                    className="data-[state=checked]:bg-white mt-1"
                                />
                                <div>
                                    <Label htmlFor="customs" className="text-lg font-black text-white cursor-pointer uppercase tracking-tighter">
                                        Integrated Brokerage
                                    </Label>
                                    <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                                        End-to-end documentation clearance. Real-time HS Code verification and tax calculation.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Summary / Tip Box - Monochrome */}
                        <div className="bg-white text-black p-8 rounded-2xl flex gap-5 items-start shadow-2xl">
                            <ShieldCheck className="w-8 h-8 shrink-0 mt-1" />
                            <div>
                                <h4 className="font-black uppercase tracking-tighter text-xl mb-2">Compliance Check</h4>
                                <p className="text-sm font-medium leading-relaxed">
                                    Mandatory for International Corridors. Selecting these options now generates a **Verified Master Quote** that avoids any hidden harbor or terminal surcharges.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="border-t border-white/10 mt-12 pt-10 flex justify-end">
                    <div className="flex gap-6 w-full md:w-auto">
                        <Button variant="outline" size="lg" onClick={prevStep} className="flex-1 md:flex-none h-14 px-10 rounded-xl border-white/10 text-gray-500 hover:bg-white hover:text-black transition-all uppercase font-black tracking-tighter">
                            Back
                        </Button>
                        <Button size="lg" onClick={nextStep} className="flex-1 md:flex-none h-14 px-12 rounded-xl bg-white text-black hover:bg-gray-200 uppercase font-black tracking-tighter text-lg shadow-[0_0_50px_rgba(255,255,255,0.05)] border-2 border-white">
                            Compile Spot Rates
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
