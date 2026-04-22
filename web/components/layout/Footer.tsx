"use client";
import Link from "next/link";
import {
    Facebook,
    Twitter,
    Instagram,
    Mail,
    Phone,
    MapPin,
    ShieldCheck,
    ArrowRight,
    Github,
    MessageCircle,
    Send,
    Linkedin,
    Youtube,
    ChevronUp
} from "lucide-react";
import LogoAnimation from "./LogoAnimation";
import { cn } from "@/lib/utils";

const socialLinks = [
    { icon: Twitter, href: "#", color: "hover:bg-sky-500", label: "Twitter" },
    { icon: Github, href: "#", color: "hover:bg-zinc-800", label: "GitHub" },
    { icon: Instagram, href: "#", color: "hover:bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600", label: "Instagram" },
    { icon: Linkedin, href: "#", color: "hover:bg-blue-700", label: "LinkedIn" },
];

const footerLinks = {
    discover: [
        { label: "Greater Accra", href: "/hostels?city=Greater%20Accra" },
        { label: "Ashanti Region", href: "/hostels?city=Ashanti" },
        { label: "Central Region", href: "/hostels?city=Central" },
        { label: "Western Region", href: "/hostels?city=Western" },
        { label: "All Listings", href: "/hostels" },
    ],
    partnership: [
        { label: "List Your Hostel", href: "/auth/register?role=OWNER" },
        { label: "Partner Program", href: "/partners" },
        { label: "Verification", href: "/support/verification" },
        { label: "Advertising", href: "/ads" },
    ],
    platform: [
        { label: "How it Works", href: "/how-it-works" },
        { label: "Safety Center", href: "/support/safety" },
        { label: "Support Desk", href: "/support" },
        { label: "System Status", href: "/status" },
    ],
    legal: [
        { label: "Privacy Policy", href: "/support/privacy" },
        { label: "Service Terms", href: "/support/terms" },
        { label: "Cookie Policy", href: "/support/cookies" },
        { label: "Payment Security", href: "/support/security" },
    ]
};

