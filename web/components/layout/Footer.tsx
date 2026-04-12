import Link from "next/link";
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Globe } from "lucide-react";
import LogoAnimation from "./LogoAnimation";

export default function Footer() {
    return (
        <footer className="bg-background border-t border-border relative overflow-hidden">
            {/* Subtle top glow */}
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-primary/10 to-transparent" />

            <div className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-12">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2 group w-fit">
                            <div className="p-1 group-hover:scale-110 transition-transform duration-500 animate-bounce-subtle">
                                <LogoAnimation />
                            </div>
                            <span className="text-lg font-black tracking-[0.2em] text-foreground uppercase">HostelGH</span>
                        </Link>
                        <p className="text-muted-foreground leading-relaxed text-[11px] font-bold uppercase tracking-tight max-w-xs">
                            GHANA'S PREMIER STUDENT HOUSING PLATFORM. VERIFIED, COMPACT, AND SECURE SOLUTIONS FOR MODERN SCHOLARS.
                        </p>
                        <div className="flex items-center gap-2 pt-2">
                            <a href="#" className="p-2 bg-muted rounded-sm border border-border text-muted-foreground hover:text-foreground transition-all"><Facebook size={14} /></a>
                            <a href="#" className="p-2 bg-muted rounded-sm border border-border text-muted-foreground hover:text-foreground transition-all"><Twitter size={14} /></a>
                            <a href="#" className="p-2 bg-muted rounded-sm border border-border text-muted-foreground hover:text-foreground transition-all"><Instagram size={14} /></a>
                        </div>
                    </div>

                    {/* Quick Explore */}
                    <div>
                        <h4 className="font-black text-foreground mb-4 uppercase text-[10px] tracking-[0.3em] italic">Regional Hubs</h4>
                        <ul className="space-y-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            <li><Link href="/hostels?city=Accra" className="group flex items-center gap-2 hover:text-primary transition-colors"><MapPin size={12} /> <span className="group-hover:translate-x-1 transition-transform">Greater Accra</span></Link></li>
                            <li><Link href="/hostels?city=Kumasi" className="group flex items-center gap-2 hover:text-primary transition-colors"><MapPin size={12} /> <span className="group-hover:translate-x-1 transition-transform">Ashanti Region</span></Link></li>
                            <li><Link href="/hostels?city=Cape Coast" className="group flex items-center gap-2 hover:text-primary transition-colors"><MapPin size={12} /> <span className="group-hover:translate-x-1 transition-transform">Central Region</span></Link></li>
                            <li><Link href="/hostels?city=Tamale" className="group flex items-center gap-2 hover:text-primary transition-colors"><MapPin size={12} /> <span className="group-hover:translate-x-1 transition-transform">Northern Region</span></Link></li>
                        </ul>
                    </div>

                    {/* Support & Legal */}
                    <div>
                        <h4 className="font-black text-foreground mb-4 uppercase text-[10px] tracking-[0.3em] italic">Operations</h4>
                        <ul className="space-y-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            <li><Link href="/support/help" className="hover:text-foreground hover:translate-x-1 transition-all block">Help Center</Link></li>
                            <li><Link href="/support/terms" className="hover:text-foreground hover:translate-x-1 transition-all block">Terms of Service</Link></li>
                            <li><Link href="/support/privacy" className="hover:text-foreground hover:translate-x-1 transition-all block">Privacy Policy</Link></li>
                            <li><Link href="/support/safety" className="hover:text-foreground hover:translate-x-1 transition-all block">Safety Guidelines</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="font-black text-foreground mb-4 uppercase text-[10px] tracking-[0.3em] italic">Contact Center</h4>
                        <ul className="space-y-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            <li className="flex items-center gap-2">
                                <Mail size={12} className="text-primary" />
                                <span className="lowercase">hello@hostelgh.com</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Phone size={12} className="text-primary" />
                                <span>+233 59 849 4617</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Globe size={12} className="text-primary" />
                                <span>Accra HQ, Ghana</span>
                            </li>
                        </ul>
                        <div className="mt-6">
                            <Link
                                href="/auth/register?role=OWNER"
                                className="inline-flex items-center gap-2 py-2 px-4 bg-foreground text-background rounded-sm font-black tracking-widest text-[9px] uppercase hover:opacity-90 transition-all active:scale-[0.98]"
                            >
                                List Your Hostel
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-[9px] text-muted-foreground font-black uppercase tracking-widest">
                    <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
                        <span className="text-foreground flex items-center gap-1.5 italic">
                            HostelGH <span className="text-primary NOT-italic">.</span>
                        </span>
                        <span className="hidden md:block w-1 h-1 bg-border rounded-full" />
                        <span>© {new Date().getFullYear()} CORE UNIT RESERVED.</span>
                    </div>
                    <div className="flex items-center gap-2 bg-muted px-4 py-1.5 rounded-sm border border-border shadow-sm">
                        ENGINEERED BY <span className="text-foreground">MINDED TECHNOLOGIES</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
