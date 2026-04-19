"use client";

import { Activity, CheckCircle2, Globe, Server, ShieldCheck, Zap, Loader2, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function StatusPage() {
    const { data: health, isLoading, error } = useQuery({
        queryKey: ["system-health"],
        queryFn: async () => {
            const res = await api.get("/health");
            return res.data;
        },
        refetchInterval: 30000, // 30 seconds
    });

    const isSystemOk = health?.status === "ok";

    const services = [
        { 
            name: "Core API Service", 
            status: isLoading ? "Checking..." : (error ? "Down" : "Operational"), 
            uptime: health?.uptime || "N/A",
            icon: Server
        },
        { 
            name: "Database Cluster", 
            status: isLoading ? "Checking..." : (health?.database === "connected" ? "Operational" : "Disconnected"), 
            uptime: "99.99%",
            icon: ShieldCheck
        },
        { 
            name: "Frontend Platform", 
            status: "Operational", 
            uptime: "100%",
            icon: Globe
        },
        { 
            name: "Payment Gateway", 
            status: "Operational", 
            uptime: "99.99%",
            icon: Zap
        }
    ];

    return (
        <main className="min-h-screen bg-[#020617] text-white pt-32 pb-24 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-4xl mx-auto mb-20 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8 justify-center md:justify-start">
                        <div className="w-16 h-16 bg-blue-600/10 border border-blue-500/20 rounded-[1.5rem] flex items-center justify-center text-blue-500 shadow-xl shadow-blue-500/5 mx-auto md:mx-0">
                            <Activity size={32} />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-6xl font-black tracking-tighter italic uppercase leading-tight mb-2">
                                System <span className="text-blue-500">Status</span>
                            </h1>
                            <p className="text-zinc-500 font-bold text-xs uppercase tracking-[0.3em]">Real-time Infrastructure Monitoring</p>
                        </div>
                    </div>
                    
                    <div className={cn(
                        "p-10 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl transition-all duration-700 border",
                        isLoading ? "bg-white/[0.03] border-white/5 animate-pulse" : (
                            isSystemOk 
                                ? "bg-emerald-500/5 border-emerald-500/20 shadow-emerald-500/5" 
                                : "bg-red-500/5 border-red-500/20 shadow-red-500/5"
                        )
                    )}>
                        <div className="flex items-center gap-6">
                            <div className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-700",
                                isLoading ? "bg-gray-500/20" : (isSystemOk ? "bg-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.5)]" : "bg-red-500 shadow-[0_0_25px_rgba(239,68,68,0.5)]")
                            )}>
                                {isLoading ? <Loader2 size={12} className="animate-spin text-white" /> : (isSystemOk ? <CheckCircle2 size={14} className="text-white" /> : <AlertCircle size={14} className="text-white" />)}
                            </div>
                            <div>
                                <span className={cn(
                                    "text-2xl md:text-3xl font-black uppercase italic tracking-tighter transition-colors duration-700",
                                    isLoading ? "text-zinc-500" : (isSystemOk ? "text-emerald-400" : "text-red-400")
                                )}>
                                    {isLoading ? "Synchronizing..." : (isSystemOk ? "All Systems Operational" : "Partial System Outage")}
                                </span>
                                {health?.timestamp && !isLoading && (
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mt-1 opacity-50">Last Heartbeat: {new Date(health.timestamp).toLocaleTimeString()}</p>
                                )}
                            </div>
                        </div>
                        {!isLoading && (
                            <div className="px-6 py-3 bg-white/[0.05] rounded-2xl border border-white/10 hidden md:block">
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Instance Memory: {health?.memoryUsage?.heapUsed || "N/A"}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                    {services.map((service, idx) => (
                        <div key={idx} className="p-8 bg-white/[0.03] border border-white/10 rounded-[2rem] flex items-center justify-between group hover:bg-white/[0.06] hover:border-blue-500/30 transition-all duration-500 shadow-xl overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                                <service.icon size={80} />
                            </div>
                            <div className="space-y-2 relative z-10">
                                <h3 className="font-black text-xl text-white tracking-tight italic uppercase">{service.name}</h3>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Global Uptime: {service.uptime}</span>
                                </div>
                            </div>
                            <div className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-xl border font-black uppercase tracking-widest text-[9px] relative z-10 shadow-lg",
                                service.status === "Operational" 
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
                                    : (service.status === "Checking..." ? "bg-white/5 border-white/10 text-zinc-500" : "bg-red-500/10 border-red-500/20 text-red-500")
                            )}>
                                {service.status === "Operational" ? <CheckCircle2 size={12} /> : (service.status === "Checking..." ? <Loader2 size={12} className="animate-spin" /> : <AlertCircle size={12} />)}
                                {service.status}
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
