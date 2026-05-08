"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import HostelCard from "@/components/hostels/HostelCard";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Flame, Building2 } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function FeaturedHostels() {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch — only render theme-dependent styles after mount
    useEffect(() => { setMounted(true); }, []);

    const isDark = mounted && resolvedTheme === "dark";

    const { data: hostels, isLoading } = useQuery({
        queryKey: ["featured-hostels"],
        queryFn: async () => {
            const { data } = await api.get("/hostels/public", { params: { sort: "relevance" } });
            return Array.isArray(data) ? data : [];
        },
    });

    return (
        <section className="py-16 md:py-24 relative overflow-hidden">
            {/* Decorative blob */}
            <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
                {/* ── Header ─────────────────────────────── */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-14">

                    <div className="space-y-5 max-w-2xl">
                        {/* Pill badges */}
                        <div className="flex items-center gap-3 flex-wrap">
                            <span className="px-4 py-1.5 bg-blue-600 text-white text-[9px] font-black uppercase tracking-[0.25em] rounded-full shadow-lg shadow-blue-600/30">
                                Our Best
                            </span>
                            <span
                                className="flex items-center gap-1.5 px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.25em] rounded-full border shadow-sm"
                                style={{
                                    backgroundColor: isDark ? "rgba(120,53,15,0.2)" : "#fffbeb",
                                    borderColor: isDark ? "rgba(120,53,15,0.3)" : "#fde68a",
                                    color: isDark ? "#fbbf24" : "#92400e",
                                }}
                            >
                                <Flame size={12} className="fill-current" />
                                Trending
                            </span>
                        </div>

                        {/* ── Main heading: hardcoded inline colours, never inherits theme ── */}
                        <div>
                            <h2
                                className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.85] uppercase"
                                style={{ color: isDark ? "#ffffff" : "#111827" }}
                            >
                                Trending
                            </h2>
                            <h2
                                className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.85] uppercase italic"
                                style={{ color: "#2563eb" }}
                            >
                                Spaces
                            </h2>
                        </div>

                        {/* Subtitle */}
                        <p
                            className="text-xs md:text-sm font-bold uppercase tracking-[0.15em] leading-relaxed pl-5 border-l-4 border-blue-600 max-w-md"
                            style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
                        >
                            Ghana&apos;s most-booked student hostels —{" "}
                            <br className="hidden md:block" />
                            ranked by student demand.
                        </p>
                    </div>

                    {/* CTA */}
                    <Link
                        href="/hostels"
                        className="group flex-shrink-0 flex h-14 items-center gap-3 px-10 rounded-2xl font-black text-[10px] uppercase tracking-[0.25em] transition-all hover:scale-105 active:scale-95 shadow-xl"
                        style={{
                            backgroundColor: isDark ? "#ffffff" : "#111827",
                            color: isDark ? "#111827" : "#ffffff",
                        }}
                    >
                        <span>View All Hostels</span>
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* ── Hostel Cards ─────────────────────── */}
                {isLoading ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex flex-col">
                                <Skeleton className="aspect-square w-full rounded-2xl mb-3" />
                                <Skeleton className="h-4 w-3/4 mb-1" />
                                <Skeleton className="h-4 w-1/2 mb-1" />
                                <Skeleton className="h-4 w-2/3" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
                        {Array.isArray(hostels) && hostels.slice(0, 4).map((hostel: any) => (
                            <HostelCard key={hostel.id} hostel={hostel} />
                        ))}

                        {(!hostels || hostels.length === 0) && (
                            <div className="col-span-full py-20 flex flex-col items-center justify-center rounded-[3rem] border-2 border-dashed text-center space-y-4"
                                style={{
                                    backgroundColor: isDark ? "rgba(15,23,42,0.5)" : "#f9fafb",
                                    borderColor: isDark ? "rgba(51,65,85,0.8)" : "#e5e7eb",
                                }}
                            >
                                <div className="w-16 h-16 rounded-2xl shadow-xl flex items-center justify-center border"
                                    style={{
                                        backgroundColor: isDark ? "#1e293b" : "#ffffff",
                                        borderColor: isDark ? "#334155" : "#f3f4f6",
                                    }}
                                >
                                    <Building2 className="text-blue-500" size={32} />
                                </div>
                                <div className="space-y-1">
                                    <h4
                                        className="text-xl font-black uppercase tracking-tight"
                                        style={{ color: isDark ? "#ffffff" : "#111827" }}
                                    >
                                        Updating Lists
                                    </h4>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                                        Our team is verifying new hostels. Check back soon.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}
