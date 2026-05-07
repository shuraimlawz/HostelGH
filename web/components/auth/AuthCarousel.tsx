"use client";

import { useState, useEffect } from "react";

const IMAGES = [
    "/SRC_hostel_KNUST-Kumasi.jpg",
    "/evandy-scaled-1.jpg",
    "/upsahostel.jpg",
    "/Hostel_Block_B_(GCTU).jpg",
    "/hall-seven.jpg",
    "/BfTDaFFIUAAYpK9.jpg",
    "/FuubNuyWIAAzS0c.jpg",
    "/ace2fe4f_z.webp"
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
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex ? "bg-white dark:bg-gray-950 w-6" : "bg-white dark:bg-gray-950/40 hover:bg-white dark:bg-gray-950/60"
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
