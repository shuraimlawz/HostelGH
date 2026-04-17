"use client";

import { useState } from "react";
import {
    BookOpen, CreditCard, User, ShieldCheck, Mail, MessageCircle,
    ChevronRight, ThumbsUp, ThumbsDown, Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import Accordion from "@/components/support/Accordion";

const HELP_CATEGORIES = [
    {
        id: "bookings",
        title: "Bookings",
        icon: BookOpen,
        articles: [
            {
                q: "How do I book a hostel?",
                a: "To book a hostel on HostelGH, follow these steps:\n1. Browse listings and use filters to find your ideal hostel.\n2. Click 'Book Now' on the room type you prefer.\n3. Enter your moving date and personal details.\n4. Complete the booking fee payment via Paystack.\n5. You'll receive a confirmation email with the owner's details."
            },
            {
                q: "Can I cancel a booking?",
                a: "Yes, you can cancel your booking from the 'My Bookings' section. \n\nImportant points:\n- Cancellations made within 24 hours of booking are eligible for a full refund of the booking fee.\n- After 24 hours, the booking fee is non-refundable as it secures your spot with the owner."
            },
            {
                q: "How do I contact the hostel owner?",
                a: "Once your booking is confirmed, the owner's contact details (Email and WhatsApp) will be visible in your booking receipt under 'My Bookings'."
            }
        ]
    },
    {
        id: "payments",
        title: "Payments & Refunds",
        icon: CreditCard,
        articles: [
            {
                q: "What payment methods are supported?",
                a: "We support locally optimized payments via Paystack:\n- Mobile Money (MTN, Vodafone, AirtelTigo)\n- Visa & Mastercard (Debit/Credit)\n- Bank Transfers"
            },
            {
                q: "When will I get my refund?",
                a: "Refunds typically take 5-10 business days to reflect in your account once approved by our finance team. You'll receive a notification when the process starts."
            }
        ]
    },
    {
        id: "safety",
        title: "Safety & Verification",
        icon: ShieldCheck,
        articles: [
            {
                q: "How are hostels verified?",
                a: "Our team physically visits or uses a trusted local agent network to verify every hostel before it receives the 'Verified' badge. We check amenity accuracy and ownership documentation."
            },
            {
                q: "What should I do if a listing is fake?",
                a: "Report it immediately using the 'Report an Issue' button on the hostel page or via the Safety Guidelines section in Support. We take these reports seriously and suspend suspicious owners within 1 hour of verification."
            }
        ]
    }
];

export default function HelpCenterPage() {
    const [activeCategory, setActiveCategory] = useState(HELP_CATEGORIES[0].id);

    return (
        <div className="max-w-[1200px] mx-auto px-4 py-12 space-y-16 pb-20 pt-4">
            {/* Page Header */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-[9px] font-bold uppercase tracking-widest border border-white/10">
                        Support Network
                    </span>
                    <div className="flex items-center gap-2">
                        <BookOpen size={14} className="text-blue-500" />
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Platform Documentation</span>
                    </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tighter uppercase leading-tight">
                    Help Center <span className="text-blue-600 opacity-40">/</span> Archive
                </h1>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest max-w-xl">
                    Detailed guides and tactical answers to help you get the most out of HostelGH.
                </p>
            </div>

            {/* Categories Grid (Desktop) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {HELP_CATEGORIES.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={cn(
                            "group flex flex-col items-start gap-4 p-8 rounded-2xl border-2 transition-all text-left",
                            activeCategory === cat.id
                                ? "border-blue-500 bg-blue-50/30 shadow-lg shadow-blue-500/5"
                                : "border-gray-100 bg-white hover:border-blue-200"
                        )}
                    >
                        <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                            activeCategory === cat.id ? "bg-blue-600 text-white" : "bg-gray-50 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600"
                        )}>
                            <cat.icon size={24} />
                        </div>
                        <span className={cn(
                            "font-bold text-[11px] uppercase tracking-[0.2em]",
                            activeCategory === cat.id ? "text-blue-600" : "text-gray-400"
                        )}>
                            {cat.title}
                        </span>
                    </button>
                ))}
            </div>

            {/* Article List Section */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="bg-white rounded-3xl border border-gray-100 p-8 md:p-12 shadow-sm">
                    <div className="flex items-center gap-3 mb-10 pb-6 border-b border-gray-50">
                        <Clock size={16} className="text-blue-600" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                            Knowledge Base Activation
                        </span>
                    </div>

                    <Accordion
                        items={HELP_CATEGORIES.find(c => c.id === activeCategory)?.articles || []}
                    />

                    {/* Feedback UI */}
                    <div className="mt-12 pt-8 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Signal usefulness of this protocol?</span>
                        <div className="flex gap-4">
                            <button className="flex items-center gap-3 px-8 py-3 rounded-xl border border-gray-100 hover:border-blue-500 hover:text-blue-600 transition-all font-bold text-[10px] uppercase tracking-widest shadow-sm active:scale-95">
                                <ThumbsUp size={16} /> Affirmative
                            </button>
                            <button className="flex items-center gap-3 px-8 py-3 rounded-xl border border-gray-100 hover:border-red-500 hover:text-red-600 transition-all font-bold text-[10px] uppercase tracking-widest shadow-sm active:scale-95">
                                <ThumbsDown size={16} /> Negative
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Support Card */}
            <div className="grid md:grid-cols-2 gap-8">
                <div className="p-10 rounded-3xl bg-gray-900 border border-white/5 space-y-6 group hover:border-blue-500/20 transition-all shadow-xl">
                    <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-blue-500 shadow-xl group-hover:scale-110 transition-transform">
                        <Mail size={28} />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-white uppercase tracking-tight">Email Command</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                            Drop us a signal and our operators will respond within 2-4 cycles.
                        </p>
                    </div>
                    <p className="text-sm font-bold text-blue-400 uppercase tracking-widest">hello@hostelgh.com</p>
                </div>

                <div className="p-10 rounded-3xl bg-gray-950 border border-white/5 space-y-6 group hover:border-emerald-500/20 transition-all shadow-xl">
                    <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-emerald-500 shadow-xl group-hover:scale-110 transition-transform">
                        <MessageCircle size={28} />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-white uppercase tracking-tight">Direct Linkage</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                            Operational status: Available 9 AM - 9 PM GMT.
                        </p>
                    </div>
                    <p className="text-sm font-bold text-emerald-400 uppercase tracking-widest">+233 59 849 4617</p>
                </div>
            </div>
        </div>
    );
}
