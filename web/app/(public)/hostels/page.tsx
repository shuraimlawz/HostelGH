"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import HostelFilters from "@/components/hostels/HostelFilters";
import SortBar from "@/components/hostels/SortBar";
import HostelCard from "@/components/hostels/HostelCard";
import HostelGrid from "@/components/hostels/HostelGrid";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense, useMemo, useState, useCallback } from "react";
import { Loader2, SearchX, ChevronDown, Map, List, LocateFixed, X } from "lucide-react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

// Dynamically import the map to avoid SSR issues with Leaflet
const HostelMap = dynamic(() => import("@/components/common/HostelMap"), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full bg-muted rounded-3xl flex items-center justify-center">
            <Loader2 className="text-blue-500 animate-spin" size={32} />
        </div>
    ),
});

interface Hostel {
    id: string;
    name: string;
    city: string;
    addressLine: string;
    latitude?: number | null;
    longitude?: number | null;
    minPrice?: number | null;
    isFeatured?: boolean;
    distanceKm?: number | null;
}

function HostelsListingContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [view, setView] = useState<"list" | "map">("list");
    const [activeId, setActiveId] = useState<string | null>(null);
    const [isGeolocating, setIsGeolocating] = useState(false);
    const [geoActive, setGeoActive] = useState(
        !!(searchParams.get("lat") && searchParams.get("lng"))
    );

    const {
        data,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteQuery({
        queryKey: ["hostels", searchParams.toString()],
        queryFn: async ({ pageParam = 1 }) => {
            const p = new URLSearchParams(searchParams.toString());
            p.set("page", pageParam.toString());
            p.set("limit", "24");
            const { data } = await api.get(`/hostels/public?${p.toString()}`);
            return Array.isArray(data) ? data : [];
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.length === 24 ? allPages.length + 1 : undefined;
        },
    });

    const hostels: Hostel[] = useMemo(() => data?.pages.flat() || [], [data]);

    // Hostels that have coordinates — shown as map markers
    const mapMarkers = useMemo(() =>
        hostels
            .filter((h) => h.latitude && h.longitude)
            .map((h) => ({
                id: h.id,
                lat: h.latitude!,
                lng: h.longitude!,
                label: h.name,
                sublabel: h.city,
                price: h.minPrice ?? undefined,
                isFeatured: h.isFeatured,
                isActive: h.id === activeId,
            })),
        [hostels, activeId]
    );

    const handleNearMe = useCallback(() => {
        if (!navigator.geolocation) return;
        setIsGeolocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const p = new URLSearchParams(searchParams.toString());
                p.set("lat", pos.coords.latitude.toString());
                p.set("lng", pos.coords.longitude.toString());
                p.set("radius", "15");
                router.push(`/hostels?${p.toString()}`);
                setGeoActive(true);
                setIsGeolocating(false);
                setView("map");
            },
            () => setIsGeolocating(false),
            { timeout: 10000 }
        );
    }, [searchParams, router]);

    const clearGeo = useCallback(() => {
        const p = new URLSearchParams(searchParams.toString());
        p.delete("lat");
        p.delete("lng");
        p.delete("radius");
        router.push(`/hostels?${p.toString()}`);
        setGeoActive(false);
    }, [searchParams, router]);

    return (
        <div className="max-w-[1400px] mx-auto px-4 py-12">
            {/* Header */}
            <div className="flex flex-col gap-6 mb-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Explore</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Find Your Hostel</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md font-medium">Browse verified student hostels across Ghana.</p>
                </div>

                <HostelFilters />
            </div>

            {/* Toolbar: view toggle + near me */}
            <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                <SortBar total={hostels.length} />

                <div className="flex items-center gap-3">
                    {/* Near Me Button */}
                    {geoActive ? (
                        <button
                            onClick={clearGeo}
                            className="flex items-center gap-2 h-10 px-4 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg dark:shadow-none"
                        >
                            <LocateFixed size={14} />
                            Near Me Active
                            <X size={12} className="opacity-70" />
                        </button>
                    ) : (
                        <button
                            onClick={handleNearMe}
                            disabled={isGeolocating}
                            className="flex items-center gap-2 h-10 px-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm"
                        >
                            {isGeolocating ? (
                                <Loader2 size={14} className="animate-spin" />
                            ) : (
                                <LocateFixed size={14} />
                            )}
                            {isGeolocating ? "Locating..." : "Near Me"}
                        </button>
                    )}

                    {/* List / Map toggle */}
                    <div className="flex items-center bg-muted rounded-xl p-1 gap-1">
                        <button
                            onClick={() => setView("list")}
                            className={cn(
                                "flex items-center gap-2 h-8 px-4 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                                view === "list"
                                    ? "bg-card text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <List size={13} /> List
                        </button>
                        <button
                            onClick={() => setView("map")}
                            className={cn(
                                "flex items-center gap-2 h-8 px-4 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                                view === "map"
                                    ? "bg-card text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Map size={13} /> Map
                        </button>
                    </div>
                </div>
            </div>

            {/* Distance badge when geo-active */}
            {geoActive && (
                <div className="mb-6 flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-xl w-fit">
                    <LocateFixed size={14} className="text-blue-600 dark:text-blue-400" />
                    <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-widest">
                        Showing hostels within 15km of your location — sorted by distance
                    </span>
                </div>
            )}

            {isLoading ? (
                <HostelGrid>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="flex flex-col">
                            <Skeleton className="aspect-square w-full rounded-2xl mb-3 bg-gray-100 dark:bg-gray-800" />
                            <Skeleton className="h-4 w-3/4 mb-1" />
                            <Skeleton className="h-4 w-1/2 mb-1" />
                            <Skeleton className="h-4 w-2/3 mb-2" />
                            <Skeleton className="h-4 w-1/3" />
                        </div>
                    ))}
                </HostelGrid>
            ) : (
                <div className="space-y-16">
                    {/* MAP VIEW */}
                    {view === "map" && (
                        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 min-h-[600px]">
                            {/* Map Panel */}
                            <div className="sticky top-24 h-[calc(100vh-180px)] rounded-3xl overflow-hidden border border-border shadow-xl bg-muted/30">
                                {mapMarkers.length > 0 ? (
                                    <HostelMap
                                        markers={mapMarkers}
                                        className="w-full h-full"
                                        onMarkerClick={(id) => setActiveId(id)}
                                        activeMarkerId={activeId}
                                    />
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center gap-4 text-gray-400">
                                        <Map size={40} className="opacity-30" />
                                        <p className="text-sm font-bold uppercase tracking-widest opacity-50">
                                            {hostels.length === 0 ? "No results" : "These hostels don't have map pins yet"}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Scrollable card list */}
                            <div className="flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-180px)] pr-1">
                                {hostels.length > 0 ? (
                                    hostels.map((hostel) => (
                                        <div
                                            key={hostel.id}
                                            onMouseEnter={() => setActiveId(hostel.id)}
                                            onMouseLeave={() => setActiveId(null)}
                                            className={cn(
                                                "transition-all duration-200 rounded-2xl",
                                                activeId === hostel.id ? "ring-2 ring-blue-500 ring-offset-2" : ""
                                            )}
                                        >
                                            <HostelCard hostel={hostel} compact />
                                            {hostel.distanceKm != null && (
                                                <div className="px-4 pb-3 -mt-1">
                                                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest flex items-center gap-1">
                                                        <LocateFixed size={10} />
                                                        {hostel.distanceKm.toFixed(1)} km away
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
                                        <SearchX size={32} className="text-muted-foreground" />
                                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">No Results Found</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* LIST VIEW */}
                    {view === "list" && (
                        <>
                            <HostelGrid>
                                {hostels.length > 0 ? (
                                    hostels.map((hostel: Hostel) => (
                                        <div key={hostel.id}>
                                            <HostelCard hostel={hostel} />
                                            {hostel.distanceKm != null && (
                                                <div className="px-2 mt-2">
                                                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest flex items-center gap-1">
                                                        <LocateFixed size={10} />
                                                        {hostel.distanceKm.toFixed(1)} km away
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-32 flex flex-col items-center justify-center bg-muted/30 rounded-[2.5rem] border-2 border-dashed border-border text-center p-10 space-y-6">
                                        <div className="w-20 h-20 bg-card rounded-2xl flex items-center justify-center text-muted-foreground shadow-sm border border-border">
                                            <SearchX size={40} />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-black text-foreground uppercase tracking-tight">No Results Found</h3>
                                            <p className="text-muted-foreground text-sm font-medium">No hostels match your search filters. Try widening the scope.</p>
                                        </div>
                                        <button
                                            onClick={() => router.push('/hostels')}
                                            className="mt-4 px-8 py-4 bg-foreground text-background rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg"
                                        >
                                            Reset Filters
                                        </button>
                                    </div>
                                )}
                            </HostelGrid>

                            {hasNextPage && (
                                <div className="flex flex-col items-center gap-6 py-10 border-t border-gray-50">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">Showing {hostels.length} Hostels</p>
                                    <button
                                        onClick={() => fetchNextPage()}
                                        disabled={isFetchingNextPage}
                                        className="group flex flex-col items-center gap-3 active:scale-95 transition-all"
                                    >
                                        <div className="w-16 h-16 rounded-full border-2 border-border flex items-center justify-center group-hover:border-primary group-hover:text-primary transition-all shadow-sm bg-card">
                                            {isFetchingNextPage ? (
                                                <Loader2 size={24} className="animate-spin" />
                                            ) : (
                                                <ChevronDown size={24} className="group-hover:translate-y-1 transition-transform" />
                                            )}
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground">
                                            {isFetchingNextPage ? "Loading More..." : "See More Properties"}
                                        </span>
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default function HostelsListingPage() {
    return (
        <Suspense fallback={
            <div className="max-w-[1400px] mx-auto px-4 py-32 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Updating list...</p>
            </div>
        }>
            <HostelsListingContent />
        </Suspense>
    );
}
