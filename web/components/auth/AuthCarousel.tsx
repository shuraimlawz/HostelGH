"use client";

import { useState, useEffect } from "react";

const IMAGES = [
    "https://upload.wikimedia.org/wikipedia/commons/6/69/Unity_hall_KNUST.jpg", // Unity Hall KNUST
    "https://upload.wikimedia.org/wikipedia/commons/5/53/Side_view_of_Commonwealth_Hall_Legon.jpg", // Commonwealth Hall Legon
    "https://upload.wikimedia.org/wikipedia/commons/7/7d/Balme_Library_at_University_of_Ghana_-_Legon.jpg", // Balme Library (UG)
    "https://upload.wikimedia.org/wikipedia/commons/a/a6/Great_Hall_University_of_Ghana.jpg", // Great Hall UG
    "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2069&auto=format&fit=crop", // Hostel Bunk (Fallback/Vibe)
    "https://images.unsplash.com/photo-1596276020587-8044fe049813?q=80&w=2078&auto=format&fit=crop", // Cozy Room (Fallback)
    "https://images.unsplash.com/photo-1520277739336-7bf67edfa768?q=80&w=2070&auto=format&fit=crop", // Lounge (Fallback)
];

export default function AuthCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % IMAGES.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="absolute inset-0 bg-black">
            {IMAGES.map((src, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? "opacity-60" : "opacity-0"
                        }`}
                    style={{
                        backgroundImage: `url(${src})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

            {/* Indicators */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 z-20">
                {IMAGES.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex ? "bg-white w-6" : "bg-white/40 hover:bg-white/60"
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
