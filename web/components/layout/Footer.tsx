"use client";
import Link from "next/link";
import { ArrowRight, MessageCircle, Send, GraduationCap, Building2, Shield, Star } from "lucide-react";
import LogoAnimation from "./LogoAnimation";
import { useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

const QUICK_LINKS = [
    { label: "All Listings", href: "/hostels" },
    { label: "How it Works", href: "/how-it-works" },
    { label: "List Your Hostel", href: "/auth/register?role=OWNER" },
    { label: "Support Desk", href: "/support" },
];

const SCHOOLS = [
    { label: "Near KNUST", href: "/schools/knust" },
    { label: "Near UG Legon", href: "/schools/ug" },
    { label: "Near UCC", href: "/schools/ucc" },
    { label: "Near GCTU", href: "/schools/gctu" },
    { label: "Near UPSA", href: "/schools/upsa" },
    { label: "Near GIMPA", href: "/schools/gimpa" },
];

const LEGAL = [
    { label: "Privacy Policy", href: "/support/privacy" },
    { label: "Terms of Service", href: "/support/terms" },
    { label: "Safety Guidelines", href: "/support/safety" },
];

const TRUST_BADGES = [
    { icon: Shield, label: "Secure Payments" },
    { icon: GraduationCap, label: "Student-Verified" },
    { icon: Star, label: "Top-Rated Hostels" },
    { icon: Building2, label: "Verified Listings" },
];

const WHATSAPP_CHANNEL = "https://whatsapp.com/channel/0029Vb7lvGb8kyyFC81FOs1B";

export default function Footer() {
    const currentYear = new Date().getFullYear();
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;
        setIsSubmitting(true);
        try {
            await api.post("/newsletter/subscribe", { email });
            toast.success("You're subscribed! 🎉");
            setEmail("");
        } catch {
            toast.error("Subscription failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <footer className="relative overflow-hidden bg-[#020617] text-white border-t border-white/10">
            {/* Background glows */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.15),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(96,165,250,0.12),_transparent_30%)]" />

            <div className="relative container mx-auto px-6 pt-16 pb-10">

                {/* Top: Brand + tagline + CTA */}
                <div className="grid gap-10 lg:grid-cols-2 mb-16">
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-white">
                            <LogoAnimation />
                            <span className="font-bold tracking-tight text-xl uppercase">HostelGH</span>
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold tracking-tight">
                                Simple hostel booking.
                                <span className="block text-blue-500">Fast and reliable.</span>
                            </h2>
                            <p className="text-zinc-400 text-sm leading-6 max-w-md">
                                Find and book verified hostels with ease. We make student housing simple for everyone.
                            </p>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 pt-2">
                            <a
                                href={WHATSAPP_CHANNEL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex h-10 items-center gap-2 rounded-xl bg-white/5 px-5 text-sm font-medium hover:bg-white/10 transition"
                            >
                                <MessageCircle size={16} />
                                Join WhatsApp
                            </a>
                            <a
                                href="/support"
                                className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-medium hover:bg-blue-500 transition shadow-lg shadow-blue-600/20"
                            >
                                Get Help
                            </a>
                        </div>
                    </div>

                    {/* Newsletter card */}
                    <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 self-start">
                        <div className="space-y-2 mb-6">
                            <p className="text-xs font-bold uppercase tracking-widest text-blue-400">Get Updates</p>
                            <h3 className="text-xl font-bold">Join our newsletter</h3>
                            <p className="text-sm text-zinc-400">Stay updated with new listings and student housing tips.</p>
                        </div>
                        
                        <form className="space-y-4" onSubmit={handleSubscribe}>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider" htmlFor="footer-email">
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <input
                                        id="footer-email"
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="e.g. student@ug.edu.gh"
                                        className="w-full h-12 rounded-xl border border-white/10 bg-black/20 px-4 text-sm outline-none focus:border-blue-500 transition"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="absolute right-1.5 top-1.5 h-9 w-9 flex items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition disabled:opacity-50"
                                    >
                                        <ArrowRight size={18} />
                                    </button>
                                </div>
                            </div>
                            <p className="text-[10px] text-zinc-500">
                                No spam. Just helpful updates.
                            </p>
                        </form>
                    </div>
                </div>

                {/* Middle: Navigation columns */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 mb-12 border-t border-white/8 pt-12">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-400/70 mb-4">Quick Links</p>
                        <ul className="space-y-3">
                            {QUICK_LINKS.map(link => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-zinc-400 hover:text-white transition-colors font-medium"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-400/70 mb-4">Browse by School</p>
                        <ul className="space-y-3">
                            {SCHOOLS.map(link => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-zinc-400 hover:text-white transition-colors font-medium"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-400/70 mb-4">Legal</p>
                        <ul className="space-y-3">
                            {LEGAL.map(link => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-zinc-400 hover:text-white transition-colors font-medium"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-white/8 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-zinc-500">
                    <div className="flex items-center gap-3 flex-wrap">
                        <span>© {currentYear} HostelGH. All Rights Reserved.</span>
                        <span className="hidden sm:inline">·</span>
                        <span>Made by <span className="text-zinc-400 font-semibold">Minded Technologies</span></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-emerald-400 font-medium">All systems operational</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
