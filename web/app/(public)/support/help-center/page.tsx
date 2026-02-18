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
        <div className="space-y-16">
            {/* Page Header */}
            <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
                    Help Center
                </h1>
                <p className="text-gray-500 text-lg font-medium">
                    Detailed guides and answers to help you get the most out of HostelGH.
                </p>
            </div>

            {/* Categories Grid (Desktop) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {HELP_CATEGORIES.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={cn(
                            "flex items-center gap-4 p-6 rounded-2xl border-2 transition-all text-left",
                            activeCategory === cat.id
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-50 bg-white hover:border-gray-200"
                        )}
                    >
                        <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center",
                            activeCategory === cat.id ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"
                        )}>
                            <cat.icon size={20} />
                        </div>
                        <span className={cn(
                            "font-black text-sm uppercase tracking-widest",
                            activeCategory === cat.id ? "text-blue-600" : "text-gray-500"
                        )}>
                            {cat.title}
                        </span>
                    </button>
                ))}
            </div>

            {/* Article List Section */}
            <section className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="bg-white rounded-[2.5rem] border-2 border-gray-50 p-8 md:p-12 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                        <Clock size={16} className="text-blue-600" />
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">
                            Frequently Asked Questions
                        </span>
                    </div>

                    <Accordion
                        items={HELP_CATEGORIES.find(c => c.id === activeCategory)?.articles || []}
                    />

                    {/* Feedback UI */}
                    <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <span className="text-sm font-bold text-gray-500 italic">Was this information helpful?</span>
                        <div className="flex gap-4">
                            <button className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-gray-100 hover:border-green-500 hover:text-green-600 transition-all font-bold text-sm">
                                <ThumbsUp size={16} /> Yes
                            </button>
                            <button className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-gray-100 hover:border-red-500 hover:text-red-600 transition-all font-bold text-sm">
                                <ThumbsDown size={16} /> No
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Support Card - NOT FOOTER */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="p-8 rounded-[2.5rem] bg-gray-50 border border-gray-100 space-y-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                        <Mail size={24} />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-xl font-black text-gray-900">Email Support</h3>
                        <p className="text-sm text-gray-500 font-medium leading-relaxed">
                            Drop us a message and we'll get back to you within 2-4 hours.
                        </p>
                    </div>
                    <p className="font-bold text-blue-600">hello@hostelgh.com</p>
                </div>

                <div className="p-8 rounded-[2.5rem] bg-gray-50 border border-gray-100 space-y-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-green-600 shadow-sm">
                        <MessageCircle size={24} />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-xl font-black text-gray-900">WhatsApp Support</h3>
                        <p className="text-sm text-gray-500 font-medium leading-relaxed">
                            Fastest for booking and verification help. Active 9 AM - 9 PM.
                        </p>
                    </div>
                    <p className="font-bold text-green-600">+233 59 849 4617</p>
                </div>
            </div>
        </div>
    );
}
