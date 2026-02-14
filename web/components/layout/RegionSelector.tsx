"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Globe, MapPin, Check, Search } from "lucide-react";
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
    const router = useRouter();
    const searchParams = useSearchParams();
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

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 cursor-pointer transition-colors mr-1 group">
                    <div className="relative">
                        <Globe size={18} className={cn(
                            "transition-all duration-300",
                            currentRegion ? "text-blue-600 scale-110" : "text-gray-600 group-hover:text-black"
                        )} />
                        {currentRegion && (
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full border-2 border-white animate-pulse" />
                        )}
                    </div>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 bg-white rounded-2xl shadow-[0_6px_16px_rgba(0,0,0,0.12)] border py-2 mt-2 animate-in fade-in zoom-in-95 duration-200">
                <DropdownMenuLabel className="px-4 py-3">
                    <div className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                        <MapPin size={12} className="text-blue-600" />
                        Select Region
                    </div>
                </DropdownMenuLabel>

                <div className="max-h-[350px] overflow-y-auto overflow-x-hidden no-scrollbar py-1">
                    <DropdownMenuItem
                        onClick={() => handleSelect("All")}
                        className={cn(
                            "px-4 py-3 cursor-pointer flex items-center justify-between transition-colors",
                            !currentRegion ? "bg-blue-50 text-blue-700 font-bold" : "hover:bg-gray-50"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-black italic">GH</div>
                            <span className="text-sm">All of Ghana</span>
                        </div>
                        {!currentRegion && <Check size={14} className="text-blue-600" />}
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="my-1 bg-gray-100" />

                    {REGIONS.map((r) => (
                        <DropdownMenuItem
                            key={r.name}
                            onClick={() => handleSelect(r.name)}
                            className={cn(
                                "px-4 py-3 cursor-pointer flex items-center justify-between transition-colors",
                                currentRegion === r.name ? "bg-blue-50 text-blue-700 font-bold" : "hover:bg-gray-50"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-black italic uppercase text-gray-400 group-hover:text-blue-600">
                                    {r.code}
                                </div>
                                <span className="text-sm">{r.name}</span>
                            </div>
                            {currentRegion === r.name && <Check size={14} className="text-blue-600" />}
                        </DropdownMenuItem>
                    ))}
                </div>

                <DropdownMenuSeparator className="my-1 bg-gray-100" />
                <div className="px-4 py-2 opacity-40">
                    <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest leading-none">
                        <Search size={10} />
                        Filter hostels by location
                    </div>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
