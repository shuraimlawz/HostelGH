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
        <div className="py-20 border-t border-border">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="p-1 px-3 rounded-full bg-gradient-to-r from-blue-500/10 to-transparent text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] border border-blue-500/20">
                            Curated Selection
                        </span>
                        <div className="flex items-center text-orange-500 font-bold text-xs gap-1.5 bg-orange-500/10 px-2 py-1 rounded-full border border-orange-500/20">
                            <Flame size={14} className="fill-orange-500" />
                            <span>Trending Now</span>
                        </div>
                    </div>
                    <h3 className="text-3xl md:text-5xl font-black tracking-tighter text-foreground">
                        Top Rated <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">Spaces</span>
                    </h3>
                    <p className="text-muted-foreground mt-3 max-w-xl font-medium text-sm md:text-base leading-relaxed">
                        Explore the highest-rated student residences across Ghana, vetted for safety, comfort, and proximity to campus.
                    </p>
                </div>

                <a
                    href="/hostels"
                    className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-foreground to-foreground/80 text-background px-6 py-3.5 rounded-2xl font-black hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] transition-all duration-300 active:scale-[0.98] overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-700 ease-in-out" />
                    <span className="relative z-10">Explore All</span>
                    <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1.5 transition-transform duration-300" />
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
                        <div className="col-span-full h-80 flex flex-col items-center justify-center bg-muted/30 border-2 border-dashed border-border rounded-[3rem] text-muted-foreground p-12 text-center">
                            <div className="w-16 h-16 bg-card rounded-2xl shadow-sm flex items-center justify-center mb-4 border">
                                <MapPin className="text-muted-foreground/30" size={32} />
                            </div>
                            <h4 className="text-xl font-black text-foreground mb-2">Finding more spaces...</h4>
                            <p className="max-w-xs font-medium">We're currently vetting new hostels. Check back soon for more premium options!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
