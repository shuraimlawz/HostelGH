"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Globe, MapPin, Check, Search, Server } from "lucide-react";
import { cn } from "@/lib/utils";

const REGIONS = [
    { name: "Ahafo", code: "AH" },
    { name: "Ashanti", code: "AS" },
    { name: "Bono", code: "BO" },
    { name: "Bono East", code: "BE" },
    { name: "Central", code: "CE" },
    { name: "Eastern", code: "EA" },
    { name: "Greater Accra", code: "GA" },
    { name: "North East", code: "NE" },
    { name: "Northern", code: "NO" },
    { name: "Oti", code: "OT" },
    { name: "Savannah", code: "SA" },
    { name: "Upper East", code: "UE" },
    { name: "Upper West", code: "UW" },
    { name: "Volta", code: "VO" },
    { name: "Western", code: "WE" },
    { name: "Western North", code: "WN" },
];

export default function RegionSelector() {
    const [mounted, setMounted] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        setMounted(true);
    }, []);

    const currentRegion = searchParams.get("region");

    const handleSelect = (regionName: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (regionName === "All") {
            params.delete("region");
        } else {
            params.set("region", regionName);
        }
        router.push(`/hostels?${params.toString()}`);
    };

    if (!mounted) return <div className="hidden md:flex w-10 h-10 mr-1" />;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-all mr-1 group border border-transparent hover:border-gray-200">
                    <div className="relative">
                        <Globe size={18} className={cn(
                            "transition-all duration-300",
                            currentRegion ? "text-blue-600 scale-110" : "text-muted-foreground group-hover:text-foreground"
                        )} />
                        {currentRegion && (
                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white shadow-sm animate-pulse" />
                        )}
                    </div>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72 bg-white rounded-3xl shadow-2xl border border-gray-100 py-3 mt-4 animate-in fade-in zoom-in-95 duration-200 lg:mr-4">
                <DropdownMenuLabel className="px-5 py-4">
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-3">
                        <Server size={14} className="text-blue-600" />
                        Choose Your Region
                    </div>
                </DropdownMenuLabel>

                <div className="max-h-[400px] overflow-y-auto no-scrollbar py-1">
                    <DropdownMenuItem
                        onClick={() => handleSelect("All")}
                        className={cn(
                            "mx-2 px-4 py-3 cursor-pointer flex items-center justify-between transition-all rounded-2xl mb-1",
                            !currentRegion ? "bg-blue-50 text-blue-600 font-bold" : "hover:bg-gray-50 dark:hover:bg-gray-800"
                        )}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-[10px] font-bold text-white shadow-lg">GH</div>
                            <span className="text-[11px] font-bold uppercase tracking-widest">All Regions</span>
                        </div>
                        {!currentRegion && <Check size={16} className="text-blue-600" />}
                    </DropdownMenuItem>

                    <div className="px-5 py-2">
                        <div className="h-px bg-gray-50 w-full" />
                    </div>

                    {REGIONS.map((r) => (
                        <DropdownMenuItem
                            key={r.name}
                            onClick={() => handleSelect(r.name)}
                            className={cn(
                                "mx-2 px-4 py-3 cursor-pointer flex items-center justify-between transition-all rounded-2xl mb-1",
                                currentRegion === r.name ? "bg-blue-50 text-blue-600 font-bold" : "hover:bg-gray-50 dark:hover:bg-gray-800"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-blue-600 transition-colors">
                                    {r.code}
                                </div>
                                <span className="text-[11px] font-bold uppercase tracking-widest leading-none">{r.name}</span>
                            </div>
                            {currentRegion === r.name && <Check size={16} className="text-blue-600" />}
                        </DropdownMenuItem>
                    ))}
                </div>

                <div className="px-5 py-4 border-t border-gray-50 mt-2">
                    <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-widest text-gray-300 leading-none">
                        <Search size={12} className="text-blue-500" />
                        Quick Filter
                    </div>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
