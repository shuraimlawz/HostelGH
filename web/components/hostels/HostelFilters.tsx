"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Wifi,
    Wind,
    Utensils,
    Waves,
    Car,
    ShieldCheck,
    Coffee,
    Building2,
    Users,
    User,
    UserCheck,
    Layout,
    School,
    DollarSign,
    MapPin,
    Navigation,
    SlidersHorizontal,
    ChevronDown,
    Search,
    X
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { REGIONAL_UNIVERSITIES } from "@/lib/constants";

const AMENITIES = [
    { id: "WiFi", icon: Wifi },
    { id: "AC", icon: Wind },
    { id: "Laundry", icon: Utensils },
    { id: "Swimming Pool", icon: Waves },
    { id: "Parking", icon: Car },
    { id: "Security", icon: ShieldCheck },
    { id: "Study Room", icon: Coffee },
    { id: "Generator", icon: Building2 },
];

export default function HostelFilters() {
    const router = useRouter();
    const params = useSearchParams();

    const [query, setQuery] = useState(params.get("query") ?? params.get("city") ?? "");
    const [city, setCity] = useState(params.get("city") ?? "");
    const [university, setUniversity] = useState(params.get("university") ?? "");
    const [minPrice, setMinPrice] = useState(params.get("minPrice") ? (parseInt(params.get("minPrice")!) / 100).toString() : "");
    const [maxPrice, setMaxPrice] = useState(params.get("maxPrice") ? (parseInt(params.get("maxPrice")!) / 100).toString() : "");
    const [gender, setGender] = useState(params.get("gender") ?? "");
    const [roomConfig, setRoomConfig] = useState(params.get("roomConfig") ?? "");
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
        params.get("amenities")?.split(",").filter(Boolean) ?? []
    );



    const handleApply = (overrides?: any) => {
        const p = new URLSearchParams();
        const activeQuery = overrides?.query !== undefined ? overrides.query : query;
        const activeUni = overrides?.university !== undefined ? overrides.university : university;
        const activeGender = overrides?.gender !== undefined ? overrides.gender : gender;

        if (activeQuery) p.set("query", activeQuery);
        if (activeUni) p.set("university", activeUni);
        if (activeGender) p.set("gender", activeGender);
        if (roomConfig) p.set("roomConfig", roomConfig);
        if (minPrice) p.set("minPrice", (parseFloat(minPrice) * 100).toString());
        if (maxPrice) p.set("maxPrice", (parseFloat(maxPrice) * 100).toString());
        if (selectedAmenities.length > 0) p.set("amenities", selectedAmenities.join(","));

        router.push(`/hostels?${p.toString()}`);
    };

    const clearFilters = () => {
        setQuery("");
        setCity("");
        setUniversity("");
        setGender("");
        setRoomConfig("");
        setMinPrice("");
        setMaxPrice("");
        setSelectedAmenities([]);
        router.push("/hostels");
    };

    const toggleAmenity = (id: string) => {
        setSelectedAmenities(prev =>
            prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
        );
    };

    return (
        <div className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl lg:rounded-[2rem] p-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none mb-10 transition-all">
            <div className="flex flex-col lg:flex-row items-center gap-2 lg:gap-0">
                
                {/* Smart Global Search */}
                <div className="flex-1 w-full lg:w-auto relative group flex items-center hover:bg-gray-50 dark:hover:bg-slate-800/50 rounded-xl lg:rounded-2xl transition-colors">
                    <Search className="absolute left-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleApply()}
                        className="w-full h-14 bg-transparent pl-12 pr-4 outline-none font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 text-sm lg:text-base"
                        placeholder="Search hostels, schools, or cities..."
                    />
                </div>

                <div className="hidden lg:block w-px h-8 bg-gray-200 dark:bg-slate-800 mx-2" />

                {/* University Select */}
                <div className="w-full lg:w-56 relative hover:bg-gray-50 dark:hover:bg-slate-800/50 rounded-xl lg:rounded-2xl transition-colors">
                    <School className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <select
                        value={university}
                        onChange={(e) => { 
                            const val = e.target.value;
                            setUniversity(val); 
                            handleApply({ university: val }); 
                        }}
                        className="w-full h-14 bg-transparent pl-11 pr-10 outline-none font-semibold text-gray-900 dark:text-white text-sm appearance-none cursor-pointer"
                    >
                        <option value="" className="text-gray-900 dark:text-white bg-white dark:bg-slate-900">Any University</option>
                        {REGIONAL_UNIVERSITIES.map(group => (
                            <optgroup key={group.region} label={group.region} className="text-gray-500 font-bold bg-gray-50 dark:bg-slate-800">
                                {group.unis.map(u => (
                                    <option key={u} value={u} className="text-gray-900 dark:text-white font-semibold bg-white dark:bg-slate-900">{u}</option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>

                <div className="hidden lg:block w-px h-8 bg-gray-200 dark:bg-slate-800 mx-2" />

                {/* Tenant Type */}
                <div className="w-full lg:w-48 relative hover:bg-gray-50 dark:hover:bg-slate-800/50 rounded-xl lg:rounded-2xl transition-colors">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <select
                        value={gender}
                        onChange={(e) => { 
                            const val = e.target.value;
                            setGender(val); 
                            handleApply({ gender: val }); 
                        }}
                        className="w-full h-14 bg-transparent pl-11 pr-10 outline-none font-semibold text-gray-900 dark:text-white text-sm appearance-none cursor-pointer"
                    >
                        <option value="" className="text-gray-900 dark:text-white bg-white dark:bg-slate-900">Any Gender</option>
                        <option value="MALE" className="text-gray-900 dark:text-white bg-white dark:bg-slate-900">Male Hostels</option>
                        <option value="FEMALE" className="text-gray-900 dark:text-white bg-white dark:bg-slate-900">Female Hostels</option>
                        <option value="MIXED" className="text-gray-900 dark:text-white bg-white dark:bg-slate-900">Mixed Hostels</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>

                {/* More Filters Popover */}
                <Popover>
                    <PopoverTrigger asChild>
                        <button className="h-14 w-full lg:w-auto px-8 lg:ml-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl lg:rounded-[1.5rem] font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95 shrink-0">
                            <SlidersHorizontal size={16} /> Filters
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-6 rounded-2xl border-gray-100 dark:border-slate-800 shadow-2xl space-y-8 bg-white dark:bg-slate-900" align="end">
                        <div className="flex items-center justify-between border-b dark:border-slate-800 pb-4">
                            <h3 className="font-bold text-gray-900 dark:text-white text-sm">Filters</h3>
                            <button onClick={clearFilters} className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline uppercase tracking-widest">Reset All</button>
                        </div>

                        {/* Room Config */}
                        <div className="space-y-3">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Room Type</Label>
                            <select
                                value={roomConfig}
                                onChange={(e) => setRoomConfig(e.target.value)}
                                className="w-full h-11 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl px-4 outline-none font-bold text-xs text-gray-900 dark:text-white"
                            >
                                <option value="" className="bg-white dark:bg-slate-900">Any Room Type</option>
                                <option value="1 in a room" className="bg-white dark:bg-slate-900">1 in a room (Single)</option>
                                <option value="2 in a room" className="bg-white dark:bg-slate-900">2 in a room</option>
                                <option value="3 in a room" className="bg-white dark:bg-slate-900">3 in a room</option>
                                <option value="4 in a room" className="bg-white dark:bg-slate-900">4 in a room</option>
                                <option value="5 in a room" className="bg-white dark:bg-slate-900">5 in a room</option>
                                <option value="6 in a room" className="bg-white dark:bg-slate-900">6 in a room</option>
                            </select>
                        </div>

                        {/* Price Range */}
                        <div className="space-y-3">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Budget (₵)</Label>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="relative">
                                    <Input
                                        type="number"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                        className="rounded-xl h-11 bg-gray-50 dark:bg-slate-800 border-gray-100 dark:border-slate-700 font-bold text-xs pl-6 text-gray-900 dark:text-white placeholder:text-gray-400"
                                        placeholder="Min"
                                    />
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 text-[10px]">₵</span>
                                </div>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                        className="rounded-xl h-11 bg-gray-50 dark:bg-slate-800 border-gray-100 dark:border-slate-700 font-bold text-xs pl-6 text-gray-900 dark:text-white placeholder:text-gray-400"
                                        placeholder="Max"
                                    />
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 text-[10px]">₵</span>
                                </div>
                            </div>
                        </div>

                        {/* Amenities */}
                        <div className="space-y-3">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Essentials</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {AMENITIES.map((a) => {
                                    const isSelected = selectedAmenities.includes(a.id);
                                    return (
                                        <button
                                            key={a.id}
                                            onClick={() => toggleAmenity(a.id)}
                                            className={cn(
                                                "flex items-center gap-2 px-3 py-2.5 rounded-xl border text-[10px] font-bold uppercase tracking-tight transition-all",
                                                isSelected
                                                    ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                                                    : "bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-500/50"
                                            )}
                                        >
                                            <a.icon size={12} className={cn(isSelected ? "text-blue-200" : "text-gray-300 dark:text-gray-600")} />
                                            <span className="truncate">{a.id}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <Button
                            onClick={handleApply}
                            className="w-full rounded-xl h-12 font-bold uppercase tracking-widest text-[10px] bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98]"
                        >
                            Apply Filters
                        </Button>
                    </PopoverContent>
                </Popover>

                {/* Reset Shortcut */}
                {(query || city || university || gender || minPrice || selectedAmenities.length > 0) && (
                    <button 
                        onClick={clearFilters}
                        className="h-14 w-14 lg:ml-2 flex items-center justify-center rounded-xl lg:rounded-[1.5rem] bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors shrink-0"
                        title="Clear all filters"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>
        </div>
    );
}
