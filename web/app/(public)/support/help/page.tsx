"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, ChevronDown, ChevronUp, BookOpen, CreditCard, User, ShieldCheck } from "lucide-react";

const CATEGORIES = [
    {
        id: "booking",
        title: "Bookings",
        icon: BookOpen,
        questions: [
            { q: "How do I book a hostel?", a: "To book a hostel, simply browse the listings, select a room type, and click 'Book Now'. Follow the prompts to provide your details and proceed to payment." },
            { q: "Can I cancel my booking?", a: "Cancellation policies vary by hostel. Please check the specific hostel's terms before booking. Generally, cancellations made 48 hours before check-in are eligible for a partial refund." },
        ]
    },
    {
        id: "payments",
        title: "Payments",
        icon: CreditCard,
        questions: [
            { q: "What payment methods are accepted?", a: "We currently accept all major credit/debit cards and mobile money via Paystack." },
            { q: "Is my payment information secure?", a: "Yes, all payments are processed through encrypted channels. We do not store your full card details on our servers." },
        ]
    },
    {
        id: "account",
        title: "Account",
        icon: User,
        questions: [
            { q: "How do I change my password?", a: "Go to your Profile settings and select 'Update Password'. You will need to verify your current password first." },
            { q: "What is the difference between Tenant and Owner roles?", a: "Tenants can browse and book hostels, while Owners can list hostels, manage rooms, and handle bookings." },
        ]
    },
    {
        id: "safety",
        title: "Safety",
        icon: ShieldCheck,
        questions: [
            { q: "How are hostels verified?", a: "Our team manually verifies every hostel listing to ensure the photos and details match the actual location." },
            { q: "What should I do if I have a problem during my stay?", a: "Contact the hostel owner first. If the issue remains unresolved, you can reach out to our support team." },
        ]
    }
];

export default function HelpCenterPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedIndex, setExpandedIndex] = useState<string | null>(null);

    const filteredCategories = CATEGORIES.map(cat => ({
        ...cat,
        questions: cat.questions.filter(q =>
            q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.a.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(cat => cat.questions.length > 0);

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
            <div className="text-center space-y-4 mb-12">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Help Center</h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Everything you need to know about using HostelGH. Search for specific questions or browse by category.
                </p>
                <div className="relative max-w-md mx-auto mt-8">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search for answers..."
                        className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid gap-12">
                {filteredCategories.map((category) => (
                    <section key={category.id} className="space-y-6">
                        <div className="flex items-center gap-3 border-b pb-4">
                            <category.icon className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-bold">{category.title}</h2>
                        </div>
                        <div className="grid gap-4">
                            {category.questions.map((item, idx) => {
                                const id = `${category.id}-${idx}`;
                                const isExpanded = expandedIndex === id;
                                return (
                                    <div
                                        key={idx}
                                        className="border rounded-2xl overflow-hidden bg-white hover:border-primary/30 transition-colors"
                                    >
                                        <button
                                            onClick={() => setExpandedIndex(isExpanded ? null : id)}
                                            className="w-full px-6 py-4 flex items-center justify-between text-left font-medium"
                                        >
                                            <span className="pr-4">{item.q}</span>
                                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                        </button>
                                        {isExpanded && (
                                            <div className="px-6 pb-4 text-muted-foreground animate-in slide-in-from-top-2 duration-300">
                                                {item.a}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                ))}

                {filteredCategories.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed">
                        <p className="text-muted-foreground">No matching questions found. Try a different search term.</p>
                    </div>
                )}
            </div>

            <div className="mt-20 p-8 rounded-3xl bg-black text-white text-center space-y-6">
                <h3 className="text-2xl md:text-3xl font-bold">Still have questions?</h3>
                <p className="opacity-80">Our support team is here to help you 24/7.</p>
                <button className="bg-white text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform">
                    Contact Support
                </button>
            </div>
        </div>
    );
}
