"use client";

import { Search, MapPin, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface StickySearchProps {
    isVisible: boolean;
}

export default function StickySearch({ isVisible }: StickySearchProps) {
    const router = useRouter();
    const [query, setQuery] = useState("");

    const handleSearch = (overrideQuery?: string) => {
        const searchVal = overrideQuery !== undefined ? overrideQuery : query;
        router.push(`/hostels${searchVal ? `?query=${encodeURIComponent(searchVal)}` : ""}`);
    };

    return (
        <div 
            className={cn(
                "absolute top-[58%] left-1/2 -translate-x-1/2 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] z-50",
                isVisible 
                    ? "opacity-100 -translate-y-1/2 scale-100 pointer-events-auto" 
                    : "opacity-0 -translate-y-[180%] scale-90 pointer-events-none"
            )}
        >
            <div className="flex items-center bg-white rounded-full border border-gray-200 shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.12)] hover:border-gray-300 transition-all duration-300 p-1.5 md:p-2 group">
                
                {/* Mobile View: Just the Icon */}
                <button 
                    onClick={() => router.push("/hostels")}
                    className="md:hidden w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform"
                >
                    <Search size={18} />
                </button>

                {/* Desktop View: Interactive Input */}
                <div className="hidden md:flex items-center">
                    <div className="flex items-center px-4 py-1.5 gap-3 border-r border-gray-100 group-focus-within:border-blue-100 transition-colors">
                        <MapPin size={16} className="text-blue-500" />
                        <div className="flex flex-col items-start leading-tight">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Search Hub</span>
                            <input
                                type="text"
                                placeholder="Where to?"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                className="bg-transparent border-none outline-none text-[13px] font-bold text-gray-900 placeholder:text-gray-400 w-32 focus:w-48 transition-all duration-300"
                            />
                        </div>
                        {query && (
                            <button 
                                onClick={() => setQuery("")}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={12} className="text-gray-400" />
                            </button>
                        )}
                    </div>

                    <button
                        onClick={() => handleSearch()}
                        className="ml-2 flex items-center gap-2 pl-4 pr-3 py-2 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-500/20 group/btn"
                    >
                        <span className="text-[10px] font-black uppercase tracking-widest">Search</span>
                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover/btn:rotate-12 transition-transform">
                            <Search size={12} />
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
