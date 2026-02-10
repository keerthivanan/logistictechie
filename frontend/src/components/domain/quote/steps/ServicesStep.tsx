"use client";

import { useQuoteStore } from "@/hooks/use-quote";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Ship, Shield, FileText, ArrowRight, ArrowLeft, Check } from "lucide-react";

export function ServicesStep() {
    const { formData, updateForm, nextStep, prevStep } = useQuoteStore();

    return (
        <div className="max-w-3xl mx-auto">
            {/* Summary Bar */}
            <div className="bg-zinc-800/30 border border-zinc-800 rounded-xl p-4 mb-8 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <Ship className="h-4 w-4 text-zinc-500" />
                    <span className="text-zinc-400">From:</span>
                    <span className="text-white font-medium">{formData.origin?.split(',')[0]}</span>
                </div>
                <div className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-zinc-600" />
                    <span className="text-zinc-400">To:</span>
                    <span className="text-white font-medium">{formData.destination?.split(',')[0]}</span>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                    <span className="text-zinc-400">Container:</span>
                    <span className="text-white font-medium">{formData.containerSize}' {formData.cargoType}</span>
                </div>
            </div>

            <div className="mb-8 text-center">
                <span className="text-sm font-medium text-emerald-500 mb-2 block">Step 4 of 6</span>
                <h2 className="text-3xl font-bold text-white mb-3">Additional Services</h2>
                <p className="text-zinc-400">Select optional services to add to your shipment.</p>
            </div>

            <div className="space-y-4 mb-8">
                {/* Port Charges - Agent */}
                <div
                    className={`p-5 rounded-xl border transition-all cursor-pointer ${formData.portChargesCoveredBy === 'agent'
                            ? 'bg-emerald-500/10 border-emerald-500/50'
                            : 'bg-zinc-800/30 border-zinc-800 hover:border-zinc-700'
                        }`}
                    onClick={() => updateForm({ portChargesCoveredBy: 'agent' })}
                >
                    <div className="flex items-start gap-4">
                        <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${formData.portChargesCoveredBy === 'agent' ? 'border-emerald-500 bg-emerald-500' : 'border-zinc-600'
                            }`}>
                            {formData.portChargesCoveredBy === 'agent' && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <div>
                            <Label className="text-lg font-semibold text-white cursor-pointer">
                                Agent Pays Port Charges
                            </Label>
                            <p className="text-sm text-zinc-500 mt-1">
                                Terminal handling and port charges will be covered by the destination agent
                            </p>
                        </div>
                    </div>
                </div>

                {/* Port Charges - Supplier */}
                <div
                    className={`p-5 rounded-xl border transition-all cursor-pointer ${formData.portChargesCoveredBy === 'supplier'
                            ? 'bg-emerald-500/10 border-emerald-500/50'
                            : 'bg-zinc-800/30 border-zinc-800 hover:border-zinc-700'
                        }`}
                    onClick={() => updateForm({ portChargesCoveredBy: 'supplier' })}
                >
                    <div className="flex items-start gap-4">
                        <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${formData.portChargesCoveredBy === 'supplier' ? 'border-emerald-500 bg-emerald-500' : 'border-zinc-600'
                            }`}>
                            {formData.portChargesCoveredBy === 'supplier' && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <div>
                            <Label className="text-lg font-semibold text-white cursor-pointer">
                                Supplier Pays Port Charges
                            </Label>
                            <p className="text-sm text-zinc-500 mt-1">
                                Terminal handling and port charges will be covered at origin by the supplier
                            </p>
                        </div>
                    </div>
                </div>

                {/* Insurance */}
                <div className={`p-5 rounded-xl border transition-all ${formData.needsInsurance
                        ? 'bg-blue-500/10 border-blue-500/50'
                        : 'bg-zinc-800/30 border-zinc-800'
                    }`}>
                    <div className="flex items-start gap-4">
                        <Switch
                            id="insurance"
                            checked={formData.needsInsurance}
                            onCheckedChange={(c) => updateForm({ needsInsurance: c })}
                            className="mt-1"
                        />
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-blue-400" />
                                <Label htmlFor="insurance" className="text-lg font-semibold text-white cursor-pointer">
                                    Cargo Insurance
                                </Label>
                            </div>
                            <p className="text-sm text-zinc-500 mt-1">
                                Protect your shipment with full coverage up to $500,000. Includes damage, loss, and theft protection.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Customs Brokerage */}
                <div className={`p-5 rounded-xl border transition-all ${formData.needsCustomsBrokerage
                        ? 'bg-purple-500/10 border-purple-500/50'
                        : 'bg-zinc-800/30 border-zinc-800'
                    }`}>
                    <div className="flex items-start gap-4">
                        <Switch
                            id="customs"
                            checked={formData.needsCustomsBrokerage}
                            onCheckedChange={(c) => updateForm({ needsCustomsBrokerage: c })}
                            className="mt-1"
                        />
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-purple-400" />
                                <Label htmlFor="customs" className="text-lg font-semibold text-white cursor-pointer">
                                    Customs Brokerage
                                </Label>
                            </div>
                            <p className="text-sm text-zinc-500 mt-1">
                                Let us handle all customs documentation and clearance. Includes duty calculation and compliance checks.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex gap-3">
                <Button
                    onClick={prevStep}
                    variant="outline"
                    className="h-12 px-6 rounded-lg border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button
                    onClick={nextStep}
                    className="flex-1 h-12 rounded-lg bg-white text-black hover:bg-zinc-100 font-semibold transition-all"
                >
                    Get Carrier Rates <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
