"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Search, Loader2, X, Navigation, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface NominatimResult {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
    address?: {
        city?: string;
        town?: string;
        village?: string;
        state?: string;
        country?: string;
    };
}

interface LocationPickerProps {
    onSelect: (data: {
        display_name: string;
        lat: number;
        lng: number;
        city?: string;
        region?: string;
    }) => void;
    defaultValue?: string;
    placeholder?: string;
    className?: string;
}

export default function LocationPicker({
    onSelect,
    defaultValue = "",
    placeholder = "Search your hostel address (e.g. Danyame, Kumasi)...",
    className,
}: LocationPickerProps) {
    const [query, setQuery] = useState(defaultValue);
    const [results, setResults] = useState<NominatimResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSelected, setIsSelected] = useState(!!defaultValue);
    const [isGeolocating, setIsGeolocating] = useState(false);
    const [open, setOpen] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const search = useCallback(async (q: string) => {
        if (q.trim().length < 3) {
            setResults([]);
            setOpen(false);
            return;
        }
        setIsLoading(true);
        try {
            // Bias results to Ghana with countrycodes=gh
            const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=6&countrycodes=gh`;
            const res = await fetch(url, {
                headers: { "User-Agent": "HostelGH/1.0 (hostelgh.vercel.app)" },
            });
            const data: NominatimResult[] = await res.json();
            setResults(data);
            setOpen(data.length > 0);
        } catch (err) {
            console.error("Nominatim search error:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleInput = (value: string) => {
        setQuery(value);
        setIsSelected(false);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => search(value), 400);
    };

    const handleSelect = (result: NominatimResult) => {
        const city = result.address?.city || result.address?.town || result.address?.village;
        const region = result.address?.state;
        setQuery(result.display_name);
        setIsSelected(true);
        setOpen(false);
        setResults([]);
        onSelect({
            display_name: result.display_name,
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon),
            city,
            region,
        });
    };

    const handleGeolocation = () => {
        if (!navigator.geolocation) return;
        setIsGeolocating(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
                        { headers: { "User-Agent": "HostelGH/1.0 (hostelgh.vercel.app)" } }
                    );
                    const data = await res.json();
                    const city = data.address?.city || data.address?.town || data.address?.village;
                    const region = data.address?.state;
                    setQuery(data.display_name || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
                    setIsSelected(true);
                    onSelect({
                        display_name: data.display_name,
                        lat: latitude,
                        lng: longitude,
                        city,
                        region,
                    });
                } catch {
                    // Fallback: just use raw coords
                    setQuery(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
                    onSelect({ display_name: "", lat: latitude, lng: longitude });
                } finally {
                    setIsGeolocating(false);
                }
            },
            () => setIsGeolocating(false),
            { timeout: 10000, maximumAge: 60000 }
        );
    };

    const clear = () => {
        setQuery("");
        setIsSelected(false);
        setResults([]);
        setOpen(false);
    };

    return (
        <div ref={containerRef} className={cn("relative", className)}>
            <div className={cn(
                "flex items-center gap-2 w-full px-4 py-3 bg-gray-50 border rounded-xl transition-all",
                isSelected
                    ? "border-emerald-400 bg-emerald-50/30"
                    : "border-gray-200 focus-within:border-blue-500 focus-within:bg-white"
            )}>
                {isSelected ? (
                    <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                ) : (
                    <MapPin size={18} className="text-gray-300 shrink-0" />
                )}
                <input
                    value={query}
                    onChange={(e) => handleInput(e.target.value)}
                    onFocus={() => { if (results.length > 0) setOpen(true); }}
                    placeholder={placeholder}
                    className="flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400"
                />
                {isLoading && <Loader2 size={15} className="text-gray-300 animate-spin shrink-0" />}
                {!isLoading && query && (
                    <button type="button" onClick={clear} className="text-gray-300 hover:text-gray-600 transition-colors shrink-0">
                        <X size={15} />
                    </button>
                )}
                <div className="w-px h-5 bg-gray-200 shrink-0" />
                <button
                    type="button"
                    onClick={handleGeolocation}
                    disabled={isGeolocating}
                    title="Use my current location"
                    className="shrink-0 text-blue-500 hover:text-blue-700 transition-colors disabled:opacity-50"
                >
                    {isGeolocating ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : (
                        <Navigation size={16} />
                    )}
                </button>
            </div>

            {open && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl shadow-gray-200/50 z-50 overflow-hidden">
                    {results.map((r) => (
                        <button
                            key={r.place_id}
                            type="button"
                            onClick={() => handleSelect(r)}
                            className="w-full flex items-start gap-3 px-4 py-3.5 hover:bg-blue-50 transition-colors text-left border-b border-gray-50 last:border-0"
                        >
                            <MapPin size={14} className="text-blue-500 mt-0.5 shrink-0" />
                            <span className="text-sm text-gray-700 leading-snug">{r.display_name}</span>
                        </button>
                    ))}
                </div>
            )}

            {isSelected && (
                <p className="mt-1.5 text-xs text-emerald-600 font-medium flex items-center gap-1">
                    <CheckCircle2 size={11} /> Location pinned on map
                </p>
            )}
        </div>
    );
}
