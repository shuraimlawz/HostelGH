"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import HostelCard from "@/components/hostels/HostelCard";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Flame, MapPin } from "lucide-react";

export default function FeaturedHostels() {
    const { data: hostels, isLoading } = useQuery({
        queryKey: ["featured-hostels"],
        queryFn: async () => {
            const { data } = await api.get("/hostels/public");
            return Array.isArray(data) ? data : [];
        },
    });

    return (
        <div className="py-20 border-t border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="p-1 px-3 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] border border-blue-100">
                            Curated Selection
                        </span>
                        <div className="flex items-center text-orange-500 font-bold text-xs gap-1">
                            <Flame size={14} className="fill-orange-500" />
                            <span>Trending Now</span>
                        </div>
                    </div>
                    <h3 className="text-4xl md:text-5xl font-black tracking-tighter text-gray-900">
                        Top Rated <span className="text-blue-600">Spaces</span>
                    </h3>
                    <p className="text-gray-500 mt-3 max-w-xl font-medium">
                        Explore the highest-rated student residences across Ghana, vetted for safety, comfort, and proximity to campus.
                    </p>
                </div>

                <a
                    href="/hostels"
                    className="group inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-xl hover:shadow-blue-500/20 active:scale-95"
                >
                    <span>Explore All</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </a>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="space-y-6">
                            <Skeleton className="aspect-[4/5] w-full rounded-[2rem]" />
                            <div className="space-y-3 px-1">
                                <Skeleton className="h-6 w-3/4 rounded-lg" />
                                <Skeleton className="h-4 w-1/2 rounded-lg" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12">
                    {Array.isArray(hostels) && hostels.map((hostel: any) => (
                        <HostelCard key={hostel.id} hostel={hostel} />
                    ))}
                    {(!hostels || hostels.length === 0) && (
                        <div className="col-span-full h-80 flex flex-col items-center justify-center bg-gray-50/50 border-2 border-dashed border-gray-100 rounded-[3rem] text-muted-foreground p-12 text-center">
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
                                <MapPin className="text-gray-300" size={32} />
                            </div>
                            <h4 className="text-xl font-black text-gray-900 mb-2">Finding more spaces...</h4>
                            <p className="max-w-xs font-medium">We're currently vetting new hostels. Check back soon for more premium options!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
