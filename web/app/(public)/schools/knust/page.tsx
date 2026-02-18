import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Building2, Users, GraduationCap, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
    title: "Hostels Near KNUST – Student Accommodation in Kumasi",
    description: "Find affordable hostels near Kwame Nkrumah University of Science and Technology (KNUST) in Ayeduase, Kotei, Maxima. Self-contained and chamber and hall options.",
    keywords: ["hostel near KNUST", "KNUST hostels", "Ayeduase hostels", "Kotei accommodation", "Maxima hostel", "KNUST student hostel"],
};

export default function KNUSTHostelsPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-gradient-to-br from-yellow-600 to-orange-700 text-white py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center gap-2 text-yellow-100 mb-4">
                        <GraduationCap size={20} />
                        <span className="text-sm font-medium">Kwame Nkrumah University of Science and Technology</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-3">
                        Hostels Near KNUST
                    </h1>
                    <p className="text-xl text-yellow-100 max-w-2xl">
                        Find verified student hostels near KNUST campus in Ayeduase, Kotei, Maxima, and Bomso. Affordable rates with modern facilities.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 -mt-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                        <Building2 className="text-yellow-600 mb-3" size={32} />
                        <h3 className="text-3xl font-bold mb-1">95+</h3>
                        <p className="text-gray-600">Hostels Near KNUST</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                        <Users className="text-orange-600 mb-3" size={32} />
                        <h3 className="text-3xl font-bold mb-1">8,000+</h3>
                        <p className="text-gray-600">KNUST Students</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                        <MapPin className="text-green-600 mb-3" size={32} />
                        <h3 className="text-3xl font-bold mb-1">5-15min</h3>
                        <p className="text-gray-600">From Campus</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold mb-8">Best Areas for KNUST Students</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { name: "Ayeduase", count: "42 hostels", distance: "5 min walk", description: "Closest to KNUST main campus" },
                        { name: "Kotei", count: "35 hostels", distance: "10 min", description: "Affordable student favorite" },
                        { name: "Maxima", count: "28 hostels", distance: "10 min", description: "Near KNUST main gate" },
                        { name: "Bomso", count: "22 hostels", distance: "15 min", description: "Quiet residential area" },
                        { name: "Kentinkrono", count: "18 hostels", distance: "12 min", description: "Budget-friendly options" },
                        { name: "Ayigya", count: "15 hostels", distance: "15 min", description: "Near sports complex" },
                    ].map((area) => (
                        <div
                            key={area.name}
                            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <h3 className="text-xl font-bold">{area.name}</h3>
                                <span className="text-xs bg-yellow-50 text-yellow-600 px-2 py-1 rounded-full font-bold">
                                    {area.distance}
                                </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-3">{area.description}</p>
                            <div className="flex items-center justify-between">
                                <span className="text-yellow-600 font-semibold">{area.count}</span>
                                <Link
                                    href={`/search?school=knust&location=${area.name.toLowerCase()}`}
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
                    <h2 className="text-3xl font-bold mb-8">What KNUST Students Get</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[
                            { title: "Self-Contained Rooms", items: ["Own washroom", "Wardrobe space", "Kitchen facilities", "Water and light included"] },
                            { title: "Chamber and Hall", items: ["Shared washroom", "Affordable rates", "Common kitchen", "Security services"] },
                            { title: "Boys Hostel", items: ["Male-only accommodation", "Study areas", "Sports facilities", "24/7 security"] },
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

            <div className="bg-gradient-to-br from-yellow-600 to-orange-700 text-white py-16">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">Find Your KNUST Hostel Today</h2>
                    <p className="text-xl text-yellow-100 mb-8">
                        Browse verified hostels near KNUST with self-contained and chamber and hall options.
                    </p>
                    <Link
                        href="/search?school=knust"
                        className="inline-block bg-white text-yellow-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-50 transition-colors"
                    >
                        Browse KNUST Hostels
                    </Link>
                </div>
            </div>
        </div>
    );
}
