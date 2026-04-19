"use client";

import { ShieldCheck, UserCheck, FileText, CheckCircle2, Search, ArrowRight, Zap } from "lucide-react";

export default function VerificationPage() {
    const steps = [
        {
            title: "Identity Verification",
            description: "Property owners must provide valid government ID and business registration documents.",
            icon: UserCheck
        },
        {
            title: "Physical Inspection",
            description: "Our field agents visit every hostel to verify photos, amenities, and safety standards.",
            icon: Search
        },
        {
            title: "Ownership Proof",
            description: "We verify title deeds and utility bills to ensure the person listing is the rightful owner or authorized agent.",
            icon: FileText
        },
        {
            title: "Verified Badge",
            description: "Once passed, the property receives the 'HostelGH Verified' badge, signaling trust to students.",
            icon: ShieldCheck
        }
    ];

    return (
        <main className="min-h-screen bg-[#020617] text-white pt-32 pb-24 overflow-hidden relative">
            {/* Mesh Gradients */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-4xl mx-auto text-center mb-24">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-full mb-8">
                        <ShieldCheck size={16} className="text-blue-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Trust & Safety Standard</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 italic uppercase leading-none">
                        Hostel <span className="text-blue-500">Verification</span>
                    </h1>
                    <p className="text-zinc-400 text-xl font-medium leading-relaxed max-w-2xl mx-auto">
                        We prioritize your safety. Every single property on HostelGH undergoes a rigorous multi-step verification process before it goes live.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-32">
                    {steps.map((step, idx) => (
                        <div key={idx} className="bg-white/[0.03] border border-white/10 rounded-3xl p-10 hover:bg-white/[0.05] hover:border-blue-500/30 transition-all duration-500 group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                                <step.icon size={100} />
                            </div>
                            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-blue-500 mb-8 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 relative z-10">
                                <step.icon size={28} />
                            </div>
                            <h3 className="text-2xl font-black mb-4 uppercase italic tracking-tight relative z-10">{step.title}</h3>
                            <p className="text-zinc-400 text-sm font-medium leading-relaxed relative z-10">{step.description}</p>
                        </div>
                    ))}
                </div>

                {/* Audit Checklist */}
                <div className="max-w-4xl mx-auto mb-32">
                    <h2 className="text-3xl font-black mb-12 italic uppercase tracking-tighter text-center">The <span className="text-blue-500">HostelGH</span> Audit Checklist</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            "Water supply consistency & backup tanks",
                            "Emergency lighting & fire safety",
                            "WiFi speed & signal distribution",
                            "Sanitary facilities (Bathrooms/Kitchens)",
                            "Security presence & CCTV (if applicable)",
                            "Room ventilation & natural lighting",
                            "Furniture quality & structural integrity",
                            "Proximity to campus transportation"
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-4 p-5 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-blue-500/30 transition-colors">
                                <div className="w-5 h-5 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-500">
                                    <CheckCircle2 size={12} />
                                </div>
                                <span className="text-zinc-400 text-sm font-bold uppercase tracking-tight group-hover:text-white transition-colors">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Trust Tiers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-32">
                    <div className="p-12 bg-white/[0.03] border border-white/10 rounded-[3rem] relative overflow-hidden group">
                        <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500 mb-8 border border-blue-500/20">
                            <ShieldCheck size={24} />
                        </div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-4">Standard Tier</h4>
                        <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-6">Verified</h3>
                        <p className="text-zinc-500 text-sm leading-bold font-medium mb-8">Basic identity, ownership, and structural safety verification completed by our field team.</p>
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10 w-fit">
                            <CheckCircle2 size={12} className="text-blue-500" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Entry Standard Approved</span>
                        </div>
                    </div>

                    <div className="p-12 bg-blue-600/5 border border-blue-600/20 rounded-[3rem] relative overflow-hidden group">
                        <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white mb-8 shadow-xl shadow-blue-600/20">
                            <Zap size={24} />
                        </div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 mb-4">Premium Tier</h4>
                        <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-6">Elite Status</h3>
                        <p className="text-zinc-500 text-sm leading-bold font-medium mb-8">Hostels consistently rated highly by students with 99% uptime for all featured amenities.</p>
                        <div className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 rounded-xl border border-blue-500/30 w-fit">
                            <Zap size={12} className="text-blue-500 fill-blue-500" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Top 5% Performance</span>
                        </div>
                    </div>
                </div>

                <div className="mt-24 pt-24 border-t border-white/5 text-center">
                    <h3 className="text-4xl font-black mb-12 italic uppercase tracking-tighter">Your Peace of Mind is Our Mission</h3>
                    <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-12 max-w-3xl mx-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                            <div className="space-y-2">
                                <div className="text-4xl font-black text-blue-500 tracking-tighter">100%</div>
                                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Manually Verified</div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-4xl font-black text-blue-500 tracking-tighter">24/7</div>
                                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Safety Monitoring</div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-4xl font-black text-blue-500 tracking-tighter">Zero</div>
                                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Tolerance for Fraud</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
