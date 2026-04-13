"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
    CreditCard,
    CheckCircle2,
    Zap,
    ShieldCheck,
    TrendingUp,
    BarChart3,
    Loader2,
    ArrowRight,
    Trophy,
    Check,
    Star,
    Activity,
    Layers,
    Target
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SubscriptionPage() {
    const queryClient = useQueryClient();
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

    const { data: sub, isLoading } = useQuery({
        queryKey: ["my-subscription"],
        queryFn: async () => {
            const res = await api.get("/subscriptions/my");
            return res.data;
        }
    });

    const upgradeMutation = useMutation({
        mutationFn: async () => {
            const res = await api.post("/subscriptions/upgrade-pro", { billingCycle });
            return res.data;
        },
        onSuccess: (data) => {
            if (data.authorization_url) {
                window.location.href = data.authorization_url;
            } else {
                queryClient.invalidateQueries({ queryKey: ["my-subscription"] });
                toast.success("UPGRADE SUCCESSFUL", { description: "Proprietor PRO engaged." });
            }
        },
        onError: (err: any) => toast.error("UPGRADE ERROR", { description: err.message })
    });

    const downgradeMutation = useMutation({
        mutationFn: () => api.post("/subscriptions/downgrade-free"),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-subscription"] });
            toast.success("DOWNGRADE COMPLETE", { description: "Switched to Basic Protocol." });
        },
        onError: (err: any) => toast.error("PROTOCOL SHIFT ERROR", { description: err.message })
    });

    if (isLoading) return (
        <div className="flex h-[80vh] items-center justify-center bg-black/5 rounded-[3rem]">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-blue-500" size={40} />
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.5em]">Initialising Growth Matrix...</p>
            </div>
        </div>
    );

    const isPro = sub?.plan === "PRO";
    const monthlyPrice = 99;
    const yearlyPrice = 990;

    return (
        <div className="max-w-[1400px] mx-auto space-y-16 pb-24">
            {/* Premium Hero Section */}
            <div className="text-center space-y-8 animate-in fade-in slide-in-from-top-8 duration-1000">
                <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-[0.4em] border border-blue-500/20 mb-4 backdrop-blur-md">
                    <Trophy size={14} className="animate-pulse" /> NETWORK SCALE PROTOCOL
                </div>
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-foreground uppercase italic leading-[0.85] max-w-4xl mx-auto">
                    Capital <br /><span className="text-blue-600 NOT-italic opacity-40">Growth Matrix .</span>
                </h1>
                <p className="text-muted-foreground text-[11px] font-bold uppercase tracking-[0.2em] max-w-xl mx-auto leading-relaxed italic">
                    Optimising your asset portfolio with advanced network triggers, priority indexing, and real-time revenue analytics.
                </p>

                {/* High-Contrast Billing Toggle */}
                <div className="flex items-center justify-center gap-8 mt-12 bg-muted/30 w-fit mx-auto p-2 rounded-full border border-muted group transition-all hover:bg-muted/50">
                    <button 
                        onClick={() => setBillingCycle("monthly")}
                        className={cn(
                            "px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                            billingCycle === "monthly" ? "bg-black text-white shadow-xl" : "text-muted-foreground hover:text-black"
                        )}
                    >
                        Monthly Sync
                    </button>
                    <button 
                         onClick={() => setBillingCycle("yearly")}
                         className={cn(
                            "px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all relative flex items-center gap-2",
                            billingCycle === "yearly" ? "bg-black text-white shadow-xl" : "text-muted-foreground hover:text-black"
                        )}
                    >
                        Yearly Engagement
                        <span className="bg-blue-600 text-white px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tight shadow-lg shadow-blue-500/20">2 MONTHS FREE</span>
                    </button>
                </div>
            </div>

            {/* Premium Plan Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto items-stretch">
                {/* Basic Plan Entry */}
                <div className={cn(
                    "relative group transition-all duration-700",
                    !isPro ? "scale-100" : "opacity-40 hover:opacity-100"
                )}>
                    <div className={cn(
                        "h-full p-12 rounded-[3.5rem] border transition-all bg-white flex flex-col justify-between overflow-hidden relative",
                        !isPro ? "border-black shadow-2xl shadow-black/5" : "border-muted"
                    )}>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-10">
                                <div className="space-y-1">
                                    <h3 className="text-3xl font-black text-foreground uppercase italic tracking-tighter leading-none">Basic <br/> Tier</h3>
                                    <p className="text-muted-foreground font-black text-[9px] uppercase tracking-[0.4em]">Core Interface</p>
                                </div>
                                {!isPro && (
                                    <div className="bg-black text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                                        <Activity size={12} className="text-blue-500 animate-pulse" /> LIVE
                                    </div>
                                )}
                            </div>

                            <div className="flex items-baseline gap-2 mb-12">
                                <span className="text-muted-foreground font-black text-lg font-mono">GH₵</span>
                                <span className="text-7xl font-black tracking-tighter text-foreground leading-none">0</span>
                                <span className="text-muted-foreground font-black text-[12px] uppercase tracking-widest">/SYNC</span>
                            </div>

                            <ul className="space-y-5">
                                {[
                                    { text: "3 Active Asset Listings", icon: Layers },
                                    { text: "Standard Matrix Tools", icon: BarChart3 },
                                    { text: "Direct Network Sync", icon: Zap },
                                    { text: "Priority Email Trace", icon: Target }
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-4 text-foreground/70">
                                        <div className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                            <item.icon size={11} className="text-muted-foreground" />
                                        </div>
                                        <span className="font-black text-[11px] uppercase tracking-widest leading-none">{item.text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button
                            onClick={() => isPro && downgradeMutation.mutate()}
                            disabled={!isPro || downgradeMutation.isPending}
                            className={cn(
                                "w-full h-20 rounded-[1.8rem] font-black text-[11px] tracking-[0.3em] uppercase transition-all mt-12 flex items-center justify-center gap-3 relative overflow-hidden group/btn",
                                isPro
                                    ? "bg-white text-black border-2 border-black hover:bg-black hover:text-white"
                                    : "bg-muted text-muted-foreground cursor-default"
                            )}
                        >
                            {downgradeMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : null}
                            {isPro ? "RE-INDEX TO BASIC" : "PROTOCOL ACTIVE"}
                        </button>
                    </div>
                </div>

                {/* PRO Plan Matrix */}
                <div className={cn(
                    "relative group transition-all duration-700",
                    isPro ? "scale-100" : "hover:scale-[1.02]"
                )}>
                    {/* Pulsing Aesthetic Layer */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-[3.6rem] blur-2xl opacity-0 group-hover:opacity-100 transition duration-1000" />

                    <div className={cn(
                        "relative h-full p-12 rounded-[3.5rem] border-2 transition-all duration-700 flex flex-col justify-between overflow-hidden bg-black",
                        isPro ? "border-blue-600 shadow-[0_0_80px_-20px_rgba(37,99,235,0.3)]" : "border-white/10"
                    )}>
                        <div className="relative z-10 text-white">
                            <div className="flex justify-between items-start mb-10">
                                <div className="space-y-1">
                                    <h3 className="text-3xl font-black uppercase italic tracking-tighter leading-none">Proprietor <br/> PRO</h3>
                                    <p className="text-blue-500 font-black text-[9px] uppercase tracking-[0.4em] flex items-center gap-2">
                                        <TrendingUp size={12} /> GLOBAL SCALE Engaged
                                    </p>
                                </div>
                                {isPro ? (
                                    <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-2xl shadow-blue-600/40 animate-in zoom-in duration-500 group-hover:rotate-12 transition-transform">
                                        <ShieldCheck size={28} />
                                    </div>
                                ) : (
                                    <div className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.3em] shadow-lg shadow-blue-600/20">PREMIUM</div>
                                )}
                            </div>

                            <div className="flex items-baseline gap-3 mb-12">
                                <span className="text-blue-500/50 font-black text-2xl font-mono">GH₵</span>
                                <span className="text-8xl font-black tracking-tighter text-white leading-none">
                                    {billingCycle === "monthly" ? monthlyPrice : yearlyPrice}
                                </span>
                                <div className="ml-2 text-left">
                                    <p className="text-white/40 font-black text-[10px] uppercase tracking-[0.3em] leading-tight">
                                        PER {billingCycle === "monthly" ? "SYNC" : "CYCLE"}
                                    </p>
                                    {billingCycle === "yearly" && (
                                        <p className="text-emerald-500 font-black text-[10px] uppercase tracking-tighter leading-tight mt-1 animate-pulse italic">SAVE 20% TOTAL</p>
                                    )}
                                </div>
                            </div>

                            <ul className="space-y-6">
                                {[
                                    { text: "Unlimited Asset Deployments", icon: Zap, color: "text-blue-500" },
                                    { text: "Network Matrix Analytics", icon: BarChart3, color: "text-blue-500" },
                                    { text: "Featured Badge Indexing", icon: Star, color: "text-amber-400 font-black" },
                                    { text: "Priority Asset Audit", icon: ShieldCheck, color: "text-blue-500" },
                                    { text: "Smart Operational Alerts", icon: Activity, color: "text-blue-500" }
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-5 text-white/90">
                                        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border border-white/10 bg-white/5 backdrop-blur-md group-hover:scale-110 transition-transform duration-500">
                                            <item.icon size={14} className={item.color} />
                                        </div>
                                        <span className="font-black text-[12px] uppercase tracking-[0.15em] leading-none italic">{item.text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="mt-12 space-y-4 relative z-10">
                            <button
                                onClick={() => !isPro && upgradeMutation.mutate()}
                                disabled={isPro || upgradeMutation.isPending}
                                className={cn(
                                    "w-full h-20 rounded-[1.8rem] font-black text-[11px] tracking-[0.4em] uppercase transition-all duration-500 flex items-center justify-center gap-4 group/btn",
                                    isPro
                                        ? "bg-blue-600/10 text-blue-500 cursor-default border border-blue-600/20"
                                        : "bg-blue-600 text-white hover:bg-white hover:text-black hover:shadow-[0_0_80px_-20px_rgba(255,255,255,0.4)] shadow-2xl shadow-blue-900/40"
                                )}
                            >
                                {upgradeMutation.isPending ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        {isPro ? "PROTOCOL ACTIVE ✓" : "ENGAGE PRO SYSTEM"}
                                        {!isPro && <ArrowRight size={18} className="group-hover/btn:translate-x-3 transition-transform duration-500" />}
                                    </>
                                )}
                            </button>
                            <p className="text-center text-[9px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center justify-center gap-3 italic">
                                <CreditCard size={12} className="text-blue-500" /> SECURED SETTLEMENT LOGIC engaged
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Matrix Comparison Section */}
            <div className="mt-32 pt-16 border-t border-muted animate-in fade-in duration-1000">
                <h2 className="text-4xl font-black tracking-tighter text-center text-foreground uppercase italic mb-16">Compare <span className="text-blue-600 NOT-italic opacity-40">Matrix .</span></h2>
                <div className="overflow-hidden rounded-[3.5rem] border border-muted bg-white shadow-2xl relative">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-black text-white">
                                <th className="p-10 font-black text-[11px] uppercase tracking-[0.4em] italic leading-none">Operational Feature</th>
                                <th className="p-10 font-black text-[11px] uppercase tracking-[0.4em] italic text-center">Basic Tier</th>
                                <th className="p-10 font-black text-[11px] uppercase tracking-[0.4em] italic text-center text-blue-500">PRO Matrix</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-muted/30">
                            {[
                                { name: "Asset Deployments", basic: "3 Only", pro: "Unlimited Stacks", highlight: true },
                                { name: "Inventory Management", basic: "Standard", pro: "Advanced Triggers", highlight: false },
                                { name: "Premium Identity Badge", basic: "Not Included", pro: "Global Sync", highlight: true },
                                { name: "Multi-User Access", basic: "Restricted", pro: "Full Delegation", highlight: false },
                                { name: "Real-time Drift Analytics", basic: "Basic", pro: "Pro Visualiser", highlight: true },
                                { name: "Priority Support Bridge", basic: "L1 Trace", pro: "L3 Direct Tunnel", highlight: false },
                                { name: "Operational SMS Alerts", basic: "In-App Only", pro: "Global Push", highlight: true },
                            ].map((item, i) => (
                                <tr key={i} className="hover:bg-muted/10 transition-colors group/row">
                                    <td className="p-10 text-[12px] font-black text-foreground uppercase tracking-widest italic">{item.name}</td>
                                    <td className="p-10 text-[11px] font-bold text-center text-muted-foreground uppercase">{item.basic}</td>
                                    <td className={cn(
                                        "p-10 text-[12px] font-black text-center uppercase tracking-widest italic",
                                        item.highlight ? "text-blue-600" : "text-foreground"
                                    )}>{item.pro}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
