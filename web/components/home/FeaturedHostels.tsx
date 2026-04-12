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
            const { data } = await api.get("/hostels/public", { params: { sort: "relevance" } });
            return Array.isArray(data) ? data : [];
        },
    });

    return (
        <div className="py-12 border-t border-border/50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="p-1 px-2 rounded-sm bg-primary/10 text-primary text-[9px] font-black uppercase tracking-[0.2em] border border-primary/20">
                            Selection
                        </span>
                        <div className="flex items-center text-orange-500 font-black text-[9px] gap-1 bg-orange-500/10 px-2 py-1 rounded-sm border border-orange-500/20 uppercase tracking-widest">
                            <Flame size={12} className="fill-orange-500" />
                            <span>Trending</span>
                        </div>
                    </div>
                    <h3 className="text-2xl md:text-4xl font-black tracking-tighter text-foreground uppercase">
                        Top <span className="text-primary italic">Spaces</span>
                    </h3>
                    <p className="text-muted-foreground mt-2 max-w-lg font-bold text-xs md:text-sm leading-relaxed">
                        Ghana's highest-vetted student residences. Safety and comfort guaranteed.
                    </p>
                </div>

                <a
                    href="/hostels"
                    className="group relative inline-flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-sm font-black text-xs uppercase tracking-widest hover:bg-foreground/90 transition-all active:scale-[0.98]"
                >
                    <span>View All</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
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
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8">
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
