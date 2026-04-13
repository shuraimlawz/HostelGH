"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
    CreditCard,
    Plus,
    Trash2,
    CheckCircle2,
    Building2,
    Phone,
    Loader2,
    Check,
    Lock,
    ShieldCheck,
    X,
    Zap,
    ArrowUpRight,
    TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { GHANA_BANKS, GHANA_MOMO_PROVIDERS } from "@/lib/constants";

const payoutSchema = z.object({
    type: z.enum(["BANK", "MOBILE_MONEY"]),
    provider: z.string().min(2, "Provider selection required"),
    bankCode: z.string().optional(),
    accountNumber: z.string().min(8, "Account number invalid"),
    accountName: z.string().min(3, "Account name required"),
    isDefault: z.boolean(),
});

type PayoutFormValues = z.infer<typeof payoutSchema>;

export default function PayoutSettingsPage() {
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);

    const { data: methods, isLoading } = useQuery({
        queryKey: ["payout-methods"],
        queryFn: async () => {
            const { data } = await api.get("/payouts");
            return Array.isArray(data) ? data : [];
        },
    });

    const createMutation = useMutation({
        mutationFn: (values: PayoutFormValues) => api.post("/payouts", values),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["payout-methods"] });
            toast.success("SETTLEMENT SYNCED", { description: "Payout method integrated successfully." });
            setShowForm(false);
            reset();
        },
        onError: (err: any) => toast.error("SYNC FAILED", { description: err.message }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/payouts/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["payout-methods"] });
            toast.success("METHOD PURGED", { description: "Payout endpoint removed." });
        },
        onError: (err: any) => toast.error("PURGE ERROR", { description: err.message }),
    });

    const setDefaultMutation = useMutation({
        mutationFn: (id: string) => api.patch(`/payouts/${id}/default`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["payout-methods"] });
            toast.success("DEFAULT RE-INDEXED", { description: "Primary settlement endpoint updated." });
        },
        onError: (err: any) => toast.error("RE-INDEX ERROR", { description: err.message }),
    });

    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<PayoutFormValues>({
        resolver: zodResolver(payoutSchema),
        defaultValues: {
            type: "MOBILE_MONEY",
            isDefault: false,
        }
    });

    const selectedType = watch("type");

    if (isLoading) return (
        <div className="flex h-[60vh] items-center justify-center bg-black/5 rounded-[3rem]">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-blue-500" size={40} />
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.5em]">Syncing Ledger...</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-[1400px] mx-auto space-y-12 pb-20">
            {/* Header / Operational Stats */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-[9px] font-black uppercase tracking-[0.3em] border border-blue-500/20">
                            Settlement Matrix
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest italic">Live Revenue Sync</span>
                        </div>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-foreground tracking-tighter uppercase italic leading-[0.9]">
                        Payout <span className="text-blue-600 NOT-italic opacity-50">Protocols</span>
                    </h1>
                    <p className="text-muted-foreground text-[11px] font-bold uppercase tracking-[0.1em] max-w-md">
                        Manage your capital distribution endpoints. Automated MoMo and Bank settlements engaged.
                    </p>
                </div>

                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="px-10 py-5 bg-black text-white rounded-[1.8rem] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-blue-600 transition-all flex items-center gap-4 group shadow-2xl active:scale-[0.98]"
                    >
                        <Plus size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                        Deploy New Method
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
                {/* Active Methods Ledger */}
                <div className="xl:col-span-12 space-y-6">
                    {showForm && (
                        <div className="bg-white rounded-[3rem] border border-muted shadow-2xl animate-in fade-in slide-in-from-top-8 duration-700 overflow-hidden group">
                            <div className="p-10 border-b border-muted flex items-center justify-between">
                                <div className="space-y-1">
                                    <h2 className="text-xl font-black text-foreground tracking-tight uppercase italic">Initialise Endpoint <span className="text-blue-600 NOT-italic">.</span></h2>
                                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Add Bank or Mobile Money Gateway</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => { setShowForm(false); reset(); }}
                                    className="w-12 h-12 flex items-center justify-center bg-muted/30 rounded-2xl hover:bg-red-500 hover:text-white transition-all text-muted-foreground duration-500"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit((v) => createMutation.mutate(v))} className="p-10 space-y-10">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] ml-2">Protocol Selection</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {(["MOBILE_MONEY", "BANK"] as const).map((t) => (
                                            <button
                                                key={t}
                                                type="button"
                                                onClick={() => reset({ ...watch(), type: t })}
                                                className={cn(
                                                    "flex items-center justify-between px-8 py-6 rounded-[2rem] border transition-all duration-500",
                                                    selectedType === t
                                                        ? "bg-black text-white border-black scale-[1.01] shadow-xl"
                                                        : "bg-muted/30 border-muted text-muted-foreground hover:border-black/20 hover:text-black"
                                                )}
                                            >
                                                <div className="flex items-center gap-5">
                                                    <div className={cn(
                                                        "w-12 h-12 rounded-[1.2rem] flex items-center justify-center",
                                                        selectedType === t ? "bg-white/10 text-blue-500" : "bg-black/5"
                                                    )}>
                                                        {t === "MOBILE_MONEY" ? <Phone size={22} /> : <Building2 size={22} />}
                                                    </div>
                                                    <span className="font-black text-[12px] uppercase tracking-widest">{t === "MOBILE_MONEY" ? "Mobile Money" : "Institutional Bank"}</span>
                                                </div>
                                                {selectedType === t && <Zap size={16} className="text-blue-500 fill-current" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] ml-2">Gateway Provider</label>
                                        <div className="relative group/select">
                                            <select
                                                {...register("provider")}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    const list = selectedType === "BANK" ? GHANA_BANKS : GHANA_MOMO_PROVIDERS;
                                                    const found = list.find(l => l.name === val);
                                                    if (found) setValue("bankCode", found.code);
                                                    register("provider").onChange(e);
                                                }}
                                                className="w-full h-20 bg-muted/30 border border-muted rounded-[1.8rem] px-8 text-[13px] font-black uppercase tracking-widest focus:bg-white focus:border-black transition-all appearance-none outline-none group-hover/select:border-black/20"
                                            >
                                                <option value="">Select Protocol</option>
                                                {selectedType === "BANK"
                                                    ? GHANA_BANKS.map(bank => <option key={bank.code} value={bank.name}>{bank.name}</option>)
                                                    : GHANA_MOMO_PROVIDERS.map(momo => <option key={momo.code} value={momo.name}>{momo.name}</option>)
                                                }
                                            </select>
                                            <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                                <TrendingUp size={16} />
                                            </div>
                                        </div>
                                        {errors.provider && <p className="text-[10px] text-red-500 font-black uppercase tracking-wider ml-4">{errors.provider.message}</p>}
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] ml-2">Endpoint Identifier</label>
                                        <input
                                            {...register("accountNumber")}
                                            placeholder={selectedType === "MOBILE_MONEY" ? "024XXXXXXX" : "ACC# XXXXXXXX"}
                                            className="w-full h-20 bg-muted/30 border border-muted rounded-[1.8rem] px-8 text-[13px] font-black uppercase tracking-[0.3em] font-mono focus:bg-white focus:border-black transition-all outline-none placeholder:text-muted-foreground/30"
                                        />
                                        {errors.accountNumber && <p className="text-[10px] text-red-500 font-black uppercase tracking-wider ml-4">{errors.accountNumber.message}</p>}
                                    </div>

                                    <div className="space-y-3 md:col-span-2">
                                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] ml-2">Identity Verification (Account Name)</label>
                                        <input
                                            {...register("accountName")}
                                            placeholder="FULL LEGAL NAME"
                                            className="w-full h-20 bg-muted/30 border border-muted rounded-[1.8rem] px-8 text-[13px] font-black uppercase tracking-[0.3em] focus:bg-white focus:border-black transition-all outline-none"
                                        />
                                        {errors.accountName && <p className="text-[10px] text-red-500 font-black uppercase tracking-wider ml-4">{errors.accountName.message}</p>}
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row items-center gap-8 pt-4">
                                    <label className="flex-1 w-full flex items-center gap-5 cursor-pointer p-6 bg-muted/20 hover:bg-muted/40 rounded-[1.8rem] border border-muted transition-all group/check">
                                        <div className="relative">
                                            <input type="checkbox" {...register("isDefault")} id="isDefault" className="peer w-6 h-6 rounded-lg opacity-0 absolute inset-0 cursor-pointer z-10" />
                                            <div className="w-6 h-6 rounded-lg border-2 border-muted-foreground flex items-center justify-center transition-all peer-checked:bg-black peer-checked:border-black">
                                                <Check size={14} className="text-white scale-0 peer-checked:scale-100 transition-transform" />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[11px] font-black text-foreground uppercase tracking-widest leading-none">Primary Payout Gateway</p>
                                            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Mark as the default terminal for all operational settlements.</p>
                                        </div>
                                    </label>

                                    <button
                                        type="submit"
                                        disabled={createMutation.isPending}
                                        className="w-full md:w-auto px-16 h-20 bg-black text-white rounded-[1.8rem] font-black text-[11px] uppercase tracking-[0.4em] hover:bg-blue-600 transition-all flex items-center justify-center gap-4 disabled:opacity-50 shadow-2xl"
                                    >
                                        {createMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                                        Initialize Sync
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="space-y-6">
                        {methods?.length === 0 ? (
                            <div className="bg-white border-4 border-dashed border-muted rounded-[3.5rem] p-32 text-center space-y-8 animate-in fade-in duration-1000">
                                <div className="w-24 h-24 bg-muted/30 rounded-[2.5rem] flex items-center justify-center mx-auto transform -rotate-12 transition-transform hover:rotate-0 duration-700">
                                    <CreditCard className="text-muted-foreground/30" size={48} />
                                </div>
                                <div className="max-w-md mx-auto space-y-4">
                                    <h3 className="text-4xl font-black text-foreground tracking-tighter uppercase italic leading-none">Registry Empty <span className="text-blue-600 NOT-italic">.</span></h3>
                                    <p className="text-muted-foreground font-black text-[11px] uppercase tracking-[0.2em] leading-relaxed">No settlement endpoints detected. Deploy a bank or mobile money gateway to receive operational revenue.</p>
                                </div>
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="px-10 py-5 bg-black text-white rounded-[1.8rem] font-black text-[10px] uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-xl"
                                >
                                    ENGAGE DEPLOYMENT
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {methods?.map((method: any) => (
                                    <div key={method.id} className={cn(
                                        "group bg-white rounded-[2.8rem] border p-8 transition-all duration-500 overflow-hidden relative",
                                        method.isDefault
                                            ? "border-black shadow-2xl shadow-black/5"
                                            : "border-muted hover:border-black/20"
                                    )}>
                                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                                            <div className={cn(
                                                "w-20 h-20 rounded-[1.8rem] flex items-center justify-center shadow-inner shrink-0 transition-transform group-hover:rotate-6 duration-700 border",
                                                method.type === "BANK" ? "bg-black text-white border-black/10" : "bg-blue-500/5 text-blue-600 border-blue-500/10"
                                            )}>
                                                {method.type === "BANK" ? <Building2 size={32} /> : <Phone size={32} />}
                                            </div>

                                            <div className="flex-1 text-center md:text-left">
                                                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                                                    <h3 className="font-black text-xl text-foreground uppercase tracking-tighter italic">{method.provider}</h3>
                                                    {method.isDefault && (
                                                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.3em] inline-block w-fit mx-auto md:mx-0 shadow-lg shadow-blue-500/20">Active Gateway</span>
                                                    )}
                                                </div>
                                                <p className="text-2xl font-black font-mono tracking-[0.15em] text-foreground leading-none">{method.accountNumber}</p>
                                                <div className="flex items-center justify-center md:justify-start gap-4 mt-2">
                                                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] italic">{method.accountName}</p>
                                                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                                                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">{method.type.replace(/_/g, " ")}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 shrink-0">
                                                {!method.isDefault && (
                                                    <button
                                                        onClick={() => setDefaultMutation.mutate(method.id)}
                                                        disabled={setDefaultMutation.isPending}
                                                        className="h-14 px-6 rounded-[1.2rem] border border-muted bg-white hover:bg-black hover:text-white hover:border-black text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3"
                                                        title="Assign as Primary"
                                                    >
                                                        {setDefaultMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                                                        INDEX AS PRIMARY
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => {
                                                        if (confirm(`PURGE PROTOCOL TRIGGERED: Remove ${method.provider} terminal ending in ${method.accountNumber.slice(-4)}?`)) {
                                                            deleteMutation.mutate(method.id);
                                                        }
                                                    }}
                                                    disabled={deleteMutation.isPending}
                                                    className="w-14 h-14 rounded-[1.2rem] border border-muted bg-white hover:bg-red-500 hover:text-white hover:border-red-500 transition-all flex items-center justify-center"
                                                    title="Purge Method"
                                                >
                                                    {deleteMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                                </button>
                                            </div>
                                        </div>
                                        
                                        {/* Accent line for default */}
                                        {method.isDefault && <div className="absolute bottom-0 left-0 w-full h-1.5 bg-blue-600" />}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Vertical Compliance / Info Sections */}
                <div className="xl:col-span-12">
                    <div className="bg-black text-white rounded-[3.5rem] p-12 relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full -mr-48 -mt-48 blur-[100px] group-hover:scale-125 transition-transform duration-1000" />
                        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                            <div className="lg:col-span-1 border border-white/10 w-20 h-20 rounded-[1.8rem] flex items-center justify-center bg-white/5 backdrop-blur-md">
                                <ShieldCheck size={32} className="text-blue-500" />
                            </div>
                            <div className="lg:col-span-8 space-y-4">
                                <h4 className="text-3xl font-black uppercase italic tracking-tighter leading-none">Secure Financial Ledger <span className="text-blue-600 NOT-italic">.</span></h4>
                                <p className="text-[11px] text-white/40 font-bold uppercase tracking-[0.2em] leading-relaxed max-w-2xl">
                                    Operational endpoints are encrypted via industry-level security logic. 10% network commission is automatically abstracted before transfer triggers. Settle accounts within 24 hours of tenant check-in verification.
                                </p>
                            </div>
                            <div className="lg:col-span-3 flex justify-end">
                                <div className="flex flex-col items-end gap-2 px-8 py-5 bg-white/5 border border-white/10 rounded-[1.5rem] backdrop-blur-md">
                                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-blue-500">Network Logic</p>
                                    <p className="text-2xl font-black italic tracking-tighter">V4.2 SECURE</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
