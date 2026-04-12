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

    const { data: trendingHostels } = useQuery({
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
        router.push(`/hostels${searchCity ? `?city=${encodeURIComponent(searchCity)}` : ""}`);
    };

    const { data: trendingLocations, isLoading: isLoadingTrending } = useQuery({
        queryKey: ["trending-locations"],
        queryFn: async () => {
            const { data } = await api.get("/hostels/trending-locations");
            return Array.isArray(data) ? data : [];
        },
    });

    return (
        <div className="relative w-full h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden rounded-xl mx-auto my-4 max-w-[98%] shadow-xl border border-border/50">
            {/* Background Image Carousel with Ken Burns Effect */}
            {displayImages.map((img: string, index: number) => (
                <div
                    key={img}
                    className={cn(
                        "absolute inset-0 transition-opacity duration-[1500ms] ease-in-out overflow-hidden",
                        index === currentImageIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                    )}
                >
                    <img
                        src={img}
                        alt={`Hostel Hero ${index + 1}`}
                        className={cn(
                            "w-full h-full object-cover transition-transform duration-[8000ms] ease-linear scale-105",
                            index === currentImageIndex && "scale-100"
                        )}
                    />
                    {/* Multi-layered Overlay for depth */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/80" />
                </div>
            ))}

            {/* Content Container */}
            <div className="relative z-20 w-full max-w-4xl px-6 flex flex-col items-center text-center">
                {/* Floating Badge - Minimalist */}
                <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-1000">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-sm bg-primary/20 backdrop-blur-md border border-primary/30 text-primary-foreground text-[10px] uppercase font-black tracking-widest">
                        <Sparkles className="mr-2 h-3 w-3 text-primary-foreground" />
                        Premium Student Spaces
                    </span>
                </div>

                {/* Main Heading - Scaled Down */}
                <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter drop-shadow-xl animate-in fade-in slide-in-from-bottom-6 duration-1000 fill-mode-both uppercase">
                    Your <span className="text-primary italic">next chapter</span> starts here
                </h1>

                {/* Subtitle - More Compact */}
                <p className="text-sm md:text-lg text-white/70 mb-10 max-w-xl drop-shadow-lg font-bold animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-both leading-relaxed">
                    Vetted residences near Ghana's top campuses. Safe, modern, and student-focused.
                </p>

                {/* Modern Direct Search Box */}
                <div className="w-full max-w-2xl animate-in fade-in zoom-in-95 duration-1000 delay-500 fill-mode-both px-4">
                    <div className="bg-background/95 backdrop-blur-md p-1.5 rounded-lg border border-border shadow-2xl flex flex-col md:flex-row items-center gap-1.5 relative overflow-hidden">
                        
                        {/* Location Input Group */}
                        <div className="relative z-10 flex-1 flex items-center px-4 py-2.5 rounded-md bg-muted/30 border border-transparent hover:border-border transition-colors w-full focus-within:ring-1 focus-within:ring-primary/50">
                            <MapPin className="text-primary mr-3" size={18} />
                            <div className="flex-1 text-left">
                                <label className="block text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-0.5">Location</label>
                                <input
                                    type="text"
                                    placeholder="Legon, KNUST, UCC..."
                                    className="w-full text-foreground placeholder:text-muted-foreground/50 font-black bg-transparent border-none outline-none text-sm selection:bg-primary/30"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                />
                            </div>
                        </div>

                        {/* Search Button */}
                        <button
                            onClick={() => handleSearch()}
                            className="relative z-10 bg-primary text-primary-foreground px-6 h-full min-h-[48px] rounded-md transition-all shadow-md hover:bg-primary/90 flex items-center justify-center gap-2 w-full md:w-auto font-black text-xs uppercase tracking-widest group active:scale-95"
                        >
                            <Search size={16} />
                            <span>Search</span>
                        </button>
                    </div>

                    {/* Quick Links - Slanted / Unique style */}
                    <div className="mt-6 flex flex-wrap justify-center gap-2 text-white/50 text-[10px] font-black uppercase tracking-widest">
                        <span className="mt-1.5 opacity-40">Trending:</span>
                        {trendingLocations && trendingLocations.length > 0 ? (
                            trendingLocations.map((loc) => (
                                <button
                                    key={loc}
                                    onClick={() => {
                                        setCity(loc);
                                        handleSearch(loc);
                                    }}
                                    className="px-3 py-1.5 rounded-sm border border-white/10 hover:border-primary/50 hover:bg-primary/10 hover:text-white transition-all backdrop-blur-sm active:scale-90"
                                >
                                    {loc}
                                </button>
                            ))
                        ) : (
                            !isLoadingTrending && <span className="opacity-30 italic font-medium px-4 lowercase">Discovering hotspots...</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Small Indicators */}
            <div className="absolute bottom-6 flex gap-1.5 z-30">
                {displayImages.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={cn(
                            "h-1 transition-all duration-500 rounded-full",
                            index === currentImageIndex ? "w-8 bg-primary" : "w-2 bg-white/20 hover:bg-white/40"
                        )}
                        aria-label={`Show image ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
