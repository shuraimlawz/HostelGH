"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import HostelSection from "./HostelSection";
import PromoCarousel from "./PromoCarousel";
import { Star, GraduationCap, TrendingDown, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const MIN_SLOTS_ALERT = 4;

// === Data hook: single fetch for optimized discovery data ===
function useDiscovery() {
    return useQuery({
        queryKey: ["home-discovery"],
        queryFn: async () => {
            const { data } = await api.get("/discovery");
            return data;
        },
        staleTime: 10 * 60 * 1000, // 10 min
    });
}

// ── Section 1: Hostels of the Week ──────────────────────────────
function HostelsOfTheWeek({ hostels, isLoading }: { hostels: any[]; isLoading: boolean }) {
    return (
        <HostelSection
            title="Hostels of the Week"
            subtitle="Our curated staffpick — refreshed every Monday."
            badge="Staff Pick"
            badgeClassName="bg-amber-500 text-white border-amber-400/20"
            icon={<Star size={14} className="fill-amber-500 text-amber-500" />}
            hostels={hostels}
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

// ── Section 2: Near Campus ──────────────────────────────────────
function NearUniversitySections({ uniSections, isLoading }: {
    uniSections: { university: string, hostels: any[] }[];
    isLoading: boolean;
}) {
    if (isLoading) {
        return (
            <div className="py-12 border-t border-gray-50">
                <Skeleton className="h-8 w-64 rounded-lg mb-6" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex flex-col">
                            <Skeleton className="aspect-square w-full rounded-xl mb-3" />
                            <Skeleton className="h-4 w-3/4 mb-1" />
                            <Skeleton className="h-4 w-1/2 mb-1" />
                            <Skeleton className="h-4 w-2/3 mb-2" />
                            <Skeleton className="h-4 w-1/3" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <>
            {uniSections.map(({ university, hostels }) => {
                const displayName = university.length > 40 
                    ? university.split("(")[1]?.replace(")", "") || university.split(" ").slice(0, 3).join(" ") 
                    : university;

                return (
                    <HostelSection
                        key={university}
                        title={`Near ${displayName}`}
                        subtitle={`Hostels closest to ${university} — verified & available`}
                        badge="Near Campus"
                        badgeClassName="bg-indigo-100 text-indigo-700 border-indigo-200"
                        icon={<GraduationCap size={14} className="text-indigo-600" />}
                        hostels={hostels}
                        isLoading={false}
                        viewAllHref={`/hostels?university=${encodeURIComponent(university)}`}
                    />
                );
            })}
        </>
    );
}

// ── Section 3: Affordable by City ───────────────────────────────
function AffordableByCitySections({ citySections, isLoading }: {
    citySections: { city: string, hostels: any[] }[];
    isLoading: boolean;
}) {
    if (isLoading) return null;

    return (
        <>
            {citySections.map(({ city, hostels }) => (
                <HostelSection
                    key={city}
                    title={`Most Affordable in ${city}`}
                    subtitle={`Lowest-priced verified hostels in ${city} right now`}
                    badge="Best Value"
                    badgeClassName="bg-emerald-100 text-emerald-700 border-emerald-200"
                    icon={<TrendingDown size={14} className="text-emerald-600" />}
                    hostels={hostels}
                    isLoading={false}
                    viewAllHref={`/hostels?city=${encodeURIComponent(city)}&sort=price_asc`}
                    cardBadge={(h) => {
                        const price = h.minPrice ? h.minPrice / 100 : null;
                        return price ? (
                            <span className="px-2 py-0.5 bg-emerald-600 text-white text-[9px] font-bold rounded-md shadow-sm">
                                From ₵{price.toLocaleString()}
                            </span>
                        ) : null;
                    }}
                />
            ))}
        </>
    );
}

// ── Section 4: Last Rooms Available ─────────────────────────────
function LastRoomsSection({ hostels, isLoading }: { hostels: any[]; isLoading: boolean }) {
    return (
        <HostelSection
            title="Last Rooms Available"
            subtitle="These hostels are filling up fast — secure your spot now."
            badge="Almost Full 🔥"
            badgeClassName="bg-red-100 text-red-600 border-red-200"
            icon={<AlertTriangle size={14} className="text-red-500" />}
            hostels={hostels}
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
    const { data, isLoading } = useDiscovery();

    return (
        <div className="space-y-0">
            <PromoCarousel />

            {/* Hostels of the Week */}
            <HostelsOfTheWeek 
                hostels={data?.weekly || []} 
                isLoading={isLoading} 
            />

            {/* Near Campus sections (dynamic server-side) */}
            <NearUniversitySections 
                uniSections={data?.nearUniversity || []} 
                isLoading={isLoading} 
            />

            {/* Affordable by City (dynamic server-side) */}
            <AffordableByCitySections 
                citySections={data?.affordable || []} 
                isLoading={isLoading} 
            />

            {/* Last Rooms Available */}
            <LastRoomsSection 
                hostels={data?.lastRooms || []} 
                isLoading={isLoading} 
            />
        </div>
    );
}

