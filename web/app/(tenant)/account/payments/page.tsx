"use client";

import { CreditCard, History, Download, Loader2, Plus, Trash2, CheckCircle2, MoreVertical, Smartphone, Building2, Zap, ShieldCheck, ArrowRight, Activity, Wallet } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const GHANA_BANKS = [
    "GCB Bank",
    "Ecobank Ghana",
    "Absa Bank Ghana",
    "Zenith Bank Ghana",
    "Standard Chartered Ghana",
    "Stanbic Bank Ghana",
    "Fidelity Bank Ghana",
    "United Bank for Africa (UBA)",
    "CalBank",
    "Access Bank Ghana",
    "Republic Bank Ghana",
    "Societe Generale Ghana",
    "Prudential Bank Ghana",
    "First National Bank (FNB)",
    "OmniBSIC Bank",
    "Bank of Africa Ghana",
    "Consolidated Bank Ghana (CBG)",
    "FBNBank Ghana",
    "GTBank Ghana",
    "Agricultural Development Bank (ADB)",
    "National Investment Bank (NIB)",
    "First Atlantic Bank"
].sort();

export default function TenantPaymentsPage() {
    const queryClient = useQueryClient();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newMethod, setNewMethod] = useState({
        type: "MOMO",
        provider: "MTN",
        phone: "",
        last4: ""
    });

    const { data: payments, isLoading: isPaymentsLoading } = useQuery({
        queryKey: ["tenant-payments"],
        queryFn: async () => {
            const { data } = await api.get("/payments/history");
            return Array.isArray(data) ? data : [];
        }
    });

    const { data: savedMethods, isLoading: isMethodsLoading } = useQuery({
        queryKey: ["saved-payment-methods"],
        queryFn: async () => {
            const { data } = await api.get("/payment-methods");
            return Array.isArray(data) ? data : [];
        }
    });

    const addMethodMutation = useMutation({
        mutationFn: async (dto: any) => {
            return api.post("/payment-methods", dto);
        },
        onSuccess: () => {
            toast.success("FINANCIAL SYNC SUCCESSFUL", { description: "Payment method integrated." });
            setIsAddModalOpen(false);
            setNewMethod({ type: "MOMO", provider: "MTN", phone: "", last4: "" });
            queryClient.invalidateQueries({ queryKey: ["saved-payment-methods"] });
        },
        onError: (error: any) => {
            toast.error("SYNC FAILED", { description: error.response?.data?.message || "Internal error" });
        }
    });

    const deleteMethodMutation = useMutation({
        mutationFn: async (id: string) => {
            return api.delete(`/payment-methods/${id}`);
        },
        onSuccess: () => {
            toast.success("ENDPOINT PURGED", { description: "Payment method removed." });
            queryClient.invalidateQueries({ queryKey: ["saved-payment-methods"] });
        }
    });

    const setDefaultMutation = useMutation({
        mutationFn: async (id: string) => {
            return api.patch(`/payment-methods/${id}/default`);
        },
        onSuccess: () => {
            toast.success("DEFAULT RE-INDEXED", { description: "Primary endpoint updated." });
            queryClient.invalidateQueries({ queryKey: ["saved-payment-methods"] });
        }
    });

    const handleAddMethod = (e: React.FormEvent) => {
        e.preventDefault();
        const payload: any = {
            type: newMethod.type,
            provider: newMethod.provider
        };

        if (newMethod.type === "MOMO") {
            if (!/^233[0-9]{9}$/.test(newMethod.phone)) {
                toast.error("INVALID PROTOCOL", { description: "Enter valid Ghana phone number (233XXXXXXXXX)" });
                return;
            }
            payload.phone = newMethod.phone;
        } else if (newMethod.type === "CARD") {
            if (!/^[0-9]{4}$/.test(newMethod.last4)) {
                toast.error("INVALID PROTOCOL", { description: "Enter last 4 digits" });
                return;
            }
            payload.last4 = newMethod.last4;
        } else if (newMethod.type === "BANK") {
            if (!newMethod.phone) {
                toast.error("INVALID PROTOCOL", { description: "Enter account number" });
                return;
            }
            payload.phone = newMethod.phone;
        }

        addMethodMutation.mutate(payload);
    };

    const isLoading = isPaymentsLoading || isMethodsLoading;

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center bg-black/5 rounded-[3rem]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-blue-500" size={40} />
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.5em]">Synchronising Financial Data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto space-y-12 pb-20 pt-6">
            {/* Hero Header */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
                <div className="space-y-4 max-w-2xl">
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-[9px] font-black uppercase tracking-[0.3em] border border-blue-500/20">
                            Financial Matrix
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest italic">Secure Streams Engaged</span>
                        </div>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-foreground tracking-tighter uppercase italic leading-[0.9]">
                        Settlement <span className="text-blue-600 NOT-italic opacity-50">Ledger</span>
                    </h1>
                    <p className="text-muted-foreground text-[11px] font-bold uppercase tracking-[0.1em] max-w-md">
                        Manage your capital flows, saved endpoints, and operational history. Real-time encryption engaged.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                        <DialogTrigger asChild>
                            <button className="px-10 py-5 bg-black text-white rounded-[1.8rem] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-blue-600 transition-all flex items-center gap-4 group shadow-2xl active:scale-[0.98]">
                                <Plus size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                                Integrate Gateway
                            </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-xl rounded-[3rem] border-4 border-black p-0 overflow-hidden">
                            <div className="bg-black text-white p-10 space-y-2">
                                <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter">New Gateway <span className="text-blue-500 NOT-italic">.</span></DialogTitle>
                                <DialogDescription className="text-white/40 text-[10px] font-black uppercase tracking-widest">Initialising Secure Financial Endpoint</DialogDescription>
                            </div>
                            <form onSubmit={handleAddMethod} className="p-10 space-y-8 bg-white">
                                <div className="space-y-4">
                                    <Label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-2">Protocol Type</Label>
                                    <Select
                                        value={newMethod.type}
                                        onValueChange={(v) => {
                                            const defaultProvider = v === "MOMO" ? "MTN" : v === "CARD" ? "VISA" : "GCB Bank";
                                            setNewMethod({ ...newMethod, type: v, provider: defaultProvider });
                                        }}
                                    >
                                        <SelectTrigger className="h-16 rounded-2xl border-2 border-muted bg-muted/20 font-black text-[11px] uppercase tracking-widest px-6 focus:border-black transition-all">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-2 border-black">
                                            <SelectItem value="MOMO">Mobile Money Protocol</SelectItem>
                                            <SelectItem value="CARD">Bank Card Logic</SelectItem>
                                            <SelectItem value="BANK">Direct Institutional Sync</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-2">Provider Identity</Label>
                                    {newMethod.type === "MOMO" ? (
                                        <Select value={newMethod.provider} onValueChange={(v) => setNewMethod({ ...newMethod, provider: v })}>
                                            <SelectTrigger className="h-16 rounded-2xl border-2 border-muted bg-muted/20 font-black text-[11px] uppercase tracking-widest px-6 focus:border-black transition-all">
                                                <SelectValue placeholder="Select provider" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-2 border-black">
                                                <SelectItem value="MTN">MTN MoMo Hub</SelectItem>
                                                <SelectItem value="VODAFONE">Vodafone Cash Protocol</SelectItem>
                                                <SelectItem value="AIRTELTIGO">AirtelTigo Matrix</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : newMethod.type === "CARD" ? (
                                        <Select value={newMethod.provider} onValueChange={(v) => setNewMethod({ ...newMethod, provider: v })}>
                                            <SelectTrigger className="h-16 rounded-2xl border-2 border-muted bg-muted/20 font-black text-[11px] uppercase tracking-widest px-6 focus:border-black transition-all">
                                                <SelectValue placeholder="Select provider" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-2 border-black">
                                                <SelectItem value="VISA">Visa Secure</SelectItem>
                                                <SelectItem value="MASTERCARD">Mastercard Shield</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <Select value={newMethod.provider} onValueChange={(v) => setNewMethod({ ...newMethod, provider: v })}>
                                            <SelectTrigger className="h-16 rounded-2xl border-2 border-muted bg-muted/20 font-black text-[11px] uppercase tracking-widest px-6 focus:border-black transition-all">
                                                <SelectValue placeholder="Select bank" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-2 border-black">
                                                {GHANA_BANKS.map(bank => (
                                                    <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-2">
                                        {newMethod.type === "MOMO" ? "MoMo Terminal Number" : newMethod.type === "CARD" ? "Final 4 Indices" : "Account Index"}
                                    </Label>
                                    <Input
                                        placeholder={newMethod.type === "MOMO" ? "233XXXXXXXXX" : newMethod.type === "CARD" ? "XXXX" : "Institutional ID"}
                                        value={newMethod.type === "CARD" ? newMethod.last4 : newMethod.phone}
                                        onChange={(e) => setNewMethod({ ...newMethod, [newMethod.type === "CARD" ? 'last4' : 'phone']: e.target.value })}
                                        className="h-16 rounded-2xl border-2 border-muted bg-muted/20 font-black text-[13px] tracking-[0.2em] px-6 focus:border-black transition-all placeholder:text-muted-foreground/30 font-mono"
                                        maxLength={newMethod.type === "CARD" ? 4 : undefined}
                                        required
                                    />
                                </div>

                                <DialogFooter className="pt-6">
                                    <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="h-16 rounded-2xl border-2 font-black uppercase text-[10px] tracking-widest">Abort Sync</Button>
                                    <Button type="submit" disabled={addMethodMutation.isPending} className="h-16 rounded-2xl bg-black text-white font-black uppercase text-[10px] tracking-widest px-10 hover:bg-blue-600 shadow-xl transition-all">
                                        {addMethodMutation.isPending ? <Loader2 className="animate-spin mr-2" size={16} /> : <Zap size={16} className="mr-2 fill-current" />}
                                        Finalise Integration
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Saved Gateways */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white rounded-[3.5rem] border border-muted p-10 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700 blur-3xl opacity-0 group-hover:opacity-100" />
                        <div className="flex items-center justify-between mb-10">
                            <div className="space-y-1">
                                <h2 className="text-xl font-black text-foreground uppercase italic tracking-tight leading-none">Integrated <br/> Gateways <span className="text-blue-600 NOT-italic">.</span></h2>
                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Stored Financial Endpoints</p>
                            </div>
                            <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center border border-black/10 shadow-xl group-hover:rotate-12 transition-transform">
                                <CreditCard size={20} />
                            </div>
                        </div>

                        <div className="space-y-4">
                            {savedMethods && savedMethods.length > 0 ? (
                                savedMethods.map((method: any) => (
                                    <div key={method.id} className={cn(
                                        "flex items-center justify-between p-6 rounded-[2rem] border transition-all duration-500 group/item relative overflow-hidden",
                                        method.isDefault
                                            ? "bg-black text-white border-black shadow-xl"
                                            : "bg-muted/30 border-muted hover:border-black/20 hover:bg-white"
                                    )}>
                                        <div className="flex items-center gap-6 relative z-10">
                                            <div className={cn(
                                                "w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner transition-transform group-hover/item:rotate-6 duration-500 border",
                                                method.isDefault ? "bg-white/10 border-white/10 text-blue-500" : "bg-white border-muted text-muted-foreground"
                                            )}>
                                                {method.type === "MOMO" ? <Smartphone size={24} /> :
                                                    method.type === "BANK" ? <Building2 size={24} /> :
                                                        <CreditCard size={24} />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <p className="font-black text-[13px] uppercase tracking-tight italic">
                                                        {method.provider}
                                                    </p>
                                                    {method.isDefault && (
                                                        <span className="text-[8px] font-black uppercase tracking-[0.3em] bg-blue-600 text-white px-2 py-0.5 rounded-full shadow-lg shadow-blue-500/20">Primary</span>
                                                    )}
                                                </div>
                                                <p className={cn("text-base font-black font-mono tracking-widest mt-1", method.isDefault ? "text-white" : "text-black")}>
                                                    {method.type === "CARD" ? `**** ${method.last4}` : method.phone}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 relative z-10">
                                            {!method.isDefault && (
                                                <button
                                                    onClick={() => setDefaultMutation.mutate(method.id)}
                                                    className="p-3 rounded-xl bg-black text-white hover:bg-blue-600 transition-all shadow-xl"
                                                    title="Assign as Primary"
                                                >
                                                    <Zap size={16} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    if (confirm("PURGE PROTOCOL TRIGGERED: Delete this payment method?")) {
                                                        deleteMethodMutation.mutate(method.id);
                                                    }
                                                }}
                                                className={cn(
                                                    "p-3 rounded-xl border transition-all",
                                                    method.isDefault ? "bg-white/5 border-white/10 text-white/40 hover:bg-red-500 hover:text-white" : "bg-white border-muted text-muted-foreground hover:bg-red-500 hover:text-white"
                                                )}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-16 bg-muted/20 rounded-[2.5rem] border-2 border-dashed border-muted space-y-4">
                                    <div className="w-16 h-16 bg-muted/40 rounded-[1.5rem] flex items-center justify-center mx-auto opacity-20">
                                        <Wallet size={32} />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.4em]">Registry Empty</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Compliance / Logic Info */}
                    <div className="bg-black text-white rounded-[3.5rem] p-10 relative overflow-hidden group shadow-2xl">
                         <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -mr-32 -mt-32 blur-[100px]" />
                         <div className="relative z-10 space-y-6">
                            <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
                                <ShieldCheck size={28} className="text-blue-500" />
                            </div>
                            <h3 className="text-3xl font-black uppercase italic tracking-tighter leading-none">Security <br/> Protocol <span className="text-blue-500 NOT-italic">.</span></h3>
                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em] leading-relaxed">
                                Financial endpoints are encrypted via Advanced Stream Logic. Settle accounts within 24 hours of operational verification. Integrated with Paystack for secure Africa-wide clearing.
                            </p>
                         </div>
                    </div>
                </div>

                {/* Operational Ledger (History) */}
                <div className="lg:col-span-7">
                    <div className="bg-white rounded-[3.5rem] border border-muted shadow-sm overflow-hidden flex flex-col group h-full">
                        <div className="p-10 border-b border-muted flex items-center justify-between">
                            <div className="space-y-1">
                                <h2 className="text-xl font-black text-foreground tracking-tight uppercase italic leading-none">Settlement <br/> History <span className="text-blue-600 NOT-italic">.</span></h2>
                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em]">Operational Transaction Archive</p>
                            </div>
                            <div className="w-12 h-12 bg-muted/30 rounded-2xl flex items-center justify-center text-muted-foreground group-hover:text-black group-hover:rotate-12 transition-all">
                                <History size={20} />
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="space-y-4">
                                {payments && payments.length > 0 ? (
                                    payments.map((payment: any) => (
                                        <div key={payment.id} className="flex items-center justify-between p-6 hover:bg-black hover:text-white rounded-[2.5rem] transition-all duration-500 group/row border border-transparent hover:border-black shadow-none hover:shadow-2xl hover:shadow-black/10">
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 rounded-[1.8rem] bg-blue-500/10 text-blue-600 flex items-center justify-center font-black text-[10px] uppercase tracking-tighter shrink-0 group-hover/row:bg-white group-hover/row:text-black transition-colors">
                                                    PAID
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-base uppercase tracking-tight italic leading-none mb-1 group-hover/row:text-white">
                                                        {payment.booking?.hostel?.name || "Asset Deployment"}
                                                    </h4>
                                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-2 group-hover/row:text-white/40">
                                                        {format(new Date(payment.createdAt), "MMM d, yyyy")} <Activity size={10} /> VIA {payment.provider}
                                                    </p>
                                                    <p className="text-[9px] text-primary font-black uppercase tracking-widest mt-1 opacity-70 group-hover/row:opacity-100">REF: {payment.reference.toUpperCase()}</p>
                                                </div>
                                            </div>
                                            <div className="text-right flex flex-col items-end gap-3">
                                                <p className="text-2xl font-black tracking-tighter leading-none group-hover/row:text-white">
                                                    ₵{(payment.amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </p>
                                                <Link
                                                    href={`/account/payments/receipt/${payment.id}`}
                                                    className="inline-flex items-center gap-2 bg-muted/30 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all group-hover/row:bg-white/10 group-hover/row:hover:bg-blue-600"
                                                    target="_blank"
                                                >
                                                    <Download size={14} /> ARCHIVE
                                                </Link>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-20 text-center space-y-6">
                                        <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto opacity-20">
                                            <Activity size={40} />
                                        </div>
                                        <p className="text-muted-foreground font-black uppercase tracking-[0.5em] text-[11px]">No Operational Data Found</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {payments && payments.length > 5 && (
                             <div className="mt-auto p-10 bg-muted/20 text-center">
                                <Link href="/account/payments/history" className="inline-flex items-center gap-3 text-[10px] font-black text-foreground uppercase tracking-[0.4em] hover:text-blue-600 transition-colors group">
                                    ACCESS GLOBAL ARCHIVE <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
