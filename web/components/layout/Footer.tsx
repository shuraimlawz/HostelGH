import Link from "next/link";
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Globe, ShieldCheck, Zap } from "lucide-react";
import LogoAnimation from "./LogoAnimation";

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-50 relative overflow-hidden pb-10">
            {/* Subtle top glow */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-600/10 to-transparent" />

            <div className="container mx-auto px-6 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                    {/* Brand Section */}
                    <div className="space-y-8">
                        <Link href="/" className="flex items-center gap-3 group w-fit">
                            <div className="p-1 group-hover:scale-110 transition-transform duration-500">
                                <LogoAnimation />
                            </div>
                            <span className="text-xl font-bold tracking-tighter text-gray-900 uppercase">HostelGH</span>
                        </Link>
                        <p className="text-gray-400 leading-relaxed text-[11px] font-bold uppercase tracking-widest max-w-xs">
                            Ghana's premier student housing network. Verified, secure, and optimized for modern operational standards.
                        </p>
                        <div className="flex items-center gap-3">
                            <a href="#" className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-xl border border-gray-100 text-gray-400 hover:text-blue-600 hover:border-blue-500/20 hover:bg-white hover:shadow-xl transition-all"><Facebook size={16} /></a>
                            <a href="#" className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-xl border border-gray-100 text-gray-400 hover:text-blue-400 hover:border-blue-500/20 hover:bg-white hover:shadow-xl transition-all"><Twitter size={16} /></a>
                            <a href="#" className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-xl border border-gray-100 text-gray-400 hover:text-pink-600 hover:border-blue-500/20 hover:bg-white hover:shadow-xl transition-all"><Instagram size={16} /></a>
                        </div>
                    </div>

                    {/* Quick Explore */}
                    <div className="space-y-6">
                        <h4 className="font-bold text-gray-900 uppercase text-[10px] tracking-[0.3em] flex items-center gap-2">
                             <MapPin size={12} className="text-blue-600" /> Regional Hubs
                        </h4>
                        <ul className="space-y-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                            <li><Link href="/find?city=Accra" className="group flex items-center gap-3 hover:text-gray-900 transition-colors"><span className="w-1 h-1 bg-blue-600 rounded-full group-hover:scale-150 transition-transform" /> Greater Accra Zone</Link></li>
                            <li><Link href="/find?city=Kumasi" className="group flex items-center gap-3 hover:text-gray-900 transition-colors"><span className="w-1 h-1 bg-blue-600 rounded-full group-hover:scale-150 transition-transform" /> Ashanti Sector</Link></li>
                            <li><Link href="/find?city=Cape Coast" className="group flex items-center gap-3 hover:text-gray-900 transition-colors"><span className="w-1 h-1 bg-blue-600 rounded-full group-hover:scale-150 transition-transform" /> Central Registry</Link></li>
                            <li><Link href="/find?city=Tamale" className="group flex items-center gap-3 hover:text-gray-900 transition-colors"><span className="w-1 h-1 bg-blue-600 rounded-full group-hover:scale-150 transition-transform" /> Northern District</Link></li>
                        </ul>
                    </div>

                    {/* Support & Legal */}
                    <div className="space-y-6">
                        <h4 className="font-bold text-gray-900 uppercase text-[10px] tracking-[0.3em] flex items-center gap-2">
                            <ShieldCheck size={12} className="text-blue-600" /> Operational Protocol
                        </h4>
                        <ul className="space-y-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                            <li><Link href="/support/help-center" className="hover:text-gray-900 hover:translate-x-1 transition-all flex items-center gap-3">Help Center</Link></li>
                            <li><Link href="/support/terms" className="hover:text-gray-900 hover:translate-x-1 transition-all flex items-center gap-3">Terms of Service</Link></li>
                            <li><Link href="/support/privacy" className="hover:text-gray-900 hover:translate-x-1 transition-all flex items-center gap-3">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-6">
                        <h4 className="font-bold text-gray-900 uppercase text-[10px] tracking-[0.3em] flex items-center gap-2">
                            <Zap size={12} className="text-blue-600" /> Support Terminal
                        </h4>
                        <ul className="space-y-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                            <li className="flex items-center gap-3 group cursor-pointer hover:text-gray-900 transition-colors">
                                <Mail size={14} className="text-blue-500" />
                                <span className="lowercase">hello@hostelgh.com</span>
                            </li>
                            <li className="flex items-center gap-3 group cursor-pointer hover:text-gray-900 transition-colors">
                                <Phone size={14} className="text-blue-500" />
                                <span>+233 59 849 4617</span>
                            </li>
                            <li className="flex items-center gap-3 group cursor-pointer hover:text-gray-900 transition-colors">
                                <Globe size={14} className="text-blue-500" />
                                <span>Accra Alpha HQ</span>
                            </li>
                        </ul>
                        <div className="pt-4">
                            <Link
                                href="/auth/register?role=OWNER"
                                className="inline-flex h-12 items-center justify-center px-8 bg-gray-900 text-white rounded-xl font-bold tracking-widest text-[10px] uppercase hover:bg-black transition-all active:scale-[0.98] shadow-xl"
                            >
                                Deploy Your Asset
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-50 pt-10 flex flex-col md:flex-row justify-between items-center gap-10 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <span className="text-gray-900 font-bold tracking-tighter">
                            HostelGH <span className="text-blue-600">.</span>
                        </span>
                        <div className="hidden md:block w-1.5 h-1.5 bg-gray-100 rounded-full" />
                        <span>© {new Date().getFullYear()} CORE UNIT RESERVED.</span>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-50 px-6 py-2.5 rounded-xl border border-gray-100 shadow-sm">
                        ENGINEERED BY <span className="text-gray-900">MINDED TECHNOLOGIES</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
