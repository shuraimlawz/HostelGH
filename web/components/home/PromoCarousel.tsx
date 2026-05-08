"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, ShieldCheck, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const PROMOS = [
    {
        id: 1,
        title: "List Your Hostel",
        subtitle: "Reach thousands of students instantly. Join the largest student housing network in Ghana.",
        badge: "Limited Offer",
        cta: "Start Listing",
        href: "/auth/register?role=OWNER",
        color: "from-blue-600 to-indigo-700",
        icon: <Sparkles className="text-blue-200" size={40} />,
        image: "https://images.unsplash.com/photo-1555854817-5b2247a8175f?q=80&w=1200&auto=format&fit=crop"
    },
    {
        id: 2,
        title: "Verified by HostelGH",
        subtitle: "Every hostel on our platform is physically verified for safety, water, and electricity standards.",
        badge: "Trust & Safety",
        cta: "Learn more about our verification",
        href: "/support",
        color: "from-emerald-600 to-teal-700",
        icon: <ShieldCheck className="text-emerald-200" size={40} />,
        image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1200&auto=format&fit=crop"
    },
    {
        id: 3,
        title: "Swift Bookings",
        subtitle: "Secure your room in less than 2 minutes with our automated reservation system.",
        badge: "Efficiency",
        cta: "Explore Hubs",
        href: "/hostels",
        color: "from-purple-600 to-violet-700",
        icon: <Zap className="text-purple-200" size={40} />,
        image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1200&auto=format&fit=crop"
    }
];

export default function PromoCarousel() {
    const [current, setCurrent] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const next = useCallback(() => {
        setCurrent((prev) => (prev === PROMOS.length - 1 ? 0 : prev + 1));
    }, []);

    const prev = () => {
        setCurrent((prev) => (prev === 0 ? PROMOS.length - 1 : prev - 1));
    };

    useEffect(() => {
        if (isPaused) return;
        const timer = setInterval(next, 5000);
        return () => clearInterval(timer);
    }, [next, isPaused]);

    return (
        <div 
            className="relative w-full py-8 md:py-12"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="relative min-h-[380px] md:min-h-[280px] w-full overflow-hidden rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-800">
                {PROMOS.map((promo, index) => (
                    <div
                        key={promo.id}
                        className={cn(
                            "absolute inset-0 transition-all duration-1000 ease-in-out flex items-center",
                            index === current ? "opacity-100 translate-x-0 scale-100" : "opacity-0 translate-x-10 scale-105 pointer-events-none"
                        )}
                    >
                        {/* Background Gradient & Image */}
                        <div className={cn("absolute inset-0 bg-gradient-to-r z-10 opacity-95", promo.color)} />
                        <Image 
                            src={promo.image} 
                            alt={promo.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 800px"
                            className="object-cover opacity-20 mix-blend-overlay"
                        />

                        {/* Content */}
                        <div className="relative z-20 px-6 py-10 md:px-12 md:py-0 w-full h-full flex flex-col md:flex-row items-center justify-between gap-8 md:gap-10">
                            <div className="space-y-5 max-w-xl text-center md:text-left flex-1 flex flex-col items-center md:items-start justify-center h-full">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full shadow-sm">
                                    <span className="text-[9px] font-bold text-white uppercase tracking-widest">{promo.badge}</span>
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                                        {promo.title}
                                    </h2>
                                    <p className="text-white/80 text-sm md:text-base font-medium max-w-md leading-relaxed mx-auto md:mx-0">
                                        {promo.subtitle}
                                    </p>
                                </div>
                                <div className="pt-2">
                                    <Link href={promo.href}>
                                        <button className="group h-12 px-6 bg-white text-gray-900 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg w-full md:w-auto">
                                            {promo.cta}
                                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </Link>
                                </div>
                            </div>

                            <div className="hidden md:flex items-center justify-center w-40 h-40 lg:w-48 lg:h-48 bg-white/10 border border-white/20 rounded-3xl backdrop-blur-md shadow-2xl relative overflow-hidden shrink-0 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                                <div className="transform scale-150">
                                    {promo.icon}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Navigation Controls */}
                <div className="absolute bottom-6 left-0 right-0 md:left-12 md:right-auto z-30 flex items-center justify-center md:justify-start gap-4">
                    <div className="flex gap-2">
                        {PROMOS.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrent(i)}
                                className="p-2 group outline-none"
                                aria-label={`Go to slide ${i + 1}`}
                            >
                                <div className={cn(
                                    "h-1.5 rounded-full transition-all duration-500",
                                    i === current ? "w-6 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" : "w-1.5 bg-white/40 group-hover:bg-white/70"
                                )} />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="absolute bottom-6 right-6 md:right-12 z-30 hidden md:flex items-center gap-2">
                    <button 
                        onClick={prev}
                        className="h-8 w-8 flex items-center justify-center rounded-lg bg-black/20 border border-white/20 text-white hover:bg-black/40 backdrop-blur-sm transition-all active:scale-90"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button 
                        onClick={next}
                        className="h-8 w-8 flex items-center justify-center rounded-lg bg-black/20 border border-white/20 text-white hover:bg-black/40 backdrop-blur-sm transition-all active:scale-90"
                        aria-label="Next slide"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
