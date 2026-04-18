"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
    CreditCard,
    CheckCircle2,
    Zap,
    ShieldCheck,
    TrendingUp,
    BarChart3,
    Loader2,
    ArrowRight,
    Trophy,
    Check,
    Star,
    Activity,
    Layers,
    Target,
    Shield
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SubscriptionPage() {
    return (
        <div className="max-w-[1200px] mx-auto space-y-12 pb-20 pt-4 px-4">
            {/* Header Section */}
            <div className="text-center space-y-6 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-widest border border-blue-100 mb-2">
                    <Trophy size={14} /> Launch Celebration Protocol
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 max-w-4xl mx-auto">
                    Open Access Beta Launch
                </h1>
                <p className="text-gray-500 text-sm max-w-2xl mx-auto leading-relaxed font-medium">
                    To celebrate the launch of HostelGH, we are offering <span className="text-gray-900 font-bold">100% Free Unlimited Access</span> to all proprietor tools. 
                    No subscriptions, no listing fees, and 0% platform commissions.
                </p>
            </div>

            {/* Launch Perks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-8 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-4 group hover:border-blue-500 transition-colors">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100 group-hover:scale-110 transition-transform">
                        <Zap size={24} className="fill-current" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Unlimited Listings</h3>
                    <p className="text-xs text-gray-500 leading-relaxed font-medium">
                        Add every property in your portfolio without any caps or listing costs.
                    </p>
                </div>

                <div className="p-8 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-4 group hover:border-emerald-500 transition-colors">
                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100 group-hover:scale-110 transition-transform">
                        <TrendingUp size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">0% Commission</h3>
                    <p className="text-xs text-gray-500 leading-relaxed font-medium">
                        Keep every pesewa of your rent income. We've waived all platform service fees.
                    </p>
                </div>

                <div className="p-8 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-4 group hover:border-amber-500 transition-colors">
                    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 border border-amber-100 group-hover:scale-110 transition-transform">
                        <Star size={24} className="fill-current" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Free Featuring</h3>
                    <p className="text-xs text-gray-500 leading-relaxed font-medium">
                        Boost your visibility by featuring your properties at the top of search for free.
                    </p>
                </div>
            </div>

            {/* Verification Note */}
            <div className="bg-gray-900 text-white rounded-2xl p-10 relative overflow-hidden group border border-gray-800 shadow-xl">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-32 -mt-32 blur-3xl opacity-60" />
                 <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="space-y-4 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-400 text-[10px] font-bold uppercase tracking-widest border border-white/10">
                            <ShieldCheck size={14} /> Quality Protocol
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight uppercase">Ready to Start?</h2>
                        <p className="text-sm text-gray-400 font-medium max-w-xl">
                            While access is free, we maintain a high standard for our students. All listings go through our standard review process before going live.
                        </p>
                    </div>
                    <Link href="/owner/hostels/new" className="h-14 px-10 bg-white text-gray-900 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2 shrink-0 shadow-lg active:scale-95">
                        Create Your First Listing <ArrowRight size={16} />
                    </Link>
                 </div>
            </div>

            {/* Comparison Logic - Hidden but kept metadata for structure */}
            <div className="pt-12 text-center">
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Network Version 1.0.4</p>
                 <p className="text-xs text-gray-400 font-medium tracking-tight">Launch Mode Enabled • Support Available 24/7</p>
            </div>
        </div>
    );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800", className)}>
            {children}
        </span>
    );
}
