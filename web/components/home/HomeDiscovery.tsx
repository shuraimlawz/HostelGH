"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import HostelSection from "./HostelSection";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import PromoCarousel from "./PromoCarousel";
import { Star, GraduationCap, TrendingDown, AlertTriangle, ArrowRight } from "lucide-react";

const MIN_SLOTS_ALERT = 4; // "Last rooms available" threshold

// === Data hook: single fetch, all sections derived client-side ===
function useAllHostels() {
    return useQuery({
        queryKey: ["home-all-hostels"],
        queryFn: async () => {
            const { data } = await api.get("/hostels/public", {
                params: { sort: "relevance", limit: 100 },
            });
            return Array.isArray(data) ? data : [];
        },
        staleTime: 5 * 60 * 1000, // 5 min
    });
}

function useCityStats() {
    return useQuery({
        queryKey: ["city-stats"],
        queryFn: async () => {
            const { data } = await api.get("/hostels/city-stats");
            return Array.isArray(data) ? data : [];
        },
        staleTime: 10 * 60 * 1000,
    });
}

function useTrendingLocations() {
    return useQuery({
        queryKey: ["trending-locations"],
        queryFn: async () => {
            const { data } = await api.get("/hostels/trending-locations");
            return Array.isArray(data) ? data : [];
        },
        staleTime: 5 * 60 * 1000,
    });
}

// ── Section 1: Hostels of the Week ──────────────────────────────
function HostelsOfTheWeek({ hostels, isLoading }: { hostels: any[]; isLoading: boolean }) {
    // Use a weekly "seed" to shuffle differently each week, keeping it stable within the week
    const weekSeed = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
    const pick = (arr: any[]) => {
        const shuffled = [...arr].sort((a, b) => {
            const ha = parseInt(a.id.slice(-4), 16) ^ weekSeed;
            const hb = parseInt(b.id.slice(-4), 16) ^ weekSeed;
            return ha - hb;
        });
        return shuffled.slice(0, 4);
    };

    const weekly = isLoading ? [] : pick(hostels.filter(h => h.images?.[0]));

    return (
        <HostelSection
            title="Hostels of the Week"
            subtitle="Our curated staffpick — refreshed every Monday."
            badge="Staff Pick"
            badgeClassName="bg-amber-500 text-white border-amber-400/20"
            icon={<Star size={14} className="fill-amber-500 text-amber-500" />}
            hostels={weekly}
            isLoading={isLoading}
            viewAllHref="/hostels?sort=relevance"
            cardBadge={() => (
                <span className="px-2 py-0.5 bg-amber-500 text-white text-[9px] font-bold uppercase tracking-widest rounded-md shadow-sm">
                    This Week
                </span>
            )}
        />
    );
}

