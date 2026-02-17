"use client";

import { useState, useEffect } from "react";
import { Search, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const HERO_IMAGES = [
    "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2069&auto=format&fit=crop", // Lounge
    "https://images.unsplash.com/photo-1596276020612-a9c5a91c7849?q=80&w=2070&auto=format&fit=crop", // Bedroom
    "https://images.unsplash.com/photo-1520277739336-7bf67edfa768?q=80&w=1978&auto=format&fit=crop", // Exterior
    "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=2070&auto=format&fit=crop", // Mountain view
    "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=1966&auto=format&fit=crop"  // Study area
];

export default function HeroSearch() {
    const router = useRouter();
    const [city, setCity] = useState("");
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleSearch = () => {
        router.push(`/hostels${city ? `?city=${encodeURIComponent(city)}` : ""}`);
    };

    return (
        <div className="relative w-full h-[500px] md:h-[600px] flex items-center justify-center overflow-hidden rounded-3xl mx-auto my-4 max-w-[95%]">
            {/* Background Image Carousel */}
            {/* Background Image Carousel */}
            {HERO_IMAGES.map((img, index) => (
                <div
                    key={img}
                    className={cn(
                        "absolute inset-0 transition-opacity duration-1000 ease-in-out",
                        index === currentImageIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                    )}
                >
                    <img
                        src={img}
                        alt={`Hostel Hero ${index + 1}`}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40" />
                </div>
            ))}

            {/* Content */}
            <div className="relative z-10 w-full max-w-4xl px-4 flex flex-col items-center text-center">
                <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight drop-shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-700">
                    Find your home away from home
                </h1>
                <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl drop-shadow-md animate-in fade-in slide-in-from-bottom-5 duration-1000">
                    Discover and book the best student hostels near your campus with ease and security.
                </p>

                {/* Search Box */}
                <div className="bg-white p-2 rounded-full shadow-2xl flex items-center w-full max-w-2xl transform transition-transform hover:scale-[1.01] animate-in fade-in zoom-in-95 duration-500 delay-300">
                    <div className="flex-1 flex items-center px-6 border-r border-gray-200">
                        <MapPin className="text-gray-400 mr-3" size={20} />
                        <div className="flex-1 text-left">
                            <div className="text-xs font-bold text-gray-800 uppercase tracking-wider">Location</div>
                            <input
                                type="text"
                                placeholder="Where do you want to go?"
                                className="w-full text-gray-700 placeholder:text-gray-400 font-medium bg-transparent border-none outline-none text-sm truncate"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleSearch}
                        className="bg-[#1877F2] hover:bg-[#145CBF] text-white p-4 rounded-full transition-colors shadow-md group"
                    >
                        <Search size={24} className="group-hover:scale-110 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Carousel Indicators */}
            <div className="absolute bottom-6 flex gap-2 z-20">
                {HERO_IMAGES.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={cn(
                            "w-2 h-2 rounded-full transition-all backdrop-blur-sm",
                            index === currentImageIndex
                                ? "bg-white w-6"
                                : "bg-white/50 hover:bg-white/80"
                        )}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}