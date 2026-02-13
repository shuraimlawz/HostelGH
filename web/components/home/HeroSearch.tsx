"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const HERO_IMAGES = [
    "https://upload.wikimedia.org/wikipedia/commons/6/69/Unity_hall_KNUST.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/5/53/Side_view_of_Commonwealth_Hall_Legon.jpg",
    "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2069&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1596276020587-8044fe049813?q=80&w=2078&auto=format&fit=crop",
    "https://upload.wikimedia.org/wikipedia/commons/a/a6/Great_Hall_University_of_Ghana.jpg",
];

export default function HeroSearch() {
    const router = useRouter();
    const [city, setCity] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % HERO_IMAGES.length);
        }, 6000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="px-4">
            <div className="mx-auto max-w-6xl py-8">
                <div className="relative rounded-[3rem] overflow-hidden min-h-[450px] flex flex-col justify-center p-8 md:p-16 border border-white/10 shadow-2xl">
                    {/* Dynamic Backgrounds */}
                    {HERO_IMAGES.map((src, idx) => (
                        <div
                            key={idx}
                            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentIndex ? "opacity-100" : "opacity-0"
                                }`}
                            style={{
                                backgroundImage: `url(${src})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                            }}
                        />
                    ))}

                    {/* Sophisticated Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />
                    <div className="absolute inset-0 bg-black/20 z-10" />

                    {/* Content */}
                    <div className="relative z-20 text-white max-w-2xl">
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 leading-tight drop-shadow-lg">
                            Find a hostel that <span className="text-blue-400">feels like home.</span>
                        </h1>
                        <p className="text-lg md:text-xl opacity-90 mb-10 leading-relaxed font-light">
                            Browse verified hostels, compare room types, request bookings, and pay securely across Ghana's top universities.
                        </p>

                        <div className="flex flex-col md:flex-row gap-4 mb-10 p-2 bg-white/10 backdrop-blur-md rounded-[2rem] border border-white/20">
                            <div className="relative flex-1">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/60 w-5 h-5" />
                                <Input
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    placeholder="Which city are you going to?"
                                    className="w-full bg-transparent border-none text-white placeholder:text-white/50 h-14 pl-14 focus-visible:ring-0 focus-visible:ring-offset-0 text-lg"
                                />
                            </div>
                            <Button
                                onClick={() => router.push(`/hostels${city ? `?city=${encodeURIComponent(city)}` : ""}`)}
                                className="rounded-[1.5rem] h-14 px-10 font-bold bg-white text-black hover:bg-gray-100 transition-all active:scale-[0.98] text-lg"
                            >
                                Search
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {["Accra", "Kumasi", "Cape Coast", "Tamale"].map((c) => (
                                <button
                                    key={c}
                                    onClick={() => router.push(`/hostels?city=${encodeURIComponent(c)}`)}
                                    className="group relative rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 p-4 text-left hover:bg-white/20 transition-all duration-300 active:scale-[0.97]"
                                >
                                    <div className="font-bold text-white group-hover:text-blue-300 transition-colors uppercase tracking-wider text-xs mb-1">{c}</div>
                                    <div className="text-[10px] text-white/60 font-medium">EXPLORE HOSTELS</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}