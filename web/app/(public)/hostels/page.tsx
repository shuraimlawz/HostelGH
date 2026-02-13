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
import { Loader2 } from "lucide-react";

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
        <div className="container px-6 py-8">
            <div className="flex flex-col md:flex-row gap-8">
                <HostelFilters />

                <div className="flex-1">
                    <SortBar total={hostels?.length || 0} />

                    {isLoading ? (
                        <HostelGrid>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                <div key={i} className="space-y-4">
                                    <Skeleton className="h-64 w-full rounded-2xl" />
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            ))}
                        </HostelGrid>
                    ) : (
                        <>
                            <HostelGrid>
                                {Array.isArray(hostels) && hostels.map((hostel: Hostel) => (
                                    <HostelCard key={hostel.id} hostel={hostel} />
                                ))}
                            </HostelGrid>
                            {(!Array.isArray(hostels) || hostels.length === 0) && (
                                <div className="h-96 flex flex-col items-center justify-center bg-gray-50 rounded-3xl border border-dashed text-center p-10">
                                    <h3 className="text-xl font-bold mb-2">No hostels match your criteria</h3>
                                    <p className="text-muted-foreground">Try adjusting your filters or search for something else.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function HostelsListingPage() {
    return (
        <Suspense fallback={<div className="container px-6 py-32 flex items-center justify-center"><Loader2 className="w-16 h-16 text-primary animate-spin" /></div>}>
            <HostelsListingContent />
        </Suspense>
    );
}
