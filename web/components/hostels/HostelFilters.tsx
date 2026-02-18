"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    Navigation
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
    const [region, setRegion] = useState(params.get("region") ?? "");
    const [university, setUniversity] = useState(params.get("university") ?? "");
    const [minPrice, setMinPrice] = useState(params.get("minPrice") ?? "");
    const [maxPrice, setMaxPrice] = useState(params.get("maxPrice") ?? "");
    const [gender, setGender] = useState(params.get("gender") ?? "");
    const [roomConfig, setRoomConfig] = useState(params.get("roomConfig") ?? "");
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
        params.get("amenities")?.split(",").filter(Boolean) ?? []
    );

    useEffect(() => {
        setCity(params.get("city") ?? "");
        setRegion(params.get("region") ?? "");
        setUniversity(params.get("university") ?? "");
        setGender(params.get("gender") ?? "");
        setRoomConfig(params.get("roomConfig") ?? "");
        setMinPrice(params.get("minPrice") && !isNaN(parseInt(params.get("minPrice")!)) ? (parseInt(params.get("minPrice")!) / 100).toString() : "");
        setMaxPrice(params.get("maxPrice") && !isNaN(parseInt(params.get("maxPrice")!)) ? (parseInt(params.get("maxPrice")!) / 100).toString() : "");
        setSelectedAmenities(params.get("amenities")?.split(",").filter(Boolean) ?? []);
    }, [params]);

    const handleApply = () => {
        const p = new URLSearchParams();
        if (city) p.set("city", city);
        if (region) p.set("region", region);
        if (university) p.set("university", university);
        if (gender) p.set("gender", gender);
        if (roomConfig) p.set("roomConfig", roomConfig);
        if (minPrice) p.set("minPrice", (parseFloat(minPrice) * 100).toString());
        if (maxPrice) p.set("maxPrice", (parseFloat(maxPrice) * 100).toString());
        if (selectedAmenities.length > 0) p.set("amenities", selectedAmenities.join(","));

        router.push(`/hostels?${p.toString()}`);
    };

    const toggleAmenity = (id: string) => {
        setSelectedAmenities(prev =>
            prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
        );
    };

    const clearFilters = () => {
        setCity("");
        setRegion("");
        setUniversity("");
        setGender("");
        setRoomConfig("");
        setMinPrice("");
        setMaxPrice("");
        setSelectedAmenities([]);
        router.push("/hostels");
    };

    return (
        <div className="w-full md:w-80 space-y-8 bg-white md:bg-gray-50/50 rounded-[2.5rem] md:p-8 md:border md:sticky md:top-24 h-fit">
            <div className="flex items-center justify-between px-2 md:px-0">
                <h3 className="font-bold text-xl">Filters</h3>
                <button
                    onClick={clearFilters}
                    className="text-xs font-bold text-blue-600 hover:underline uppercase tracking-widest"
                >
                    Clear All
                </button>
            </div>

            <div className="space-y-8">
                {/* Location Filter */}
                <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                        <MapPin size={14} className="text-blue-500" /> Location
                    </Label>
                    <div className="relative group">
                        <Input
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="rounded-2xl h-14 bg-white border-gray-100 shadow-sm shadow-gray-100/50 focus:ring-4 focus:ring-blue-50/50 focus:border-blue-200 transition-all font-bold text-gray-900 placeholder:text-gray-300"
                            placeholder="e.g. Accra"
                        />
                    </div>
                </div>

                {/* University Filter */}
                <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                        <School size={14} className="text-purple-500" /> University
                    </Label>
                    <div className="relative">
                        <select
                            value={university}
                            onChange={(e) => setUniversity(e.target.value)}
                            className="w-full h-14 bg-white border border-gray-100 rounded-2xl px-5 outline-none focus:ring-4 focus:ring-blue-50/50 focus:border-blue-200 transition-all text-sm font-bold text-gray-900 shadow-sm shadow-gray-100/50 appearance-none cursor-pointer"
                        >
                            <option value="">Any University</option>
                            {REGIONAL_UNIVERSITIES.map(group => (
                                <optgroup key={group.region} label={group.region} className="font-black text-blue-600 bg-gray-50 uppercase tracking-widest text-[9px]">
                                    {group.unis.map(u => (
                                        <option key={u} value={u} className="text-gray-900 bg-white font-bold">{u}</option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <Layout size={14} />
                        </div>
                    </div>
                </div>

                {/* Gender Filter */}
                <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                        <Users size={14} className="text-pink-500" /> Room For
                    </Label>
                    <div className="flex gap-3">
                        {[
                            { id: "MALE", label: "Boys", icon: User },
                            { id: "FEMALE", label: "Girls", icon: UserCheck },
                            { id: "MIXED", label: "Mixed", icon: Users }
                        ].map((g) => (
                            <button
                                key={g.id}
                                onClick={() => setGender(gender === g.id ? "" : g.id)}
                                className={cn(
                                    "flex-1 flex flex-col items-center gap-3 py-4 rounded-2xl border transition-all active:scale-95",
                                    gender === g.id
                                        ? "bg-gray-950 text-white border-gray-950 shadow-xl shadow-gray-200"
                                        : "bg-white text-gray-500 border-gray-100 hover:border-gray-300 hover:bg-gray-50"
                                )}
                            >
                                <g.icon size={18} className={cn(gender === g.id ? "text-blue-400" : "text-gray-400")} />
                                <span className="text-[9px] font-black uppercase tracking-widest">{g.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Room Configuration Filter */}
                <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                        <Layout size={14} className="text-orange-500" /> Configuration
                    </Label>
                    <div className="relative">
                        <select
                            value={roomConfig}
                            onChange={(e) => setRoomConfig(e.target.value)}
                            className="w-full h-14 bg-white border border-gray-100 rounded-2xl px-5 outline-none focus:ring-4 focus:ring-blue-50/50 focus:border-blue-200 transition-all text-sm font-bold text-gray-900 shadow-sm shadow-gray-100/50 appearance-none cursor-pointer"
                        >
                            <option value="">Any Configuration</option>
                            <option value="1 in a room">1 in a room (Single)</option>
                            <option value="2 in a room">2 in a room</option>
                            <option value="3 in a room">3 in a room</option>
                            <option value="4 in a room">4 in a room</option>
                        </select>
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <Navigation size={14} />
                        </div>
                    </div>
                </div>

                {/* Price Range */}
                <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                        <DollarSign size={14} className="text-emerald-500" /> Price Range (₵)
                    </Label>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <Input
                                type="number"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                className="rounded-2xl h-14 bg-white border-gray-100 shadow-sm focus:ring-4 focus:ring-emerald-50 focus:border-emerald-200 transition-all font-bold pl-8"
                                placeholder="Min"
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 font-bold text-xs">₵</span>
                        </div>
                        <div className="relative">
                            <Input
                                type="number"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                className="rounded-2xl h-14 bg-white border-gray-100 shadow-sm focus:ring-4 focus:ring-emerald-50 focus:border-emerald-200 transition-all font-bold pl-8"
                                placeholder="Max"
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 font-bold text-xs">₵</span>
                        </div>
                    </div>
                </div>

                {/* Amenities */}
                <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Essential Amenities</Label>
                    <div className="grid grid-cols-2 gap-3">
                        {AMENITIES.map((a) => {
                            const isSelected = selectedAmenities.includes(a.id);
                            return (
                                <button
                                    key={a.id}
                                    onClick={() => toggleAmenity(a.id)}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-4 rounded-2xl border transition-all active:scale-95 min-h-[64px]",
                                        isSelected
                                            ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200 scale-[1.02] z-10"
                                            : "bg-white text-gray-600 border-gray-100 hover:border-gray-300 hover:bg-gray-50"
                                    )}
                                >
                                    <a.icon size={16} className={cn(isSelected ? "text-blue-200" : "text-gray-300")} />
                                    <span className="text-[9px] font-black uppercase tracking-[0.1em] text-left leading-tight break-words">{a.id}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <Button
                    onClick={handleApply}
                    className="w-full rounded-2xl h-16 font-black uppercase tracking-[0.3em] bg-blue-600 text-white hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-500/30 transition-all active:scale-95 mt-4"
                >
                    Apply Filters
                </Button>
            </div>
        </div>
    );
}
