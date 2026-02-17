"use client";

import { useState } from "react";
import { Search, MapPin, Calendar, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function HeroSearch() {
    const router = useRouter();
    const [city, setCity] = useState("");

    const handleSearch = () => {
        router.push(`/hostels${city ? `?city=${encodeURIComponent(city)}` : ""}`);
    };

    return (
        <div className="relative w-full h-[500px] md:h-[600px] flex items-center justify-center overflow-hidden rounded-3xl mx-auto my-4 max-w-[95%]">
            {/* Background Image */}
            <div className="absolute inset-0">
                <img
                    src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2069&auto=format&fit=crop"
                    alt="Hostel Hero"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-4xl px-4 flex flex-col items-center text-center">
                <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight drop-shadow-lg">
                    Find your home away from home
                </h1>
                <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl drop-shadow-md">
                    Discover and book the best student hostels near your campus with ease and security.
                </p>

                {/* Search Box */}
                <div className="bg-white p-2 rounded-full shadow-2xl flex items-center w-full max-w-2xl transform transition-transform hover:scale-[1.01]">
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
                        className="bg-[#1877F2] hover:bg-[#145CBF] text-white p-4 rounded-full transition-colors shadow-md"
                    >
                        <Search size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
}