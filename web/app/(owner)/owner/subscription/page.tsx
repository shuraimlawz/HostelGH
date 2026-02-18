"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
    CreditCard,
    CheckCircle2,
    Zap,
    Star,
    Globe,
    FileText,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SubscriptionPage() {
    const queryClient = useQueryClient();

    const { data: sub, isLoading } = useQuery({
        queryKey: ["my-subscription"],
        queryFn: async () => {
            const res = await api.get("/subscriptions/my");
            return res.data;
        }
    });

    const upgradeMutation = useMutation({
        mutationFn: () => api.post("/subscriptions/upgrade-pro"),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-subscription"] });
            toast.success("Successfully upgraded to PRO!");
        },
        onError: (err: any) => toast.error(err.response?.data?.message || "Upgrade failed")
    });

    if (isLoading) return (
        <div className="flex h-[60vh] items-center justify-center">
            <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
    );

    const isPro = sub?.plan === "PRO";

    return (
        <div className="max-w-4xl mx-auto py-12 px-6">
            <div className="mb-12">
                <h1 className="text-4xl font-black tracking-tight mb-2">Subscription Plan</h1>
                <p className="text-gray-500 text-lg">Manage your business tier and unlock premium growth features.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Basic Plan */}
                <div className={cn(
                    "bg-white border-2 rounded-[3rem] p-10 flex flex-col relative overflow-hidden transition-all duration-500",
                    !isPro ? "border-black shadow-2xl shadow-gray-200" : "border-gray-100 opacity-60"
                )}>
                    {!isPro && (
                        <div className="absolute top-8 right-8">
                            <CheckCircle2 className="text-black" size={24} />
                        </div>
                    )}
                    <h3 className="text-2xl font-bold mb-1">Owner Basic</h3>
                    <p className="text-gray-400 text-sm font-medium mb-8">Standard Listing</p>

                    <div className="flex items-baseline gap-1 mb-8">
                        <span className="text-sm font-bold">₵</span>
                        <span className="text-5xl font-black tracking-tighter">0</span>
                        <span className="text-gray-400 font-bold ml-1">/mo</span>
                    </div>

                    <ul className="space-y-4 mb-12 flex-1">
                        {[
                            "1 Hostel Listing",
                            "Standard Dashboard",
                            "Email Notifications",
                            "Basic Booking Management"
                        ].map(feat => (
                            <li key={feat} className="flex items-center gap-3 text-sm font-semibold text-gray-600">
                                <CheckCircle2 size={16} className="text-gray-200" />
                                {feat}
                            </li>
                        ))}
                    </ul>

                    <button
                        disabled={!isPro}
                        className={cn(
                            "w-full py-4 rounded-2xl font-bold text-sm tracking-widest uppercase transition-all",
                            !isPro ? "bg-gray-100 text-gray-400 cursor-default" : "bg-black text-white hover:opacity-90 active:scale-95"
                        )}
                    >
                        {!isPro ? "Current Plan" : "Downgrade"}
                    </button>
                </div>

                {/* Pro Plan */}
                <div className={cn(
                    "bg-white border-2 rounded-[3rem] p-10 flex flex-col relative overflow-hidden transition-all duration-500",
                    isPro ? "border-blue-600 shadow-2xl shadow-blue-100" : "border-gray-100 hover:border-gray-200"
                )}>
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl"></div>

                    {isPro && (
                        <div className="absolute top-8 right-8">
                            <div className="bg-blue-600 text-white p-1 rounded-full shadow-lg">
                                <CheckCircle2 size={20} />
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-2xl font-bold">Owner PRO</h3>
                        <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Growth</div>
                    </div>
                    <p className="text-gray-400 text-sm font-medium mb-8">Maximum Visibility</p>

                    <div className="flex items-baseline gap-1 mb-8">
                        <span className="text-sm font-bold text-blue-600">₵</span>
                        <span className="text-5xl font-black tracking-tighter text-blue-600">99</span>
                        <span className="text-gray-400 font-bold ml-1">/mo</span>
                    </div>

                    <ul className="space-y-4 mb-12 flex-1">
                        {[
                            "Unlimited Hostel Listings",
                            "Featured (Recommended) Badge",
                            "Advanced Analytics & Charts",
                            "Priority Booking Support",
                            "SMS & WhatsApp Notifications"
                        ].map(feat => (
                            <li key={feat} className="flex items-center gap-3 text-sm font-semibold text-gray-700">
                                <Zap size={16} className="text-blue-500 fill-blue-500/10" />
                                {feat}
                            </li>
                        ))}
                    </ul>

                    <button
                        onClick={() => !isPro && upgradeMutation.mutate()}
                        disabled={isPro || upgradeMutation.isPending}
                        className={cn(
                            "w-full py-4 rounded-2xl font-bold text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-100",
                            isPro ? "bg-blue-50 text-blue-600 border border-blue-100 cursor-default" : "bg-blue-600 text-white hover:opacity-90 active:scale-95"
                        )}
                    >
                        {upgradeMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />}
                        {isPro ? "Plan Active" : "Upgrade to Pro"}
                    </button>
                    <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-4">Safe & Secure via Paystack</p>
                </div>
            </div>
        </div>
    );
}
