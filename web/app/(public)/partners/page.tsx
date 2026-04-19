"use client";

import { Building2, Users, BarChart3, ShieldCheck, ArrowUpRight, Zap } from "lucide-react";

export default function PartnersPage() {
    const benefits = [
        {
            icon: Users,
            title: "Massive Audience",
            description: "Access thousands of verified students actively looking for accommodation every month."
        },
        {
            icon: BarChart3,
            title: "Advanced Analytics",
            description: "Receive deep insights into your property's performance and market demand trends."
        },
        {
            icon: Zap,
            title: "Instant Payouts",
            description: "Automated payment processing with instant notifications and fast settlement cycles."
        },
        {
            icon: ShieldCheck,
            title: "Fraud Prevention",
            description: "Our secure platform verifies tenants and handles disputes, giving you peace of mind."
        }
    ];

    return (
        <main className="min-h-screen bg-[#020617] text-white pt-32 pb-24 overflow-hidden relative">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-[800px] bg-gradient-to-b from-blue-600/5 to-transparent pointer-events-none" />
            <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-blue-500/10 blur-[150px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-20 mb-32">
                    <div className="lg:max-w-2xl text-center lg:text-left">
                        <span className="px-5 py-2 bg-emerald-500/10 text-emerald-400 rounded-full text-[11px] font-black uppercase tracking-[0.3em] border border-emerald-500/20 mb-8 inline-block">
                            Partner Network v2.0
                        </span>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 italic uppercase leading-none">
                            Scale Your <span className="text-blue-500">Property</span> Portfolio
                        </h1>
                        <p className="text-zinc-400 text-xl font-medium leading-relaxed max-w-xl mb-12">
                            Join Ghana&apos;s most sophisticated student accommodation ecosystem. List once, book forever.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <button className="h-16 px-10 bg-white text-black rounded-2xl font-black uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center gap-3 active:scale-95 shadow-2xl">
                                Become a Partner <ArrowUpRight size={20} />
                            </button>
                            <div className="flex items-center gap-4 text-emerald-500 font-bold text-xs uppercase tracking-widest">
                                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                                Onboarding Active
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full lg:max-w-lg">
                        <div className="space-y-4 pt-12">
                            <div className="aspect-square bg-white/[0.03] border border-white/10 rounded-3xl p-8 flex flex-col justify-end group hover:bg-white/5 transition-colors">
                                <Building2 size={32} className="text-blue-500 mb-4 transition-transform group-hover:-translate-y-2" />
                                <div className="font-black text-2xl uppercase tracking-tighter">1,200+</div>
                                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Active Properties</div>
                            </div>
                            <div className="aspect-square bg-white/[0.03] border border-white/10 rounded-3xl p-8 flex flex-col justify-end group hover:bg-white/5 transition-colors">
                                <Users size={32} className="text-emerald-500 mb-4 transition-transform group-hover:-translate-y-2" />
                                <div className="font-black text-2xl uppercase tracking-tighter">150k+</div>
                                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Monthly Searches</div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="aspect-square bg-white/[0.03] border border-white/10 rounded-3xl p-8 flex flex-col justify-end group hover:bg-white/5 transition-colors">
                                <Zap size={32} className="text-yellow-500 mb-4 transition-transform group-hover:-translate-y-2" />
                                <div className="font-black text-2xl uppercase tracking-tighter">98%</div>
                                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Occupancy Rate</div>
                            </div>
                            <div className="aspect-[1/1.5] bg-blue-600 rounded-3xl p-8 flex flex-col justify-end group shadow-2xl shadow-blue-600/20">
                                <div className="font-black text-4xl text-white uppercase tracking-tighter leading-none mb-4 italic">Next Level Living</div>
                                <button className="w-full py-4 bg-white/20 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/30 transition-all">Sign Up Now</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Benefits Grid */}
                <div>
                    <div className="h-px bg-white/10 w-full mb-20" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-32">
                        {benefits.map((benefit, idx) => (
                            <div key={idx} className="space-y-6 group">
                                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                                    <benefit.icon size={24} />
                                </div>
                                <h3 className="text-xl font-black uppercase italic tracking-tight">{benefit.title}</h3>
                                <p className="text-zinc-500 text-sm font-medium leading-relaxed">{benefit.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Onboarding Roadmap */}
                <div className="mb-32">
                    <div className="max-w-3xl border-l border-blue-600/30 ml-8 space-y-16 py-8">
                        {[
                            { step: "01", title: "Digital Listing", text: "Create your partner account and list your properties with high-resolution imagery and accurate details." },
                            { step: "02", stepTitle: "Verification Audit", text: "Our field team conducts a 50-point safety and amenity audit to grant you the Verified Partner badge." },
                            { step: "03", stepTitle: "Market Connection", text: "Your hostel goes live on the platform, reaching students across all major Ghanaian universities." },
                            { step: "04", stepTitle: "Seamless Payouts", text: "Receive automated settlements directly to your preferred account as bookings are confirmed." }
                        ].map((node, i) => (
                            <div key={i} className="relative pl-12 group">
                                <div className="absolute left-[-13px] top-0 w-6 h-6 rounded-full bg-[#020617] border-2 border-blue-600 flex items-center justify-center group-hover:scale-125 transition-transform">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                </div>
                                <div className="space-y-4">
                                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">{node.step} / Phase</span>
                                    <h4 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none">{node.stepTitle || node.title}</h4>
                                    <p className="text-zinc-500 max-w-xl font-medium leading-relaxed">{node.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Partner FAQ */}
                <div className="mt-32 p-12 md:p-20 bg-white/[0.02] border border-white/5 rounded-[3rem] backdrop-blur-md">
                    <h3 className="text-3xl font-black mb-12 italic uppercase tracking-tighter text-center sm:text-left">Partner Intelligence <span className="text-blue-500">FAQ</span></h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <h4 className="font-bold text-white uppercase tracking-tight text-lg italic">Is there a listing fee?</h4>
                            <p className="text-zinc-500 text-sm leading-relaxed">No. We only charge a small performance commission once a booking is successfully finalized through the platform.</p>
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-bold text-white uppercase tracking-tight text-lg italic">How long does verification take?</h4>
                            <p className="text-zinc-500 text-sm leading-relaxed">Typically 3–5 business days. Our field team is optimized for speed without compromising safety standards.</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
