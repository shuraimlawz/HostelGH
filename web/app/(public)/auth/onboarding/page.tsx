"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { User, Building2, ChevronRight, Loader2, Zap, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export default function OnboardingPage() {
    const [role, setRole] = useState<"TENANT" | "OWNER" | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { updateUser } = useAuth();

    const handleCompleteOnboarding = async () => {
        if (!role) {
            toast.error("Account type selection required");
            return;
        }

        setIsLoading(true);
        try {
            const { data } = await api.patch("/auth/onboard", { role });
            updateUser(data.user);
            toast.success("Identity Finalized");
            router.push(role === "OWNER" ? "/owner" : "/");
        } catch (error: any) {
            toast.error(error.message || "Initialization Failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Aesthetic */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full animate-pulse" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/5 blur-[100px] rounded-full" />
            </div>

            <div className="relative z-10 w-full max-w-2xl text-center space-y-12">
                <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Deployment Phase 02</span>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic text-foreground">
                        Initialization <span className="text-primary NOT-italic">.</span>
                    </h1>
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                        Defining your operational role within the HostelGH network.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in zoom-in-95 duration-700">
                    <button
                        onClick={() => setRole("TENANT")}
                        className={cn(
                            "p-10 rounded-sm border transition-all text-left flex flex-col gap-6 relative group bg-card",
                            role === "TENANT"
                                ? "border-primary shadow-2xl shadow-primary/10 scale-[1.02]"
                                : "border-border hover:border-primary/50"
                        )}
                    >
                        <div className={cn(
                            "w-12 h-12 rounded-sm flex items-center justify-center transition-all",
                            role === "TENANT" ? "bg-primary text-background rotate-3" : "bg-muted text-muted-foreground group-hover:rotate-3"
                        )}>
                            <User size={24} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-black text-xs uppercase tracking-widest italic flex items-center gap-2">
                                Operator / Tenant
                                {role === "TENANT" && <div className="w-1 h-1 bg-primary rounded-full animate-ping" />}
                            </h3>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none opacity-70">
                                Seeking asset allocation & secure living quarters.
                            </p>
                        </div>
                        {role === "TENANT" && (
                            <div className="absolute top-6 right-6 text-primary animate-in fade-in slide-in-from-right-2">
                                <ShieldCheck size={18} />
                            </div>
                        )}
                    </button>

                    <button
                        onClick={() => setRole("OWNER")}
                        className={cn(
                            "p-10 rounded-sm border transition-all text-left flex flex-col gap-6 relative group bg-card",
                            role === "OWNER"
                                ? "border-foreground shadow-2xl shadow-foreground/10 scale-[1.02]"
                                : "border-border hover:border-foreground/50"
                        )}
                    >
                        <div className={cn(
                            "w-12 h-12 rounded-sm flex items-center justify-center transition-all",
                            role === "OWNER" ? "bg-foreground text-background -rotate-3" : "bg-muted text-muted-foreground group-hover:-rotate-3"
                        )}>
                            <Building2 size={24} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-black text-xs uppercase tracking-widest italic flex items-center gap-2">
                                Proprietor / Owner
                                {role === "OWNER" && <div className="w-1 h-1 bg-foreground rounded-full animate-ping" />}
                            </h3>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none opacity-70">
                                Asset deployment & portfolio management.
                            </p>
                        </div>
                        {role === "OWNER" && (
                            <div className="absolute top-6 right-6 text-foreground animate-in fade-in slide-in-from-right-2">
                                <ShieldCheck size={18} />
                            </div>
                        )}
                    </button>
                </div>

                <div className="pt-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <button
                        onClick={handleCompleteOnboarding}
                        disabled={!role || isLoading}
                        className="w-full h-16 bg-foreground text-background rounded-sm font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-foreground/20 hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                SYNCHRONIZING CORE...
                            </>
                        ) : (
                            <>
                                <Zap size={14} className={cn("transition-transform group-hover:scale-110", role && "text-primary animate-pulse")} />
                                Confirm Deployment
                            </>
                        )}
                    </button>
                    <p className="mt-8 text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                        <ShieldCheck size={12} /> Registry protocols will be enforced upon confirmation.
                    </p>
                </div>
            </div>
        </div>
    );
}
