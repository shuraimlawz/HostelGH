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
    School,
    DollarSign,
    MapPin
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";

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

const UNIVERSITIES = [
    "University of Ghana",
    "KNUST",
    "UCC",
    "University of Education, Winneba",
    "GIMPA",
    "Ashesi University",
    "Valley View University",
];

export default function HostelFilters() {
    const router = useRouter();
    const params = useSearchParams();

    const [city, setCity] = useState(params.get("city") ?? "");
    const [university, setUniversity] = useState(params.get("university") ?? "");
    const [minPrice, setMinPrice] = useState(params.get("minPrice") ?? "");
    const [maxPrice, setMaxPrice] = useState(params.get("maxPrice") ?? "");
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
        params.get("amenities")?.split(",").filter(Boolean) ?? []
    );

    useEffect(() => {
        setCity(params.get("city") ?? "");
        setUniversity(params.get("university") ?? "");
        setMinPrice(params.get("minPrice") ?? "");
        setMaxPrice(params.get("maxPrice") ?? "");
        setSelectedAmenities(params.get("amenities")?.split(",").filter(Boolean) ?? []);
    }, [params]);

    const handleApply = () => {
        const p = new URLSearchParams();
        if (city) p.set("city", city);
        if (university) p.set("university", university);
        if (minPrice) p.set("minPrice", (parseInt(minPrice) * 100).toString());
        if (maxPrice) p.set("maxPrice", (parseInt(maxPrice) * 100).toString());
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
        setUniversity("");
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
                {/* City Filter */}
                <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                        <MapPin size={12} className="text-blue-500" /> Location
                    </Label>
                    <Input
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="rounded-2xl h-14 bg-white border-gray-100 shadow-sm focus:ring-2 focus:ring-black transition-all"
                        placeholder="e.g. Accra"
                    />
                </div>

                {/* University Filter */}
                <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                        <School size={12} className="text-purple-500" /> University
                    </Label>
                    <select
                        value={university}
                        onChange={(e) => setUniversity(e.target.value)}
                        className="w-full h-14 bg-white border border-gray-100 rounded-2xl px-4 outline-none focus:ring-2 focus:ring-black transition-all text-sm font-medium shadow-sm appearance-none"
                    >
                        <option value="">Any University</option>
                        {UNIVERSITIES.map(u => (
                            <option key={u} value={u}>{u}</option>
                        ))}
                    </select>
                </div>

                {/* Price Range */}
                <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                        <DollarSign size={12} className="text-green-500" /> Price Range (₵)
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            type="number"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            className="rounded-2xl h-12 bg-white border-gray-100 placeholder:text-gray-300"
                            placeholder="Min"
                        />
                        <Input
                            type="number"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className="rounded-2xl h-12 bg-white border-gray-100 placeholder:text-gray-300"
                            placeholder="Max"
                        />
                    </div>
                </div>

                {/* Amenities */}
                <div className="space-y-4">
                    <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">Amenities</Label>
                    <div className="grid grid-cols-2 gap-2">
                        {AMENITIES.map((a) => {
                            const isSelected = selectedAmenities.includes(a.id);
                            return (
                                <button
                                    key={a.id}
                                    onClick={() => toggleAmenity(a.id)}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-3 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all",
                                        isSelected
                                            ? "bg-black text-white border-black shadow-md shadow-black/10 scale-105 z-10"
                                            : "bg-white text-gray-500 border-gray-100 hover:bg-gray-50"
                                    )}
                                >
                                    <a.icon size={14} className={isSelected ? "text-blue-300" : "text-gray-300"} />
                                    <span className="truncate">{a.id}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <Button
                    onClick={handleApply}
                    className="w-full rounded-2xl h-14 font-black uppercase tracking-[0.2em] bg-black text-white hover:opacity-90 transition-all active:scale-[0.98] shadow-xl shadow-black/20"
                >
                    Show Results
                </Button>
            </div>
        </div>
    );
}
