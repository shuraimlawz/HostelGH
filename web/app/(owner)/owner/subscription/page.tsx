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
    Check
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
    const yearlyPrice = 990; // 2 months free

    return (
        <div className="max-w-6xl mx-auto py-20 px-6">
            <div className="text-center mb-16 space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-widest border border-blue-100 mb-4 animate-bounce">
                    <Trophy size={14} /> Scale Your Business
                </div>
                <div className="flex flex-col items-center text-center space-y-4 max-w-2xl mx-auto">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900">
                        Elevate Your <span className="text-blue-600">Property Management</span>
                    </h1>
                    <p className="text-gray-500 text-base font-medium leading-relaxed">
                        Choose a plan that scales with your portfolio. Get advanced analytics, priority verification, and better visibility for your hostels.
                    </p>
                </div>
                {/* Billing Toggle */}
                <div className="flex items-center justify-center gap-4 mt-12">
                    <span className={cn("text-sm font-bold transition-all", billingCycle === "monthly" ? "text-gray-900" : "text-gray-400")}>Monthly</span>
                    <button
                        onClick={() => setBillingCycle(prev => prev === "monthly" ? "yearly" : "monthly")}
                        className="w-14 h-8 rounded-full bg-gray-100 p-1 relative transition-all border border-gray-200"
                    >
                        <div className={cn(
                            "absolute top-1 w-6 h-6 rounded-full bg-white shadow-md border border-gray-100 transition-all duration-300 transform",
                            billingCycle === "monthly" ? "left-1" : "left-7 bg-blue-600 border-blue-500"
                        )} />
                    </button>
                    <div className="flex items-center gap-2">
                        <span className={cn("text-sm font-bold transition-all", billingCycle === "yearly" ? "text-gray-900" : "text-gray-400")}>Yearly</span>
                        <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tighter shadow-sm border border-emerald-200">2 Months Free</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                {/* Basic Plan */}
                <div className={cn(
                    "relative group h-full transition-all duration-700",
                    !isPro ? "scale-105 z-10" : "opacity-70 grayscale-[0.5] hover:opacity-100 hover:grayscale-0"
                )}>
                    <div className={cn(
                        "h-full p-12 rounded-[4rem] border-2 transition-all duration-500 bg-white/50 backdrop-blur-xl flex flex-col justify-between",
                        !isPro ? "border-gray-900 shadow-[0_32px_80px_-20px_rgba(0,0,0,0.1)]" : "border-gray-100"
                    )}>
                        <div>
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <h3 className="text-3xl font-black text-gray-900 mb-2 tracking-tighter">Basic</h3>
                                    <p className="text-gray-400 font-bold text-sm uppercase tracking-widest leading-none">Starting Out</p>
                                </div>
                                {!isPro && (
                                    <div className="bg-gray-900 text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest">Active</div>
                                )}
                            </div>

                            <div className="flex items-baseline gap-1 mb-12">
                                <span className="text-gray-300 font-bold text-xl">₵</span>
                                <span className="text-7xl font-black tracking-tighter text-gray-900">0</span>
                                <span className="text-gray-400 font-black ml-2 uppercase text-xs tracking-widest">/forever</span>
                            </div>

                            <ul className="space-y-6">
                                {[
                                    { text: "1 Hostel Listing", icon: Check },
                                    { text: "Standard Dashboard", icon: Check },
                                    { text: "Email Notifications", icon: Check },
                                    { text: "Standard Support", icon: Check }
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-4 text-gray-600 group/item">
                                        <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 transition-colors group-hover/item:bg-gray-900 group-hover/item:text-white">
                                            <item.icon size={12} />
                                        </div>
                                        <span className="font-bold text-sm">{item.text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button
                            onClick={() => isPro && downgradeMutation.mutate()}
                            disabled={!isPro || downgradeMutation.isPending}
                            className={cn(
                                "w-full py-6 rounded-[2rem] font-black text-sm tracking-[0.2em] uppercase transition-all mt-12 flex items-center justify-center gap-2",
                                isPro
                                    ? "bg-white text-gray-900 border-2 border-gray-100 hover:border-gray-900"
                                    : "bg-gray-100 text-gray-400 cursor-default"
                            )}
                        >
                            {downgradeMutation.isPending ? <Loader2 className="animate-spin" size={20} /> : (isPro ? "Switch to Basic" : "Current Plan")}
                        </button>
                    </div>
                </div>

                {/* PRO Plan */}
                <div className={cn(
                    "relative group h-full transition-all duration-700",
                    isPro ? "scale-105 z-10" : "hover:scale-[1.02]"
                )}>
                    {/* Glassmorphism Background Decoration */}
                    <div className="absolute -top-12 -right-12 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

                    <div className={cn(
                        "h-full p-12 rounded-[4rem] border-[3px] transition-all duration-500 flex flex-col justify-between relative overflow-hidden",
                        isPro
                            ? "bg-white border-blue-600 shadow-[0_32px_80px_-20px_rgba(37,99,235,0.2)]"
                            : "bg-gradient-to-br from-white to-blue-50/30 border-gray-100 hover:border-blue-200"
                    )}>
                        {/* Glow effect for Pro */}
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />

                        <div>
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-4xl font-black text-gray-900 tracking-tighter">Pro</h3>
                                        <div className="bg-blue-600 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-200">Popular</div>
                                    </div>
                                    <p className="text-blue-500 font-bold text-sm uppercase tracking-widest leading-none flex items-center gap-2">
                                        <TrendingUp size={14} /> Maximum Visibility
                                    </p>
                                </div>
                                {isPro && (
                                    <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xl shadow-blue-200">
                                        <ShieldCheck size={20} />
                                    </div>
                                )}
                            </div>

                            <div className="flex items-baseline gap-1 mb-12">
                                <span className="text-blue-200 font-bold text-xl">₵</span>
                                <span className="text-8xl font-black tracking-tighter text-gray-900">
                                    {billingCycle === "monthly" ? monthlyPrice : yearlyPrice}
                                </span>
                                <div className="ml-3">
                                    <p className="text-gray-400 font-black text-xs uppercase tracking-[0.2em] leading-tight">
                                        {billingCycle === "monthly" ? "Per Month" : "Per Year"}
                                    </p>
                                    <p className="text-emerald-500 font-bold text-[10px] uppercase tracking-tighter leading-tight mt-1">
                                        {billingCycle === "monthly" ? "Billed Monthly" : "Billed Annually"}
                                    </p>
                                </div>
                            </div>

                            <ul className="grid grid-cols-1 gap-6">
                                {[
                                    { text: "Unlimited Hostel Listings", icon: Zap, color: "text-blue-500" },
                                    { text: "Featured (Recommended) Badge", icon: Trophy, color: "text-amber-500" },
                                    { text: "Advanced Analytics & Insights", icon: BarChart3, color: "text-blue-500" },
                                    { text: "Priority Approval & Support", icon: Zap, color: "text-blue-500" },
                                    { text: "SMS & WhatsApp Direct Alerts", icon: Zap, color: "text-blue-500" }
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-5 text-gray-700 group/pro-item">
                                        <div className={cn(
                                            "w-8 h-8 rounded-2xl flex items-center justify-center transition-all shadow-sm border",
                                            isPro ? "bg-blue-50 border-blue-100 text-blue-600" : "bg-white border-gray-100 group-hover/pro-item:border-blue-200"
                                        )}>
                                            <item.icon size={16} className={item.color} />
                                        </div>
                                        <span className="font-bold text-sm tracking-tight">{item.text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="mt-12 space-y-4">
                            <button
                                onClick={() => !isPro && upgradeMutation.mutate()}
                                disabled={isPro || upgradeMutation.isPending}
                                className={cn(
                                    "w-full py-7 rounded-[2.5rem] font-black text-sm tracking-[0.3em] uppercase transition-all flex items-center justify-center gap-3 overflow-hidden group/btn relative",
                                    isPro
                                        ? "bg-blue-50 text-blue-600 border-2 border-blue-100 cursor-default"
                                        : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] active:scale-[0.98]"
                                )}
                            >
                                {upgradeMutation.isPending ? (
                                    <Loader2 className="animate-spin" size={24} />
                                ) : (
                                    <>
                                        {isPro ? "Active Plan" : "Upgrade to Pro"}
                                        {!isPro && <ArrowRight size={20} className="transition-transform group-hover/btn:translate-x-2" />}
                                    </>
                                )}
                            </button>
                            <div className="flex items-center justify-center gap-4 py-2">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <CreditCard size={12} /> Secure via Paystack
                                </p>
                                <div className="h-1 w-1 rounded-full bg-gray-200" />
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Cancel Anytime</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Comparison Section (Optional for more "ChatGPT" feel) */}
            <div className="mt-40 max-w-4xl mx-auto border-t border-gray-100 pt-20">
                <h2 className="text-3xl font-black tracking-tighter text-center mb-16">Compare features</h2>
                <div className="overflow-hidden rounded-[2rem] border border-gray-100 bg-white/50 backdrop-blur-sm shadow-xl shadow-gray-100/50">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="p-8 font-black text-xs uppercase tracking-widest text-gray-500">Feature</th>
                                <th className="p-8 font-black text-xs uppercase tracking-widest text-gray-500 text-center">Basic</th>
                                <th className="p-8 font-black text-xs uppercase tracking-widest text-blue-500 text-center">Pro</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {[
                                { name: "Hostel Limit", basic: "1 Hostel", pro: "Unlimited", highlight: true },
                                { name: "Room Management", basic: "Basic", pro: "Advanced", highlight: false },
                                { name: "Featured Badges", basic: "-", pro: "Included", highlight: true },
                                { name: "Analytics Dashboard", basic: "Limited", pro: "Full Access", highlight: false },
                                { name: "Revenue Tracking", basic: "No", pro: "Yes", highlight: true },
                                { name: "Custom Branding", basic: "No", pro: "Yes", highlight: false },
                                { name: "Direct WhatsApp Line", basic: "Included", pro: "Included", highlight: false },
                            ].map((row, i) => (
                                <tr key={i} className="hover:bg-blue-50/20 transition-colors">
                                    <td className="p-8 text-sm font-bold text-gray-700">{row.name}</td>
                                    <td className="p-8 text-sm font-semibold text-center text-gray-400">{row.basic}</td>
                                    <td className={cn(
                                        "p-8 text-sm font-black text-center",
                                        row.highlight ? "text-blue-600" : "text-gray-900"
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
