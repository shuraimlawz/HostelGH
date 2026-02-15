import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Building2, Users, GraduationCap, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
    title: "Hostels Near GCTU – Affordable Student Accommodation in Accra",
    description: "Find verified hostels near Ghana Communication Technology University (GCTU) in Accra. Self-contained rooms, chamber and hall options with modern facilities.",
    keywords: ["hostel near GCTU", "GCTU hostels", "GCTU accommodation", "Tesano hostels", "Accra student hostel"],
};

export default function GCTUHostelsPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-gradient-to-br from-purple-600 to-pink-700 text-white py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center gap-2 text-purple-100 mb-4">
                        <GraduationCap size={20} />
                        <span className="text-sm font-medium">Ghana Communication Technology University</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Hostels Near GCTU
                    </h1>
                    <p className="text-xl text-purple-100 max-w-2xl">
                        Discover verified student hostels near Ghana Communication Technology University. Self-contained and chamber and hall options available.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 -mt-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                        <Building2 className="text-purple-600 mb-3" size={32} />
                        <h3 className="text-3xl font-bold mb-1">45+</h3>
                        <p className="text-gray-600">Hostels Near GCTU</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                        <Users className="text-pink-600 mb-3" size={32} />
                        <h3 className="text-3xl font-bold mb-1">2,500+</h3>
                        <p className="text-gray-600">GCTU Students</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                        <MapPin className="text-blue-600 mb-3" size={32} />
                        <h3 className="text-3xl font-bold mb-1">5-15min</h3>
                        <p className="text-gray-600">From Campus</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold mb-8">Best Areas for GCTU Students</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { name: "Tesano", count: "18 hostels", distance: "5 min walk" },
                        { name: "Dzorwulu", count: "15 hostels", distance: "10 min" },
                        { name: "Kokomlemle", count: "12 hostels", distance: "15 min" },
                    ].map((area) => (
                        <div
                            key={area.name}
                            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <h3 className="text-xl font-bold">{area.name}</h3>
                                <span className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-full font-bold">
                                    {area.distance}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-purple-600 font-semibold">{area.count}</span>
                                <Link
                                    href={`/search?school=gctu&location=${area.name.toLowerCase()}`}
                                    className="text-sm text-blue-600 hover:underline"
                                >
                                    View hostels →
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-8">Hostel Features for GCTU Students</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            "Self-contained rooms",
                            "Chamber and hall",
                            "Water and light included",
                            "Wardrobe and kitchen",
                            "Boys hostel options",
                            "Girls hostel options",
                            "24/7 security",
                            "Verified listings",
                        ].map((feature) => (
                            <div key={feature} className="flex items-center gap-2">
                                <CheckCircle size={20} className="text-green-600 shrink-0" />
                                <span className="text-gray-700">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-br from-purple-600 to-pink-700 text-white py-16">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">Find Your GCTU Hostel</h2>
                    <p className="text-xl text-purple-100 mb-8">
                        Browse verified hostels near Ghana Communication Technology University.
                    </p>
                    <Link
                        href="/search?school=gctu"
                        className="inline-block bg-white text-purple-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-purple-50 transition-colors"
                    >
                        Browse GCTU Hostels
                    </Link>
                </div>
            </div>
        </div>
    );
}
