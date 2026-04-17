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

    const [city, setCity] = useState(params.get("city") ?? "");
    const [university, setUniversity] = useState(params.get("university") ?? "");
    const [minPrice, setMinPrice] = useState(params.get("minPrice") ? (parseInt(params.get("minPrice")!) / 100).toString() : "");
    const [maxPrice, setMaxPrice] = useState(params.get("maxPrice") ? (parseInt(params.get("maxPrice")!) / 100).toString() : "");
    const [gender, setGender] = useState(params.get("gender") ?? "");
    const [roomConfig, setRoomConfig] = useState(params.get("roomConfig") ?? "");
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
        params.get("amenities")?.split(",").filter(Boolean) ?? []
    );

    useEffect(() => {
        setCity(params.get("city") ?? "");
        setUniversity(params.get("university") ?? "");
        setGender(params.get("gender") ?? "");
        setRoomConfig(params.get("roomConfig") ?? "");
        setMinPrice(params.get("minPrice") && !isNaN(parseInt(params.get("minPrice")!)) ? (parseInt(params.get("minPrice")!) / 100).toString() : "");
        setSelectedAmenities(params.get("amenities")?.split(",").filter(Boolean) ?? []);
    }, [params]);

    const handleApply = () => {
        const p = new URLSearchParams();
        if (city) p.set("city", city);
        if (university) p.set("university", university);
        if (gender) p.set("gender", gender);
        if (roomConfig) p.set("roomConfig", roomConfig);
        if (minPrice) p.set("minPrice", (parseFloat(minPrice) * 100).toString());
        if (maxPrice) p.set("maxPrice", (parseFloat(maxPrice) * 100).toString());
        if (selectedAmenities.length > 0) p.set("amenities", selectedAmenities.join(","));

        router.push(`/hostels?${p.toString()}`);
    };

    const clearFilters = () => {
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
        <div className="w-full bg-white border border-gray-100 rounded-2xl p-2 shadow-xl shadow-gray-200/20 mb-10">
            <div className="flex flex-col lg:flex-row items-center gap-2">
                
                {/* Search / City */}
                <div className="flex-1 w-full lg:w-auto relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleApply()}
                        className="w-full h-12 bg-gray-50/50 hover:bg-white border border-transparent hover:border-gray-100 focus:bg-white focus:border-blue-500 rounded-xl pl-11 pr-4 outline-none font-bold text-gray-950 placeholder:text-gray-300 shadow-sm transition-all text-sm"
                        placeholder="Search city or specific area..."
                    />
                </div>

                <div className="h-8 w-px bg-gray-100 hidden lg:block mx-1" />

                {/* University Select */}
                <div className="w-full lg:w-56">
                    <div className="relative">
                        <School className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                        <select
                            value={university}
                            onChange={(e) => { setUniversity(e.target.value); setTimeout(handleApply, 0); }}
                            className="w-full h-12 bg-white border border-transparent hover:bg-gray-50 focus:bg-white focus:border-blue-500 rounded-xl pl-11 pr-10 outline-none font-bold text-gray-900 shadow-sm transition-all text-xs appearance-none cursor-pointer"
                        >
                            <option value="">Any University</option>
                            {REGIONAL_UNIVERSITIES.map(group => (
                                <optgroup key={group.region} label={group.region}>
                                    {group.unis.map(u => (
                                        <option key={u} value={u}>{u}</option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" size={14} />
                    </div>
                </div>

                {/* Tenant Type */}
                <div className="w-full lg:w-44">
                    <div className="relative">
                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                        <select
                            value={gender}
                            onChange={(e) => { setGender(e.target.value); setTimeout(handleApply, 0); }}
                            className="w-full h-12 bg-white border border-transparent hover:bg-gray-50 focus:bg-white focus:border-blue-500 rounded-xl pl-11 pr-10 outline-none font-bold text-gray-900 shadow-sm transition-all text-xs appearance-none cursor-pointer"
                        >
                            <option value="">Any Gender</option>
                            <option value="MALE">Male Hostels</option>
                            <option value="FEMALE">Female Hostels</option>
                            <option value="MIXED">Mixed Hostels</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" size={14} />
                    </div>
                </div>

                {/* More Filters Popover */}
                <Popover>
                    <PopoverTrigger asChild>
                        <button className="h-12 w-full lg:w-auto px-6 bg-gray-900 text-white hover:bg-black rounded-xl font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-lg shadow-gray-200 transition-all active:scale-95">
                            <SlidersHorizontal size={14} /> Advanced
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-6 rounded-2xl border-gray-100 shadow-2xl space-y-8" align="end">
                        <div className="flex items-center justify-between border-b pb-4">
                            <h3 className="font-bold text-gray-900 text-sm">Strategic Filters</h3>
                            <button onClick={clearFilters} className="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-widest">Reset</button>
                        </div>

                        {/* Room Config */}
                        <div className="space-y-3">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Configuration</Label>
                            <select
                                value={roomConfig}
                                onChange={(e) => setRoomConfig(e.target.value)}
                                className="w-full h-11 bg-gray-50 border border-gray-100 rounded-xl px-4 outline-none font-bold text-xs"
                            >
                                <option value="">Any Room Type</option>
                                <option value="1 in a room">1 in a room (Single)</option>
                                <option value="2 in a room">2 in a room</option>
                                <option value="3 in a room">3 in a room</option>
                                <option value="4 in a room">4 in a room</option>
                            </select>
                        </div>

                        {/* Price Range */}
                        <div className="space-y-3">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Monthly Budget (₵)</Label>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="relative">
                                    <Input
                                        type="number"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                        className="rounded-xl h-11 bg-gray-50 border-gray-100 font-bold text-xs pl-6"
                                        placeholder="Min"
                                    />
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-[10px]">₵</span>
                                </div>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                        className="rounded-xl h-11 bg-gray-50 border-gray-100 font-bold text-xs pl-6"
                                        placeholder="Max"
                                    />
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-[10px]">₵</span>
                                </div>
                            </div>
                        </div>

                        {/* Amenities */}
                        <div className="space-y-3">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Essentials</Label>
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
                                                    ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100"
                                                    : "bg-white text-gray-600 border-gray-100 hover:border-blue-200"
                                            )}
                                        >
                                            <a.icon size={12} className={cn(isSelected ? "text-blue-200" : "text-gray-300")} />
                                            <span className="truncate">{a.id}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <Button
                            onClick={handleApply}
                            className="w-full rounded-xl h-12 font-bold uppercase tracking-widest text-[10px] bg-blue-600 text-white shadow-xl shadow-blue-100"
                        >
                            Apply Criteria
                        </Button>
                    </PopoverContent>
                </Popover>

                {/* Reset Shortcut */}
                {(city || university || gender || minPrice || selectedAmenities.length > 0) && (
                    <button 
                        onClick={clearFilters}
                        className="h-12 w-12 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors shrink-0"
                        title="Clear all filters"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>
        </div>
    );
}
