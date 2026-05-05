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
                <div className="grid gap-12 lg:grid-cols-[2fr_1fr] mb-14">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white w-fit">
                            <LogoAnimation />
                            <span className="uppercase tracking-[0.25em]">HostelGH</span>
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-400/90 mb-3">
                                Engineered for modern hostel living
                            </p>
                            <h2 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight">
                                Powerful and reliable.
                                <span className="block text-blue-500">Full hostel automation you can afford.</span>
                            </h2>
                            <p className="mt-4 text-zinc-400 text-sm leading-7 max-w-lg">
                                A complete platform for students and hostel owners, designed with trusted workflows, secure payments, and a sleek digital experience that keeps every booking seamless.
                            </p>
                        </div>

                        {/* Trust badges */}
                        <div className="flex flex-wrap gap-3">
                            {TRUST_BADGES.map(({ icon: Icon, label }) => (
                                <div key={label} className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-300">
                                    <Icon size={12} className="text-blue-400" />
                                    {label}
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <a
                                href={WHATSAPP_CHANNEL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex h-9 items-center gap-2 rounded-2xl border border-blue-500/20 bg-white/5 px-4 text-sm font-semibold text-blue-100 transition hover:border-blue-400/40 hover:bg-blue-500/10"
                            >
                                <MessageCircle size={15} className="text-blue-400" />
                                Join WhatsApp Channel
                            </a>
                            <a
                                href="/support"
                                className="inline-flex h-9 items-center gap-2 rounded-2xl bg-blue-500 px-4 text-sm font-semibold text-white transition hover:bg-blue-400"
                            >
                                <ArrowRight size={15} />
                                Get Support
                            </a>
                        </div>
                    </div>

                    {/* Newsletter card */}
                    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-blue-900/15 backdrop-blur-2xl self-start">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500 text-white shadow-[0_8px_20px_-10px_rgba(59,130,246,0.9)]">
                                <Send size={16} />
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-[0.3em] text-blue-300/80">Stay Informed</p>
                                <p className="font-black text-white text-lg leading-tight">Subscribe to updates</p>
                            </div>
                        </div>
                        <p className="text-xs text-zinc-400 mb-4 leading-relaxed">Get new listings, price drops, and student housing tips straight to your inbox.</p>
                        <form className="space-y-3" onSubmit={handleSubscribe}>
                            <label className="block text-sm font-semibold text-zinc-300" htmlFor="footer-email">
                                Your email address
                            </label>
                            <div className="relative rounded-2xl border border-white/10 bg-[#0c1321] px-4 py-3 focus-within:border-blue-500/70 transition-colors">
                                <input
                                    id="footer-email"
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="e.g. student@ug.edu.gh"
                                    className="w-full border-none bg-transparent pr-10 text-sm text-white outline-none placeholder:text-zinc-500"
                                />
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500 text-white transition hover:bg-blue-400 disabled:opacity-60"
                                >
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                            <p className="text-[11px] leading-5 text-zinc-500">
                                No spam. Unsubscribe anytime.
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
