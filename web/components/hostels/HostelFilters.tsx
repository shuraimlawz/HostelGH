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

const REGIONAL_UNIVERSITIES = [
    {
        region: "Greater Accra",
        unis: [
            "Academic City University",
            "Accra Institute of Technology",
            "Accra Technical University",
            "African University College of Communications",
            "BlueCrest College",
            "Central University",
            "Ghana Christian University College",
            "Ghana Communication Technology University (GCTU)",
            "GIMPA",
            "Islamic University College",
            "Kings University College",
            "Knutsford University College",
            "Lancaster University Ghana",
            "Maranatha University College",
            "Methodist University Ghana",
            "Mountcrest University College",
            "Pentecost University",
            "Radford University College",
            "Regional Maritime University",
            "Regent University College of Science and Tech",
            "University of Ghana (Legon)",
            "University of Media, Arts and Communication (UniMAC)",
            "UPSA",
            "West End University College",
            "Wisconsin International University College",
            "Zenith University College"
        ]
    },
    {
        region: "Ashanti",
        unis: [
            "AAM-USTED (Kumasi/Mampong)",
            "Baptist University College",
            "Christ Apostolic University College",
            "Christian Service University College",
            "Garden City University College",
            "KNUST",
            "Kumasi Technical University"
        ]
    },
    {
        region: "Central",
        unis: [
            "Cape Coast Technical University",
            "University of Cape Coast (UCC)",
            "University of Education, Winneba (UEW)"
        ]
    },
    {
        region: "Eastern",
        unis: [
            "All Nations University",
            "Koforidua Technical University",
            "Presbyterian University Ghana",
            "University College of Agriculture and Environmental Studies",
            "University of Environment and Sustainable Development"
        ]
    },
    {
        region: "Western / Western North",
        unis: [
            "Takoradi Technical University",
            "University of Mines and Technology (UMaT)"
        ]
    },
    {
        region: "Volta / Oti",
        unis: [
            "Evangelical Presbyterian University",
            "Ho Technical University",
            "University of Health and Allied Sciences (UHAS)"
        ]
    },
    {
        region: "Northern / NE / Savannah",
        unis: [
            "Tamale Technical University",
            "University for Development Studies (UDS)"
        ]
    },
    {
        region: "Bono / Bono East / Ahafo",
        unis: [
            "Catholic University of Ghana",
            "Sunyani Technical University",
            "University of Energy and Natural Resources (UENR)"
        ]
    },
    {
        region: "Upper East",
        unis: [
            "Bolgatanga Technical University",
            "CK Tedam Uni of Technology & Applied Sciences"
        ]
    },
    {
        region: "Upper West",
        unis: [
            "Dr. Hilla Limann Technical University",
            "SDD-UBIDS (Wa)"
        ]
    }
];

export default function HostelFilters() {
    const router = useRouter();
    const params = useSearchParams();

    const [city, setCity] = useState(params.get("city") ?? "");
    const [region, setRegion] = useState(params.get("region") ?? "");
    const [university, setUniversity] = useState(params.get("university") ?? "");
    const [minPrice, setMinPrice] = useState(params.get("minPrice") ?? "");
    const [maxPrice, setMaxPrice] = useState(params.get("maxPrice") ?? "");
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
        params.get("amenities")?.split(",").filter(Boolean) ?? []
    );

    useEffect(() => {
        setCity(params.get("city") ?? "");
        setRegion(params.get("region") ?? "");
        setUniversity(params.get("university") ?? "");
        setMinPrice(params.get("minPrice") ?? "");
        setMaxPrice(params.get("maxPrice") ?? "");
        setSelectedAmenities(params.get("amenities")?.split(",").filter(Boolean) ?? []);
    }, [params]);

    const handleApply = () => {
        const p = new URLSearchParams();
        if (city) p.set("city", city);
        if (region) p.set("region", region);
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
        setRegion("");
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
                        {REGIONAL_UNIVERSITIES.map(group => (
                            <optgroup key={group.region} label={group.region} className="font-bold text-blue-600 bg-gray-50">
                                {group.unis.map(u => (
                                    <option key={u} value={u} className="text-gray-900 bg-white">{u}</option>
                                ))}
                            </optgroup>
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
