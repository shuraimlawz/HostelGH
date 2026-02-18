import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Building2, Users, Star, ArrowRight, Waves } from "lucide-react";

export const metadata: Metadata = {
    title: "Hostels in Cape Coast – Student Accommodation Near UCC",
    description: "Find affordable hostels in Cape Coast near University of Cape Coast (UCC). Self-contained rooms, chamber and hall options with water and light included.",
    keywords: ["hostels in Cape Coast", "UCC hostels", "Cape Coast student accommodation", "hostel near UCC", "self-contained hostel Cape Coast"],
};

export default function CapeCoastHostelsPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-gradient-to-br from-cyan-600 to-blue-700 text-white py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center gap-2 text-cyan-100 mb-4">
                        <MapPin size={20} />
                        <span className="text-sm font-medium">Cape Coast, Central Region</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-3">
                        Student Hostels in Cape Coast
                    </h1>
                    <p className="text-xl text-cyan-100 max-w-2xl">
                        Discover verified hostels near University of Cape Coast (UCC). Affordable accommodation with modern facilities by the coast.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 -mt-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                        <Building2 className="text-cyan-600 mb-3" size={32} />
                        <h3 className="text-3xl font-bold mb-1">80+</h3>
                        <p className="text-gray-600">Verified Hostels</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                        <Users className="text-blue-600 mb-3" size={32} />
                        <h3 className="text-3xl font-bold mb-1">3,500+</h3>
                        <p className="text-gray-600">UCC Students</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                        <Waves className="text-teal-600 mb-3" size={32} />
                        <h3 className="text-3xl font-bold mb-1">Coastal</h3>
                        <p className="text-gray-600">Living Experience</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold mb-8">Popular Areas in Cape Coast</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { name: "Ola", count: "25 hostels", description: "Close to UCC main campus" },
                        { name: "Apewosika", count: "22 hostels", description: "Affordable student area" },
                        { name: "Kwaprow", count: "18 hostels", description: "Quiet residential zone" },
                        { name: "Adisadel", count: "15 hostels", description: "Near UCC north campus" },
                    ].map((area) => (
                        <Link
                            key={area.name}
                            href={`/search?location=${area.name.toLowerCase()}`}
                            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all group"
                        >
                            <h3 className="text-xl font-bold mb-2 group-hover:text-cyan-600 transition-colors">
                                {area.name}
                            </h3>
                            <p className="text-gray-600 text-sm mb-3">{area.description}</p>
                            <div className="flex items-center justify-between">
                                <span className="text-cyan-600 font-semibold">{area.count}</span>
                                <ArrowRight className="text-gray-400 group-hover:text-cyan-600 group-hover:translate-x-1 transition-all" size={20} />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-8">Hostels Near Schools</h2>
                    <Link
                        href="/schools/ucc"
                        className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl hover:bg-cyan-50 transition-colors group max-w-2xl"
                    >
                        <span className="font-semibold">University of Cape Coast (UCC)</span>
                        <ArrowRight className="text-gray-400 group-hover:text-cyan-600 transition-colors" size={20} />
                    </Link>
                </div>
            </div>

            <div className="bg-gradient-to-br from-cyan-600 to-blue-700 text-white py-16">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">Find Your Cape Coast Hostel</h2>
                    <p className="text-xl text-cyan-100 mb-8">
                        Browse verified hostels near UCC with self-contained rooms, chamber and hall options.
                    </p>
                    <Link
                        href="/search?city=cape-coast"
                        className="inline-block bg-white text-cyan-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-cyan-50 transition-colors"
                    >
                        Browse Cape Coast Hostels
                    </Link>
                </div>
            </div>
        </div>
    );
}
