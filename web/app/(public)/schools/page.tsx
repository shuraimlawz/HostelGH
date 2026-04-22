import type { Metadata } from "next";
import Link from "next/link";
import { SCHOOLS_MAP } from "@/lib/constants";
import { GraduationCap, ArrowRight, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
    title: "Hostels Near Universities in Ghana – HostelGH",
    description: "Find verified student hostels near every major university in Ghana. Browse hostels near KNUST, UG Legon, UCC, GCTU, UHAS, UDS, and more.",
    keywords: ["hostel near university Ghana", "student accommodation Ghana", "hostels near KNUST", "hostels near UG", "university hostels Ghana"],
};

export default function SchoolsPage() {
    const schools = Object.entries(SCHOOLS_MAP);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero */}
            <div className="bg-gray-900 text-white py-20 px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center gap-2 text-blue-400 mb-5">
                        <GraduationCap size={20} />
                        <span className="text-sm font-bold uppercase tracking-widest">Browse by Campus</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase leading-tight mb-4">
                        Hostels Near <span className="text-blue-500">Every Campus</span>
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl">
                        HostelGH has verified student accommodation near every major university and polytechnic across Ghana.
                    </p>
                </div>
            </div>

            {/* Schools grid */}
            <div className="max-w-5xl mx-auto px-4 py-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 uppercase tracking-tight">Select Your University</h2>
                <p className="text-sm text-gray-500 mb-10">Click any school to browse verified hostels nearby.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {schools.map(([slug, school]) => (
                        <Link
                            key={slug}
                            href={`/schools/${slug}`}
                            className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-gray-200 transition-all duration-300 hover:-translate-y-0.5"
                        >
                            {/* Color bar top */}
                            <div className={cn("h-2 w-full bg-gradient-to-r", school.color)} />

                            <div className="p-6">
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <div>
                                        <p className="text-xl font-black text-gray-900 tracking-tight">{school.shortName}</p>
                                        <p className="text-xs text-gray-500 font-medium leading-snug mt-0.5 pr-4">{school.name}</p>
                                    </div>
                                    <ArrowRight
                                        size={18}
                                        className="shrink-0 text-gray-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all mt-1"
                                    />
                                </div>

                                <div className="flex items-center gap-1.5 text-gray-400 text-xs font-medium">
                                    <MapPin size={12} />
                                    <span>{school.city}, {school.region}</span>
                                </div>

                                {school.areas && school.areas.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-4">
                                        {school.areas.slice(0, 3).map(area => (
                                            <span key={area} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-full uppercase tracking-widest">
                                                {area}
                                            </span>
                                        ))}
                                        {school.areas.length > 3 && (
                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-400 text-[10px] font-bold rounded-full">
                                                +{school.areas.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))}

                    {/* Catch-all: Browse all hostels */}
                    <Link
                        href="/hostels"
                        className="group relative bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 p-6 flex flex-col justify-between min-h-[160px]"
                    >
                        <div>
                            <p className="text-xl font-black text-white tracking-tight">All Other Universities</p>
                            <p className="text-xs text-blue-200 mt-1">Browse all hostels and filter by your school</p>
                        </div>
                        <div className="flex items-center gap-2 text-white font-bold text-sm mt-4">
                            Browse All Hostels <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
