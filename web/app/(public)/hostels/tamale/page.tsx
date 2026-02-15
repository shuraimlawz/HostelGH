import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Building2, Users, Star, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
    title: "Hostels in Tamale – Student Accommodation Near UDS",
    description: "Find affordable hostels in Tamale near University for Development Studies (UDS). Self-contained rooms and chamber and hall options available.",
    keywords: ["hostels in Tamale", "UDS hostels", "Tamale student accommodation", "hostel near UDS", "Northern Region hostels"],
};

export default function TamaleHostelsPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-gradient-to-br from-orange-600 to-red-700 text-white py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center gap-2 text-orange-100 mb-4">
                        <MapPin size={20} />
                        <span className="text-sm font-medium">Tamale, Northern Region</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Student Hostels in Tamale
                    </h1>
                    <p className="text-xl text-orange-100 max-w-2xl">
                        Discover verified hostels near University for Development Studies (UDS) and across Tamale. Affordable student accommodation.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 -mt-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                        <Building2 className="text-orange-600 mb-3" size={32} />
                        <h3 className="text-3xl font-bold mb-1">60+</h3>
                        <p className="text-gray-600">Verified Hostels</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                        <Users className="text-red-600 mb-3" size={32} />
                        <h3 className="text-3xl font-bold mb-1">2,800+</h3>
                        <p className="text-gray-600">UDS Students</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                        <Star className="text-yellow-600 mb-3" size={32} />
                        <h3 className="text-3xl font-bold mb-1">4.6/5</h3>
                        <p className="text-gray-600">Average Rating</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold mb-8">Popular Areas in Tamale</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { name: "Dungu", count: "20 hostels", description: "Close to UDS campus" },
                        { name: "Kalpohin", count: "18 hostels", description: "Student-friendly area" },
                        { name: "Sagnarigu", count: "15 hostels", description: "Affordable options" },
                        { name: "Vittin", count: "12 hostels", description: "Quiet neighborhood" },
                    ].map((area) => (
                        <Link
                            key={area.name}
                            href={`/search?location=${area.name.toLowerCase()}`}
                            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all group"
                        >
                            <h3 className="text-xl font-bold mb-2 group-hover:text-orange-600 transition-colors">
                                {area.name}
                            </h3>
                            <p className="text-gray-600 text-sm mb-3">{area.description}</p>
                            <div className="flex items-center justify-between">
                                <span className="text-orange-600 font-semibold">{area.count}</span>
                                <ArrowRight className="text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" size={20} />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-8">Hostels Near Schools</h2>
                    <Link
                        href="/schools/uds"
                        className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl hover:bg-orange-50 transition-colors group max-w-2xl"
                    >
                        <span className="font-semibold">University for Development Studies (UDS)</span>
                        <ArrowRight className="text-gray-400 group-hover:text-orange-600 transition-colors" size={20} />
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold mb-8">Tamale Hostel Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-xl font-bold mb-3">Room Types</h3>
                        <ul className="space-y-2 text-gray-700">
                            <li>✓ Self-contained rooms</li>
                            <li>✓ Chamber and hall</li>
                            <li>✓ Single rooms</li>
                            <li>✓ Shared apartments</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-3">Facilities</h3>
                        <ul className="space-y-2 text-gray-700">
                            <li>✓ Water and light included</li>
                            <li>✓ Wardrobe and kitchen</li>
                            <li>✓ Washroom facilities</li>
                            <li>✓ 24/7 security</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-3">Options</h3>
                        <ul className="space-y-2 text-gray-700">
                            <li>✓ Boys hostel</li>
                            <li>✓ Girls hostel</li>
                            <li>✓ Mixed hostels</li>
                            <li>✓ Verified listings</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-br from-orange-600 to-red-700 text-white py-16">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">Find Your Tamale Hostel</h2>
                    <p className="text-xl text-orange-100 mb-8">
                        Browse verified hostels near UDS with affordable rates and modern facilities.
                    </p>
                    <Link
                        href="/search?city=tamale"
                        className="inline-block bg-white text-orange-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-orange-50 transition-colors"
                    >
                        Browse Tamale Hostels
                    </Link>
                </div>
            </div>
        </div>
    );
}
