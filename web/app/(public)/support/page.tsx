"use client";

import { useState } from "react";
import { Search, Book, CreditCard, Home, UserCheck, Shield, LifeBuoy } from "lucide-react";
import SupportCard from "@/components/support/SupportCard";
import { useRouter } from "next/navigation";

const TOPICS = [
    {
        title: "Booking Help",
        description: "How to book a room, cancel, and contact your hostel owner.",
        icon: Book,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        href: "/support/help-center"
    },
    {
        title: "Payments & Refunds",
        description: "MoMo, card payments, booking fees, and refund timelines.",
        icon: CreditCard,
        color: "text-green-600",
        bgColor: "bg-green-100",
        href: "/support/help-center"
    },
    {
        title: "List Your Hostel",
        description: "How to create a listing, add rooms, and get verified.",
        icon: Home,
        color: "text-purple-600",
        bgColor: "bg-purple-100",
        href: "/support/help-center"
    },
    {
        title: "Account & Verification",
        description: "Update your profile, change password, and verify your identity.",
        icon: UserCheck,
        color: "text-orange-600",
        bgColor: "bg-orange-100",
        href: "/support/help-center"
    },
    {
        title: "Safety & Reporting",
        description: "Spot scams, report fake listings, and stay safe.",
        icon: Shield,
        color: "text-red-600",
        bgColor: "bg-red-100",
        href: "/support/safety"
    },
    {
        title: "Technical Issues",
        description: "Page not loading, login problems, or payment errors.",
        icon: LifeBuoy,
        color: "text-muted-foreground",
        bgColor: "bg-muted",
        href: "/support/help-center"
    }
];

export default function SupportPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    const filtered = TOPICS.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-20 pb-10">
            {/* Hero */}
            <div className="space-y-8">
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground">
                        How can we help?
                    </h1>
                    <p className="text-base font-medium max-w-2xl text-muted-foreground leading-relaxed">
                        Find answers about bookings, payments, listings, and safety — built for students and hostel owners across Ghana.
                    </p>
                </div>

                {/* Search */}
                <div className="relative max-w-2xl group">
                    <div className="flex items-center bg-muted border-2 border-border rounded-3xl px-6 py-2 focus-within:border-primary focus-within:bg-card focus-within:shadow-2xl focus-within:shadow-primary/5 transition-all duration-300">
                        <Search className="text-muted-foreground w-6 h-6 shrink-0 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search e.g. refund, cancel booking, MoMo..."
                            className="w-full px-4 py-5 font-bold bg-transparent outline-none placeholder:text-muted-foreground text-foreground text-lg"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Topics */}
            <section className="space-y-8">
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground pl-1">
                    Popular Topics
                </h2>
                {filtered.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map((topic) => (
                            <SupportCard
                                key={topic.title}
                                {...topic}
                                onClick={() => router.push(topic.href)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="py-24 text-center space-y-4 bg-muted/30 rounded-[3rem] border-2 border-dashed border-border">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                            <Search size={32} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-foreground font-black text-lg">No results for "{searchQuery}"</p>
                            <p className="text-muted-foreground text-sm font-medium">Try searching for "booking", "payment", or "safety".</p>
                        </div>
                        <button 
                            onClick={() => setSearchQuery("")}
                            className="text-primary font-black text-sm uppercase tracking-widest hover:underline pt-2"
                        >
                            Clear Search
                        </button>
                    </div>
                )}
            </section>

            {/* CTA */}
            <div className="p-10 md:p-12 bg-foreground rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl">
                <div className="space-y-2 text-center md:text-left">
                    <h3 className="text-2xl md:text-3xl font-black text-background">Still need help?</h3>
                    <p className="text-background/60 font-bold text-base">Browse our full Help Center or contact our support team directly.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <button
                        onClick={() => router.push("/support/help-center")}
                        className="bg-background text-foreground px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all active:scale-95 shadow-lg shadow-black/10"
                    >
                        Help Center
                    </button>
                    <a
                        href="mailto:hello@hostelgh.com"
                        className="bg-primary text-primary-foreground px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all active:scale-95 text-center shadow-lg shadow-primary/20"
                    >
                        Email Us
                    </a>
                </div>
            </div>
        </div>
    );
}
