import Link from "next/link";
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Globe, ShieldCheck, Zap, ArrowRight, Github, ExternalLink } from "lucide-react";
import LogoAnimation from "./LogoAnimation";
import { cn } from "@/lib/utils";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-zinc-950 border-t border-white/5 relative overflow-hidden pt-24 pb-12 selection:bg-blue-500/30">
            {/* Architectural Background Accents */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-600/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-24">
                    {/* Brand Meta Section */}
                    <div className="md:col-span-4 space-y-10">
                        <div className="space-y-6">
                            <Link href="/" className="flex items-center gap-3 group w-fit">
                                <div className="p-1 transition-transform duration-700 group-hover:rotate-[360deg]">
                                    <LogoAnimation />
                                </div>
                                <span className="text-2xl font-black tracking-tighter text-white uppercase not-italic">HostelGH</span>
                            </Link>
                            <p className="text-zinc-400 text-sm leading-relaxed font-bold uppercase tracking-widest max-w-sm not-italic">
                                Decoupling the complexity of student housing. A high-density archival network for verified residences across Ghana.
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <a href="#" className="w-11 h-11 flex items-center justify-center bg-white/5 rounded-xl border border-white/5 text-zinc-400 hover:text-white hover:bg-blue-600 hover:border-blue-500 transition-all duration-300 shadow-2xl group">
                                <Twitter size={18} className="transition-transform group-hover:scale-110" />
                            </a>
                            <a href="#" className="w-11 h-11 flex items-center justify-center bg-white/5 rounded-xl border border-white/5 text-zinc-400 hover:text-white hover:bg-blue-600 hover:border-blue-500 transition-all duration-300 shadow-2xl group">
                                <Github size={18} className="transition-transform group-hover:scale-110" />
                            </a>
                            <a href="#" className="w-11 h-11 flex items-center justify-center bg-white/5 rounded-xl border border-white/5 text-zinc-400 hover:text-white hover:bg-blue-600 hover:border-blue-500 transition-all duration-300 shadow-2xl group">
                                <Instagram size={18} className="transition-transform group-hover:scale-110" />
                            </a>
                        </div>
                    </div>

                    {/* Navigation Hubs */}
                    <div className="md:col-span-2 space-y-8">
                        <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-2 not-italic">
                            <MapPin size={12} className="text-blue-500" /> Ecosystem
                        </h4>
                        <ul className="space-y-4">
                            {["Greater Accra", "Ashanti Sector", "Central Hub", "Northern Zone"].map((hub) => (
                                <li key={hub}>
                                    <Link href={`/hostels?city=${hub}`} className="text-zinc-500 hover:text-white text-[11px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2 group not-italic">
                                        <div className="w-1 h-1 bg-zinc-800 rounded-full group-hover:bg-blue-500 transition-all group-hover:scale-150" />
                                        {hub}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="md:col-span-3 space-y-8">
                        <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-2 not-italic">
                            <ShieldCheck size={12} className="text-blue-500" /> Infrastructure
                        </h4>
                        <ul className="space-y-4">
                            {[
                                { label: "Help Center", href: "/support" },
                                { label: "Security Protocol", href: "/support/privacy" },
                                { label: "Terms of Use", href: "/support/terms" },
                                { label: "Owner Portal", href: "/auth/register?role=OWNER" }
                            ].map((item) => (
                                <li key={item.label}>
                                    <Link href={item.href} className="text-zinc-500 hover:text-white text-[11px] font-bold uppercase tracking-widest transition-all hover:translate-x-1 flex items-center gap-2 not-italic">
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Terminal Section */}
                    <div className="md:col-span-3 space-y-8">
                        <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-2 not-italic">
                            <Zap size={12} className="text-blue-500" /> Support Terminal
                        </h4>
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 group cursor-pointer">
                                    <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-blue-500 border border-white/5 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        <Mail size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest not-italic">Transmission</p>
                                        <p className="text-[11px] font-bold text-zinc-300 not-italic">hello@hostelgh.com</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 group cursor-pointer">
                                    <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-blue-500 border border-white/5 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        <Phone size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest not-italic">Hotline</p>
                                        <p className="text-[11px] font-bold text-zinc-300 not-italic">+233 59 849 4617</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Sub-layer */}
                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest not-italic">System Status: Optimal</span>
                        </div>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] not-italic">
                            © {currentYear} CORE UNIT RESERVED. HOSTELGH IS A PROPERTY OF MINDED GH.
                        </p>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] not-italic">
                            Engineered By <span className="text-white px-2 py-1 bg-white/5 rounded border border-white/10">Minded Technologies</span>
                        </div>
                        <a href="https:// mindedgh.com" target="_blank" className="text-zinc-500 hover:text-white transition-colors">
                            <ExternalLink size={16} />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
