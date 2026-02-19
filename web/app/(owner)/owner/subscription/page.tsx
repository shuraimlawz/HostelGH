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
            const res = await api.post("/subscriptions/upgrade-pro");
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
        onError: (err: any) => toast.error(err.response?.data?.message || "Upgrade failed")
    });

    const downgradeMutation = useMutation({
        mutationFn: () => api.post("/subscriptions/downgrade-free"),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-subscription"] });
            toast.success("Switched to Basic Plan");
        },
        onError: (err: any) => toast.error(err.response?.data?.message || "Downgrade failed")
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                {/* Basic Plan */}
                <div className={cn(
                    "relative transition-all duration-500",
                    !isPro ? "scale-[1.02]" : "opacity-70 hover:opacity-100"
                )}>
                    <div className={cn(
                        "h-full p-10 rounded-[3rem] border-2 transition-all bg-white flex flex-col justify-between",
                        !isPro ? "border-gray-950 shadow-[0_32px_80px_-20px_rgba(0,0,0,0.08)]" : "border-gray-100"
                    )}>
                        <div>
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h3 className="text-3xl font-black text-gray-950 tracking-tight mb-1">Basic</h3>
                                    <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Starting Out</p>
                                </div>
                                {!isPro && (
                                    <div className="bg-gray-950 text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest">Active</div>
                                )}
                            </div>

                            <div className="flex items-baseline gap-1 mb-10">
                                <span className="text-gray-300 font-black text-lg">₵</span>
                                <span className="text-7xl font-black tracking-tighter text-gray-950">0</span>
                                <span className="text-gray-400 font-black ml-2 text-xs uppercase tracking-wider">/forever</span>
                            </div>

                            <ul className="space-y-5">
                                {[
                                    "1 Hostel Listing",
                                    "Standard Dashboard",
                                    "Email Notifications",
                                    "Standard Support"
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-3 text-gray-600">
                                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                            <Check size={10} className="text-gray-500" />
                                        </div>
                                        <span className="font-bold text-sm">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button
                            onClick={() => isPro && downgradeMutation.mutate()}
                            disabled={!isPro || downgradeMutation.isPending}
                            className={cn(
                                "w-full py-5 rounded-[2rem] font-black text-xs tracking-[0.2em] uppercase transition-all mt-10 flex items-center justify-center gap-2",
                                isPro
                                    ? "bg-white text-gray-900 border-2 border-gray-200 hover:border-gray-950"
                                    : "bg-gray-50 text-gray-400 cursor-default"
                            )}
                        >
                            {downgradeMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : null}
                            {isPro ? "Switch to Basic" : "Current Plan"}
                        </button>
                    </div>
                </div>

                {/* PRO Plan */}
                <div className={cn(
                    "relative transition-all duration-500",
                    isPro ? "scale-[1.02]" : "hover:scale-[1.01]"
                )}>
                    {/* Glow */}
                    <div className="absolute -top-12 -right-12 w-56 h-56 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />
                    <div className="absolute -bottom-12 -left-12 w-56 h-56 bg-blue-400/10 rounded-full blur-[80px] pointer-events-none" />

                    <div className={cn(
                        "relative h-full p-10 rounded-[3rem] border-[3px] transition-all duration-500 flex flex-col justify-between overflow-hidden",
                        isPro
                            ? "bg-white border-blue-600 shadow-[0_32px_80px_-20px_rgba(37,99,235,0.25)]"
                            : "bg-gradient-to-br from-white to-blue-50/30 border-gray-100 hover:border-blue-200"
                    )}>
                        {/* Top glow line */}
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />

                        <div>
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-4xl font-black text-gray-950 tracking-tighter">Pro</h3>
                                        <div className="bg-blue-600 text-white px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-200">Popular</div>
                                    </div>
                                    <p className="text-blue-500 font-black text-xs uppercase tracking-widest flex items-center gap-1.5 mt-1">
                                        <TrendingUp size={12} /> Maximum Visibility
                                    </p>
                                </div>
                                {isPro && (
                                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xl shadow-blue-200">
                                        <ShieldCheck size={22} />
                                    </div>
                                )}
                            </div>

                            <div className="flex items-baseline gap-1 mb-10">
                                <span className="text-blue-200 font-black text-lg">₵</span>
                                <span className="text-8xl font-black tracking-tighter text-gray-950">
                                    {billingCycle === "monthly" ? monthlyPrice : yearlyPrice}
                                </span>
                                <div className="ml-2">
                                    <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] leading-tight">
                                        {billingCycle === "monthly" ? "Per Month" : "Per Year"}
                                    </p>
                                    {billingCycle === "yearly" && (
                                        <p className="text-emerald-500 font-black text-[10px] uppercase tracking-tight leading-tight mt-0.5">Save ₵198</p>
                                    )}
                                </div>
                            </div>

                            <ul className="space-y-5">
                                {[
                                    { text: "Unlimited Hostel Listings", icon: Zap, color: "text-blue-500" },
                                    { text: "Featured (Recommended) Badge", icon: Star, color: "text-amber-500" },
                                    { text: "Advanced Analytics & Insights", icon: BarChart3, color: "text-blue-500" },
                                    { text: "Priority Approval & Support", icon: Zap, color: "text-blue-500" },
                                    { text: "SMS & WhatsApp Direct Alerts", icon: CheckCircle2, color: "text-blue-500" }
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-4 text-gray-700">
                                        <div className={cn(
                                            "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border shadow-sm",
                                            isPro ? "bg-blue-50 border-blue-100" : "bg-white border-gray-100"
                                        )}>
                                            <item.icon size={14} className={item.color} />
                                        </div>
                                        <span className="font-bold text-sm">{item.text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="mt-10 space-y-3">
                            <button
                                onClick={() => !isPro && upgradeMutation.mutate()}
                                disabled={isPro || upgradeMutation.isPending}
                                className={cn(
                                    "w-full py-6 rounded-[2rem] font-black text-xs tracking-[0.25em] uppercase transition-all flex items-center justify-center gap-3 group/btn",
                                    isPro
                                        ? "bg-blue-50 text-blue-600 border-2 border-blue-100 cursor-default"
                                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-200 active:scale-[0.98]"
                                )}
                            >
                                {upgradeMutation.isPending ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        {isPro ? "Active Plan ✓" : "Upgrade to Pro"}
                                        {!isPro && <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />}
                                    </>
                                )}
                            </button>
                            <div className="flex items-center justify-center gap-4 py-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <CreditCard size={12} /> Secured by Paystack
                                </p>
                                <div className="h-1 w-1 rounded-full bg-gray-200" />
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Cancel Anytime</p>
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
                                { name: "Hostel Listings", basic: "1 Only", pro: "Unlimited", highlight: true },
                                { name: "Room Management", basic: "Standard", pro: "Advanced", highlight: false },
                                { name: "Featured Badges", basic: "—", pro: "Included", highlight: true },
                                { name: "Analytics Dashboard", basic: "Basic", pro: "Full Access", highlight: false },
                                { name: "Revenue Tracking", basic: "No", pro: "Yes", highlight: true },
                                { name: "Priority Support", basic: "No", pro: "Yes", highlight: false },
                                { name: "WhatsApp Contact Tools", basic: "Included", pro: "Included", highlight: false },
                            ].map((row, i) => (
                                <tr key={i} className="hover:bg-blue-50/20 transition-colors">
                                    <td className="p-8 text-sm font-bold text-gray-700">{row.name}</td>
                                    <td className="p-8 text-sm font-semibold text-center text-gray-400">{row.basic}</td>
                                    <td className={cn(
                                        "p-8 text-sm font-black text-center",
                                        row.highlight ? "text-blue-600" : "text-gray-950"
                                    )}>{row.pro}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
