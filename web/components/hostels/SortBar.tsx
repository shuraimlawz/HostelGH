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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 mb-8 border-b border-gray-100 dark:border-slate-800 gap-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-gray-400 border border-gray-100 dark:border-slate-700 shadow-sm">
                    <ListFilter size={18} />
                </div>
                <div className="space-y-0.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 leading-none">Results</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                        Found <span className="text-blue-600 dark:text-blue-400">{total}</span> Hostels
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap hidden md:block">Sort by:</span>
                <Select defaultValue={searchParams.get("sort") || "newest"} onValueChange={handleSort}>
                    <SelectTrigger className="w-full sm:w-[200px] h-11 rounded-xl border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold text-xs shadow-sm hover:border-blue-200 dark:hover:border-blue-500/50 transition-all outline-none text-gray-900 dark:text-white">
                        <SelectValue placeholder="Select order" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-gray-100 dark:border-slate-800 shadow-xl p-1 bg-white dark:bg-slate-900 text-gray-900 dark:text-white">
                        <SelectItem value="price_asc" className="rounded-lg text-xs font-bold py-2.5 focus:bg-gray-50 dark:focus:bg-slate-800">Price: Low to High</SelectItem>
                        <SelectItem value="price_desc" className="rounded-lg text-xs font-bold py-2.5 focus:bg-gray-50 dark:focus:bg-slate-800">Price: High to Low</SelectItem>
                        <SelectItem value="newest" className="rounded-lg text-xs font-bold py-2.5 focus:bg-gray-50 dark:focus:bg-slate-800">Newest First</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
