import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Building2, Users, GraduationCap, ArrowRight, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
    title: "Hostels Near University of Ghana (UG Legon) – Verified Student Accommodation",
    description: "Find affordable hostels near UG Legon in Madina, East Legon, Atomic, and Kwabenya. Self-contained rooms, chamber and hall options. Water and light included.",
    keywords: ["hostel near UG Legon", "UG hostels", "Legon accommodation", "Madina hostels", "East Legon student hostel", "Atomic hostel"],
};

export default function UGHostelsPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-gradient-to-br from-red-600 to-orange-700 text-white py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center gap-2 text-red-100 mb-4">
                        <GraduationCap size={20} />
                        <span className="text-sm font-medium">University of Ghana, Legon</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Hostels Near UG Legon
                    </h1>
                    <p className="text-xl text-red-100 max-w-2xl">
                        Find verified student hostels within walking distance or short trotro ride from UG Legon campus. Self-contained, chamber and hall options available.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 -mt-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                        <Building2 className="text-red-600 mb-3" size={32} />
                        <h3 className="text-3xl font-bold mb-1">85+</h3>
                        <p className="text-gray-600">Hostels Near UG</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                        <Users className="text-orange-600 mb-3" size={32} />
                        <h3 className="text-3xl font-bold mb-1">6,500+</h3>
                        <p className="text-gray-600">UG Students Housed</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                        <MapPin className="text-blue-600 mb-3" size={32} />
                        <h3 className="text-3xl font-bold mb-1">5-20min</h3>
                        <p className="text-gray-600">From Campus</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold mb-8">Best Areas for UG Students</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { name: "Madina", count: "38 hostels", distance: "5-10 min trotro", description: "Most popular for UG students" },
                        { name: "East Legon", count: "28 hostels", distance: "10-15 min", description: "Upscale, modern facilities" },
                        { name: "Atomic", count: "22 hostels", distance: "5 min walk", description: "Closest to UG main gate" },
                        { name: "Kwabenya", count: "18 hostels", distance: "10-15 min", description: "Budget-friendly options" },
                        { name: "Haatso", count: "15 hostels", distance: "15 min", description: "Quiet residential area" },
                        { name: "Ashongman", count: "12 hostels", distance: "20 min", description: "Affordable rates" },
                    ].map((area) => (
                        <div
                            key={area.name}
                            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all group cursor-pointer"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <h3 className="text-xl font-bold group-hover:text-red-600 transition-colors">
                                    {area.name}
                                </h3>
                                <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full font-bold">
                                    {area.distance}
                                </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-3">{area.description}</p>
                            <div className="flex items-center justify-between">
                                <span className="text-red-600 font-semibold">{area.count}</span>
                                <Link
                                    href={`/search?school=ug&location=${area.name.toLowerCase()}`}
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
                    <h2 className="text-3xl font-bold mb-8">What UG Students Get</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[
                            { title: "Self-Contained Rooms", items: ["Own washroom", "Wardrobe space", "Kitchen access", "Water and light included"] },
                            { title: "Chamber and Hall", items: ["Shared washroom", "Affordable rates", "Common kitchen", "Security services"] },
                            { title: "Boys Hostel", items: ["Male-only accommodation", "Sports facilities", "Study rooms", "24/7 security"] },
                            { title: "Girls Hostel", items: ["Female-only accommodation", "Safe environment", "Modern amenities", "Verified landlords"] },
                        ].map((category) => (
                            <div key={category.title} className="bg-gray-50 rounded-2xl p-6">
                                <h3 className="text-xl font-bold mb-4">{category.title}</h3>
                                <ul className="space-y-2">
                                    {category.items.map((item) => (
                                        <li key={item} className="flex items-center gap-2 text-gray-700">
                                            <CheckCircle size={18} className="text-green-600 shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 md:p-12">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">Why Choose HostelGH for UG Accommodation?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <h3 className="font-bold mb-2">✓ Verified Listings</h3>
                            <p className="text-gray-700 text-sm">All hostels inspected and verified by our team</p>
                        </div>
                        <div>
                            <h3 className="font-bold mb-2">✓ Real Photos</h3>
                            <p className="text-gray-700 text-sm">Actual photos of rooms, not fake pictures</p>
                        </div>
                        <div>
                            <h3 className="font-bold mb-2">✓ Secure Booking</h3>
                            <p className="text-gray-700 text-sm">Safe payment and booking confirmation</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-br from-red-600 to-orange-700 text-white py-16">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">Find Your UG Hostel Today</h2>
                    <p className="text-xl text-red-100 mb-8">
                        Browse verified hostels near University of Ghana. Book your room in minutes.
                    </p>
                    <Link
                        href="/search?school=ug"
                        className="inline-block bg-white text-red-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-red-50 transition-colors"
                    >
                        Browse UG Hostels
                    </Link>
                </div>
            </div>
        </div>
    );
}
