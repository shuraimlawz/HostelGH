"use client";

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
                <div className="relative z-10 text-white max-w-lg p-12 w-full h-full flex flex-col justify-center">
                    <div className="relative h-80">
                        {QUOTES.map((quote, idx) => (
                            <div
                                key={idx}
                                className={`absolute inset-0 transition-all duration-1000 ease-in-out ${idx === quoteIndex
                                    ? "opacity-100 translate-y-0 visible"
                                    : "opacity-0 translate-y-8 invisible"
                                    }`}
                            >
                                <h2 className="text-sm font-bold tracking-[0.3em] mb-6 text-blue-400 opacity-80 uppercase">A Wise Quote</h2>
                                <div className="h-1 w-16 bg-white/20 mb-8"></div>
                                <p className="text-2xl font-light opacity-90 leading-relaxed mb-10 drop-shadow-lg italic">
                                    "{quote.text}"
                                </p>
                                <div className="mt-auto">
                                    <h1 className="text-5xl font-serif leading-tight drop-shadow-2xl whitespace-pre-line font-medium">
                                        {quote.title}
                                    </h1>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Simple Progress Bar for Quotes */}
                    <div className="absolute bottom-12 left-12 flex gap-3">
                        {QUOTES.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setQuoteIndex(idx)}
                                className={`h-1 rounded-full transition-all duration-500 ${idx === quoteIndex ? "w-10 bg-blue-500" : "w-4 bg-white/20 hover:bg-white/40"
                                    }`}
                                aria-label={`Select quote ${idx + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side - Form Content */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 bg-white">
                <div className="w-full max-w-[420px]">
                    {/* Header */}
                    <div className="mb-10 text-center">
                        <div className="flex justify-center mb-6">
                            <span className="font-bold text-2xl flex items-center gap-2">
                                <LogoAnimation />
                                HostelGH
                            </span>
                        </div>
                        <h1 className="text-4xl font-serif font-medium mb-3">{title}</h1>
                        {subtitle && <p className="text-gray-500">{subtitle}</p>}
                    </div>

                    {/* Form Container */}
                    {children}
                </div>
            </div>
        </div>
    );
}
