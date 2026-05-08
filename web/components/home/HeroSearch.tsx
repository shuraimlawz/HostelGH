"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Search, MapPin, Sparkles, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

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
    const [scrolled, setScrolled] = useState(false);
    const heroRef = useRef<HTMLDivElement>(null);

    const { data: trendingHostels } = useQuery({
        queryKey: ["featured-hostels"],
        queryFn: async () => {
            const { data } = await api.get("/hostels/public", { params: { sort: "relevance" } });
            return Array.isArray(data) ? data : [];
        },
    });

    const activeImages = trendingHostels && trendingHostels.length > 0
        ? trendingHostels.map((h: any) => h.images?.[0]).filter(Boolean)
        : FALLBACK_HERO_IMAGES;
    const displayImages = activeImages.length > 0 ? activeImages : FALLBACK_HERO_IMAGES;

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [displayImages.length]);

    // Scroll-collapse listener
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 90);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const [isFocused, setIsFocused] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem("recent_hostel_searches");
        if (saved) setRecentSearches(JSON.parse(saved));
    }, []);

    const saveRecentSearch = (q: string) => {
        if (!q || q.trim().length < 2) return;
        const updated = [q, ...recentSearches.filter(s => s !== q)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem("recent_hostel_searches", JSON.stringify(updated));
    };

    const handleSearch = (overrideQuery?: string) => {
        const searchVal = overrideQuery !== undefined ? overrideQuery : city;
        if (searchVal) saveRecentSearch(searchVal);
        router.push(`/hostels${searchVal ? `?query=${encodeURIComponent(searchVal)}` : ""}`);
    };


    return (
        <div
            ref={heroRef}
            className={cn(
                "relative w-full flex items-center justify-center overflow-hidden rounded-[2rem] mx-auto my-6 max-w-[98%] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border border-white/10 transition-all duration-700 ease-in-out",
                scrolled
                    ? "h-[42vh] md:h-[38vh]"
                    : "h-[65vh] md:h-[75vh]"
            )}
        >
            {/* Background Image Carousel */}
            {displayImages.map((img: string, index: number) => (
                <div
                    key={img}
                    className={cn(
                        "absolute inset-0 transition-opacity duration-[2000ms] ease-in-out overflow-hidden",
                        index === currentImageIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                    )}
                >
                    <Image
                        src={img}
                        alt={`Hostel ${index + 1}`}
                        fill
                        priority={index === 0}
                        sizes="100vw"
                        className={cn(
                            "object-cover transition-transform duration-[10000ms] ease-linear scale-110",
                            index === currentImageIndex && "scale-100"
                        )}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-black/90" />
                </div>
            ))}

            {/* Content */}
            <div className="relative z-20 w-full max-w-5xl px-6 flex flex-col items-center text-center space-y-6">
                {/* Badge — hides when scrolled */}
                <div className={cn(
                    "transition-all duration-500",
                    scrolled ? "opacity-0 -translate-y-4 h-0 overflow-hidden" : "opacity-100 translate-y-0"
                )}>
                    <div className="inline-flex items-center px-4 py-2 rounded-xl bg-blue-600/20 backdrop-blur-xl border border-blue-500/30 text-white text-[10px] uppercase font-bold tracking-[0.2em] shadow-xl">
                        <Sparkles className="mr-3 h-4 w-4 text-blue-400 animate-pulse" />
                        PREMIUM HOSTEL ACCESS
                    </div>
                </div>

                {/* Heading — shrinks when scrolled */}
                <div className={cn("space-y-3 transition-all duration-500", scrolled && "space-y-0")}>
                    <h1 className={cn(
                        "font-bold text-white tracking-tighter drop-shadow-2xl uppercase leading-tight transition-all duration-500",
                        scrolled ? "text-3xl md:text-4xl" : "text-5xl md:text-8xl"
                    )}>
                        Next Chapter <span className="text-blue-500">Starts</span> Here
                    </h1>
                    {/* Subtitle — fades out when scrolled */}
                    <p className={cn(
                        "text-base text-gray-300 max-w-2xl mx-auto drop-shadow-lg font-bold uppercase tracking-wide transition-all duration-500",
                        scrolled ? "opacity-0 max-h-0 overflow-hidden mt-0" : "opacity-100 max-h-20 md:text-xl"
                    )}>
                        Vetted residences near Ghana's elite campuses. Safe, modern, and verified.
                    </p>
                </div>

                {/* Search Box — always visible */}
                <div className="w-full max-w-3xl relative">
                    <div className={cn(
                        "bg-white/10 backdrop-blur-2xl p-2.5 rounded-2xl border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-center gap-2 transition-all duration-300",
                        isFocused && "bg-white/20 border-white/30"
                    )}>
                        <div className="relative z-10 flex-1 flex items-center px-5 h-14 rounded-xl bg-white/5 border border-white/5 focus-within:bg-white focus-within:border-white transition-all w-full focus-within:shadow-xl group">
                            <MapPin className="text-blue-500 mr-3 shrink-0 transition-colors group-focus-within:text-blue-600" size={20} />
                            <div className="flex-1 text-left">
                                <label className="block text-[9px] font-bold text-gray-400 group-focus-within:text-gray-500 uppercase tracking-widest mb-0.5">Where do you want to live?</label>
                                <input
                                    type="text"
                                    placeholder="School, city, or area..."
                                    className="w-full text-white group-focus-within:text-gray-900 placeholder:text-gray-500 font-bold bg-transparent border-none outline-none text-sm uppercase tracking-widest"
                                    value={city}
                                    autoComplete="off"
                                    autoCorrect="off"
                                    autoCapitalize="off"
                                    spellCheck={false}
                                    onChange={(e) => setCity(e.target.value)}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handleSearch();
                                            setIsFocused(false);
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        <button
                            onClick={() => { handleSearch(); setIsFocused(false); }}
                            className="bg-blue-600 text-white h-14 px-8 rounded-xl transition-all shadow-xl shadow-blue-600/20 hover:bg-blue-700 flex items-center justify-center gap-2 w-full md:w-auto font-bold text-[11px] uppercase tracking-widest active:scale-95"
                        >
                            <Search size={18} />
                            <span>Search</span>
                        </button>
                    </div>

                    {/* Suggestions Dropdown (Home Page) — only user's own recent searches */}
                    {isFocused && recentSearches.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 text-left">
                            <div className="p-4">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    Recent Searches
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {recentSearches.map(s => (
                                        <button 
                                            key={s} 
                                            onClick={() => { setCity(s); handleSearch(s); setIsFocused(false); }}
                                            className="px-3 py-1.5 bg-gray-50 hover:bg-blue-50 text-xs font-bold text-gray-600 rounded-lg border border-gray-100 hover:border-blue-200 transition-all"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                    {/* Simple search hint — no hardcoded locations */}
                    <div className={cn(
                        "mt-5 transition-all duration-500",
                        scrolled ? "opacity-0 h-0 overflow-hidden mt-0" : "opacity-100"
                    )}>
                        <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest text-center">
                            Search by school name, hostel name, or city
                        </p>
                </div>
            </div>

            {/* Pagination dots — hide when scrolled */}
            <div className={cn(
                "absolute bottom-8 flex gap-2 z-30 transition-all duration-500",
                scrolled ? "opacity-0 bottom-2" : "opacity-100"
            )}>
                {displayImages.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className="p-2 group outline-none"
                        aria-label={`Image ${index + 1}`}
                    >
                        <div className={cn(
                            "h-1.5 transition-all duration-700 rounded-full",
                            index === currentImageIndex ? "w-8 bg-blue-600 shadow-lg shadow-blue-500/50" : "w-2.5 bg-white/20 group-hover:bg-white/40"
                        )} />
                    </button>
                ))}
            </div>
        </div>
    );
}
