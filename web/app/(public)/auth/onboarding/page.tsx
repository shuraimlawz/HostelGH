"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { User, Building2, ChevronRight, Loader2, Zap, ShieldCheck, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function OnboardingPage() {
    const [role, setRole] = useState<"TENANT" | "OWNER" | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { updateUser } = useAuth();

    const handleCompleteOnboarding = async () => {
        if (!role) {
            toast.error("PROTOCOL BREACH", { description: "Account type selection required" });
            return;
        }

        setIsLoading(true);
        try {
            const { data } = await api.patch("/auth/onboard", { role });
            updateUser(data.user);
            toast.success("IDENTITY FINALIZED", { description: "Account initialised successfully." });
            router.push(role === "OWNER" ? "/owner" : "/");
        } catch (error: any) {
            toast.error("INITIALISATION FAILED", { description: error.message || "Unknown error" });
        } finally {
            setIsLoading(false);
        }
    };

    const buttonContent = isLoading ? (
        <>
            <Loader2 className="animate-spin" size={20} />
            SYNCHRONIZING SECURE STREAMS...
        </>
    ) : (
        <>
            <Zap 
                size={16} 
                className={cn(
                    "transition-transform group-hover:scale-125 duration-500", 
                    role && "text-blue-500 animate-pulse"
                )} 
            />
            CONFIRM IDENTITY DEFINITION
        </>
    );

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* High-Contrast Aesthetic Layer */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 blur-[180px] rounded-full animate-pulse" />
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-600/5 blur-[120px] rounded-full" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
            </div>

            <div className="relative z-10 w-full max-w-4xl space-y-16">
                <div className="text-center space-y-6 animate-in fade-in slide-in-from-top-8 duration-1000">
                    <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500">Phase 02 / Onboarding</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic text-white leading-none">
                        Identity <span className="text-blue-600 NOT-italic">.</span>
                    </h1>
                    <p className="text-[12px] font-black text-white/40 uppercase tracking-[0.3em] max-w-xl mx-auto leading-relaxed">
                        Defining your operational role within the <span className="text-white">HostelGH Network</span>. Select your primary interface.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in zoom-in-95 duration-1000 delay-200">
                    {/* Tenant Role Selection */}
                    <button
                        onClick={() => setRole("TENANT")}
                        className={cn(
                            "group relative overflow-hidden rounded-[3.5rem] border transition-all duration-700 p-12 text-left flex flex-col gap-10",
                            role === "TENANT"
                                ? "bg-white border-white scale-[1.02] shadow-[0_0_80px_-15px_rgba(255,255,255,0.3)]"
                                : "bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/[0.07]"
                        )}
                    >
                        <div className={cn(
                            "w-16 h-16 rounded-[1.8rem] flex items-center justify-center transition-all duration-500 shadow-2xl",
                            role === "TENANT" ? "bg-black text-white rotate-6" : "bg-white/10 text-white/40 group-hover:rotate-6 group-hover:text-white"
                        )}>
                            <User size={32} />
                        </div>
                        
                        <div className="space-y-4">
                            <h3 className={cn(
                                "text-2xl font-black uppercase italic tracking-tighter leading-none transition-colors",
                                role === "TENANT" ? "text-black" : "text-white"
                            )}>
                                Student <br /> Resident
                            </h3>
                            <p className={cn(
                                "text-[11px] font-black uppercase tracking-widest leading-relaxed transition-colors",
                                role === "TENANT" ? "text-black/60" : "text-white/30"
                            )}>
                                Find, secure, and thrive in your ideal academic residence. Verified listings and instant settlements.
                            </p>
                        </div>

                        <div className={cn(
                            "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all",
                            role === "TENANT" ? "text-blue-600" : "text-white/20 group-hover:text-white/60"
                        )}>
                            ENGAGE STUDENT INTERFACE <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </div>

                        {role === "TENANT" && (
                            <div className="absolute top-10 right-10 text-blue-600 animate-in fade-in zoom-in-50 duration-500">
                                <Zap size={24} className="fill-current" />
                            </div>
                        )}
                    </button>

                    {/* Owner Role Selection */}
                    <button
                        onClick={() => setRole("OWNER")}
                        className={cn(
                            "group relative overflow-hidden rounded-[3.5rem] border transition-all duration-700 p-12 text-left flex flex-col gap-10",
                            role === "OWNER"
                                ? "bg-white border-white scale-[1.02] shadow-[0_0_80px_-15px_rgba(255,255,255,0.3)]"
                                : "bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/[0.07]"
                        )}
                    >
                        <div className={cn(
                            "w-16 h-16 rounded-[1.8rem] flex items-center justify-center transition-all duration-500 shadow-2xl",
                            role === "OWNER" ? "bg-black text-white -rotate-6" : "bg-white/10 text-white/40 group-hover:-rotate-6 group-hover:text-white"
                        )}>
                            <Building2 size={32} />
                        </div>
                        
                        <div className="space-y-4">
                            <h3 className={cn(
                                "text-2xl font-black uppercase italic tracking-tighter leading-none transition-colors",
                                role === "OWNER" ? "text-black" : "text-white"
                            )}>
                                Asset <br /> Proprietor
                            </h3>
                            <p className={cn(
                                "text-[11px] font-black uppercase tracking-widest leading-relaxed transition-colors",
                                role === "OWNER" ? "text-black/60" : "text-white/30"
                            )}>
                                Deploy property listings, manage inventory, and automate revenue settlements through our core network.
                            </p>
                        </div>

                        <div className={cn(
                            "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all",
                            role === "OWNER" ? "text-blue-600" : "text-white/20 group-hover:text-white/60"
                        )}>
                            ENGAGE PROPRIETOR HUB <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </div>

                        {role === "OWNER" && (
                            <div className="absolute top-10 right-10 text-blue-600 animate-in fade-in zoom-in-50 duration-500">
                                <Zap size={24} className="fill-current" />
                            </div>
                        )}
                    </button>
                </div>

                <div className="pt-10 flex flex-col items-center gap-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
                    <button
                        onClick={handleCompleteOnboarding}
                        disabled={!role || isLoading}
                        className={cn(
                            "w-full h-24 rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.4em] transition-all duration-500 flex items-center justify-center gap-6 group relative overflow-hidden disabled:opacity-20 disabled:cursor-not-allowed",
                            role 
                                ? "bg-white text-black hover:shadow-[0_0_100px_-20px_rgba(255,255,255,0.4)] hover:scale-[1.01]" 
                                : "bg-white/10 text-white/30 border border-white/10"
                        )}
                    >
                        <div className="relative z-10 flex items-center gap-6">
                            {buttonContent}
                        </div>
                        {role && !isLoading && (
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity duration-700" />
                        )}
                    </button>
                    
                    <div className="flex items-center gap-6 opacity-40">
                        <div className="w-12 h-[1px] bg-white/20" />
                        <p className="text-[9px] font-black text-white uppercase tracking-[0.5em] flex items-center gap-3">
                            <ShieldCheck size={14} className="text-blue-500" /> 
                            Identity finalisation required for network access
                        </p>
                        <div className="w-12 h-[1px] bg-white/20" />
                    </div>
                </div>
            </div>
        </div>
    );
}
