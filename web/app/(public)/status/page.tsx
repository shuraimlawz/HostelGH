"use client";

import { Activity, CheckCircle2, Globe, Server, ShieldCheck, Zap } from "lucide-react";

export default function StatusPage() {
    const services = [
        { name: "Frontend Platform", status: "Operational", uptime: "99.98%" },
        { name: "API Gateway", status: "Operational", uptime: "99.95%" },
        { name: "Global CDN", status: "Operational", uptime: "100%" },
        { name: "Payment Processing", status: "Operational", uptime: "99.99%" },
        { name: "Notification Engine", status: "Operational", uptime: "99.8%" },
        { name: "Database Cluster", status: "Operational", uptime: "99.99%" }
    ];

    return (
        <main className="min-h-screen bg-[#020617] text-white pt-32 pb-24 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-4xl mx-auto mb-20">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-blue-600/10 border border-blue-500/20 rounded-xl flex items-center justify-center text-blue-500">
                            <Activity size={24} />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter italic uppercase leading-none">
                            System <span className="text-blue-500">Status</span>
                        </h1>
                    </div>
                    
                    <div className="p-8 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center justify-between gap-6 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
                        <div className="flex items-center gap-4">
                            <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                            <span className="text-xl md:text-2xl font-black uppercase italic tracking-tight text-emerald-400">All Systems Operational</span>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/70 hidden md:block">Updated 2 minutes ago</span>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                    {services.map((service, idx) => (
                        <div key={idx} className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center justify-between group hover:bg-white/[0.04] transition-all">
                            <div className="space-y-1">
                                <h3 className="font-bold text-lg text-white tracking-tight">{service.name}</h3>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Uptime: {service.uptime}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                                <CheckCircle2 size={12} className="text-emerald-500" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">{service.status}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="max-w-4xl mx-auto mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white/[0.01] border border-white/5 rounded-3xl space-y-4">
                        <Globe size={24} className="text-indigo-500" />
                        <h4 className="font-black uppercase tracking-widest text-[10px] text-zinc-500 opacity-50">Global Regions</h4>
                        <div className="text-2xl font-black text-white italic tracking-tighter">14 Regions</div>
                    </div>
                    <div className="p-8 bg-white/[0.01] border border-white/5 rounded-3xl space-y-4">
                        <Server size={24} className="text-blue-500" />
                        <h4 className="font-black uppercase tracking-widest text-[10px] text-zinc-500 opacity-50">Data Centers</h4>
                        <div className="text-2xl font-black text-white italic tracking-tighter">Multi-AZ Aware</div>
                    </div>
                    <div className="p-8 bg-white/[0.01] border border-white/5 rounded-3xl space-y-4">
                        <Zap size={24} className="text-yellow-500" />
                        <h4 className="font-black uppercase tracking-widest text-[10px] text-zinc-500 opacity-50">Response Time</h4>
                        <div className="text-2xl font-black text-white italic tracking-tighter">42ms Avg.</div>
                    </div>
                </div>
            </div>
        </main>
    );
}
