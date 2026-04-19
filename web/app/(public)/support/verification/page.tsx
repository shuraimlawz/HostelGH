"use client";

import { ShieldCheck, UserCheck, Search, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function VerificationPage() {
    const steps = [
        {
            title: "Identity & Ownership",
            description: "We verify developer IDs and property title deeds to ensure every listing is legitimate.",
            icon: UserCheck
        },
        {
            title: "On-Site Inspection",
            description: "Field agents visit in-person to audit amenities, water, security, and photo accuracy.",
            icon: Search
        },
        {
            title: "HostelGH Approved",
            description: "Verified hostels receive the 'Shield' badge and priority placement in search results.",
            icon: ShieldCheck
        }
    ];

    return (
        <main className="min-h-screen bg-[#020617] text-white pt-32 pb-24 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-3xl mx-auto text-center mb-20">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-full mb-8">
                        <ShieldCheck size={16} className="text-blue-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Trust Guarantee</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 italic uppercase leading-tight">
                        Hostel <span className="text-blue-500">Verification</span>
                    </h1>
                    <p className="text-zinc-400 text-lg font-medium leading-relaxed max-w-xl mx-auto">
                        We manually audit every property. No fake photos. No ghosts. Just verified student homes.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-20">
                    {steps.map((step, idx) => (
                        <div key={idx} className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 hover:bg-white/[0.05] hover:border-blue-500/30 transition-all duration-500 group">
                            <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                                <step.icon size={28} />
                            </div>
                            <h3 className="text-xl font-black mb-3 uppercase italic tracking-tight">{step.title}</h3>
                            <p className="text-zinc-500 text-sm font-medium leading-relaxed">{step.description}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-10 max-w-4xl mx-auto text-center">
                    <h3 className="text-2xl font-black mb-8 italic uppercase tracking-tighter text-white">Our Standards</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                        {["Water & Utility Backup", "Fire Safety & Emergency Exit", "Verified Internet Speed", "CCTV & Security Presence"].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 justify-center text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                <CheckCircle2 size={14} className="text-blue-500" /> {item}
                            </div>
                        ))}
                    </div>
                    <Link href="/auth/register?role=OWNER" className="inline-flex items-center gap-3 h-14 px-8 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-blue-500 transition-all active:scale-95 shadow-xl shadow-blue-500/20">
                        Apply for Verification <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        </main>
    );
}
