"use client";

import { Megaphone, Target, BarChart, Rocket, ArrowRight, Zap, CheckCircle2 } from "lucide-react";

export default function AdvertisingPage() {
    return (
        <main className="min-h-screen bg-[#020617] text-white pt-32 pb-24 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-4xl mx-auto mb-24 text-center">
                    <div className="w-16 h-16 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-500 mb-8 mx-auto">
                        <Megaphone size={32} />
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 italic uppercase leading-none">
                        Grow Your <span className="text-blue-500">Brand</span>
                    </h1>
                    <p className="text-zinc-400 text-xl font-medium leading-relaxed max-w-2xl mx-auto">
                        Reach tens of thousands of students across Ghana at the exact moment they are making major living decisions.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
                    <div className="p-10 bg-white/[0.03] border border-white/10 rounded-[2.5rem] space-y-6 group hover:bg-white/[0.05] transition-all">
                        <Target size={32} className="text-blue-500 group-hover:scale-110 transition-transform" />
                        <h3 className="text-2xl font-black uppercase italic tracking-tight text-white">Search Spotlight</h3>
                        <p className="text-zinc-500 text-sm leading-relaxed">
                            Appear at the very top of search results for specific universities. High conversion for immediate bookings.
                        </p>
                    </div>
                    <div className="p-10 bg-white/[0.03] border border-white/10 rounded-[2.5rem] space-y-6 group hover:bg-white/[0.05] transition-all">
                        <BarChart size={32} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                        <h3 className="text-2xl font-black uppercase italic tracking-tight text-white">Featured Index</h3>
                        <p className="text-zinc-500 text-sm leading-relaxed">
                            Get showcased on the home page carousel. Perfect for building general brand awareness and trust.
                        </p>
                    </div>
                    <div className="p-10 bg-white/[0.03] border border-white/10 rounded-[2.5rem] space-y-6 group hover:bg-white/[0.05] transition-all">
                        <Zap size={32} className="text-yellow-500 group-hover:scale-110 transition-transform" />
                        <h3 className="text-2xl font-black uppercase italic tracking-tight text-white">Direct Push</h3>
                        <p className="text-zinc-500 text-sm leading-relaxed">
                            Reach students directly through our newsletter and SMS notification engine with high-retention banners.
                        </p>
                    </div>
                </div>

                {/* Demographics & Reach */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-32">
                    <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-12">
                        <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-8">Audience <span className="text-blue-500">Demographics</span></h3>
                        <div className="space-y-8">
                            {[
                                { label: "University Concentration", value: "95%", sub: "UG, KNUST, UPSA, UCC" },
                                { label: "Active User Age Group", value: "18 - 26", sub: "Undergraduates & Fresh Graduates" },
                                { label: "Mobile Engagement", value: "88%", sub: "Primary access via iOS/Android" }
                            ].map((stat, i) => (
                                <div key={i} className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{stat.label}</span>
                                        <span className="text-2xl font-black text-white italic">{stat.value}</span>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-600 rounded-full" style={{ width: i === 0 ? "95%" : (i === 1 ? "100%" : "88%") }} />
                                    </div>
                                    <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{stat.sub}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col justify-center space-y-8">
                        <div className="p-8 bg-blue-600/5 border border-blue-600/20 rounded-3xl">
                            <h4 className="text-xl font-black italic uppercase tracking-tight text-white mb-4">Why Advertise with us?</h4>
                            <p className="text-zinc-500 text-sm leading-relaxed mb-6 font-medium">
                                HostelGH is the #1 destination for student housing in Ghana. We provide a brand-safe environment with high-intent users ready to convert.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/5">
                                    <div className="text-xl font-black text-white">50k+</div>
                                    <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Monthly Users</div>
                                </div>
                                <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/5">
                                    <div className="text-xl font-black text-white">12.5%</div>
                                    <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Avg. Click Rate</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Simple Pricing Cards */}
                <div className="max-w-4xl mx-auto mb-32">
                    <h3 className="text-2xl font-black mb-12 italic uppercase tracking-tighter text-center">Flexible <span className="text-blue-500">Tiered</span> Placements</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[2.5rem] space-y-8 group hover:bg-white/[0.05] transition-all">
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-2">Essential Tier</h4>
                                <div className="text-4xl font-black text-white italic tracking-tighter">Performance</div>
                            </div>
                            <p className="text-zinc-500 text-sm font-medium leading-relaxed">Pay per click/engagement. Ideal for individual hostel owners looking for quick fills.</p>
                            <ul className="space-y-4">
                                {["Search Boost", "Verified Badge", "Weekly Stats"].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                        <CheckCircle2 size={12} className="text-blue-500" /> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="p-10 bg-blue-600/10 border border-blue-500/30 rounded-[2.5rem] space-y-8 group hover:bg-blue-600/20 transition-all shadow-2xl shadow-blue-500/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-10 opacity-10">
                                <Zap size={60} />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-2">Premium Tier</h4>
                                <div className="text-4xl font-black text-white italic tracking-tighter">Spotlight +</div>
                            </div>
                            <p className="text-zinc-500 text-sm font-medium leading-relaxed">Fixed monthly placement with top-tier visibility. Ideal for corporate developers.</p>
                            <ul className="space-y-4">
                                {["Homepage Featured", "Newsletter Blast", "Account Manager"].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white">
                                        <CheckCircle2 size={12} className="text-emerald-500" /> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[3rem] p-12 md:p-20 text-center max-w-5xl mx-auto shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-5 transition-opacity duration-1000 pointer-events-none" />
                    <Rocket size={48} className="text-blue-600 mb-8 mx-auto" />
                    <h3 className="text-4xl font-black mb-6 italic uppercase tracking-tighter text-gray-900 leading-none">Ready to amplify your presence?</h3>
                    <p className="text-gray-500 text-lg mb-12 max-w-xl mx-auto font-medium">
                        Contact our media sales team today to learn about our customized advertising packages.
                    </p>
                    <button className="h-16 px-12 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-500 transition-all flex items-center gap-3 shadow-xl shadow-blue-600/30 mx-auto active:scale-95">
                        Inquire Now <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        </main>
    );
}
