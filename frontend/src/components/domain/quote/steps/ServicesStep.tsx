"use client";

import { useQuoteStore } from "@/hooks/use-quote";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Ship, Shield, FileText, ArrowRight, ArrowLeft, Check, Zap, Globe, Package } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function ServicesStep() {
    const { formData, updateForm, nextStep, prevStep } = useQuoteStore();

    return (
        <div className="max-w-4xl mx-auto">
            {/* Tactical Mission Summary */}
            <div className="bg-zinc-950/40 border-l-2 border-emerald-500 p-10 mb-16 flex flex-wrap items-center gap-12 text-[10px] font-black uppercase tracking-[0.4em] relative overflow-hidden group">
                <div className="flex items-center gap-4">
                    <Globe className="h-4 w-4 text-emerald-500 group-hover:rotate-45 transition-transform" />
                    <span className="text-zinc-700">TRAJECTORY:</span>
                    <span className="text-white">{formData.origin?.split(',')[0].trim() || "UNDEFINED"}</span>
                    <ArrowRight className="h-3 w-3 text-zinc-900" />
                    <span className="text-white">{formData.destination?.split(',')[0].trim() || "UNDEFINED"}</span>
                </div>
                <div className="flex items-center gap-4">
                    <Package className="h-4 w-4 text-zinc-700" />
                    <span className="text-zinc-700">UNIT:</span>
                    <span className="text-white">{formData.containerSize} {formData.cargoType?.toUpperCase()}</span>
                </div>
                <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-[0.05] select-none pointer-events-none italic text-4xl">
                    TELEMETRY_SYNC
                </div>
            </div>

            <div className="mb-20">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-[1px] bg-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500">PROTOCOL_STEP_04</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-6 leading-none">
                    Enhance. <span className="text-zinc-900 hover:text-white transition-colors duration-1000">Intelligence.</span>
                </h2>
                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em] leading-relaxed max-w-xl">
                    Activate specialized tactical modules to ensure mission-critical security, regulatory compliance, and asset protection.
                </p>
            </div>

            <div className="space-y-10 mb-20">
                {/* Deployment Matrix */}
                <div className="grid md:grid-cols-2 gap-8">
                    <div
                        className={cn(
                            "p-10 border transition-all duration-700 cursor-pointer relative overflow-hidden group/tile",
                            formData.portChargesCoveredBy === 'agent'
                                ? "bg-white text-black border-transparent"
                                : "bg-zinc-950/40 border-white/5 text-zinc-500 hover:border-white/20"
                        )}
                        onClick={() => updateForm({ portChargesCoveredBy: 'agent' })}
                    >
                        <div className="flex items-start justify-between relative z-10">
                            <div className="space-y-2">
                                <Label className="text-base font-black uppercase tracking-tighter italic cursor-pointer">AGENT_SETTLEMENT</Label>
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-50">DIRECT_PORT_CLEARANCE</p>
                            </div>
                            <div className={cn(
                                "w-6 h-6 border flex items-center justify-center transition-all",
                                formData.portChargesCoveredBy === 'agent' ? "border-black bg-black text-white" : "border-zinc-800"
                            )}>
                                {formData.portChargesCoveredBy === 'agent' && <Check className="w-4 h-4" />}
                            </div>
                        </div>
                    </div>

                    <div
                        className={cn(
                            "p-10 border transition-all duration-700 cursor-pointer relative overflow-hidden group/tile",
                            formData.portChargesCoveredBy === 'supplier'
                                ? "bg-white text-black border-transparent"
                                : "bg-zinc-950/40 border-white/5 text-zinc-500 hover:border-white/20"
                        )}
                        onClick={() => updateForm({ portChargesCoveredBy: 'supplier' })}
                    >
                        <div className="flex items-start justify-between relative z-10">
                            <div className="space-y-2">
                                <Label className="text-base font-black uppercase tracking-tighter italic cursor-pointer">CARRIER_HANDLING</Label>
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-50">INTEGRATED_HUB_PROTOCOL</p>
                            </div>
                            <div className={cn(
                                "w-6 h-6 border flex items-center justify-center transition-all",
                                formData.portChargesCoveredBy === 'supplier' ? "border-black bg-black text-white" : "border-zinc-800"
                            )}>
                                {formData.portChargesCoveredBy === 'supplier' && <Check className="w-4 h-4" />}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6">
                    {[
                        { id: 'insurance', label: 'SOVEREIGN_INSURANCE', icon: Shield, desc: 'Advanced asset protection against global volatility' },
                        { id: 'customs', label: 'REGULATORY_BYPASS', icon: FileText, desc: 'Automated customs clearance and document verification' },
                        { id: 'warehousing', label: 'STORAGE_NODE_SYNC', icon: Ship, desc: 'Climate-controlled strategic warehousing modules' }
                    ].map((service) => (
                        <div key={service.id} className="p-10 bg-zinc-950/40 border border-white/5 hover:border-white/20 transition-all duration-700 relative overflow-hidden group/service">
                            <div className="flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-8">
                                    <div className="w-16 h-16 bg-zinc-900 flex items-center justify-center group-hover/service:bg-emerald-500 group-hover/service:text-black transition-all duration-700 group-hover/service:rotate-12">
                                        <service.icon className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">{service.label}</h3>
                                        <p className="text-[9px] font-black text-zinc-800 uppercase tracking-[0.4em]">{service.desc}</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={!!(formData as any)[service.id]}
                                    onCheckedChange={(val) => updateForm({ [service.id]: val } as any)}
                                    className="data-[state=checked]:bg-emerald-500"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-between items-center pt-16 border-t border-white/5">
                <Button
                    variant="ghost"
                    onClick={prevStep}
                    className="h-16 px-12 rounded-none text-zinc-600 hover:text-white hover:bg-zinc-950 font-black text-[10px] uppercase tracking-[0.4em] transition-all"
                >
                    <ArrowLeft className="w-4 h-4 mr-6" /> BACK_TO_MANIFEST
                </Button>
                <Button
                    onClick={nextStep}
                    className="h-16 px-16 rounded-none bg-white text-black hover:bg-emerald-500 font-black text-[10px] uppercase tracking-[0.6em] transition-all duration-700 shadow-[0_20px_60px_rgba(255,255,255,0.05)]"
                >
                    COMMIT_INTELLIGENCE <ArrowRight className="w-4 h-4 ml-6" />
                </Button>
            </div>
        </div>
    );
}
