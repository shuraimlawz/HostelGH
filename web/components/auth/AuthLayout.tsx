"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import LogoAnimation from "../layout/LogoAnimation";
import AuthCarousel from "./AuthCarousel";

const QUOTES = [
    {
        title: "GET EVERYTHING\nYOU WANT",
        text: "You can get everything you want if you work hard, trust the process, and stick to the plan."
    },
    {
        title: "START YOUR\nJOURNEY",
        text: "Home is where your story begins. Find yours with HostelGH, the next generation of student living."
    },
    {
        title: "INVEST IN\nYOUR FUTURE",
        text: "The beautiful thing about learning is that no one can take it away from you. Let us handle your comfort."
    },
    {
        title: "PREMIUM\nSTUDENT LIVING",
        text: "Your home away from home, where comfort meets academic excellence and community thrives."
    },
    {
        title: "KEEP PUSHING\nFORWARD",
        text: "Success is the sum of small efforts, repeated day in and day out. We're here to support your climb."
    }
];

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
    showSocialAuth?: boolean;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    const [quoteIndex, setQuoteIndex] = useState(0);

    useEffect(() => {
        console.log("Auth Quote Cycle Started");
        const interval = setInterval(() => {
            setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen w-full flex">
            {/* Left Side - Image Carousel */}
            <div className="hidden lg:flex w-1/2 bg-black relative overflow-hidden items-center justify-center">
                <div className="absolute inset-0 z-0">
                    <AuthCarousel />
                </div>

                {/* Overlay Content - Rotating Quotes */}
                <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex flex-col justify-center p-12 w-full h-full text-white">
                    <div className="relative h-80 max-w-lg">
                        {QUOTES.map((quote, idx) => (
                            <div
                                key={idx}
                                className={`absolute inset-0 transition-all duration-[1200ms] ease-out ${idx === quoteIndex
                                    ? "opacity-100 translate-x-0 visible"
                                    : "opacity-0 -translate-x-12 invisible"
                                    }`}
                            >
                                <div className="inline-block px-3 py-1 mb-8 rounded-full border border-white/20 bg-white/10 backdrop-blur-md">
                                    <h2 className="text-[10px] font-black tracking-[0.3em] text-cyan-300 uppercase">A Wise Quote</h2>
                                </div>
                                <p className="text-2xl font-medium opacity-90 leading-relaxed mb-8 drop-shadow-md text-white/90">
                                    "{quote.text}"
                                </p>
                                <div className="mt-auto">
                                    <h1 className="text-5xl lg:text-6xl font-black tracking-tighter leading-tight drop-shadow-2xl whitespace-pre-line text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60">
                                        {quote.title}
                                    </h1>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Premium Progress Bar for Quotes */}
                    <div className="absolute bottom-12 left-12 flex gap-2 items-center bg-black/20 backdrop-blur-md p-2 rounded-full border border-white/10">
                        {QUOTES.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setQuoteIndex(idx)}
                                className={`h-1.5 rounded-full transition-all duration-700 ${idx === quoteIndex ? "w-8 bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]" : "w-2 bg-white/30 hover:bg-white/60"
                                    }`}
                                aria-label={`Select quote ${idx + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side - Form Content */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 bg-background relative">
                {/* Subtle background glow */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(var(--primary-rgb),0.03),transparent_40%)] pointer-events-none" />

                <div className="w-full max-w-[380px] relative z-10">
                    {/* Header */}
                    <div className="mb-8 text-center lg:text-left">
                        <div className="flex justify-center lg:justify-start mb-6">
                            <Link href="/" className="font-black tracking-tighter text-lg flex items-center gap-2 group">
                                <span className="p-1 animate-bounce-subtle">
                                    <LogoAnimation />
                                </span>
                                <span className="uppercase tracking-[0.2em] text-xs">HostelGH</span>
                            </Link>
                        </div>
                        <h1 className="text-2xl font-black tracking-tight mb-1 text-foreground uppercase italic">{title} <span className="text-primary NOT-italic">.</span></h1>
                        {subtitle && <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest">{subtitle}</p>}
                    </div>

                    {/* Form Container */}
                    <div className="bg-card border border-border p-6 rounded-sm shadow-sm">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
