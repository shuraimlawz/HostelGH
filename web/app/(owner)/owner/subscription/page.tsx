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
    Target,
    Shield
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
                toast.success("Upgrade successful! Proprietor Pro system engaged.");
            }
        },
        onError: (err: any) => toast.error("Upgrade failure: " + err.message)
    });

    const downgradeMutation = useMutation({
        mutationFn: () => api.post("/subscriptions/downgrade-free"),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-subscription"] });
            toast.success("Downgrade successful. Switched to Basic protocol.");
        },
        onError: (err: any) => toast.error("Downgrade failure: " + err.message)
    });

    if (isLoading) return (
        <div className="flex h-[60vh] items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-center">
                <Loader2 className="animate-spin text-blue-600" size={32} />
                <p className="text-sm font-medium text-gray-400">Syncing growth matrix...</p>
            </div>
        </div>
    );

    const isPro = sub?.plan === "PRO";
    const monthlyPrice = 99;
    const yearlyPrice = 990;

    return (
        <div className="max-w-[1200px] mx-auto space-y-12 pb-20 pt-4 px-4">
            {/* Header Section */}
            <div className="text-center space-y-6 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-widest border border-blue-100 mb-2">
                    <Trophy size={14} /> Network Scale Protocol
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 max-w-4xl mx-auto">
                    Proprietor Growth Matrix
                </h1>
                <p className="text-gray-500 text-sm max-w-2xl mx-auto leading-relaxed">
                    Optimize your asset portfolio with advanced network triggers, priority indexing, and real-time revenue analytics.
                </p>

                {/* Billing Toggle */}
                <div className="flex items-center justify-center pt-4">
                    <div className="inline-flex items-center p-1 bg-gray-50 rounded-xl border border-gray-100">
                        <button 
                            onClick={() => setBillingCycle("monthly")}
                            className={cn(
                                "h-10 px-6 rounded-lg text-xs font-bold transition-all",
                                billingCycle === "monthly" ? "bg-white text-gray-900 shadow-sm border border-gray-100" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            Monthly
                        </button>
                        <button 
                             onClick={() => setBillingCycle("yearly")}
                             className={cn(
                                "h-10 px-6 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                                billingCycle === "yearly" ? "bg-white text-gray-900 shadow-sm border border-gray-100" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            Yearly
                            <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-tight">Save 20%</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Plan Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Basic Plan */}
                <div className={cn(
                    "relative group flex flex-col bg-white rounded-2xl border p-8 transition-all duration-300",
                    !isPro ? "border-gray-900 ring-1 ring-gray-900 shadow-xl" : "border-gray-100 opacity-60 hover:opacity-100"
                )}>
                    <div className="space-y-6 flex-1">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold text-gray-900 tracking-tight">Standard Tier</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Entry Level</p>
                            </div>
                            {!isPro && (
                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-tight shadow-none">
                                    Current
                                </Badge>
                            )}
                        </div>

                        <div className="flex items-baseline gap-1.5">
                            <span className="text-sm font-bold text-gray-400">GHS</span>
                            <span className="text-4xl font-bold text-gray-900 tracking-tight">0</span>
                            <span className="text-xs font-bold text-gray-400">/mo</span>
                        </div>

                        <ul className="space-y-4 pt-4 border-t border-gray-50">
                            {[
                                { text: "3 Active Property Listings", icon: Layers },
                                { text: "Standard Management Tools", icon: BarChart3 },
                                { text: "Basic Occupancy Sync", icon: Zap },
                                { text: "Community Support Access", icon: Target }
                            ].map((item, idx) => (
                                <li key={idx} className="flex items-center gap-3 text-gray-600">
                                    <div className="w-5 h-5 rounded-md bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                                        <item.icon size={12} className="text-gray-400" />
                                    </div>
                                    <span className="text-xs font-semibold">{item.text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <button
                        onClick={() => isPro && downgradeMutation.mutate()}
                        disabled={!isPro || downgradeMutation.isPending}
                        className={cn(
                            "w-full h-12 rounded-xl font-bold text-xs uppercase tracking-widest transition-all mt-10 flex items-center justify-center gap-2",
                            isPro
                                ? "bg-white text-gray-900 border border-gray-200 hover:bg-gray-50"
                                : "bg-gray-100 text-gray-400 cursor-default"
                        )}
                    >
                        {downgradeMutation.isPending && <Loader2 className="animate-spin" size={14} />}
                        {isPro ? "Switch to Basic" : "Active Protocol"}
                    </button>
                </div>

                {/* PRO Plan */}
                <div className={cn(
                    "relative group flex flex-col bg-gray-900 text-white rounded-2xl p-8 transition-all duration-300 shadow-2xl shadow-blue-900/10",
                    isPro ? "ring-2 ring-blue-600 ring-offset-4 ring-offset-white" : "border border-gray-800"
                )}>
                    {/* Visual Highlights */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                    
                    <div className="space-y-6 flex-1 relative z-10">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold tracking-tight">Proprietor PRO</h3>
                                <div className="flex items-center gap-2">
                                    <Zap size={10} className="text-blue-400 fill-current" />
                                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Global Scale Hub</p>
                                </div>
                            </div>
                            {isPro ? (
                                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                    <Shield size={20} />
                                </div>
                            ) : (
                                <Badge className="bg-blue-600 text-white border-blue-500 px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-tight shadow-none">
                                    Most Popular
                                </Badge>
                            )}
                        </div>

                        <div className="flex items-baseline gap-1.5">
                            <span className="text-sm font-bold text-blue-400">GHS</span>
                            <span className="text-4xl font-bold tracking-tight">
                                {billingCycle === "monthly" ? monthlyPrice : (yearlyPrice / 12).toFixed(0)}
                            </span>
                            <span className="text-xs font-bold text-gray-400">/mo</span>
                        </div>

                        <ul className="space-y-4 pt-4 border-t border-white/5">
                            {[
                                { text: "Unlimited Property Stacks", icon: Zap, color: "text-blue-400" },
                                { text: "Advanced Performance Analytics", icon: BarChart3, color: "text-blue-400" },
                                { text: "Featured Marketplace Indexing", icon: Star, color: "text-amber-400" },
                                { text: "Priority Compliance Auditing", icon: ShieldCheck, color: "text-blue-400" },
                                { text: "Real-time Signal Alerts", icon: Activity, color: "text-blue-400" }
                            ].map((item, idx) => (
                                <li key={idx} className="flex items-center gap-3 text-gray-300">
                                    <div className="w-5 h-5 rounded-md bg-white/5 flex items-center justify-center shrink-0 border border-white/10 group-hover:scale-110 transition-transform">
                                        <item.icon size={12} className={item.color} />
                                    </div>
                                    <span className="text-xs font-semibold">{item.text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <button
                        onClick={() => !isPro && upgradeMutation.mutate()}
                        disabled={isPro || upgradeMutation.isPending}
                        className={cn(
                            "w-full h-12 rounded-xl font-bold text-xs uppercase tracking-widest transition-all mt-10 flex items-center justify-center gap-2 relative z-10 shadow-lg shadow-blue-900/20",
                            isPro
                                ? "bg-white/10 text-blue-400 border border-white/10 cursor-default"
                                : "bg-blue-600 text-white hover:bg-white hover:text-gray-900"
                        )}
                    >
                        {upgradeMutation.isPending && <Loader2 className="animate-spin text-white" size={14} />}
                        {isPro ? "PRO Active" : "Upgrade to PRO"}
                        {!isPro && !upgradeMutation.isPending && <ArrowRight size={14} />}
                    </button>
                    
                    <p className="mt-4 text-center text-[9px] font-bold text-gray-500 uppercase tracking-widest flex items-center justify-center gap-2">
                        <CreditCard size={10} className="text-blue-500" /> Secure Settlement Logic
                    </p>
                </div>
            </div>

            {/* Comparison Table */}
            <div className="pt-20">
                <div className="text-center space-y-2 mb-10">
                    <h2 className="text-2xl font-bold text-gray-900">Feature Comparison</h2>
                    <p className="text-sm text-gray-500">A detailed breakdown of the operational metrics per tier.</p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100">Protocol Feature</th>
                                <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center border-b border-gray-100">Standard</th>
                                <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-blue-600 text-center border-b border-gray-100">Proprietor PRO</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {[
                                { name: "Property Listings", basic: "Up to 3", pro: "Unlimited", highlight: true },
                                { name: "Operational Controls", basic: "Standard", pro: "Advanced Triggers", highlight: false },
                                { name: "Featured Badging", basic: "No", pro: "Yes, Priority", highlight: true },
                                { name: "Manager Permissions", basic: "Single User", pro: "Multi-Team Sync", highlight: false },
                                { name: "Market Analytics", basic: "Daily Digest", pro: "Real-time Matrix", highlight: true },
                                { name: "Support Tier", basic: "Community", pro: "Direct Command", highlight: false },
                            ].map((item, i) => (
                                <tr key={i} className="hover:bg-gray-50/30 transition-colors">
                                    <td className="p-5 text-sm font-semibold text-gray-700">{item.name}</td>
                                    <td className="p-5 text-xs font-semibold text-center text-gray-400">{item.basic}</td>
                                    <td className={cn(
                                        "p-5 text-sm font-bold text-center",
                                        item.highlight ? "text-blue-600" : "text-gray-900"
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

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800", className)}>
            {children}
        </span>
    );
}
