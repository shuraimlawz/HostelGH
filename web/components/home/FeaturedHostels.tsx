"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import HostelCard from "@/components/hostels/HostelCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function FeaturedHostels() {
    const { data: hostels, isLoading } = useQuery({
        queryKey: ["featured-hostels"],
        queryFn: async () => {
            const { data } = await api.get("/hostels/public");
            return Array.isArray(data) ? data : [];
        },
    });

    return (
        <div className="py-12">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h3 className="text-3xl font-bold tracking-tight">Featured for You</h3>
                    <p className="text-muted-foreground mt-2">The highest rated hostels this month</p>
                </div>
                <a href="/hostels" className="text-primary font-bold hover:underline mb-1">View all</a>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="space-y-4">
                            <Skeleton className="h-64 w-full rounded-2xl" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
                    {Array.isArray(hostels) && hostels.map((hostel: any) => (
                        <HostelCard key={hostel.id} hostel={hostel} />
                    ))}
                    {(!hostels || hostels.length === 0) && (
                        <div className="col-span-full h-48 flex items-center justify-center bg-gray-50 rounded-2xl text-muted-foreground">
                            No hostels found. Start by creating one!
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
