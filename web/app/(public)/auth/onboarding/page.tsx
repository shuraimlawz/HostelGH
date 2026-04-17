"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { User, Building2, ChevronRight, Loader2, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function OnboardingPage() {
    const [role, setRole] = useState<"TENANT" | "OWNER" | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { updateUser } = useAuth();

    const handleCompleteOnboarding = async () => {
        if (!role) {
            toast.error("Selection Required", { description: "Please select your primary role." });
            return;
        }

        setIsLoading(true);
        try {
            const { data } = await api.patch("/auth/onboard", { role });
            updateUser(data.user);
            toast.success("Profile Initialized", { description: "Welcome to the HostelGH network." });
            router.push(role === "OWNER" ? "/owner" : "/");
        } catch (error: any) {
            toast.error("Error", { description: error.message || "Failed to initialize profile." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Elegant Background Accents */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[10%] left-[10%] w-[600px] h-[600px] bg-blue-50/50 blur-[120px] rounded-full" />
                <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-blue-50/30 blur-[100px] rounded-full" />
            </div>

            <div className="relative z-10 w-full max-w-4xl space-y-16">
                <div className="text-center space-y-6">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-600 text-white rounded-full shadow-xl shadow-blue-500/20 border border-white/10">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Account Setup</span>
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-gray-900 uppercase leading-none">
                            Choose Your Role
                        </h1>
                        <p className="text-xs md:text-sm text-gray-400 max-w-lg mx-auto leading-relaxed font-bold uppercase tracking-widest">
                            Select how you'd like to use the platform to get started.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Tenant Role Selection */}
                    <button
                        onClick={() => setRole("TENANT")}
                        className={cn(
                            "group relative overflow-hidden rounded-3xl border transition-all duration-500 p-10 text-left flex flex-col gap-10",
                            role === "TENANT"
                                ? "bg-white border-blue-600 shadow-2xl shadow-blue-500/10"
                                : "bg-white border-gray-100 hover:border-blue-500/20 hover:shadow-2xl shadow-sm"
                        )}
                    >
                        <div className={cn(
                            "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl",
                            role === "TENANT" ? "bg-blue-600 text-white shadow-blue-500/20" : "bg-gray-50 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600"
                        )}>
                            <User size={32} />
                        </div>
                        
                        <div className="space-y-3">
                            <h3 className="text-2xl font-bold text-gray-900 tracking-tight uppercase">Student Hub</h3>
                            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                                Join Ghana's top student housing network and book your room easily.
                            </p>
                        </div>

                        <div className={cn(
                            "mt-auto flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest transition-all",
                            role === "TENANT" ? "text-blue-600" : "text-gray-300 group-hover:text-gray-900"
                        )}>
                            Join as Student <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </button>

                    {/* Owner Role Selection */}
                    <button
                        onClick={() => setRole("OWNER")}
                        className={cn(
                            "group relative overflow-hidden rounded-3xl border transition-all duration-500 p-10 text-left flex flex-col gap-10",
                            role === "OWNER"
                                ? "bg-white border-blue-600 shadow-2xl shadow-blue-500/10"
                                : "bg-white border-gray-100 hover:border-blue-500/20 hover:shadow-2xl shadow-sm"
                        )}
                    >
                        <div className={cn(
                            "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl",
                            role === "OWNER" ? "bg-blue-600 text-white shadow-blue-500/20" : "bg-gray-50 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600"
                        )}>
                            <Building2 size={32} />
                        </div>
                        
                        <div className="space-y-3">
                            <h3 className="text-2xl font-bold text-gray-900 tracking-tight uppercase">Owner Hub</h3>
                            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                                List your hostels, manage bookings, and handle your payments effortlessly.
                            </p>
                        </div>

                        <div className={cn(
                            "mt-auto flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest transition-all",
                            role === "OWNER" ? "text-blue-600" : "text-gray-300 group-hover:text-gray-900"
                        )}>
                            Join as Owner <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </button>
                </div>

                <div className="pt-8 flex flex-col items-center gap-10">
                    <button
                        onClick={handleCompleteOnboarding}
                        disabled={!role || isLoading}
                        className={cn(
                            "w-full max-w-sm h-16 rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all duration-500 flex items-center justify-center gap-4 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed",
                            role 
                                ? "bg-blue-600 text-white hover:bg-black shadow-blue-500/20" 
                                : "bg-gray-100 text-gray-300"
                        )}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Setting up account...
                            </>
                        ) : (
                            <>
                                Complete Setup
                                <ShieldCheck size={20} />
                            </>
                        )}
                    </button>
                    
                    <div className="flex items-center gap-4 py-5 px-8 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm animate-pulse">
                        <ShieldCheck size={18} className="text-blue-600" /> 
                        <span className="text-[10px] font-bold text-gray-900 uppercase tracking-[0.2em]">Account Secured</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
