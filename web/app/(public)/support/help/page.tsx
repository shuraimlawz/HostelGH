"use client";

import { useState } from "react";
import { Search, ChevronDown, ChevronUp, BookOpen, CreditCard, User, ShieldCheck, Mail, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
    {
        id: "booking",
        title: "Bookings",
        description: "How to find, book, and manage your hostel stays.",
        icon: BookOpen,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        questions: [
            { q: "How do I book a hostel?", a: "To book a hostel, simply browse the listings, select a room type, and click 'Book Now'. Follow the prompts to provide your details and proceed to payment." },
            { q: "Can I cancel my booking?", a: "Cancellation policies vary by hostel. Please check the specific hostel's terms before booking. Generally, cancellations made 48 hours before check-in are eligible for a partial refund." },
            { q: "How do I check my booking status?", a: "Log in to your account and navigate to 'My Bookings' from the user menu. You can see the current status of all your pending and confirmed bookings there." },
        ]
    },
    {
        id: "payments",
        title: "Payments",
        description: "Billing, refunds, and accepted payment methods.",
        icon: CreditCard,
        color: "text-green-600",
        bgColor: "bg-green-50",
        questions: [
            { q: "What payment methods are accepted?", a: "We currently accept all major credit/debit cards and mobile money via Paystack." },
            { q: "Is my payment information secure?", a: "Yes, all payments are processed through encrypted channels. We do not store your full card details on our servers." },
            { q: "When will I get my refund?", a: "Refunds typically take 5-10 business days to reflect in your account, depending on your bank or mobile money provider." },
        ]
    },
    {
        id: "account",
        title: "Account",
        description: "Managing your profile and security settings.",
        icon: User,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
        questions: [
            { q: "How do I change my password?", a: "Go to your Profile settings and select 'Update Password'. You will need to verify your current password first." },
            { q: "What is the difference between Tenant and Owner roles?", a: "Tenants can browse and book hostels, while Owners can list hostels, manage rooms, and handle bookings." },
        ]
    },
    {
        id: "safety",
        title: "Safety",
        description: "Trust, verification, and community guidelines.",
        icon: ShieldCheck,
        color: "text-red-600",
        bgColor: "bg-red-50",
        questions: [
            { q: "How are hostels verified?", a: "Our team manually verifies every hostel listing to ensure the photos and details match the actual location." },
            { q: "What should I do if I have a problem during my stay?", a: "Contact the hostel owner first. If the issue remains unresolved, you can reach out to our support team via the 'Report' button." },
        ]
    }
];

