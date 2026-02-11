import * as React from "react";
import { Check, ChevronsUpDown, Ship, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface Vessel {
    name: string;
    imo: string;
    flag: string;
    operator: string;
}

interface VesselAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    minimal?: boolean;
}

export function VesselAutocomplete({ value, onChange, placeholder, className, minimal = false }: VesselAutocompleteProps) {
    const [open, setOpen] = React.useState(false);
    const [vessels, setVessels] = React.useState<Vessel[]>([]);
    const [loading, setLoading] = React.useState(false);

    // Initial Fetch
    React.useEffect(() => {
        const fetchVessels = async () => {
            setLoading(true);
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
                const { data } = await axios.get(`${apiUrl}/api/vessels/active`);
                if (data && data.vessels) {
                    setVessels(data.vessels);
                }
            } catch (error) {
                console.error("Vessel fetch failed", error);
            } finally {
                setLoading(false);
            }
        };
        fetchVessels();
    }, []);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "w-full justify-between h-12 font-normal px-4",
                        minimal
                            ? "bg-transparent border-0 hover:bg-gray-50 text-gray-500 focus:ring-0"
                            : "bg-background/50 border-input",
                        !value && "text-muted-foreground",
                        className
                    )}
                >
                    <div className="flex items-center gap-2 overflow-hidden w-full text-left">
                        {!minimal && <Ship className="h-4 w-4 shrink-0 opacity-50 text-gray-500" />}
                        <span className="truncate flex-1 font-medium text-base">
                            {value || placeholder || "Select Vessel..."}
                        </span>
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[calc(100vw-2rem)] md:w-[380px] p-0 shadow-2xl border-white/10 rounded-none bg-black" align="start">
                <Command className="bg-black">
                    <CommandInput
                        placeholder="SEARCH_FLEET_DATA..."
                        className="h-14 text-[10px] font-black tracking-[0.3em] border-b border-white/10 uppercase bg-black text-white"
                    />
                    <CommandList className="max-h-[350px]">
                        {loading && <div className="p-6 text-[10px] font-black tracking-widest text-center text-zinc-500 uppercase flex items-center justify-center gap-3"><div className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /> SCANNING_NETWORKS...</div>}
                        {!loading && vessels.length === 0 && (
                            <CommandEmpty className="py-8 text-center text-[10px] font-bold text-zinc-600 uppercase tracking-widest">No active units found.</CommandEmpty>
                        )}
                        <CommandGroup heading="ACTIVE_OPERATIONAL_FLEET" className="text-zinc-600 font-black text-[9px] tracking-[0.4em] px-4 py-3 uppercase border-b border-white/5">
                            {vessels.map((vessel, idx) => {
                                const isSelected = value === vessel.name;
                                return (
                                    <CommandItem
                                        key={idx}
                                        value={vessel.name}
                                        onSelect={() => {
                                            onChange(vessel.name);
                                            setOpen(false);
                                        }}
                                        className={cn(
                                            "cursor-pointer transition-all duration-200 py-4 px-4 border-b border-white/[0.02] relative group outline-none",
                                            "aria-selected:bg-white/10 hover:bg-white/10",
                                            isSelected && "bg-white/[0.05]"
                                        )}
                                    >
                                        <div className={cn(
                                            "absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 opacity-0 transition-opacity",
                                            "group-aria-selected:opacity-100 group-hover:opacity-100",
                                            isSelected && "opacity-100"
                                        )} />

                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className={cn(
                                                        "font-bold text-xs uppercase tracking-tight transition-colors",
                                                        isSelected ? "text-emerald-400" : "text-white group-hover:text-emerald-400"
                                                    )}>
                                                        {vessel.name}
                                                    </span>
                                                    <span className="text-[9px] px-1.5 py-0.5 bg-zinc-800 text-zinc-400 font-black rounded">
                                                        {vessel.flag}
                                                    </span>
                                                </div>
                                                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
                                                    IMO: {vessel.imo} • {vessel.operator}
                                                </span>
                                            </div>
                                            <Ship className={cn(
                                                "h-3.5 w-3.5 transition-all",
                                                isSelected ? "text-emerald-500 opacity-100" : "text-zinc-600 opacity-40 group-hover:opacity-100"
                                            )} />
                                        </div>
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

