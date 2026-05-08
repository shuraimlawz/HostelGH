"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { SCHOOLS_MAP } from "@/lib/constants";
import HostelCard from "@/components/hostels/HostelCard";
import { Skeleton } from "@/components/ui/skeleton";
import { GraduationCap, MapPin, Building2, ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { notFound } from "next/navigation";

export default function SchoolHostelsClient() {
    const params = useParams();
    const slug = params.slug as string;
    const school = SCHOOLS_MAP[slug];

    if (!school) return notFound();

    return <SchoolContent slug={slug} school={school} />;
}

function SchoolContent({ slug, school }: { slug: string; school: (typeof SCHOOLS_MAP)[string] }) {
    const { data: hostels = [], isLoading } = useQuery({
        queryKey: ["school-hostels", slug],
        queryFn: async () => {
            const aliases = school.aliases ?? [school.name, school.shortName];

            // Send all known name variants in a single request — the backend builds an OR
            // query across all of them, so "GCTU" / "Ghana Communication Technology University" /
            // "Ghana Telecom University College" all resolve correctly.
            const { data } = await api.get("/hostels/public", {
                params: {
                    universityAliases: aliases.join("|"),
                    sort: "relevance",
                    limit: 40,
                },
            });

            if (Array.isArray(data) && data.length > 0) return data;

            // Fallback: search by city but filter to school-relevant hostels to avoid
            // returning every hostel in Accra for a single Accra-based school
            const { data: cityData } = await api.get("/hostels/public", {
                params: { city: school.city, sort: "relevance", limit: 80 },
            });

            if (Array.isArray(cityData) && cityData.length > 0) {
                const schoolAreas = (school.areas ?? []).map((a: string) => a.toLowerCase());
                const schoolAliasesLower = aliases.map((a: string) => a.toLowerCase());

                const relevant = cityData.filter((h: any) => {
                    const uniField = (h.university ?? "").toLowerCase();
                    const addrField = (h.addressLine ?? "").toLowerCase();

                    // Match if the university field contains any alias
                    if (schoolAliasesLower.some(a => uniField.includes(a) || a.includes(uniField.trim()))) {
                        return true;
                    }
                    // Match if address contains one of the school's known areas
                    if (schoolAreas.some(area => addrField.includes(area))) {
                        return true;
                    }
                    return false;
                });

                // If we found relevant ones, use them; otherwise fall back to all city results
                return relevant.length > 0 ? relevant : cityData;
            }

            // Last resort: region-level results
            if (school.region) {
                const { data: regionData } = await api.get("/hostels/public", {
                    params: { region: school.region, sort: "relevance", limit: 40 },
                });
                if (Array.isArray(regionData) && regionData.length > 0) return regionData;
            }

            return [];
        },
        staleTime: 5 * 60 * 1000,
    });

    const minPrice = hostels.length > 0
        ? Math.min(...hostels.filter(h => h.minPrice).map(h => h.minPrice / 100))
        : null;

    const available = hostels.filter(h => h.rooms?.some((r: any) => r.availableSlots > 0)).length;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero */}
            <div className={cn("bg-gradient-to-br text-white pt-10 pb-20 px-4", school.color)}>
                <div className="max-w-5xl mx-auto">
                    <Link
                        href="/schools"
                        className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-medium mb-8 transition-colors"
                    >
                        <ArrowLeft size={15} /> Back to all schools
                    </Link>

                    <div className="flex items-center gap-2 text-white/70 mb-4">
                        <GraduationCap size={18} />
                        <span className="text-xs font-bold uppercase tracking-widest">{school.region} Region</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-tight mb-3">
                        Hostels Near <br className="hidden md:block" />
                        <span className="text-white/90">{school.shortName}</span>
                    </h1>

                    <p className="text-white/70 text-base md:text-lg max-w-2xl mb-8">
                        {school.description} Find verified student accommodation nearby.
                    </p>

                    <div className="flex items-center gap-2 text-white/80 text-sm">
                        <MapPin size={14} />
                        <span>{school.city}, Ghana</span>
                    </div>
                </div>
            </div>

            {/* Stats strip */}
            <div className="max-w-5xl mx-auto px-4 -mt-10 mb-12">
                <div className="grid grid-cols-3 gap-4">
                    {[
                        {
                            label: "Hostels Listed",
                            value: isLoading ? "—" : `${hostels.length}+`,
                            icon: Building2,
                        },
                        {
                            label: "Available Now",
                            value: isLoading ? "—" : `${available}`,
                            icon: MapPin,
                        },
                        {
                            label: "Starting From",
                            value: isLoading ? "—" : (minPrice ? `₵${minPrice.toLocaleString()}` : "Contact"),
                            icon: GraduationCap,
                        },
                    ].map(stat => (
                        <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
                            <stat.icon className="text-blue-600 mb-2" size={24} />
                            <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                            <p className="text-xs text-gray-500 font-medium mt-0.5">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Nearby areas */}
            {school.areas && school.areas.length > 0 && (
                <div className="max-w-5xl mx-auto px-4 mb-12">
                    <h2 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-tight">Popular Areas</h2>
                    <div className="flex flex-wrap gap-2">
                        {school.areas.map(area => (
                            <Link
                                key={area}
                                href={`/hostels?city=${encodeURIComponent(area)}`}
                                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                                {area}
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Hostels grid */}
            <div className="max-w-5xl mx-auto px-4 pb-20">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tight">
                        Available Hostels
                    </h2>
                    <Link
                        href={`/hostels?university=${encodeURIComponent(school.name)}`}
                        className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-semibold"
                    >
                        View all <ExternalLink size={13} />
                    </Link>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="flex flex-col">
                                <Skeleton className="aspect-square w-full rounded-2xl mb-3 bg-gray-100" />
                                <Skeleton className="h-4 w-3/4 mb-1" />
                                <Skeleton className="h-4 w-1/2 mb-1" />
                                <Skeleton className="h-4 w-2/3 mb-2" />
                                <Skeleton className="h-4 w-1/3" />
                            </div>
                        ))}
                    </div>
                ) : hostels.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                        {hostels.map(hostel => (
                            <HostelCard key={hostel.id} hostel={hostel} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Building2 size={40} className="text-gray-200 mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 mb-2">No listings yet</h3>
                        <p className="text-sm text-gray-500 max-w-sm mb-6">
                            We don't have verified hostels near {school.shortName} yet, but we're growing fast.
                        </p>
                        <Link
                            href={`/hostels?city=${encodeURIComponent(school.city)}`}
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors"
                        >
                            Browse hostels in {school.city}
                        </Link>
                    </div>
                )}
            </div>

            {/* Owner CTA */}
            <div className={cn("bg-gradient-to-br text-white py-16 px-4", school.color)}>
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-2xl md:text-3xl font-black mb-3 uppercase tracking-tight">
                        Own a Hostel Near {school.shortName}?
                    </h2>
                    <p className="text-white/80 mb-8 text-sm">
                        List your hostel on HostelGH and reach thousands of students searching for accommodation near {school.shortName}.
                    </p>
                    <Link
                        href="/auth/register?role=OWNER"
                        className="inline-block bg-white text-gray-900 px-8 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-xl"
                    >
                        List Your Hostel — It's Free
                    </Link>
                </div>
            </div>
        </div>
    );
}
