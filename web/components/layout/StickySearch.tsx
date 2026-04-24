"use client";

import { Search, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface StickySearchProps {
    isVisible: boolean;
}

export default function StickySearch({ isVisible }: StickySearchProps) {
    const router = useRouter();

    return (
        <div 
            className={cn(
                "absolute left-1/2 -translate-x-1/2 transition-all duration-500 ease-in-out pointer-events-none",
                isVisible 
                    ? "opacity-100 translate-y-0 pointer-events-auto scale-100" 
                    : "opacity-0 -translate-y-4 pointer-events-none scale-90"
            )}
        >
            <button
                onClick={() => router.push("/hostels")}
                className="flex items-center gap-3 pl-6 pr-2 py-2 bg-white rounded-full border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-gray-300 transition-all active:scale-95 group"
            >
                <div className="flex items-center gap-3">
                    <MapPin size={14} className="text-blue-500" />
                    <span className="text-[11px] font-bold text-gray-900 uppercase tracking-widest border-r border-gray-100 pr-4">
                        Any University
                    </span>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                        Start Search
                    </span>
                </div>
                
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200 group-hover:bg-blue-700 transition-colors">
                    <Search size={14} />
                </div>
            </button>
        </div>
    );
}
