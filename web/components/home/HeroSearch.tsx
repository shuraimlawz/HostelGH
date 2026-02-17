"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function HeroSearch() {
    const router = useRouter();
    const [city, setCity] = useState("");

    const handleSearch = () => {
        router.push(`/hostels${city ? `?city=${encodeURIComponent(city)}` : ""}`);
    };

    return (
        <div className="w-full flex justify-center pt-6 pb-2">
            <div className="bg-white rounded-full shadow-[0_3px_12px_rgba(0,0,0,0.08),0_3px_6px_rgba(0,0,0,0.12)] border border-gray-200 flex items-center divide-x divide-gray-200 h-[66px] max-w-4xl w-full mx-6 hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)] transition-shadow">

                {/* Where */}
                <div className="flex-1 px-8 py-3 hover:bg-gray-100 rounded-full cursor-pointer transition-colors relative group">
                    <div className="text-xs font-bold px-1 mb-0.5">Where</div>
                    <input
                        type="text"
                        placeholder="Search destinations"
                        className="w-full text-sm text-gray-600 bg-transparent border-none outline-none placeholder:text-gray-400 truncate"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                </div>

                {/* When */}
                <div className="flex-1 px-8 py-3 hover:bg-gray-100 rounded-full cursor-pointer transition-colors relative group">
                    <div className="text-xs font-bold px-1 mb-0.5">When</div>
                    <div className="text-sm text-gray-400">Add dates</div>
                </div>

                {/* Who */}
                <div className="flex-[0.8] pl-8 pr-2 py-3 hover:bg-gray-100 rounded-full cursor-pointer transition-colors relative group flex items-center">
                    <div className="flex-1">
                        <div className="text-xs font-bold px-1 mb-0.5">Who</div>
                        <div className="text-sm text-gray-400">Add guests</div>
                    </div>

                    <button
                        className="bg-[#FF385C] hover:bg-[#D90B3E] text-white p-4 rounded-full transition-all flex items-center justify-center shadow-md ml-4"
                        onClick={handleSearch}
                    >
                        <Search size={16} strokeWidth={3} />
                        <span className="ml-2 font-semibold hidden lg:block">Search</span>
                    </button>
                </div>

            </div>
        </div>
    );
}