"use client";

import { useState, useEffect, useCallback } from "react";
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
        cta: "Learn More",
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
            className="relative w-full py-10"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="relative h-[300px] md:h-[350px] w-full overflow-hidden rounded-[2.5rem] shadow-2xl">
                {PROMOS.map((promo, index) => (
                    <div
                        key={promo.id}
                        className={cn(
                            "absolute inset-0 transition-all duration-1000 ease-in-out flex items-center",
                            index === current ? "opacity-100 translate-x-0 scale-100" : "opacity-0 translate-x-10 scale-105 pointer-events-none"
                        )}
                    >
                        {/* Background Gradient & Image */}
                        <div className={cn("absolute inset-0 bg-gradient-to-r z-10 opacity-90", promo.color)} />
                        <img 
                            src={promo.image} 
                            alt={promo.title}
                            className="absolute inset-0 w-full h-full object-cover grayscale opacity-30"
                        />

                        {/* Content */}
                        <div className="relative z-20 px-10 md:px-20 w-full flex flex-col md:flex-row items-center justify-between gap-10">
                            <div className="space-y-6 max-w-xl text-center md:text-left">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 border border-white/20 rounded-full">
                                    <span className="text-[10px] font-black text-white uppercase tracking-[0.25em]">{promo.badge}</span>
                                </div>
                                <div className="space-y-3">
                                    <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-[0.85]">
                                        {promo.title.split(' ').map((word, i) => (
                                            <span key={i} className="block">{word}</span>
                                        ))}
                                    </h2>
                                    <p className="text-white/70 text-sm md:text-base font-bold max-w-md leading-relaxed">
                                        {promo.subtitle}
                                    </p>
                                </div>
                                <div className="pt-4">
                                    <Link href={promo.href}>
                                        <button className="group h-14 px-8 bg-white text-gray-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all active:scale-95 flex items-center gap-3">
                                            {promo.cta}
                                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </Link>
                                </div>
                            </div>

                            <div className="hidden md:flex items-center justify-center w-64 h-64 bg-white/5 border border-white/10 rounded-[3rem] backdrop-blur-sm shadow-2xl relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                                {promo.icon}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Navigation Controls */}
                <div className="absolute bottom-10 left-10 md:left-20 z-30 flex items-center gap-4">
                    <div className="flex gap-2">
                        {PROMOS.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrent(i)}
                                className={cn(
                                    "h-1.5 rounded-full transition-all duration-500",
                                    i === current ? "w-8 bg-white" : "w-2 bg-white/30 hover:bg-white/50"
                                )}
                            />
                        ))}
                    </div>
                </div>

                <div className="absolute bottom-10 right-10 md:right-20 z-30 flex items-center gap-3">
                    <button 
                        onClick={prev}
                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-all active:scale-90"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button 
                        onClick={next}
                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-all active:scale-90"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
