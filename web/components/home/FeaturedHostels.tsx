"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import HostelCard from "@/components/hostels/HostelCard";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Flame, MapPin, Building2 } from "lucide-react";
import Link from "next/link";

export default function FeaturedHostels() {
    const { data: hostels, isLoading } = useQuery({
        queryKey: ["featured-hostels"],
        queryFn: async () => {
            const { data } = await api.get("/hostels/public", { params: { sort: "relevance" } });
            return Array.isArray(data) ? data : [];
        },
    });

    return (
        <div className="py-20 border-t border-gray-50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-12">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-[9px] font-bold uppercase tracking-widest border border-white/10 shadow-lg shadow-blue-500/10">
                            Our Best
                        </span>
                        <div className="flex items-center text-amber-600 font-bold text-[9px] gap-2 bg-amber-50 dark:bg-amber-950/30 px-3 py-1 rounded-full border border-amber-100 dark:border-amber-900/50 uppercase tracking-widest shadow-sm">
                            <Flame size={12} className="fill-amber-500" />
                            <span>Trending</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-4xl md:text-5xl font-bold tracking-tighter text-gray-900 dark:text-white uppercase leading-tight">
                            Trending <span className="text-blue-600">Spaces</span>
                        </h3>
                        <p className="text-gray-400 dark:text-gray-500 max-w-lg font-bold text-xs md:text-sm uppercase tracking-widest leading-relaxed">
                            Ghana's most-booked student hostels — ranked by student demand.
                        </p>
                    </div>
                </div>

                <Link
                    href="/hostels"
                    className="group relative inline-flex h-14 items-center gap-3 bg-gray-900 text-white px-8 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-black transition-all active:scale-[0.98] shadow-xl"
                >
                    <span>View All Hostels</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="space-y-6">
                            <Skeleton className="aspect-[4/5] w-full rounded-3xl" />
                            <div className="space-y-3 px-1">
                                <Skeleton className="h-6 w-3/4 rounded-xl" />
                                <Skeleton className="h-4 w-1/2 rounded-xl" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
                    {Array.isArray(hostels) && hostels.slice(0, 4).map((hostel: any) => (
                        <HostelCard key={hostel.id} hostel={hostel} />
                    ))}
                    {(!hostels || hostels.length === 0) && (
                        <div className="col-span-full h-96 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-slate-800/30 border border-gray-100/50 dark:border-slate-700/30 rounded-[3rem] text-gray-400 p-12 text-center space-y-6">
                            <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-2xl shadow-sm flex items-center justify-center border border-gray-100 dark:border-slate-700">
                                <Building2 className="text-gray-200 dark:text-gray-600" size={40} />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">Updating Lists</h4>
                                <p className="max-w-xs font-bold text-[10px] uppercase tracking-widest text-gray-400">Our team is currently verifying new hostels. Check back soon for new listings.</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
