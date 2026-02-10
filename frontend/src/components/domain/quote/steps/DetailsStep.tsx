"use client";

import { useQuoteStore } from "@/hooks/use-quote";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Box, ArrowRight, ArrowLeft, Calendar, Scale, Ruler } from "lucide-react";

export function DetailsStep() {
    const { nextStep, prevStep, formData, updateForm } = useQuoteStore();

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8 text-center">
                <span className="text-sm font-medium text-emerald-500 mb-2 block">Step 3 of 6</span>
                <h2 className="text-3xl font-bold text-white mb-3">Shipment Details</h2>
                <p className="text-zinc-400">Provide additional information about your cargo for accurate quotes.</p>
            </div>

            <div className="space-y-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Ready Date */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Cargo Ready Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                            <Input
                                type="date"
                                className="pl-10 bg-zinc-800/50 border-zinc-700 h-12 rounded-lg text-white focus:border-zinc-500"
                                value={formData.readyDate}
                                onChange={(e) => updateForm({ readyDate: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Incoterms */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Incoterms</label>
                        <Select
                            defaultValue={formData.incoterm}
                            onValueChange={(val: string) => updateForm({ incoterm: val as 'EXW' | 'FCA' | 'FOB' | 'CFR' | 'CIF' | 'DAP' | 'DDP' })}
                        >
                            <SelectTrigger className="bg-zinc-800/50 border-zinc-700 h-12 rounded-lg text-white focus:border-zinc-500">
                                <SelectValue placeholder="Select terms" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-700 text-white rounded-lg">
                                <SelectItem value="FOB" className="py-3">FOB - Free On Board</SelectItem>
                                <SelectItem value="EXW" className="py-3">EXW - Ex Works</SelectItem>
                                <SelectItem value="CIF" className="py-3">CIF - Cost, Insurance & Freight</SelectItem>
                                <SelectItem value="DDP" className="py-3">DDP - Delivered Duty Paid</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Commodity */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Commodity / Goods Description</label>
                    <div className="relative">
                        <Box className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        <Input
                            placeholder="e.g., Electronics, Furniture, Machinery"
                            className="pl-10 bg-zinc-800/50 border-zinc-700 h-12 rounded-lg text-white placeholder:text-zinc-500 focus:border-zinc-500"
                            value={formData.commodity}
                            onChange={(e) => updateForm({ commodity: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Weight */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Total Weight (kg)</label>
                        <div className="relative">
                            <Scale className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                            <Input
                                type="number"
                                placeholder="1000"
                                className="pl-10 bg-zinc-800/50 border-zinc-700 h-12 rounded-lg text-white placeholder:text-zinc-500 focus:border-zinc-500"
                                value={formData.weight || ""}
                                onChange={(e) => updateForm({ weight: Number(e.target.value) })}
                            />
                        </div>
                    </div>

                    {/* Volume */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Total Volume (CBM)</label>
                        <div className="relative">
                            <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                            <Input
                                type="number"
                                placeholder="2.5"
                                step="0.1"
                                className="pl-10 bg-zinc-800/50 border-zinc-700 h-12 rounded-lg text-white placeholder:text-zinc-500 focus:border-zinc-500"
                                value={formData.volume || ""}
                                onChange={(e) => updateForm({ volume: Number(e.target.value) })}
                            />
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
                    Get Quotes <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
