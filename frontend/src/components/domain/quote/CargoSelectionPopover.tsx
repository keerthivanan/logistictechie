"use client";

import * as React from "react";
import { Package, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useLanguage } from "@/contexts/LanguageContext";

interface CargoSelectionProps {
    containerSize: string;
    onChange: (size: string) => void;
    className?: string;
}

export function CargoSelectionPopover({ containerSize, onChange, className }: CargoSelectionProps) {
    const [open, setOpen] = React.useState(false);
    const { t } = useLanguage();

    const SIZES = [
        { id: "20", label: "20' ST", desc: "Standard Container" },
        { id: "40", label: "40' ST", desc: "Standard Container" },
        { id: "40HC", label: "40' HC", desc: "High Cube Container" },
        { id: "45HC", label: "45' HC", desc: "Extra High Cube" },
    ];

    const TYPES = [
        { id: "FCL", label: "FCL" },
        { id: "LCL", label: "LCL" },
    ];

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    className={cn(
                        "h-24 px-8 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-left flex items-center gap-6 group w-full outline-none",
                        className
                    )}
                >
                    <Package className="h-6 w-6 text-white/40 group-hover:text-white transition-colors" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">{t('quote.wizard.cargo.unitType') || "CARGO_CONFIGURATION"}</span>
                        <span className="text-lg font-black text-white uppercase tracking-tighter italic">
                            FCL, {containerSize}&apos; {containerSize.includes('HC') ? 'HC' : 'ST'}
                        </span>
                    </div>
                    <ChevronDown className="h-4 w-4 ml-auto text-white/20" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0 border-white/10 rounded-[48px] bg-black shadow-2xl backdrop-blur-3xl" align="start">
                <div className="p-10 space-y-10">
                    <div className="space-y-6">
                        <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">LOAD_OPTIMIZATION</h4>
                        <div className="grid grid-cols-2 gap-4">
                            {TYPES.map((type) => (
                                <button
                                    key={type.id}
                                    className={cn(
                                        "py-4 rounded-full border text-[11px] font-black tracking-widest transition-all",
                                        type.id === "FCL" ? "bg-white text-black border-white" : "border-white/5 text-white/40 hover:border-white/20"
                                    )}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">CONTAINER_DIMENSIONS</h4>
                        <div className="grid gap-4">
                            {SIZES.map((s) => {
                                const isSelected = containerSize === s.id || (containerSize === "40" && s.id === "40");
                                return (
                                    <button
                                        key={s.id}
                                        onClick={() => {
                                            onChange(s.id);
                                            setOpen(false);
                                        }}
                                        className={cn(
                                            "flex items-center justify-between p-6 rounded-[32px] border transition-all",
                                            isSelected ? "border-white bg-white/5" : "border-white/5 hover:border-white/20 bg-white/[0.02]"
                                        )}
                                    >
                                        <div className="flex flex-col items-start">
                                            <span className={cn("text-[12px] font-black uppercase tracking-widest", isSelected ? "text-white" : "text-white/40")}>
                                                {s.label}
                                            </span>
                                            <span className="text-[10px] font-black text-white/10 uppercase tracking-widest mt-1">{s.desc}</span>
                                        </div>
                                        {isSelected && <Check className="h-4 w-4 text-white" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
