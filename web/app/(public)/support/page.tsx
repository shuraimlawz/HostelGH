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
        <div className="space-y-16">
            {/* Hero */}
            <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
                    How can we help?
                </h1>
                <p className="text-sm font-medium max-w-2xl text-muted-foreground">
                    Find answers about bookings, payments, listings, and safety — built for students and hostel owners across Ghana.
                </p>

                {/* Search */}
                <div className="relative max-w-xl">
                    <div className="flex items-center bg-muted border-2 border-border rounded-2xl px-5 py-1 focus-within:border-primary transition-all">
                        <Search className="text-muted-foreground w-5 h-5 shrink-0" />
                        <input
                            type="text"
                            placeholder="Search e.g. refund, cancel booking, MoMo..."
                            className="w-full px-4 py-4 font-medium bg-transparent outline-none placeholder:text-muted-foreground text-foreground"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Topics */}
            <section className="space-y-6">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
                    Popular Topics
                </h2>
                {filtered.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filtered.map((topic) => (
                            <SupportCard
                                key={topic.title}
                                {...topic}
                                onClick={() => router.push(topic.href)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="py-16 text-center space-y-2">
                        <p className="text-muted-foreground font-bold text-sm uppercase tracking-widest">No results for "{searchQuery}"</p>
                        <p className="text-muted-foreground text-xs">Try "booking", "payment", or "cancel"</p>
                    </div>
                )}
            </section>

            {/* CTA */}
            <div className="p-8 bg-foreground rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-1 text-center md:text-left">
                    <h3 className="text-xl font-black text-background">Still need help?</h3>
                    <p className="text-background/60 font-medium text-sm">Browse our full Help Center or contact us directly.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={() => router.push("/support/help-center")}
                        className="bg-background text-foreground px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all active:scale-95"
                    >
                        Help Center
                    </button>
                    <a
                        href="mailto:hello@hostelgh.com"
                        className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all active:scale-95 text-center"
                    >
                        Email Us
                    </a>
                </div>
            </div>
        </div>
    );
}
