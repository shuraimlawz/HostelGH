"use client";

import { Cookie, Shield, Eye, Settings, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CookiesPage() {
    return (
        <main className="min-h-screen bg-[#020617] text-white pt-32 pb-24 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-3xl mx-auto mb-16 text-center">
                    <div className="w-16 h-16 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-500 mb-8 mx-auto">
                        <Cookie size={32} />
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 italic uppercase leading-none">
                        Cookie <span className="text-blue-500">Policy</span>
                    </h1>
                    <p className="text-zinc-400 text-lg font-medium leading-relaxed max-w-xl mx-auto">
                        We use cookies to keep you logged in, remember your university filters, and keep the platform fast and secure.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
                    {[
                        { icon: Shield, title: "Essential", text: "Login sessions and secure booking state. (Cannot be disabled)" },
                        { icon: Eye, title: "Analytics", text: "Helps us see which universities are most popular." },
                        { icon: Settings, title: "Preferences", text: "Remembers your dark mode and filter settings." }
                    ].map((item, i) => (
                        <div key={i} className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl group hover:bg-white/[0.04] transition-all">
                            <item.icon size={24} className="text-blue-500 mb-4" />
                            <h3 className="text-lg font-black uppercase italic tracking-tight text-white mb-2">{item.title}</h3>
                            <p className="text-zinc-500 text-sm leading-relaxed">{item.text}</p>
                        </div>
                    ))}
                </div>

                <div className="max-w-2xl mx-auto p-10 bg-blue-600/5 border border-blue-500/20 rounded-[2.5rem] flex flex-col items-center text-center">
                    <h3 className="text-2xl font-black uppercase italic tracking-tight text-white mb-4">Managing Data</h3>
                    <p className="text-zinc-500 text-sm mb-10 leading-relaxed font-medium">
                        You can clear cookies at any time through your browser settings. For data requests, contact our privacy officer.
                    </p>
                    <Link href="/support/help-center" className="h-14 px-8 bg-white text-blue-600 rounded-xl font-black uppercase tracking-widest hover:bg-zinc-100 transition-all active:scale-95 flex items-center gap-2">
                        Contact Support <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        </main>
    );
}
