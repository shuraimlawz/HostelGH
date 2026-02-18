import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Building2, Users, Star, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
    title: "Hostels in Accra – Find Affordable Student Accommodation",
    description: "Browse verified hostels in Accra, Ghana. Self-contained rooms, chamber and hall options near UG Legon, GCTU, and other schools. Water and light included.",
    keywords: ["hostels in Accra", "Accra student accommodation", "hostel near UG Legon", "East Legon hostels", "Madina hostels", "self-contained hostel Accra"],
};

export default function AccraHostelsPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center gap-2 text-blue-100 mb-4">
                        <MapPin size={20} />
                        <span className="text-sm font-medium">Accra, Greater Accra Region</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-3">
                        Find Your Perfect Hostel in Accra
                    </h1>
                    <p className="text-xl text-blue-100 max-w-2xl">
                        Discover affordable, verified student hostels across Accra. From East Legon to Madina, find self-contained rooms, chamber and hall options near your school.
                    </p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="max-w-7xl mx-auto px-4 -mt-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                        <Building2 className="text-blue-600 mb-3" size={32} />
                        <h3 className="text-3xl font-bold mb-1">150+</h3>
                        <p className="text-gray-600">Verified Hostels</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                        <Users className="text-green-600 mb-3" size={32} />
                        <h3 className="text-3xl font-bold mb-1">5,000+</h3>
                        <p className="text-gray-600">Happy Students</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                        <Star className="text-yellow-600 mb-3" size={32} />
                        <h3 className="text-3xl font-bold mb-1">4.8/5</h3>
                        <p className="text-gray-600">Average Rating</p>
                    </div>
                </div>
            </div>

            {/* Popular Areas */}
            <div className="max-w-7xl mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold mb-8">Popular Areas in Accra</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { name: "East Legon", count: "45 hostels", description: "Upscale area with modern facilities" },
                        { name: "Madina", count: "38 hostels", description: "Affordable options near UG Legon" },
                        { name: "Kwabenya", count: "32 hostels", description: "Budget-friendly student area" },
                        { name: "Ashongman", count: "28 hostels", description: "Growing student community" },
                        { name: "Haatso", count: "25 hostels", description: "Quiet residential area" },
                        { name: "Atomic", count: "22 hostels", description: "Close to UG campus" },
                    ].map((area) => (
                        <Link
                            key={area.name}
                            href={`/search?location=${area.name.toLowerCase().replace(" ", "-")}`}
                            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all group"
                        >
                            <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
                                {area.name}
                            </h3>
                            <p className="text-gray-600 text-sm mb-3">{area.description}</p>
                            <div className="flex items-center justify-between">
                                <span className="text-blue-600 font-semibold">{area.count}</span>
                                <ArrowRight className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" size={20} />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Nearby Schools */}
            <div className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-8">Hostels Near Schools in Accra</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            { name: "University of Ghana (UG Legon)", link: "/schools/ug" },
                            { name: "Ghana Communication Technology University (GCTU)", link: "/schools/gctu" },
                            { name: "Ashesi University", link: "/schools/ashesi" },
                            { name: "Central University", link: "/schools/central" },
                        ].map((school) => (
                            <Link
                                key={school.name}
                                href={school.link}
                                className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl hover:bg-blue-50 transition-colors group"
                            >
                                <span className="font-semibold">{school.name}</span>
                                <ArrowRight className="text-gray-400 group-hover:text-blue-600 transition-colors" size={20} />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* What to Expect */}
            <div className="max-w-7xl mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold mb-8">What to Expect from Accra Hostels</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-xl font-bold mb-3">Room Types</h3>
                        <ul className="space-y-2 text-gray-700">
                            <li>✓ Self-contained (own washroom)</li>
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
                            <li>✓ 24/7 security</li>
                            <li>✓ Internet access</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-3">Gender Options</h3>
                        <ul className="space-y-2 text-gray-700">
                            <li>✓ Boys hostel</li>
                            <li>✓ Girls hostel</li>
                            <li>✓ Mixed hostels</li>
                            <li>✓ Verified listings only</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-16">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to Find Your Hostel?</h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Browse hundreds of verified hostels in Accra and book your room today.
                    </p>
                    <Link
                        href="/search?city=accra"
                        className="inline-block bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors"
                    >
                        Browse Accra Hostels
                    </Link>
                </div>
            </div>
        </div>
    );
}
