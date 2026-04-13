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
                <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-blue-50 blur-[120px] rounded-full opacity-60" />
                <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-indigo-50 blur-[100px] rounded-full opacity-40" />
            </div>

            <div className="relative z-10 w-full max-w-4xl space-y-12">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Onboarding</span>
                        <div className="w-1 h-1 rounded-full bg-blue-600" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 leading-tight">
                        Choose your identity
                    </h1>
                    <p className="text-sm text-gray-500 max-w-lg mx-auto leading-relaxed">
                        To tailor your experience, please select how you'll primarily use HostelGH.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Tenant Role Selection */}
                    <button
                        onClick={() => setRole("TENANT")}
                        className={cn(
                            "group relative overflow-hidden rounded-2xl border transition-all duration-300 p-8 text-left flex flex-col gap-6",
                            role === "TENANT"
                                ? "bg-white border-blue-600 ring-1 ring-blue-600 shadow-xl shadow-blue-500/10"
                                : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-lg shadow-sm"
                        )}
                    >
                        <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
                            role === "TENANT" ? "bg-blue-600 text-white" : "bg-gray-50 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600"
                        )}>
                            <User size={24} />
                        </div>
                        
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-gray-900 tracking-tight">I&apos;m a Student</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                I want to find, book and manage my hostel accommodations across Ghana.
                            </p>
                        </div>

                        <div className={cn(
                            "mt-auto flex items-center gap-2 text-xs font-bold transition-all",
                            role === "TENANT" ? "text-blue-600" : "text-gray-400 group-hover:text-gray-900"
                        )}>
                            Join as Resident <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </button>

                    {/* Owner Role Selection */}
                    <button
                        onClick={() => setRole("OWNER")}
                        className={cn(
                            "group relative overflow-hidden rounded-2xl border transition-all duration-300 p-8 text-left flex flex-col gap-6",
                            role === "OWNER"
                                ? "bg-white border-blue-600 ring-1 ring-blue-600 shadow-xl shadow-blue-500/10"
                                : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-lg shadow-sm"
                        )}
                    >
                        <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
                            role === "OWNER" ? "bg-blue-600 text-white" : "bg-gray-50 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600"
                        )}>
                            <Building2 size={24} />
                        </div>
                        
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-gray-900 tracking-tight">I&apos;m an Owner</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                I want to list property, manage bookings, and automate my rental revenue.
                            </p>
                        </div>

                        <div className={cn(
                            "mt-auto flex items-center gap-2 text-xs font-bold transition-all",
                            role === "OWNER" ? "text-blue-600" : "text-gray-400 group-hover:text-gray-900"
                        )}>
                            Join as Proprietor <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </button>
                </div>

                <div className="pt-6 flex flex-col items-center gap-8">
                    <button
                        onClick={handleCompleteOnboarding}
                        disabled={!role || isLoading}
                        className={cn(
                            "w-full max-w-sm h-14 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed",
                            role 
                                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20" 
                                : "bg-gray-100 text-gray-400"
                        )}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                Initializing...
                            </>
                        ) : (
                            <>
                                Finalize Profile
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                    
                    <div className="flex items-center gap-4 py-4 px-6 bg-gray-50 rounded-xl border border-gray-100">
                        <ShieldCheck size={16} className="text-blue-500" /> 
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">
                            Identity verification is required for network access
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