const POPULAR_ARTICLES = [
    { title: "Booking a hostel for the first time", href: "#booking" },
    { title: "Accepted payment methods in Ghana", href: "#payments" },
    { title: "How to report a fraudulent listing", href: "#safety" },
    { title: "Refund policy for cancellations", href: "#payments" },
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
        <div className="max-w-6xl mx-auto px-6 py-16">
            {/* Modern Hero Section */}
            <div className="text-center space-y-6 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h1 className="text-5xl md:text-6xl font-black tracking-tight text-gray-900">
                    We're here to <span className="text-blue-600">help.</span>
                </h1>
                <p className="text-gray-500 text-xl max-w-2xl mx-auto font-medium">
                    Search our knowledge base or browse categories below to find answers to your questions.
                </p>
                <div className="relative max-w-2xl mx-auto mt-10 group">
                    <div className="absolute inset-0 bg-blue-100 rounded-[2rem] blur-xl opacity-0 group-focus-within:opacity-50 transition-opacity" />
                    <div className="relative flex items-center bg-white border-2 border-gray-100 rounded-[2rem] px-6 py-1 shadow-sm focus-within:border-blue-500 focus-within:shadow-md transition-all">
                        <Search className="text-gray-400 w-6 h-6" />
                        <input
                            type="text"
                            placeholder="How can we help you today?"
                            className="w-full px-4 py-4 text-lg font-medium bg-transparent outline-none placeholder:text-gray-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Popular Articles List - NEW SECTION */}
            {!searchQuery && (
                <div className="mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6 text-center">Popular Support Articles</h3>
                    <div className="flex flex-wrap justify-center gap-3">
                        {POPULAR_ARTICLES.map((article, i) => (
                            <button
                                key={i}
                                onClick={() => {
                                    const element = document.querySelector(article.href);
                                    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }}
                                className="px-5 py-2.5 bg-gray-50 hover:bg-white hover:text-blue-600 border-2 border-transparent hover:border-blue-100 rounded-full text-sm font-bold text-gray-600 transition-all shadow-sm hover:shadow-md active:scale-95"
                            >
                                {article.title}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Category Grid - Improved for Mobile */}
            {!searchQuery && (
                <div className="relative mb-24 animate-in fade-in zoom-in-95 duration-700 delay-200">
                    {/* Shadow indicators for mobile scroll */}
                    <div className="md:hidden absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
                    <div className="md:hidden absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

                    <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto no-scrollbar px-2 pb-4 snap-x snap-mandatory">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    const element = document.getElementById(cat.id);
                                    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }}
                                className="min-w-[280px] md:min-w-0 p-8 rounded-[2rem] bg-gray-50 border-2 border-transparent hover:border-blue-100 hover:bg-white hover:shadow-xl transition-all text-left group snap-start"
                            >
                                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110", cat.bgColor, cat.color)}>
                                    <cat.icon size={28} />
                                </div>
                                <h3 className="text-lg font-black text-gray-900 mb-2">{cat.title}</h3>
                                <p className="text-sm text-gray-500 font-medium leading-relaxed">{cat.description}</p>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Questions Section */}
            <div className="space-y-24">
                {filteredCategories.map((category) => (
                    <section key={category.id} id={category.id} className="scroll-mt-32 space-y-10">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-gray-100 pb-8">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-black text-gray-900">{category.title}</h2>
                                <p className="text-gray-500 font-medium">{category.description}</p>
                            </div>
                            <div className={cn("px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest", category.bgColor, category.color)}>
                                {category.questions.length} Articles
                            </div>
                        </div>
                        <div className="grid gap-4">
                            {category.questions.map((item, idx) => {
                                const id = `${category.id}-${idx}`;
                                const isExpanded = expandedIndex === id;
                                return (
                                    <div
                                        key={idx}
                                        className={cn(
                                            "rounded-3xl border-2 transition-all duration-300",
                                            isExpanded
                                                ? "border-blue-500 bg-blue-50/30"
                                                : "border-gray-50 bg-white hover:border-gray-200"
                                        )}
                                    >
                                        <button
                                            onClick={() => setExpandedIndex(isExpanded ? null : id)}
                                            className="w-full px-8 py-6 flex items-center justify-between text-left"
                                        >
                                            <span className="text-lg font-bold text-gray-900 pr-6">{item.q}</span>
                                            <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                                                isExpanded ? "bg-blue-600 text-white rotate-180" : "bg-gray-100 text-gray-400"
                                            )}>
                                                <ChevronDown size={20} />
                                            </div>
                                        </button>
                                        <div className={cn(
                                            "grid transition-all duration-300 ease-in-out",
                                            isExpanded ? "grid-rows-[1fr] opacity-100 pb-8" : "grid-rows-[0fr] opacity-0"
                                        )}>
                                            <div className="overflow-hidden px-8">
                                                <div className="bg-white p-6 rounded-2xl border border-blue-100 text-gray-600 text-lg leading-relaxed shadow-sm">
                                                    {item.a}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                ))}

                {filteredCategories.length === 0 && (
                    <div className="text-center py-32 bg-gray-50 rounded-[3rem] border-4 border-dashed border-gray-100">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <Search size={32} className="text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No results found</h3>
                        <p className="text-gray-500 font-medium">Try searching for something else like "bookings" or "momo".</p>
                    </div>
                )}
            </div>

            {/* Modern CTA */}
            <div className="mt-32 relative group overflow-hidden rounded-[3rem]">
                <div className="absolute inset-0 bg-blue-600" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400 rounded-full -ml-48 -mb-48 blur-3xl opacity-50" />

                <div className="relative px-8 py-16 text-center space-y-8 max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-black uppercase tracking-widest">
                        <MessageSquare size={14} />
                        Support 24/7
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
                        Can't find what you're looking for?
                    </h2>
                    <p className="text-blue-100 text-lg font-medium">
                        Our dedicated support team is ready to assist you with any questions or concerns you might have.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <a
                            href="mailto:support@hostelgh.com"
                            className="w-full sm:w-auto px-10 py-4 bg-white text-blue-600 rounded-2xl font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2"
                        >
                            <Mail size={20} />
                            Contact Support
                        </a>
                        <button className="w-full sm:w-auto px-10 py-4 bg-blue-700 text-white rounded-2xl font-black text-lg hover:bg-blue-800 transition-all flex items-center justify-center gap-2">
                            Chat with us
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
