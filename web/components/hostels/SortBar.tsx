"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { ListFilter } from "lucide-react";

export default function SortBar({ total }: { total: number }) {
    const searchParams = useSearchParams();
    const router = useRouter();

    const handleSort = (val: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("sort", val);
        router.push(`/hostels?${params.toString()}`);
    };

    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 mb-8 border-b border-gray-100 gap-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 border border-gray-100 shadow-sm">
                    <ListFilter size={18} />
                </div>
                <div className="space-y-0.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 leading-none">Market Results</p>
                    <p className="text-sm font-bold text-gray-900">
                        Analyzing <span className="text-blue-600">{total}</span> Strategic Assets
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap hidden md:block">Prioritize by:</span>
                <Select defaultValue={searchParams.get("sort") || "newest"} onValueChange={handleSort}>
                    <SelectTrigger className="w-full sm:w-[200px] h-11 rounded-xl border-gray-100 bg-white font-bold text-xs shadow-sm hover:border-blue-200 transition-all outline-none">
                        <SelectValue placeholder="Sort Parameters" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-gray-100 shadow-xl p-1">
                        <SelectItem value="price_asc" className="rounded-lg text-xs font-bold py-2.5">Price: Lowest → Highest</SelectItem>
                        <SelectItem value="price_desc" className="rounded-lg text-xs font-bold py-2.5">Price: Highest → Lowest</SelectItem>
                        <SelectItem value="newest" className="rounded-lg text-xs font-bold py-2.5">Chronology: Newest First</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
