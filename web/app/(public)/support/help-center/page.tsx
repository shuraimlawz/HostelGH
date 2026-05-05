"use client";

import { useState } from "react";
import {
    BookOpen, CreditCard, ShieldCheck, Mail, MessageCircle,
    ThumbsUp, ThumbsDown, Clock, Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import Accordion from "@/components/support/Accordion";
import { toast } from "sonner";

const HELP_CATEGORIES = [
    {
        id: "bookings",
        title: "Bookings",
        icon: BookOpen,
        articles: [
            {
                q: "How do I book a hostel?",
                a: "Browse listings and filter by city, university, price, or gender. Click 'Book Now' on the room you want. Fill in your move-in date and details, then pay the booking fee via Paystack. You'll get a confirmation email with the owner's WhatsApp contact."
            },
            {
                q: "Can I cancel a booking?",
                a: "Yes. Go to 'My Bookings' and click 'Cancel'. Cancellations within 24 hours of booking may qualify for a refund of the booking fee. After 24 hours, the booking fee is non-refundable — it holds your room with the owner."
            },
            {
                q: "How do I contact the hostel owner?",
                a: "Once your booking is confirmed, the owner's WhatsApp and phone number appear in your booking receipt under 'My Bookings'. You can also message them directly through the platform."
            },
            {
                q: "What is a booking fee?",
                a: "The booking fee (GHS 5) is a small platform fee paid to HostelGH to reserve your spot. It is separate from the room rent, which you pay directly to the hostel owner on move-in day."
            }
        ]
    },
    {
        id: "payments",
        title: "Payments & Refunds",
        icon: CreditCard,
        articles: [
            {
                q: "What payment methods does HostelGH support?",
                a: "We use Paystack for all transactions. Accepted methods include:\n• MTN Mobile Money\n• Vodafone Cash\n• AirtelTigo Money\n• Visa & Mastercard (debit or credit)\n• Bank transfers"
            },
            {
                q: "When will I receive my refund?",
                a: "Approved refunds take 5–10 business days to reflect in your account. You'll receive an email notification once the process starts. Contact us at hello@hostelgh.com if it takes longer."
            },
            {
                q: "Is it safe to pay on HostelGH?",
                a: "Yes. All payments go through Paystack, a PCI-DSS certified payment processor used by major businesses across Africa. We never store your card number or MoMo PIN."
            },
            {
                q: "Why was my payment declined?",
                a: "Common reasons include: insufficient funds, incorrect card details, network timeouts, or your bank blocking the transaction. Try a different payment method or contact your bank. You can also retry from 'My Bookings'."
            }
        ]
    },
    {
        id: "safety",
        title: "Safety & Verification",
        icon: ShieldCheck,
        articles: [
            {
                q: "How does HostelGH verify hostels?",
                a: "Our team checks every listing before it gets the blue 'Verified' badge. We confirm the hostel exists, photos match the actual property, and the owner has proof of ownership or management rights."
            },
            {
                q: "What should I do if a listing is fake?",
                a: "Report it immediately using the 'Report an Issue' form in the Safety section, or click 'Report Listing' on the hostel page. We investigate within 1 hour and suspend suspicious owners immediately."
            },
            {
                q: "Should I pay an owner directly outside HostelGH?",
                a: "Never pay booking fees outside HostelGH. If an owner asks you to send money to a personal MoMo or bank account before move-in, it is a red flag — report it."
            },
            {
                q: "How do I verify my account?",
                a: "Go to your profile and click 'Get Verified'. Upload a valid Ghana Card or student ID. Verified accounts get priority in booking and can leave reviews. Verification usually takes 24–48 hours."
            }
        ]
    }
];

export default function HelpCenterPage() {
    const [activeCategory, setActiveCategory] = useState(HELP_CATEGORIES[0].id);
    const [feedback, setFeedback] = useState<"helpful" | "not-helpful" | null>(null);

    const handleFeedback = (type: "helpful" | "not-helpful") => {
        setFeedback(type);
        if (type === "helpful") {
            toast.success("Thanks! Glad this helped.");
        } else {
            toast("We'll improve this article. Email hello@hostelgh.com for faster help.", { icon: "💬" });
        }
    };

    return (
        <div className="space-y-16 pb-20">
            {/* Header */}
            <div className="space-y-4">
                <span className="px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-[9px] font-black uppercase tracking-widest">
                    Help Center
                </span>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
                    How can we help?
                </h1>
                <p className="text-muted-foreground text-sm font-medium max-w-xl">
                    Find answers to the most common questions about booking, payments, safety, and your account.
                </p>
            </div>

            {/* Category Tabs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {HELP_CATEGORIES.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => { setActiveCategory(cat.id); setFeedback(null); }}
                        className={cn(
                            "group flex flex-col items-start gap-4 p-8 rounded-3xl border-2 transition-all text-left active:scale-[0.98]",
                            activeCategory === cat.id
                                ? "border-primary bg-primary/5 shadow-md"
                                : "border-border bg-card hover:border-primary/30"
                        )}
                    >
                        <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                            activeCategory === cat.id
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                        )}>
                            <cat.icon size={22} />
                        </div>
                        <span className={cn(
                            "font-black text-[10px] uppercase tracking-widest",
                            activeCategory === cat.id ? "text-primary" : "text-muted-foreground"
                        )}>
                            {cat.title}
                        </span>
                    </button>
                ))}
            </div>

            {/* Article Section */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-card rounded-[2.5rem] border-2 border-border p-8 md:p-12 shadow-sm">
                    <div className="flex items-center gap-3 mb-10 pb-6 border-b border-border">
                        <Clock size={16} className="text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                            {HELP_CATEGORIES.find(c => c.id === activeCategory)?.title} Articles
                        </span>
                    </div>

                    <Accordion items={HELP_CATEGORIES.find(c => c.id === activeCategory)?.articles || []} />

                    {/* Feedback */}
                    <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-6">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                            Was this helpful?
                        </span>
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleFeedback("helpful")}
                                disabled={feedback !== null}
                                className={cn(
                                    "flex items-center gap-2 px-6 py-3 rounded-xl border-2 transition-all font-bold text-[10px] uppercase tracking-widest active:scale-95 disabled:opacity-60",
                                    feedback === "helpful"
                                        ? "border-green-500 bg-green-500/10 text-green-600"
                                        : "border-border hover:border-green-500 hover:text-green-600 text-muted-foreground bg-muted/50"
                                )}
                            >
                                {feedback === "helpful" ? <Check size={14} /> : <ThumbsUp size={14} />}
                                Yes, helpful
                            </button>
                            <button
                                onClick={() => handleFeedback("not-helpful")}
                                disabled={feedback !== null}
                                className={cn(
                                    "flex items-center gap-2 px-6 py-3 rounded-xl border-2 transition-all font-bold text-[10px] uppercase tracking-widest active:scale-95 disabled:opacity-60",
                                    feedback === "not-helpful"
                                        ? "border-orange-400 bg-orange-500/10 text-orange-600"
                                        : "border-border hover:border-destructive hover:text-destructive text-muted-foreground bg-muted/50"
                                )}
                            >
                                {feedback === "not-helpful" ? <Check size={14} /> : <ThumbsDown size={14} />}
                                Not really
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Cards */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="p-10 rounded-[2.5rem] bg-foreground text-background space-y-6 hover:scale-[1.02] transition-all duration-300">
                    <div className="w-14 h-14 bg-background/10 rounded-2xl flex items-center justify-center text-primary">
                        <Mail size={28} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black">Email Us</h3>
                        <p className="text-sm font-medium opacity-60 mt-1">We reply within 24 hours on business days.</p>
                    </div>
                    <a href="mailto:hello@hostelgh.com" className="inline-block text-base font-black text-primary hover:underline">hello@hostelgh.com</a>
                </div>

                <div className="p-10 rounded-[2.5rem] bg-foreground text-background space-y-6 hover:scale-[1.02] transition-all duration-300">
                    <div className="w-14 h-14 bg-background/10 rounded-2xl flex items-center justify-center text-green-400">
                        <MessageCircle size={28} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black">WhatsApp</h3>
                        <p className="text-sm font-medium opacity-60 mt-1">Available Mon – Sat, 9 AM – 9 PM GMT.</p>
                    </div>
                    <a href="https://wa.me/233598494617" target="_blank" rel="noopener noreferrer" className="inline-block text-base font-black text-green-400 hover:underline">+233 59 849 4617</a>
                </div>
            </div>
        </div>
    );
}
