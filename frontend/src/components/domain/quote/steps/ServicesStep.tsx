"use client";

import { useQuoteStore } from "@/hooks/use-quote";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Ship, Shield, FileText, ArrowRight, ArrowLeft, Check, Globe, Package } from "lucide-react";
import { cn } from "@/lib/utils";

export function ServicesStep() {
    const { formData, updateForm, nextStep, prevStep } = useQuoteStore();

    return (
        <div className="max-w-[1400px] mx-auto">
            {/* Tactical Mission Summary - Static */}
            <div className="bg-zinc-950/40 border-l-4 border-white p-12 mb-24 flex flex-wrap items-center gap-16 text-[12px] font-black uppercase tracking-[0.6em] relative overflow-hidden backdrop-blur-3xl border border-white/10 rounded-r-[32px]">
                <div className="flex items-center gap-6">
                    <Globe className="h-6 w-6 text-white" />
                    <span className="text-white/40">TRAJECTORY:</span>
                    <span className="text-white text-lg italic">{formData.origin?.split(',')[0].trim() || "UNDEFINED"}</span>
                    <ArrowRight className="h-4 w-4 text-white/40" />
                    <span className="text-white text-lg italic">{formData.destination?.split(',')[0].trim() || "UNDEFINED"}</span>
                </div>
                <div className="flex items-center gap-6">
                    <Package className="h-6 w-6 text-white" />
                    <span className="text-white/40">UNIT:</span>
                    <span className="text-white text-lg italic">{formData.containerSize} {formData.cargoType?.toUpperCase() || "CONTAINER"}</span>
                </div>
                <div className="absolute right-12 top-1/2 -translate-y-1/2 opacity-[0.03] select-none pointer-events-none italic text-6xl text-white font-black">
                    TELEMETRY_SYNC
                </div>
            </div>

            <div className="mb-24">
                <div className="flex items-center gap-6 mb-8">
                    <div className="w-16 h-[1px] bg-white/40" />
                    <span className="text-[10px] font-black uppercase tracking-[0.6em] text-white/40">PROTOCOL_STEP_04</span>
                </div>
                <h2 className="text-7xl md:text-[120px] font-black text-white uppercase tracking-tighter mb-8 leading-[0.8] italic">
                    Enhance. <br />
                    <span className="text-white/20 select-none">Intelligence.</span>
                </h2>
                <p className="text-white text-3xl font-black uppercase tracking-tighter leading-[0.9] max-w-3xl italic">
                    Activate specialized tactical modules to ensure mission-critical security, regulatory compliance, and asset protection.
                </p>
            </div>

            <div className="space-y-12 mb-32">
                {/* Deployment Matrix */}
                <div className="grid md:grid-cols-2 gap-12">
                    <div
                        className={cn(
                            "p-16 rounded-[64px] border-2 transition-all cursor-pointer relative overflow-hidden backdrop-blur-3xl",
                            formData.portChargesCoveredBy === 'agent'
                                ? "bg-white text-black border-white"
                                : "bg-zinc-950/40 border-white/10 text-white hover:border-white/20"
                        )}
                        onClick={() => updateForm({ portChargesCoveredBy: 'agent' })}
                    >
                        <div className="flex items-start justify-between relative z-10">
                            <div className="space-y-6">
                                <Label className="text-4xl font-black uppercase tracking-tighter italic cursor-pointer leading-none">AGENT_SETTLEMENT</Label>
                                <p className={cn("text-[10px] font-black uppercase tracking-[0.4em] opacity-40", formData.portChargesCoveredBy === 'agent' && "text-black/60")}>DIRECT_PORT_CLEARANCE</p>
                            </div>
                            <div className={cn(
                                "w-12 h-12 rounded-full border-2 flex items-center justify-center",
                                formData.portChargesCoveredBy === 'agent' ? "border-black bg-black text-white" : "border-white/20"
                            )}>
                                {formData.portChargesCoveredBy === 'agent' && <Check className="w-8 h-8" />}
                            </div>
                        </div>
                    </div>

                    <div
                        className={cn(
                            "p-16 rounded-[64px] border-2 transition-all cursor-pointer relative overflow-hidden backdrop-blur-3xl",
                            formData.portChargesCoveredBy === 'supplier'
                                ? "bg-white text-black border-white"
                                : "bg-zinc-950/40 border-white/10 text-white hover:border-white/20"
                        )}
                        onClick={() => updateForm({ portChargesCoveredBy: 'supplier' })}
                    >
                        <div className="flex items-start justify-between relative z-10">
                            <div className="space-y-6">
                                <Label className="text-4xl font-black uppercase tracking-tighter italic cursor-pointer leading-none">CARRIER_HANDLING</Label>
                                <p className={cn("text-[10px] font-black uppercase tracking-[0.4em] opacity-40", formData.portChargesCoveredBy === 'supplier' && "text-black/60")}>INTEGRATED_HUB_PROTOCOL</p>
                            </div>
                            <div className={cn(
                                "w-12 h-12 rounded-full border-2 flex items-center justify-center",
                                formData.portChargesCoveredBy === 'supplier' ? "border-black bg-black text-white" : "border-white/20"
                            )}>
                                {formData.portChargesCoveredBy === 'supplier' && <Check className="w-8 h-8" />}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-8">
                    {[
                        { id: 'insurance', label: 'SOVEREIGN_INSURANCE', icon: Shield, desc: 'Advanced asset protection against global volatility' },
                        { id: 'customs', label: 'REGULATORY_BYPASS', icon: FileText, desc: 'Automated customs clearance and document verification' },
                        { id: 'warehousing', label: 'STORAGE_NODE_SYNC', icon: Ship, desc: 'Climate-controlled strategic warehousing modules' }
                    ].map((service) => (
                        <div key={service.id} className="p-16 bg-zinc-950/40 border border-white/10 rounded-[64px] relative overflow-hidden backdrop-blur-3xl group/row hover:border-white/20 transition-all">
                            <div className="flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-12">
                                    <div className="w-24 h-24 rounded-[40px] bg-white text-black flex items-center justify-center shadow-2xl">
                                        <service.icon className="w-10 h-10" />
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">{service.label}</h3>
                                        <p className="text-[12px] font-black text-white/40 uppercase tracking-[0.6em]">{service.desc}</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={!!(formData as any)[service.id]}
                                    onCheckedChange={(val) => updateForm({ [service.id]: val } as any)}
                                    className="data-[state=checked]:bg-white w-20 h-10"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-between items-center pt-16 border-t border-white/10">
                <button
                    onClick={prevStep}
                    className="h-32 px-16 rounded-full border border-white/10 bg-white/5 text-white hover:bg-white hover:text-black transition-all font-black text-[10px] uppercase tracking-[0.6em] active:scale-95"
                >
                    <ArrowLeft className="w-8 h-8 mr-6" /> BACK_TO_MANIFEST
                </button>
                <button
                    onClick={nextStep}
                    className="h-32 px-24 bg-white text-black hover:bg-zinc-200 font-black text-[14px] uppercase tracking-[1em] transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-8"
                >
                    COMMIT_INTELLIGENCE <ArrowRight className="h-8 w-8 ml-6" />
                </button>
            </div>
        </div>
    );
}
