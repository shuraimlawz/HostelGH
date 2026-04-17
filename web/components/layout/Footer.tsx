import Link from "next/link";
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Globe, ShieldCheck, Zap, ArrowRight, Github, ExternalLink, MessageCircle, Send } from "lucide-react";
import LogoAnimation from "./LogoAnimation";
import { cn } from "@/lib/utils";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative bg-[#020617] pt-24 pb-12 overflow-hidden border-t border-white/5">
            {/* Premium Background Elements */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />
            
            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-24">
                    {/* Brand Meta Section */}
                    <div className="md:col-span-4 space-y-10">
                        <div className="space-y-6">
                            <Link href="/" className="flex items-center gap-3 group w-fit">
                                <div className="p-1 transition-transform duration-1000 group-hover:rotate-[360deg]">
                                    <LogoAnimation />
                                </div>
                                <span className="text-3xl font-black tracking-tighter text-white uppercase italic">Hostel<span className="text-blue-500">GH</span></span>
                            </Link>
                            <p className="text-zinc-400 text-sm leading-relaxed font-medium max-w-sm">
                                Elevating the student living experience across Ghana. Find, book, and secure your perfect home away from home with total peace of mind.
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            {[
                                { icon: Twitter, href: "#", color: "hover:bg-blue-400" },
                                { icon: Github, href: "#", color: "hover:bg-zinc-800" },
                                { icon: Instagram, href: "#", color: "hover:bg-pink-600" },
                                { icon: MessageCircle, href: "#", color: "hover:bg-green-500" }
                            ].map((social, idx) => (
                                <a 
                                    key={idx}
                                    href={social.href} 
                                    className={cn(
                                        "w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl border border-white/10 text-zinc-400 hover:text-white transition-all duration-500 backdrop-blur-sm group shadow-xl",
                                        social.color
                                    )}
                                >
                                    <social.icon size={20} className="transition-transform group-hover:scale-110 group-hover:rotate-12" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Access Grid */}
                    <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-12">
                        {/* Locations */}
                        <div className="space-y-8">
                            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-2 italic">
                                <MapPin size={14} className="text-blue-500" /> Explore Hubs
                            </h4>
                            <ul className="space-y-4">
                                {["Greater Accra", "Ashanti Region", "Central Region", "Western Region"].map((hub) => (
                                    <li key={hub}>
                                        <Link href={`/hostels?city=${hub}`} className="text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-3 group">
                                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-800 ring-4 ring-transparent group-hover:bg-blue-500 group-hover:ring-blue-500/20 transition-all" />
                                            {hub}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Partnership */}
                        <div className="space-y-8">
                            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-2 italic">
                                <ShieldCheck size={14} className="text-blue-500" /> Trust Hub
                            </h4>
                            <ul className="space-y-4">
                                {[
                                    { label: "Partner With Us", href: "/auth/register?role=OWNER" },
                                    { label: "Verification Guide", href: "/support/verification" },
                                    { label: "Privacy Policy", href: "/support/privacy" },
                                    { label: "Service Terms", href: "/support/terms" }
                                ].map((item) => (
                                    <li key={item.label}>
                                        <Link href={item.href} className="text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-all hover:translate-x-1 flex items-center gap-2">
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Direct Support */}
                        <div className="space-y-8">
                            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-2 italic">
                                <MessageCircle size={14} className="text-blue-500" /> Support Desk
                            </h4>
                            <div className="space-y-4">
                                <a href="mailto:hello@hostelgh.com" className="block p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-blue-500/50 transition-all group backdrop-blur-md">
                                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1 group-hover:text-blue-400 transition-colors">Email Support</p>
                                    <p className="text-xs font-bold text-zinc-200">hello@hostelgh.com</p>
                                </a>
                                <a href="tel:+233598494617" className="block p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-blue-500/50 transition-all group backdrop-blur-md">
                                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1 group-hover:text-blue-400 transition-colors">Emergency Hotline</p>
                                    <p className="text-xs font-bold text-zinc-200">+233 59 849 4617</p>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Sub-layer */}
                <div className="pt-12 border-t border-white/5 flex flex-col lg:flex-row justify-between items-center gap-10">
                    <div className="flex flex-col sm:flex-row items-center gap-8">
                        <div className="flex items-center gap-3 px-5 py-2.5 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Network Status: Operational</span>
                        </div>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] text-center sm:text-left">
                            © {currentYear} HostelGH. Precision Built by <span className="text-white">Minded Technologies</span>.
                        </p>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-1">Architecture</span>
                            <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">HostelGH-V1 System</span>
                        </div>
                        <div className="w-px h-10 bg-white/10 hidden sm:block" />
                        <Link href="/" className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-white hover:bg-blue-600 hover:border-blue-500 transition-all uppercase tracking-widest italic group">
                            Top <Send size={12} className="inline ml-2 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
