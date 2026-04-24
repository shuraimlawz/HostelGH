"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import HostelCard from "@/components/hostels/HostelCard";
import HostelGrid from "@/components/hostels/HostelGrid";
import { Loader2, Heart, Search } from "lucide-react";
import Link from "next/link";

export default function FavoritesPage() {
    const { data: favorites, isLoading } = useQuery({
        queryKey: ["my-favorites"],
        queryFn: async () => {
            const res = await api.get("/favorites");
            return res.data;
        },
    });

    if (isLoading) return (
        <div className="container py-32 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Loading your wishlist...</p>
        </div>
    );

    return (
        <div className="container py-12 space-y-12">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500 shadow-sm border border-red-100">
                        <Heart size={20} className="fill-current" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight uppercase">My Favorites</h1>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hostels you've saved for later</p>
                    </div>
                </div>
            </div>

            {favorites?.length > 0 ? (
                <HostelGrid>
                    {favorites.map((fav: any) => (
                        <HostelCard key={fav.id} hostel={fav.hostel} />
                    ))}
                </HostelGrid>
            ) : (
                <div className="py-32 flex flex-col items-center justify-center bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200 text-center space-y-6">
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-gray-200 shadow-xl shadow-gray-200/20 border border-gray-100">
                        <Search size={40} />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">Your wishlist is empty</h3>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
                            Start exploring hostels and click the heart icon to save the ones you like!
                        </p>
                    </div>
                    <Link 
                        href="/hostels" 
                        className="h-14 px-10 bg-gray-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200"
                    >
                        Explore Hostels
                    </Link>
                </div>
            )}
        </div>
    );
}
