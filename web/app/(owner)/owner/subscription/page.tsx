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
    Star
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
                toast.success("Successfully upgraded to PRO!");
            }
        },
        onError: (err: any) => toast.error(err.message)
    });

    const downgradeMutation = useMutation({
        mutationFn: () => api.post("/subscriptions/downgrade-free"),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-subscription"] });
            toast.success("Switched to Basic Plan");
        },
        onError: (err: any) => toast.error(err.message)
    });

    if (isLoading) return (
        <div className="flex h-[60vh] items-center justify-center">
            <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
    );

    const isPro = sub?.plan === "PRO";
    const monthlyPrice = 99;
    const yearlyPrice = 990;

    return (
        <div className="max-w-5xl mx-auto py-10 pb-20">
            {/* Header */}
            <div className="text-center mb-16 space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] border border-blue-100 mb-4">
                    <Trophy size={14} /> Scale Your Business
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-950 leading-none">
                    Elevate Your <br /><span className="text-blue-600">Property Management</span>
                </h1>
                <p className="text-gray-500 text-base font-medium leading-relaxed max-w-xl mx-auto">
                    Choose a plan that scales with your portfolio. Get advanced analytics, priority verification, and better visibility for your hostels.
                </p>

                {/* Billing Toggle */}
                <div className="flex items-center justify-center gap-4 mt-10">
                    <span className={cn("text-sm font-black transition-colors", billingCycle === "monthly" ? "text-gray-950" : "text-gray-400")}>Monthly</span>
                    <button
                        onClick={() => setBillingCycle(prev => prev === "monthly" ? "yearly" : "monthly")}
                        className={cn(
                            "w-14 h-8 rounded-full relative transition-all border",
                            billingCycle === "yearly" ? "bg-blue-600 border-blue-600" : "bg-gray-100 border-gray-200"
                        )}
                    >
                        <div className={cn(
                            "absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300",
                            billingCycle === "monthly" ? "left-1" : "left-7"
                        )} />
                    </button>
                    <div className="flex items-center gap-2">
                        <span className={cn("text-sm font-black transition-colors", billingCycle === "yearly" ? "text-gray-950" : "text-gray-400")}>Yearly</span>
                        <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tight border border-emerald-200">2 Months Free</span>
                    </div>
                </div>
            </div>

            {/* Plan Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto items-stretch">
                {/* Basic Plan */}
                <div className={cn(
                    "relative group",
                    !isPro ? "scale-100" : "opacity-80 hover:opacity-100 transition-all"
                )}>
                    <div className={cn(
                        "h-full p-8 rounded-[2.5rem] border-2 transition-all bg-card/50 backdrop-blur-md flex flex-col justify-between",
                        !isPro ? "border-foreground shadow-2xl shadow-foreground/5" : "border-border"
                    )}>
                        <div>
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-2xl font-black text-foreground tracking-tight mb-0.5">Basic</h3>
                                    <p className="text-muted-foreground font-black text-[9px] uppercase tracking-widest">Entry Tier</p>
                                </div>
                                {!isPro && (
                                    <div className="bg-foreground text-background px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest">Active</div>
                                )}
                            </div>

                            <div className="flex items-baseline gap-1 mb-8">
                                <span className="text-muted-foreground font-black text-base">₵</span>
                                <span className="text-5xl font-black tracking-tighter text-foreground">0</span>
                                <span className="text-muted-foreground font-black ml-1.5 text-[10px] uppercase tracking-wider">/mo</span>
                            </div>

                            <ul className="space-y-4">
                                {[
                                    "3 Hostel Listings",
                                    "Standard Analytics",
                                    "Direct WhatsApp",
                                    "Email Support"
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-3 text-foreground/80">
                                        <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center shrink-0">
                                            <Check size={9} className="text-muted-foreground" />
                                        </div>
                                        <span className="font-bold text-xs">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button
                            onClick={() => isPro && downgradeMutation.mutate()}
                            disabled={!isPro || downgradeMutation.isPending}
                            className={cn(
                                "w-full py-4 rounded-2xl font-black text-[10px] tracking-[0.2em] uppercase transition-all mt-8 flex items-center justify-center gap-2",
                                isPro
                                    ? "bg-card text-foreground border border-border hover:border-foreground"
                                    : "bg-muted text-muted-foreground cursor-default"
                            )}
                        >
                            {downgradeMutation.isPending ? <Loader2 className="animate-spin" size={14} /> : null}
                            {isPro ? "Switch to Basic" : "Current Protocol"}
                        </button>
                    </div>
                </div>

                {/* PRO Plan */}
                <div className={cn(
                    "relative group",
                    isPro ? "scale-100" : "hover:scale-[1.01] transition-all"
                )}>
                    {/* Glow effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-[2.6rem] blur opacity-10 group-hover:opacity-20 transition duration-500" />

                    <div className={cn(
                        "relative h-full p-8 rounded-[2.5rem] border-2 transition-all duration-500 flex flex-col justify-between overflow-hidden",
                        isPro
                            ? "bg-background border-primary shadow-2xl shadow-primary/10"
                            : "bg-background/80 backdrop-blur-xl border-border hover:border-primary/50"
                    )}>
                        <div>
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <h3 className="text-2xl font-black text-foreground tracking-tight">Pro</h3>
                                        <div className="bg-primary text-background px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest">Popular</div>
                                    </div>
                                    <p className="text-primary font-black text-[9px] uppercase tracking-widest flex items-center gap-1.5">
                                        <TrendingUp size={10} /> Scaling Fast
                                    </p>
                                </div>
                                {isPro && (
                                    <div className="w-10 h-10 rounded-xl bg-primary text-background flex items-center justify-center shadow-lg shadow-primary/20">
                                        <ShieldCheck size={18} />
                                    </div>
                                )}
                            </div>

                            <div className="flex items-baseline gap-1 mb-8">
                                <span className="text-primary/50 font-black text-base">₵</span>
                                <span className="text-6xl font-black tracking-tighter text-foreground">
                                    {billingCycle === "monthly" ? monthlyPrice : yearlyPrice}
                                </span>
                                <div className="ml-1.5 text-left">
                                    <p className="text-muted-foreground font-black text-[9px] uppercase tracking-widest leading-tight">
                                        {billingCycle === "monthly" ? "Month" : "Year"}
                                    </p>
                                    {billingCycle === "yearly" && (
                                        <p className="text-emerald-500 font-black text-[9px] uppercase tracking-tight leading-tight mt-0.5">Save 20%</p>
                                    )}
                                </div>
                            </div>

                            <ul className="space-y-4">
                                {[
                                    { text: "Unlimited Hostels", icon: Zap, color: "text-primary" },
                                    { text: "Featured Badging", icon: Star, color: "text-amber-500" },
                                    { text: "Pro Analytics Hub", icon: BarChart3, color: "text-primary" },
                                    { text: "Priority Verification", icon: ShieldCheck, color: "text-primary" },
                                    { text: "Smart Alert Matrix", icon: CheckCircle2, color: "text-primary" }
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-3 text-foreground/90">
                                        <div className={cn(
                                            "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border border-border bg-card shadow-sm",
                                        )}>
                                            <item.icon size={11} className={item.color} />
                                        </div>
                                        <span className="font-bold text-xs">{item.text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="mt-8 space-y-3">
                            <button
                                onClick={() => !isPro && upgradeMutation.mutate()}
                                disabled={isPro || upgradeMutation.isPending}
                                className={cn(
                                    "w-full py-4 rounded-2xl font-black text-[10px] tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-3 group/btn",
                                    isPro
                                        ? "bg-primary/10 text-primary cursor-default border border-primary/20"
                                        : "bg-primary text-background hover:opacity-90 shadow-xl shadow-primary/10"
                                )}
                            >
                                {upgradeMutation.isPending ? (
                                    <Loader2 className="animate-spin" size={16} />
                                ) : (
                                    <>
                                        {isPro ? "Protocol Active ✓" : "Initialize Upgrade"}
                                        {!isPro && <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />}
                                    </>
                                )}
                            </button>
                            <div className="flex items-center justify-center gap-3 py-1">
                                <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                    <CreditCard size={10} /> Secured Logic
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feature Comparison Table */}
            <div className="mt-24 border-t border-gray-100 pt-16">
                <h2 className="text-3xl font-black tracking-tighter text-center text-gray-950 mb-10">Compare plans</h2>
                <div className="overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-lg shadow-gray-50">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="p-8 font-black text-[10px] uppercase tracking-widest text-gray-500">Feature</th>
                                <th className="p-8 font-black text-[10px] uppercase tracking-widest text-gray-500 text-center">Basic</th>
                                <th className="p-8 font-black text-[10px] uppercase tracking-widest text-blue-600 text-center">Pro</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {[
                                { name: "Hostel Listings", basic: "3 Only", pro: "Unlimited", highlight: true },
                                { name: "Room Management", basic: "Standard", pro: "Advanced", highlight: false },
                                { name: "Featured Badges", basic: "Not Included", pro: "Included", highlight: true },
                                { name: "Analytics Dashboard", basic: "Basic", pro: "Full Access", highlight: false },
                                { name: "Revenue Tracking", basic: "No", pro: "Yes", highlight: true },
                                { name: "Priority Support", basic: "No", pro: "Yes", highlight: false },
                                { name: "WhatsApp Contact Tools", basic: "Not Included", pro: "Included", highlight: true },
                            ].map((item, i) => (
                                <tr key={i} className="hover:bg-blue-50/20 transition-colors">
                                    <td className="p-8 text-sm font-bold text-gray-700">{item.name}</td>
                                    <td className="p-8 text-sm font-semibold text-center text-gray-400">{item.basic}</td>
                                    <td className={cn(
                                        "p-8 text-sm font-black text-center",
                                        item.highlight ? "text-blue-600" : "text-gray-950"
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
