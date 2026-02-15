import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Building2, Users, Star, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
    title: "Hostels in Kumasi – Affordable Student Accommodation Near KNUST",
    description: "Find verified hostels in Kumasi near KNUST, Ayeduase, Kotei, and Maxima. Self-contained rooms, chamber and hall options with water and light included.",
    keywords: ["hostels in Kumasi", "KNUST hostels", "Ayeduase hostels", "Kotei accommodation", "Maxima hostels", "self-contained hostel Kumasi"],
};

export default function KumasiHostelsPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-green-600 to-teal-700 text-white py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center gap-2 text-green-100 mb-4">
                        <MapPin size={20} />
                        <span className="text-sm font-medium">Kumasi, Ashanti Region</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Student Hostels in Kumasi
                    </h1>
                    <p className="text-xl text-green-100 max-w-2xl">
                        Discover affordable hostels near KNUST and across Kumasi. From Ayeduase to Kotei, find the perfect student accommodation with verified listings.
                    </p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="max-w-7xl mx-auto px-4 -mt-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                        <Building2 className="text-green-600 mb-3" size={32} />
                        <h3 className="text-3xl font-bold mb-1">120+</h3>
                        <p className="text-gray-600">Verified Hostels</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                        <Users className="text-blue-600 mb-3" size={32} />
                        <h3 className="text-3xl font-bold mb-1">4,200+</h3>
                        <p className="text-gray-600">KNUST Students</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                        <Star className="text-yellow-600 mb-3" size={32} />
                        <h3 className="text-3xl font-bold mb-1">4.7/5</h3>
                        <p className="text-gray-600">Average Rating</p>
                    </div>
                </div>
            </div>

            {/* Popular Areas */}
            <div className="max-w-7xl mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold mb-8">Popular Areas in Kumasi</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { name: "Ayeduase", count: "42 hostels", description: "Walking distance to KNUST campus" },
                        { name: "Kotei", count: "35 hostels", description: "Affordable student community" },
                        { name: "Maxima", count: "28 hostels", description: "Close to KNUST main gate" },
                        { name: "Bomso", count: "22 hostels", description: "Quiet residential area" },
                        { name: "Kentinkrono", count: "18 hostels", description: "Budget-friendly options" },
                        { name: "Ayigya", count: "15 hostels", description: "Near KNUST sports complex" },
                    ].map((area) => (
                        <Link
                            key={area.name}
                            href={`/search?location=${area.name.toLowerCase()}`}
                            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all group"
                        >
                            <h3 className="text-xl font-bold mb-2 group-hover:text-green-600 transition-colors">
                                {area.name}
                            </h3>
                            <p className="text-gray-600 text-sm mb-3">{area.description}</p>
                            <div className="flex items-center justify-between">
                                <span className="text-green-600 font-semibold">{area.count}</span>
                                <ArrowRight className="text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" size={20} />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Nearby Schools */}
            <div className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-8">Hostels Near Schools in Kumasi</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            { name: "Kwame Nkrumah University of Science and Technology (KNUST)", link: "/schools/knust" },
                            { name: "Garden City University College", link: "/schools/garden-city" },
                            { name: "Christian Service University College", link: "/schools/csuc" },
                        ].map((school) => (
                            <Link
                                key={school.name}
                                href={school.link}
                                className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl hover:bg-green-50 transition-colors group"
                            >
                                <span className="font-semibold">{school.name}</span>
                                <ArrowRight className="text-gray-400 group-hover:text-green-600 transition-colors" size={20} />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* What to Expect */}
            <div className="max-w-7xl mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold mb-8">Kumasi Hostel Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-xl font-bold mb-3">Room Types</h3>
                        <ul className="space-y-2 text-gray-700">
                            <li>✓ Self-contained rooms</li>
                            <li>✓ Chamber and hall</li>
                            <li>✓ Single and shared rooms</li>
                            <li>✓ Studio apartments</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-3">Amenities</h3>
                        <ul className="space-y-2 text-gray-700">
                            <li>✓ Water and light included</li>
                            <li>✓ Wardrobe and kitchen</li>
                            <li>✓ Washroom facilities</li>
                            <li>✓ Security services</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-3">Options</h3>
                        <ul className="space-y-2 text-gray-700">
                            <li>✓ Boys hostel</li>
                            <li>✓ Girls hostel</li>
                            <li>✓ Mixed accommodation</li>
                            <li>✓ Verified by HostelGH</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-br from-green-600 to-teal-700 text-white py-16">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">Find Your Kumasi Hostel Today</h2>
                    <p className="text-xl text-green-100 mb-8">
                        Browse verified hostels near KNUST and across Kumasi. Book your room in minutes.
                    </p>
                    <Link
                        href="/search?city=kumasi"
                        className="inline-block bg-white text-green-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-50 transition-colors"
                    >
                        Browse Kumasi Hostels
                    </Link>
                </div>
            </div>
        </div>
    );
}