// ── Section 2: Near Top Universities (dynamic, top 3) ───────────
function NearUniversitySections({ hostels, isLoading, trendingLocations }: {
    hostels: any[];
    isLoading: boolean;
    trendingLocations: string[];
}) {
    // Extract all universities that have >= 1 hostel from our data
    const uniMap: Record<string, any[]> = {};
    hostels.forEach(h => {
        if (h.university) {
            if (!uniMap[h.university]) uniMap[h.university] = [];
            uniMap[h.university].push(h);
        }
    });

    // Sort by hostel count and take top 3
    const topUnis = Object.entries(uniMap)
        .filter(([, list]) => list.length >= 1)
        .sort((a, b) => b[1].length - a[1].length)
        .slice(0, 3);

    if (isLoading) {
        return (
            <div className="py-12 border-t border-gray-50">
                <Skeleton className="h-8 w-64 rounded-lg mb-6" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="space-y-3">
                            <Skeleton className="aspect-[16/11] w-full rounded-2xl" />
                            <Skeleton className="h-5 w-3/4 rounded-lg" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <>
            {topUnis.map(([uni, uniHostels]) => {
                // Shorten the name for display
                const displayName = uni.length > 40 ? uni.split("(")[1]?.replace(")", "") || uni.split(" ").slice(0, 3).join(" ") : uni;
                const slug = uni.toLowerCase()
                    .replace(/[^a-z0-9\s]/g, "")
                    .replace(/\s+/g, "-")
                    .slice(0, 50);

                return (
                    <HostelSection
                        key={uni}
                        title={`Near ${displayName}`}
                        subtitle={`Hostels closest to ${uni} — verified & available`}
                        badge="Near Campus"
                        badgeClassName="bg-indigo-100 text-indigo-700 border-indigo-200"
                        icon={<GraduationCap size={14} className="text-indigo-600" />}
                        hostels={uniHostels.slice(0, 4)}
                        isLoading={false}
                        viewAllHref={`/hostels?university=${encodeURIComponent(uni)}`}
                    />
                );
            })}
        </>
    );
}

// ── Section 3: Affordable in [City] (dynamic, all cities with data) ──
function AffordableByCitySections({ hostels, isLoading, cities }: {
    hostels: any[];
    isLoading: boolean;
    cities: { name: string; count: number }[];
}) {
    // Group by city, sort by minPrice within each city
    const cityMap: Record<string, any[]> = {};
    hostels.forEach(h => {
        if (h.city) {
            if (!cityMap[h.city]) cityMap[h.city] = [];
            cityMap[h.city].push(h);
        }
    });

    // Show top N cities (by hostel count) that have price data
    const topCities = Object.entries(cityMap)
        .filter(([, list]) => list.length >= 2)
        .sort((a, b) => b[1].length - a[1].length)
        .slice(0, 3);

    if (isLoading) return null;

    return (
        <>
            {topCities.map(([cityName, cityHostels]) => {
                const sorted = [...cityHostels]
                    .filter(h => h.minPrice)
                    .sort((a, b) => (a.minPrice || 0) - (b.minPrice || 0))
                    .slice(0, 4);

                if (sorted.length < 2) return null;

                return (
                    <HostelSection
                        key={cityName}
                        title={`Most Affordable in ${cityName}`}
                        subtitle={`Lowest-priced verified hostels in ${cityName} right now`}
                        badge="Best Value"
                        badgeClassName="bg-emerald-100 text-emerald-700 border-emerald-200"
                        icon={<TrendingDown size={14} className="text-emerald-600" />}
                        hostels={sorted}
                        isLoading={false}
                        viewAllHref={`/hostels?city=${encodeURIComponent(cityName)}&sort=price_asc`}
                        cardBadge={(h) => {
                            const price = h.minPrice ? h.minPrice / 100 : null;
                            return price ? (
                                <span className="px-2 py-0.5 bg-emerald-600 text-white text-[9px] font-bold rounded-md shadow-sm">
                                    From ₵{price.toLocaleString()}
                                </span>
                            ) : null;
                        }}
                    />
                );
            })}
        </>
    );
}

// ── Section 4: Last Rooms Available ─────────────────────────────
function LastRoomsSection({ hostels, isLoading }: { hostels: any[]; isLoading: boolean }) {
    const almostFull = hostels
        .filter(h => h.rooms?.some((r: any) => r.availableSlots > 0 && r.availableSlots <= MIN_SLOTS_ALERT))
        .slice(0, 4);

    return (
        <HostelSection
            title="Last Rooms Available"
            subtitle="These hostels are filling up fast — secure your spot now."
            badge="Almost Full 🔥"
            badgeClassName="bg-red-100 text-red-600 border-red-200"
            icon={<AlertTriangle size={14} className="text-red-500" />}
            hostels={almostFull}
            isLoading={isLoading}
            viewAllHref="/hostels"
            emptyMessage="No hostels are critically low on rooms right now."
            cardBadge={(h) => {
                const lowestSlots = Math.min(
                    ...h.rooms.filter((r: any) => r.availableSlots > 0 && r.availableSlots <= MIN_SLOTS_ALERT)
                        .map((r: any) => r.availableSlots)
                );
                return (
                    <span className="px-2 py-0.5 bg-red-500 text-white text-[9px] font-bold rounded-md shadow-sm animate-pulse">
                        {lowestSlots} spot{lowestSlots !== 1 ? "s" : ""} left!
                    </span>
                );
            }}
        />
    );
}



// ── Main Export ───────────────────────────────────────────────────
export default function HomeDiscovery() {
    const { data: hostels = [], isLoading } = useAllHostels();
    const { data: cities = [] } = useCityStats();
    const { data: trendingLocations = [] } = useTrendingLocations();

    return (
        <div className="space-y-0">
            {/* Promotional Carousel Ads */}
            <PromoCarousel />

            {/* Hostels of the Week */}
            <HostelsOfTheWeek hostels={hostels} isLoading={isLoading} />

            {/* Near University sections (dynamic top 3) */}
            <NearUniversitySections hostels={hostels} isLoading={isLoading} trendingLocations={trendingLocations} />

            {/* Affordable by City (dynamic, all cities) */}
            <AffordableByCitySections hostels={hostels} isLoading={isLoading} cities={cities} />

            {/* Last Rooms Available */}
            <LastRoomsSection hostels={hostels} isLoading={isLoading} />
        </div>
    );
}
