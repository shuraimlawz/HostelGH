import Link from "next/link";
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Globe } from "lucide-react";
import LogoAnimation from "./LogoAnimation";

export default function Footer() {
    return (
        <footer className="bg-muted/30 border-t transition-colors duration-300">
            <div className="container mx-auto px-6 pt-16 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Section */}
                    <div className="space-y-6">
                        <Link href="/" className="flex items-center gap-3 group">
                            <LogoAnimation />
                            <span className="text-xl font-bold tracking-tight text-foreground group-hover:text-[#1877F2] transition-colors">HostelGH</span>
                        </Link>
                        <p className="text-muted-foreground leading-relaxed text-sm">
                            Ghana's premier student housing platform. We connect students with safe, verified, and comfortable hostels across all major university hubs.
                        </p>
                        <div className="flex items-center gap-4 text-gray-400">
                            <a href="#" className="hover:text-[#1877F2] transition-colors"><Facebook size={20} /></a>
                            <a href="#" className="hover:text-[#1c90ff] transition-colors"><Twitter size={20} /></a>
                            <a href="#" className="hover:text-[#E4405F] transition-colors"><Instagram size={20} /></a>
                        </div>
                    </div>

                    {/* Quick Explore */}
                    <div>
                        <h4 className="font-bold text-foreground mb-6 uppercase text-xs tracking-widest">Regional Hubs</h4>
                        <ul className="space-y-4 text-sm text-muted-foreground">
                            <li><Link href="/hostels?city=Accra" className="hover:text-[#1877F2] transition-colors flex items-center gap-2"><MapPin size={14} /> Greater Accra </Link></li>
                            <li><Link href="/hostels?city=Kumasi" className="hover:text-[#1877F2] transition-colors flex items-center gap-2"><MapPin size={14} /> Ashanti Region </Link></li>
                            <li><Link href="/hostels?city=Cape Coast" className="hover:text-[#1877F2] transition-colors flex items-center gap-2"><MapPin size={14} /> Central Region </Link></li>
                            <li><Link href="/hostels?city=Tamale" className="hover:text-[#1877F2] transition-colors flex items-center gap-2"><MapPin size={14} /> Northern Region </Link></li>
                        </ul>
                    </div>

                    {/* Support & Legal */}
                    <div>
                        <h4 className="font-bold text-foreground mb-6 uppercase text-xs tracking-widest">Support</h4>
                        <ul className="space-y-4 text-sm text-muted-foreground">
                            <li><Link href="/support/help" className="hover:text-black transition-colors">Help Center</Link></li>
                            <li><Link href="/support/terms" className="hover:text-black transition-colors">Terms of Service</Link></li>
                            <li><Link href="/support/privacy" className="hover:text-black transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/support/safety" className="hover:text-black transition-colors">Safety Guidelines</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="font-bold text-foreground mb-6 uppercase text-xs tracking-widest">Contact Us</h4>
                        <ul className="space-y-4 text-sm text-muted-foreground">
                            <li className="flex items-center gap-3">
                                <Mail size={16} className="text-[#1877F2]" />
                                <span>hello@hostelgh.com</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone size={16} className="text-[#1877F2]" />
                                <span>+233 59 849 4617</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Globe size={16} className="text-[#1877F2]" />
                                <span>Accra, Ghana</span>
                            </li>
                        </ul>
                        <div className="mt-8">
                            <Link
                                href="/auth/register?role=OWNER"
                                className="inline-block py-3 px-6 bg-background border border-border rounded-xl font-bold text-[#1877F2] text-sm hover:bg-accent transition-all shadow-sm"
                            >
                                List Your Hostel
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">HostelGH</span>
                        <span>© {new Date().getFullYear()} All rights reserved.</span>
                    </div>
                    <div>
                        Built with ❤️ by <span className="font-bold text-foreground">Minded Technologies</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

