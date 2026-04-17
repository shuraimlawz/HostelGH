"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import HostelFilters from "@/components/hostels/HostelFilters";
import SortBar from "@/components/hostels/SortBar";
import HostelCard from "@/components/hostels/HostelCard";
import HostelGrid from "@/components/hostels/HostelGrid";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import { Loader2, SearchX } from "lucide-react";

interface Hostel {
    id: string;
    name: string;
    city: string;
    addressLine: string;
}

function HostelsListingContent() {
    const searchParams = useSearchParams();

    const { data: hostels, isLoading } = useQuery({
        queryKey: ["hostels", searchParams.toString()],
        queryFn: async () => {
            const q = searchParams.toString();
            const { data } = await api.get(`/hostels/public?${q}`);
            return Array.isArray(data) ? data : [];
        },
    });

    return (
        <div className="max-w-[1400px] mx-auto px-4 py-12">
            {/* Header / Filter Top Section */}
            <div className="flex flex-col gap-6 mb-12">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Market Discover</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Prime Educational Stays</h1>
                    <p className="text-gray-500 text-sm max-w-md">Discover premium hostels across Ghana vetted for safety and proximity.</p>
                </div>
                
                {/* Horizontal Integrated Filters */}
                <HostelFilters />
            </div>

            <div className="space-y-8">
                {/* Information Bar */}
                <SortBar total={hostels?.length || 0} />

                {isLoading ? (
                    <HostelGrid>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="space-y-4">
                                <Skeleton className="aspect-[16/11] w-full rounded-2xl bg-gray-100" />
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-3/4 rounded-md" />
                                    <Skeleton className="h-3 w-1/2 rounded-md" />
                                </div>
                            </div>
                        ))}
                    </HostelGrid>
                ) : (
                    <>
                        <HostelGrid>
                            {Array.isArray(hostels) && hostels.length > 0 ? (
                                hostels.map((hostel: Hostel) => (
                                    <HostelCard key={hostel.id} hostel={hostel} />
                                ))
                            ) : (
                                <div className="col-span-full py-32 flex flex-col items-center justify-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center p-10 space-y-4">
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-gray-300 shadow-sm border border-gray-100">
                                        <SearchX size={32} />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Zero Registry Hits</h3>
                                        <p className="text-gray-400 text-sm font-medium">No assets match your current parameters. Try widening the scope.</p>
                                    </div>
                                    <button 
                                        onClick={() => window.location.href = '/hostels'} 
                                        className="mt-4 px-6 py-2 bg-gray-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all"
                                    >
                                        Clear All Protocols
                                    </button>
                                </div>
                            )}
                        </HostelGrid>
                    </>
                )}
            </div>
        </div>
    );
}

export default function HostelsListingPage() {
    return (
        <Suspense fallback={
            <div className="max-w-[1400px] mx-auto px-4 py-32 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hydrating marketplace asset log...</p>
            </div>
        }>
            <HostelsListingContent />
        </Suspense>
    );
}
