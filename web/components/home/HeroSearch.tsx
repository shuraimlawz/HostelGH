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
        <div className="w-full flex justify-center">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 flex items-center p-2 max-w-2xl w-full mx-4">

                {/* Where input */}
                <div className="flex-1 px-4 py-2 relative group">
                    <div className="text-xs font-bold text-gray-800 uppercase tracking-wide mb-1">Location</div>
                    <input
                        type="text"
                        placeholder="Which school or city?"
                        className="w-full text-base text-gray-900 placeholder:text-gray-400 border-none outline-none bg-transparent font-medium"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                </div>

                {/* Search Button */}
                <button
                    className="bg-[#1877F2] hover:bg-[#145CBF] text-white px-6 py-3 rounded-lg transition-all flex items-center justify-center shadow-md ml-2"
                    onClick={handleSearch}
                >
                    <Search size={20} strokeWidth={2.5} />
                    <span className="ml-2 font-bold hidden sm:block">Search</span>
                </button>

            </div>
        </div>
    );
}