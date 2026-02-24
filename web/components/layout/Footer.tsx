import Link from "next/link";
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Globe } from "lucide-react";
import LogoAnimation from "./LogoAnimation";

export default function Footer() {
    return (
        <footer className="bg-zinc-50/50 border-t border-black/5 transition-colors duration-300 relative overflow-hidden">
            {/* Subtle top glow to separate from previous sections smoothly */}
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-black/5 to-transparent shadow-[0_1px_10px_rgba(0,0,0,0.05)]" />

            <div className="container mx-auto px-6 pt-20 pb-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
                    {/* Brand Section */}
                    <div className="space-y-6 lg:pr-8">
                        <Link href="/" className="flex items-center gap-3 group w-fit">
                            <div className="p-1.5 bg-white rounded-xl shadow-sm border border-black/5 group-hover:scale-105 transition-transform duration-300">
                                <LogoAnimation />
                            </div>
                            <span className="text-xl font-black tracking-tighter text-foreground group-hover:text-blue-600 transition-colors">HostelGH</span>
                        </Link>
                        <p className="text-muted-foreground leading-relaxed text-sm font-medium">
                            Ghana's premier student housing platform. We connect students with safe, verified, and comfortable hostels across all major university hubs.
                        </p>
                        <div className="flex items-center gap-3 pt-2">
                            <a href="#" className="p-2.5 bg-white rounded-full border border-black/5 shadow-sm text-muted-foreground hover:text-[#1877F2] hover:border-[#1877F2]/20 hover:shadow-md hover:-translate-y-1 transition-all"><Facebook size={18} /></a>
                            <a href="#" className="p-2.5 bg-white rounded-full border border-black/5 shadow-sm text-muted-foreground hover:text-[#1c90ff] hover:border-[#1c90ff]/20 hover:shadow-md hover:-translate-y-1 transition-all"><Twitter size={18} /></a>
                            <a href="#" className="p-2.5 bg-white rounded-full border border-black/5 shadow-sm text-muted-foreground hover:text-[#E4405F] hover:border-[#E4405F]/20 hover:shadow-md hover:-translate-y-1 transition-all"><Instagram size={18} /></a>
                        </div>
                    </div>

                    {/* Quick Explore */}
                    <div>
                        <h4 className="font-black text-muted-foreground mb-6 uppercase text-[10px] tracking-[0.2em]">Regional Hubs</h4>
                        <ul className="space-y-3.5 text-sm font-medium text-muted-foreground/80">
                            <li><Link href="/hostels?city=Accra" className="group flex items-center gap-2.5 hover:text-blue-600 transition-colors"><MapPin size={14} className="group-hover:translate-x-1 group-hover:text-blue-500 transition-all" /> <span className="group-hover:translate-x-1 transition-transform">Greater Accra</span></Link></li>
                            <li><Link href="/hostels?city=Kumasi" className="group flex items-center gap-2.5 hover:text-blue-600 transition-colors"><MapPin size={14} className="group-hover:translate-x-1 group-hover:text-blue-500 transition-all" /> <span className="group-hover:translate-x-1 transition-transform">Ashanti Region</span></Link></li>
                            <li><Link href="/hostels?city=Cape Coast" className="group flex items-center gap-2.5 hover:text-blue-600 transition-colors"><MapPin size={14} className="group-hover:translate-x-1 group-hover:text-blue-500 transition-all" /> <span className="group-hover:translate-x-1 transition-transform">Central Region</span></Link></li>
                            <li><Link href="/hostels?city=Tamale" className="group flex items-center gap-2.5 hover:text-blue-600 transition-colors"><MapPin size={14} className="group-hover:translate-x-1 group-hover:text-blue-500 transition-all" /> <span className="group-hover:translate-x-1 transition-transform">Northern Region</span></Link></li>
                        </ul>
                    </div>

                    {/* Support & Legal */}
                    <div>
                        <h4 className="font-black text-muted-foreground mb-6 uppercase text-[10px] tracking-[0.2em]">Support</h4>
                        <ul className="space-y-3.5 text-sm font-medium text-muted-foreground/80">
                            <li><Link href="/support/help" className="inline-block hover:text-foreground hover:translate-x-1 transition-all">Help Center</Link></li>
                            <li><Link href="/support/terms" className="inline-block hover:text-foreground hover:translate-x-1 transition-all">Terms of Service</Link></li>
                            <li><Link href="/support/privacy" className="inline-block hover:text-foreground hover:translate-x-1 transition-all">Privacy Policy</Link></li>
                            <li><Link href="/support/safety" className="inline-block hover:text-foreground hover:translate-x-1 transition-all">Safety Guidelines</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="font-black text-muted-foreground mb-6 uppercase text-[10px] tracking-[0.2em]">Contact Us</h4>
                        <ul className="space-y-4 text-sm font-medium text-muted-foreground/80">
                            <li className="flex items-center gap-3">
                                <div className="p-1.5 rounded-full bg-blue-500/10 text-blue-600"><Mail size={14} /></div>
                                <span>hello@hostelgh.com</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="p-1.5 rounded-full bg-blue-500/10 text-blue-600"><Phone size={14} /></div>
                                <span>+233 59 849 4617</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="p-1.5 rounded-full bg-blue-500/10 text-blue-600"><Globe size={14} /></div>
                                <span>Accra, Ghana</span>
                            </li>
                        </ul>
                        <div className="mt-8">
                            <Link
                                href="/auth/register?role=OWNER"
                                className="inline-flex items-center gap-2 py-3 px-6 bg-white border border-black/5 rounded-full font-black tracking-tight text-blue-600 text-sm hover:bg-blue-50 hover:border-blue-100 hover:shadow-md hover:-translate-y-0.5 transition-all w-fit"
                            >
                                List Your Hostel
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="border-t border-black/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-muted-foreground font-medium">
                    <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
                        <span className="font-black text-foreground tracking-tight flex items-center gap-1.5">
                            <div className="w-1 h-1 bg-blue-500 rounded-full" />
                            HostelGH
                        </span>
                        <span className="hidden md:block w-1 h-1 bg-black/10 rounded-full" />
                        <span>© {new Date().getFullYear()} All rights reserved.</span>
                    </div>
                    <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full border border-black/5 shadow-sm">
                        Built with <span className="px-0.5">❤️</span> by <span className="font-black text-foreground tracking-tight">Minded Technologies</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

