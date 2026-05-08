"use client";
import Link from "next/link";
import { ArrowRight, MessageCircle, Send, GraduationCap, Building2, Shield, Star } from "lucide-react";
import LogoAnimation from "./LogoAnimation";
import { useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

const QUICK_LINKS = [
    { label: "All Listings", href: "/hostels" },
    { label: "About Us", href: "/about" },
    { label: "How it Works", href: "/how-it-works" },
    { label: "List Your Hostel", href: "/auth/register?role=OWNER" },
    { label: "Contact & Support", href: "/support" },
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
    { label: "Cookie Policy", href: "/support/cookies" },
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
                <div className="border-t border-white/8 pt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 text-xs text-zinc-500">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 flex-wrap">
                        <span>© {currentYear} HostelGH. All Rights Reserved.</span>
                        <span className="hidden sm:inline text-white/20">·</span>
                        <a href="mailto:support@hostelgh.com" className="hover:text-white transition-colors">support@hostelgh.com</a>
                        <span className="hidden sm:inline text-white/20">·</span>
                        <span>Made by <span className="text-zinc-400 font-semibold">Minded Technologies</span></span>
                    </div>
                    
                    <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                        {/* Social Links */}
                        <div className="flex items-center gap-4">
                            <a href="https://twitter.com/hostelgh" target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white transition-colors" aria-label="Twitter">
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                            </a>
                            <a href="https://instagram.com/hostelgh" target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white transition-colors" aria-label="Instagram">
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                            </a>
                        </div>
                        
                        <div className="flex items-center gap-1.5 shrink-0">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-emerald-400 font-medium tracking-wide">All systems operational</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
