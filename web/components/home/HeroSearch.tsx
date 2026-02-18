"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, Sparkles, Navigation } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const HERO_IMAGES = [
    "https://graduatehillshostel.com/images/GHH4.jpg", // Graduate Hills Exterior
    "https://somewherenice.com/wp-content/uploads/2019/06/somewhere-nice-hostel-accra-pool-1.jpg", // Somewhere Nice Pool
    "https://i.ytimg.com/vi/qY_0_X7eS_8/maxresdefault.jpg", // Pentagon/Legon Area
    "https://graduatehillshostel.com/images/PHOTO-2022-02-14-17-10-57_1_edited.jpg", // Modern Student Room
    "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2069&auto=format&fit=crop" // Premium Lounge
];

export default function HeroSearch() {
    const router = useRouter();
    const [city, setCity] = useState("");
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
        }, 6000);
        return () => clearInterval(interval);
    }, []);

    const handleSearch = () => {
        router.push(`/hostels${city ? `?city=${encodeURIComponent(city)}` : ""}`);
    };

    return (
        <div className="relative w-full h-[70vh] md:h-[85vh] flex items-center justify-center overflow-hidden rounded-[2.5rem] mx-auto my-6 max-w-[98%] shadow-2xl">
            {/* Background Image Carousel with Ken Burns Effect */}
            {HERO_IMAGES.map((img, index) => (
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
                            "w-full h-full object-cover transition-transform duration-[8000ms] ease-linear scale-110",
                            index === currentImageIndex && "scale-100"
                        )}
                    />
                    {/* Multi-layered Overlay for depth */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/70" />
                    <div className="absolute inset-0 backdrop-blur-[2px]" />
                </div>
            ))}

            {/* Content Container */}
            <div className="relative z-20 w-full max-w-5xl px-6 flex flex-col items-center text-center">
                {/* Floating Badge */}
                <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
                    <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white text-sm font-medium tracking-wide">
                        <Sparkles className="mr-2 h-4 w-4 text-blue-400" />
                        Premium Student Hostels in Ghana
                    </span>
                </div>

                {/* Main Heading */}
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 tracking-tighter drop-shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-1000 fill-mode-both">
                    Find your <span className="text-blue-400">perfect</span> space
                </h1>

                {/* Subtitle */}
                <p className="text-lg md:text-2xl text-white/80 mb-12 max-w-2xl drop-shadow-lg font-medium animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-both leading-relaxed">
                    Connecting students with safe, vetted, and modern residences across Ghana's top campuses.
                </p>

                {/* Modern GlassSearch Box */}
                <div className="w-full max-w-3xl animate-in fade-in zoom-in-95 duration-1000 delay-500 fill-mode-both">
                    <div className="bg-white/10 backdrop-blur-2xl p-3 rounded-[2rem] border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col md:flex-row items-center gap-3">
                        {/* Location Input Group */}
                        <div className="flex-1 flex items-center px-6 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors w-full">
                            <MapPin className="text-blue-400 mr-4" size={24} />
                            <div className="flex-1 text-left">
                                <label className="block text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-1">Campus or City</label>
                                <input
                                    type="text"
                                    placeholder="Enter Legon, KNUST, UCC..."
                                    className="w-full text-white placeholder:text-white/30 font-bold bg-transparent border-none outline-none text-lg"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                />
                            </div>
                        </div>

                        {/* Search Button */}
                        <button
                            onClick={handleSearch}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-8 h-full min-h-[64px] rounded-2xl transition-all shadow-xl hover:shadow-blue-500/25 flex items-center justify-center gap-3 w-full md:w-auto font-black text-lg group active:scale-95"
                        >
                            <Search size={24} className="group-hover:scale-110 transition-transform" />
                            <span>Quick Search</span>
                        </button>
                    </div>

                    {/* Quick Links / Trending */}
                    <div className="mt-8 flex flex-wrap justify-center gap-4 text-white/60 text-sm font-bold">
                        <span className="uppercase tracking-widest text-[10px] mt-2 w-full md:w-auto">Trending:</span>
                        {['East Legon', 'Ayeduase', 'UCC Gate', 'Atomic'].map((loc) => (
                            <button
                                key={loc}
                                onClick={() => { setCity(loc); }}
                                className="px-4 py-2 rounded-full border border-white/10 hover:border-white/30 hover:bg-white/5 hover:text-white transition-all backdrop-blur-sm flex items-center gap-2"
                            >
                                <Navigation className="h-3 w-3" />
                                {loc}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Premium Indicators */}
            <div className="absolute bottom-8 flex gap-3 z-30">
                {HERO_IMAGES.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={cn(
                            "group relative h-1.5 transition-all duration-500 rounded-full bg-white/20",
                            index === currentImageIndex ? "w-12 bg-blue-500" : "w-4 hover:bg-white/50"
                        )}
                        aria-label={`Show image ${index + 1}`}
                    >
                        {index === currentImageIndex && (
                            <span className="absolute inset-0 bg-blue-400 blur-sm opacity-50" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
