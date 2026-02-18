"use client";

import { useState } from "react";
import { Search, Book, CreditCard, Home, UserCheck, Shield, LifeBuoy } from "lucide-react";
import SupportCard from "@/components/support/SupportCard";
import { useRouter } from "next/navigation";

const TOPICS = [
    {
        title: "Booking Issues",
        description: "Help with reservations, cancellations, and check-in procedures.",
        icon: Book,
        color: "text-blue-600",
        bgColor: "bg-blue-50"
    },
    {
        title: "Payment & Refunds",
        description: "Billing details, Paystack/MoMo issues, and refund status.",
        icon: CreditCard,
        color: "text-green-600",
        bgColor: "bg-green-50"
    },
    {
        title: "Hostel Owner Listings",
        description: "Guidance on creating and managing your property listings.",
        icon: Home,
        color: "text-purple-600",
        bgColor: "bg-purple-50"
    },
    {
        title: "Account & Verification",
        description: "Managing your profile, password, and identity verification.",
        icon: UserCheck,
        color: "text-orange-600",
        bgColor: "bg-orange-50"
    },
    {
        title: "Safety & Reporting",
        description: "Guidelines for safe bookings and reporting suspicious activity.",
        icon: Shield,
        color: "text-red-600",
        bgColor: "bg-red-50"
    },
    {
        title: "Technical Issues",
        description: "Troubleshooting app performance and connectivity problems.",
        icon: LifeBuoy,
        color: "text-gray-600",
        bgColor: "bg-gray-50"
    }
];

export default function SupportPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    return (
        <div className="space-y-16">
            {/* Hero Section */}
            <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
                    HostelGH Support
                </h1>
                <p className="text-gray-500 text-lg font-medium max-w-2xl">
                    Get help with bookings, payments, listings, and account issues. Everything you need to know about student housing in Ghana.
                </p>

                {/* Search Bar */}
                <div className="relative group max-w-xl">
                    <div className="absolute inset-0 bg-blue-100 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-40 transition-opacity" />
                    <div className="relative flex items-center bg-white border-2 border-gray-100 rounded-2xl px-5 py-1 shadow-sm focus-within:border-blue-500 focus-within:shadow-md transition-all">
                        <Search className="text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search support articles (e.g., refunds, booking, verification)"
                            className="w-full px-4 py-4 font-medium bg-transparent outline-none placeholder:text-gray-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Popular Topics Section */}
            <section className="space-y-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">
                        Popular Topics
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {TOPICS.map((topic) => (
                        <SupportCard
                            key={topic.title}
                            {...topic}
                            onClick={() => router.push("/support/help-center")}
                        />
                    ))}
                </div>
            </section>

            {/* Quick Help Tip */}
            <div className="p-8 bg-gray-900 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-2 text-center md:text-left">
                    <h3 className="text-xl font-black text-white">Can't find what you need?</h3>
                    <p className="text-gray-400 font-medium">Browse our full Help Center for detailed guides.</p>
                </div>
                <button
                    onClick={() => router.push("/support/help-center")}
                    className="bg-white text-black px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all"
                >
                    View All articles
                </button>
            </div>
        </div>
    );
}
