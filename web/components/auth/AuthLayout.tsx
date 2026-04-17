"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import LogoAnimation from "../layout/LogoAnimation";
import AuthCarousel from "./AuthCarousel";
import { cn } from "@/lib/utils";

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
        const interval = setInterval(() => {
            setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen w-full flex bg-white font-sans">
            {/* Left Side - Image Carousel */}
            <div className="hidden lg:flex w-1/2 bg-gray-900 relative overflow-hidden items-center justify-center">
                <div className="absolute inset-0 z-0">
                    <AuthCarousel />
                </div>

                {/* Overlay Content - Rotating Quotes */}
                <div className="absolute inset-0 z-10 bg-gradient-to-r from-gray-950/90 via-gray-950/40 to-transparent flex flex-col justify-center p-20 w-full h-full text-white">
                    <div className="relative h-96 max-w-xl">
                        {QUOTES.map((quote, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    "absolute inset-0 transition-all duration-[1200ms] ease-out space-y-8",
                                    idx === quoteIndex
                                        ? "opacity-100 translate-x-0 visible"
                                        : "opacity-0 -translate-x-12 invisible"
                                )}
                            >
                                <div className="inline-block px-4 py-2 rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
                                    <h2 className="text-[10px] font-bold tracking-[0.3em] text-blue-400 uppercase">Daily Inspiration</h2>
                                </div>
                                <div className="space-y-6">
                                    <p className="text-3xl font-medium tracking-tight opacity-95 leading-relaxed drop-shadow-2xl text-white/90 font-serif lowercase">
                                        "{quote.text}"
                                    </p>
                                    <div className="h-1 w-16 bg-blue-600 rounded-full" />
                                </div>
                                <div className="pt-10">
                                    <h1 className="text-6xl lg:text-7xl font-bold tracking-tighter leading-tight drop-shadow-2xl whitespace-pre-line text-white uppercase">
                                        {quote.title}
                                    </h1>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Premium Progress Bar for Quotes */}
                    <div className="absolute bottom-16 left-20 flex gap-3 items-center bg-white/5 backdrop-blur-2xl p-3 rounded-2xl border border-white/10 shadow-2xl">
                        {QUOTES.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setQuoteIndex(idx)}
                                className={cn(
                                    "h-1.5 rounded-full transition-all duration-700",
                                    idx === quoteIndex ? "w-10 bg-blue-600 shadow-lg shadow-blue-500/50" : "w-3 bg-white/20 hover:bg-white/40"
                                )}
                                aria-label={`Select unit ${idx + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side - Form Content */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-12 bg-white relative">
                {/* Subtle background glow */}
                <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none" />

                <div className="w-full max-w-md relative z-10 space-y-12">
                    {/* Header */}
                    <div className="space-y-10 text-center lg:text-left">
                        <div className="flex justify-center lg:justify-start">
                            <Link href="/" className="font-bold tracking-tighter text-xl flex items-center gap-4 group">
                                <span className="p-1 group-hover:scale-110 transition-transform duration-500">
                                    <LogoAnimation />
                                </span>
                                <span className="uppercase tracking-[0.3em] text-[10px] text-gray-900">HostelGH</span>
                            </Link>
                        </div>
                        <div className="space-y-3">
                            <h1 className="text-4xl font-bold tracking-tighter text-gray-900 uppercase leading-none">
                                {title}
                            </h1>
                            {subtitle && (
                                <p className="text-gray-400 font-bold text-[11px] uppercase tracking-widest leading-relaxed">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                        <div className="h-1.5 w-16 bg-blue-600 rounded-full mx-auto lg:mx-0" />
                    </div>

                    {/* Form Container */}
                    <div className="bg-white border border-gray-100 p-10 md:p-12 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] animate-in fade-in zoom-in-95 duration-700">
                        {children}
                    </div>

                    {/* Security Footer */}
                    <div className="flex justify-center lg:justify-start items-center gap-3 text-[9px] font-bold text-gray-300 uppercase tracking-widest leading-none">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                        Secure login & authentication
                    </div>
                </div>
            </div>
        </div>
    );
}
