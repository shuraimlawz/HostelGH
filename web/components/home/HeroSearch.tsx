"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, Sparkles, Navigation, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const FALLBACK_HERO_IMAGES = [
    "/FuubNuyWIAAzS0c.jpg",
    "/SRC_hostel_KNUST-Kumasi.jpg",
    "/evandy-scaled-1.jpg",
    "/upsahostel.jpg",
    "/Hostel_Block_B_(GCTU).jpg",
    "/hall-seven.jpg",
    "/BfTDaFFIUAAYpK9.jpg",
    "/ace2fe4f_z.webp"
];

export default function HeroSearch() {
    const router = useRouter();
    const [city, setCity] = useState("");
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const { data: trendingHostels, isLoading: isLoadingTrending } = useQuery({
        queryKey: ["featured-hostels"],
        queryFn: async () => {
            const { data } = await api.get("/hostels/public", { params: { sort: "relevance" } });
            return Array.isArray(data) ? data : [];
        },
    });

    const activeImages = trendingHostels && trendingHostels.length > 0
        ? trendingHostels.map((hostel: any) => hostel.images?.[0]).filter(Boolean)
        : FALLBACK_HERO_IMAGES;

    const displayImages = activeImages.length > 0 ? activeImages : FALLBACK_HERO_IMAGES;

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [displayImages.length]);

    const handleSearch = (overrideCity?: string) => {
        const searchCity = overrideCity !== undefined ? overrideCity : city;
        router.push(`/find${searchCity ? `?city=${encodeURIComponent(searchCity)}` : ""}`);
    };

    const { data: trendingLocations, isLoading: isLoadingLocations } = useQuery({
        queryKey: ["trending-locations"],
        queryFn: async () => {
            const { data } = await api.get("/hostels/trending-locations");
            return Array.isArray(data) ? data : [];
        },
    });

    return (
        <div className="relative w-full h-[65vh] md:h-[75vh] flex items-center justify-center overflow-hidden rounded-[2.5rem] mx-auto my-6 max-w-[98%] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border border-white/10">
            {/* Background Image Carousel with Ken Burns Effect */}
            {displayImages.map((img: string, index: number) => (
                <div
                    key={img}
                    className={cn(
                        "absolute inset-0 transition-opacity duration-[2000ms] ease-in-out overflow-hidden",
                        index === currentImageIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                    )}
                >
                    <img
                        src={img}
                        alt={`Hostel Hero ${index + 1}`}
                        className={cn(
                            "w-full h-full object-cover transition-transform duration-[10000ms] ease-linear scale-110",
                            index === currentImageIndex && "scale-100"
                        )}
                    />
                    {/* Multi-layered Overlay for depth */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-black/90 px-6" />
                </div>
            ))}

            {/* Content Container */}
            <div className="relative z-20 w-full max-w-5xl px-6 flex flex-col items-center text-center space-y-8">
                {/* Floating Badge - Minimalist */}
                <div className="animate-in fade-in slide-in-from-top-6 duration-1000">
                    <div className="inline-flex items-center px-4 py-2 rounded-xl bg-blue-600/20 backdrop-blur-xl border border-blue-500/30 text-white text-[10px] uppercase font-bold tracking-[0.2em] shadow-xl">
                        <Sparkles className="mr-3 h-4 w-4 text-blue-400 animate-pulse" />
                        PREMIUM ARCHIVE ACCESS
                    </div>
                </div>

                {/* Main Heading */}
                <div className="space-y-4">
                    <h1 className="text-5xl md:text-8xl font-bold text-white tracking-tighter drop-shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both uppercase leading-tight">
                        Next Chapter <span className="text-blue-500">Starts</span> Here
                    </h1>
                    {/* Subtitle */}
                    <p className="text-base md:text-xl text-gray-300 max-w-2xl mx-auto drop-shadow-lg font-bold animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300 fill-mode-both leading-relaxed uppercase tracking-wide">
                        Vetted residences near Ghana's elite campuses. Safe, modern, and verified.
                    </p>
                </div>

                {/* Modern Direct Search Box */}
                <div className="w-full max-w-3xl animate-in fade-in zoom-in-95 duration-1000 delay-500 fill-mode-both">
                    <div className="bg-white/10 backdrop-blur-2xl p-3 rounded-3xl border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-center gap-3 relative group">
                        
                        {/* Location Input Group */}
                        <div className="relative z-10 flex-1 flex items-center px-6 h-16 rounded-2xl bg-white/5 border border-white/5 group-focus-within:bg-white group-focus-within:border-white transition-all w-full focus-within:shadow-xl">
                            <MapPin className="text-blue-500 mr-4 shrink-0 transition-colors group-focus-within:text-blue-600" size={24} />
                            <div className="flex-1 text-left">
                                <label className="block text-[9px] font-bold text-gray-400 group-focus-within:text-gray-500 uppercase tracking-widest mb-0.5 transition-colors">Where do you want to live?</label>
                                <input
                                    type="text"
                                    placeholder="Enter school or area..."
                                    className="w-full text-white group-focus-within:text-gray-900 placeholder:text-gray-500 font-bold bg-transparent border-none outline-none text-sm selection:bg-blue-500/30 uppercase tracking-widest"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                />
                            </div>
                        </div>

                        {/* Search Button */}
                        <button
                            onClick={() => handleSearch()}
                            className="relative z-10 bg-blue-600 text-white h-16 px-10 rounded-2xl transition-all shadow-xl shadow-blue-600/20 hover:bg-blue-700 flex items-center justify-center gap-3 w-full md:w-auto font-bold text-[11px] uppercase tracking-widest group active:scale-95"
                        >
                            <Search size={20} className="group-hover:scale-110 transition-transform" />
                            <span>Locate Asset</span>
                        </button>
                    </div>

                    {/* Quick Links */}
                    <div className="mt-8 flex flex-wrap justify-center gap-3 text-white/40 text-[10px] font-bold uppercase tracking-widest">
                        <span className="mt-2.5 opacity-30">Trending:</span>
                        {trendingLocations && trendingLocations.length > 0 ? (
                            trendingLocations.map((loc) => (
                                <button
                                    key={loc}
                                    onClick={() => {
                                        setCity(loc);
                                        handleSearch(loc);
                                    }}
                                    className="px-5 py-2.5 rounded-xl border border-white/10 hover:border-blue-500/50 hover:bg-blue-600 hover:text-white transition-all backdrop-blur-md active:scale-90 shadow-sm"
                                >
                                    {loc}
                                </button>
                            ))
                        ) : (
                            !isLoadingLocations && <span className="opacity-20 font-bold px-4 lowercase tracking-[0.2em] py-2.5">Loading areas...</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Pagination Indicators */}
            <div className="absolute bottom-10 flex gap-2 z-30">
                {displayImages.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={cn(
                            "h-1.5 transition-all duration-700 rounded-full",
                            index === currentImageIndex ? "w-10 bg-blue-600 shadow-lg shadow-blue-500/50" : "w-3 bg-white/20 hover:bg-white/40"
                        )}
                        aria-label={`Show unit ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