export default function Footer() {
    const currentYear = new Date().getFullYear();

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <footer className="relative bg-[#020617] pt-32 pb-12 overflow-hidden border-t border-white/[0.02]">
            {/* Visual Depth Elements */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-600/[0.03] to-transparent pointer-events-none" />
            <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-600/[0.08] blur-[150px] rounded-full animate-pulse pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-600/[0.05] blur-[120px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                {/* Newsletter Section */}
                <div className="relative mb-32 group">
                    <div className="absolute inset-0 bg-blue-600/20 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -z-10" />
                    <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-16 flex flex-col lg:flex-row items-center justify-between gap-12 shadow-2xl relative overflow-hidden">
                        {/* Decorative Gradient Line */}
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

                        <div className="max-w-xl text-center lg:text-left">
                            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-6 italic uppercase leading-none">
                                Join The <span className="text-blue-500 underline decoration-blue-500/20 underline-offset-8">Circle</span>
                            </h2>
                            <p className="text-zinc-400 text-base md:text-lg font-medium leading-relaxed">
                                Get exclusive student deals, hostel opening alerts, and curated living tips delivered to your inbox weekly.
                            </p>
                        </div>

                        <div className="w-full lg:max-w-md">
                            <form
                                className="relative group/form"
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    const form = e.currentTarget;
                                    const email = new FormData(form).get("email") as string;
                                    const btn = form.querySelector("button");
                                    if (btn) btn.disabled = true;
                                    try {
                                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://hostelgh.onrender.com"}/newsletter/subscribe`, {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ email })
                                        });
                                        if (res.ok) {
                                            alert("Successfully joined the circle!");
                                            form.reset();
                                        } else {
                                            alert("Failed to subscribe. Please try again.");
                                        }
                                    } catch (err) {
                                        alert("An error occurred. Please try again.");
                                    } finally {
                                        if (btn) btn.disabled = false;
                                    }
                                }}
                            >
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    placeholder="Enter your email address"
                                    className="w-full h-16 md:h-20 bg-white/[0.05] border border-white/10 rounded-2xl px-8 pr-16 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all font-medium text-lg"
                                />
                                <button type="submit" className="absolute right-3 top-3 bottom-3 aspect-square bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-500 active:scale-95 transition-all shadow-lg shadow-blue-600/20 group/btn disabled:opacity-50">
                                    <Send size={24} className="transition-transform group-hover/btn:-translate-y-1 group-hover/btn:translate-x-1" />
                                </button>
                            </form>
                            <p className="mt-4 text-[10px] text-zinc-500 uppercase tracking-widest text-center lg:text-left font-bold italic">
                                Zero Spam. Unsubscribe at any time.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 mb-24">
                    {/* Brand Meta Column */}
                    <div className="lg:col-span-4 space-y-12">
                        <div className="space-y-8">
                            <Link href="/" className="flex items-center gap-4 group w-fit">
                                <div className="p-1 transition-all duration-1000 group-hover:rotate-[360deg] group-hover:scale-110">
                                    <LogoAnimation />
                                </div>
                                <div className="flex flex-col -space-y-1">
                                    <span className="text-3xl font-black tracking-tighter text-white uppercase italic">Hostel<span className="text-blue-500">GH</span></span>
                                    <span className="text-[9px] font-black text-blue-500/50 tracking-[0.4em] uppercase">Premium Living</span>
                                </div>
                            </Link>
                            <p className="text-zinc-400 text-sm leading-relaxed font-medium max-w-sm">
                                Ghana&apos;s most sophisticated student accommodation marketplace. We combine high-end technology with local expertise to secure your perfect home away from home.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                            {socialLinks.map((social, idx) => (
                                <a
                                    key={idx}
                                    href={social.href}
                                    aria-label={social.label}
                                    className={cn(
                                        "w-12 h-12 flex items-center justify-center bg-white/[0.03] rounded-2xl border border-white/10 text-zinc-500 hover:text-white transition-all duration-500 backdrop-blur-sm group shadow-xl",
                                        social.color
                                    )}
                                >
                                    <social.icon size={20} className="transition-transform group-hover:scale-110 group-hover:rotate-12" />
                                </a>
                            ))}
                        </div>

                        <div className="pt-8 border-t border-white/5 space-y-4">
                            <div className="flex items-center gap-4 group cursor-pointer">
                                <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    <Mail size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">General Inquiries</p>
                                    <p className="text-sm font-bold text-zinc-200">hello@hostelgh.com</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 group cursor-pointer">
                                <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    <Phone size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">24/7 Hotline</p>
                                    <p className="text-sm font-bold text-zinc-200">+233 59 849 4617</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Links Grid */}
                    <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-10">
                        {/* Discover */}
                        <div className="space-y-10">
                            <h4 className="text-[11px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-2 italic">
                                <MapPin size={14} className="text-blue-500" /> Discover
                            </h4>
                            <ul className="space-y-5">
                                {footerLinks.discover.map((link) => (
                                    <li key={link.label}>
                                        <Link href={link.href} className="text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-3 group">
                                            <span className="w-1 h-1 rounded-full bg-zinc-800 group-hover:bg-blue-500 group-hover:scale-125 transition-all duration-300" />
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* For Owners */}
                        <div className="space-y-10">
                            <h4 className="text-[11px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-2 italic">
                                <ArrowRight size={14} className="text-blue-500" /> For Owners
                            </h4>
                            <ul className="space-y-5">
                                {footerLinks.partnership.map((link) => (
                                    <li key={link.label}>
                                        <Link href={link.href} className="text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-all hover:translate-x-2 duration-300 flex items-center gap-2">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Platform */}
                        <div className="space-y-10">
                            <h4 className="text-[11px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-2 italic">
                                <Send size={14} className="text-blue-500" /> Platform
                            </h4>
                            <ul className="space-y-5">
                                {footerLinks.platform.map((link) => (
                                    <li key={link.label}>
                                        <Link href={link.href} className="text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-all hover:translate-x-2 duration-300 flex items-center gap-2">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Legal */}
                        <div className="space-y-10">
                            <h4 className="text-[11px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-2 italic">
                                <ShieldCheck size={14} className="text-blue-500" /> Legal
                            </h4>
                            <ul className="space-y-5">
                                {footerLinks.legal.map((link) => (
                                    <li key={link.label}>
                                        <Link href={link.href} className="text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-all hover:translate-x-2 duration-300 flex items-center gap-2">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-12 border-t border-white/5 flex flex-col lg:flex-row justify-between items-center gap-10">
                    <div className="flex flex-col sm:flex-row items-center gap-8 text-center sm:text-left">
                        <div className="flex items-center gap-3 px-6 py-3 bg-white/[0.03] rounded-full border border-white/10 backdrop-blur-md">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.6)]" />
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Network Status: Active\</span>
                        </div>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] leading-loose">
                            © {currentYear} HostelGH. Precision Built by <span className="text-white">Minded Technologies</span> in <span className="text-blue-500 italic">Accra</span>.
                        </p>
                    </div>

                    <div className="flex items-center gap-10">
                        <div className="flex items-center gap-4">
                            <ShieldCheck size={16} className="text-emerald-500/50" />
                            <div className="flex flex-col items-end">
                                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-1">Security Standard</span>
                                <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">HostelGH-Safe V2</span>
                            </div>
                        </div>
                        <div className="w-px h-10 bg-white/10 hidden sm:block" />
                        <button
                            onClick={scrollToTop}
                            className="w-14 h-14 bg-white/[0.03] border border-white/10 rounded-2xl flex items-center justify-center text-white hover:bg-blue-600 hover:border-blue-500 transition-all active:scale-95 group shadow-xl"
                        >
                            <ChevronUp size={24} className="transition-transform group-hover:-translate-y-1" />
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
}

