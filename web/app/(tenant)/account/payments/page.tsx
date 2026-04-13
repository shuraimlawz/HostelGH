"use client";

import { CreditCard, History, Download, Loader2, Plus, Trash2, CheckCircle2, MoreVertical, Smartphone, Building2, Zap, ShieldCheck, ArrowRight, Activity, Wallet, ChevronRight, Star } from "lucide-react";
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
            toast.success("Payment method added");
            setIsAddModalOpen(false);
            setNewMethod({ type: "MOMO", provider: "MTN", phone: "", last4: "" });
            queryClient.invalidateQueries({ queryKey: ["saved-payment-methods"] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to add payment method");
        }
    });

    const deleteMethodMutation = useMutation({
        mutationFn: async (id: string) => {
            return api.delete(`/payment-methods/${id}`);
        },
        onSuccess: () => {
            toast.success("Payment method removed");
            queryClient.invalidateQueries({ queryKey: ["saved-payment-methods"] });
        }
    });

    const setDefaultMutation = useMutation({
        mutationFn: async (id: string) => {
            return api.patch(`/payment-methods/${id}/default`);
        },
        onSuccess: () => {
            toast.success("Primary method updated");
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
                toast.error("Invalid phone", { description: "Enter 233XXXXXXXXX format" });
                return;
            }
            payload.phone = newMethod.phone;
        } else if (newMethod.type === "CARD") {
            if (!/^[0-9]{4}$/.test(newMethod.last4)) {
                toast.error("Invalid card", { description: "Enter last 4 digits" });
                return;
            }
            payload.last4 = newMethod.last4;
        } else if (newMethod.type === "BANK") {
            if (!newMethod.phone) {
                toast.error("Required", { description: "Enter account number" });
                return;
            }
            payload.phone = newMethod.phone;
        }

        addMethodMutation.mutate(payload);
    };

    if (isPaymentsLoading || isMethodsLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                    <p className="text-sm font-medium text-gray-400">Loading your financials...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto space-y-10 pb-20 pt-4">
            {/* Elegant Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Billing & Settlement</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Payments Hub</h1>
                    <p className="text-gray-500 text-sm max-w-md">Manage your payment methods and view your transaction history.</p>
                </div>

                <div className="flex items-center gap-3">
                    <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                        <DialogTrigger asChild>
                            <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/10">
                                <Plus size={18} />
                                Add Payment Method
                            </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
                            <div className="bg-gray-900 text-white p-8">
                                <DialogTitle className="text-2xl font-bold tracking-tight">Add Method</DialogTitle>
                                <DialogDescription className="text-gray-400 text-xs mt-1">Configure a new secure payment gateway.</DialogDescription>
                            </div>
                            <form onSubmit={handleAddMethod} className="p-8 space-y-6 bg-white">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-gray-500 ml-1">Type</Label>
                                    <Select
                                        value={newMethod.type}
                                        onValueChange={(v) => {
                                            const defaultProvider = v === "MOMO" ? "MTN" : v === "CARD" ? "VISA" : "GCB Bank";
                                            setNewMethod({ ...newMethod, type: v, provider: defaultProvider });
                                        }}
                                    >
                                        <SelectTrigger className="h-12 rounded-xl border-gray-100 bg-gray-50/50 font-bold text-sm">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                                            <SelectItem value="MOMO">Mobile Money</SelectItem>
                                            <SelectItem value="CARD">Bank Card</SelectItem>
                                            <SelectItem value="BANK">Bank Account</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-gray-500 ml-1">Provider</Label>
                                    {newMethod.type === "MOMO" ? (
                                        <Select value={newMethod.provider} onValueChange={(v) => setNewMethod({ ...newMethod, provider: v })}>
                                            <SelectTrigger className="h-12 rounded-xl border-gray-100 bg-gray-50/50 font-bold text-sm">
                                                <SelectValue placeholder="Select provider" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                                                <SelectItem value="MTN">MTN</SelectItem>
                                                <SelectItem value="VODAFONE">Vodafone</SelectItem>
                                                <SelectItem value="AIRTELTIGO">AirtelTigo</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : newMethod.type === "CARD" ? (
                                        <Select value={newMethod.provider} onValueChange={(v) => setNewMethod({ ...newMethod, provider: v })}>
                                            <SelectTrigger className="h-12 rounded-xl border-gray-100 bg-gray-50/50 font-bold text-sm">
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                                                <SelectItem value="VISA">Visa</SelectItem>
                                                <SelectItem value="MASTERCARD">Mastercard</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <Select value={newMethod.provider} onValueChange={(v) => setNewMethod({ ...newMethod, provider: v })}>
                                            <SelectTrigger className="h-12 rounded-xl border-gray-100 bg-gray-50/50 font-bold text-sm">
                                                <SelectValue placeholder="Select bank" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-gray-100 shadow-xl max-h-[300px]">
                                                {GHANA_BANKS.map(bank => (
                                                    <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-gray-500 ml-1">
                                        {newMethod.type === "MOMO" ? "Phone Number" : newMethod.type === "CARD" ? "Last 4 Digits" : "Account Number"}
                                    </Label>
                                    <Input
                                        placeholder={newMethod.type === "MOMO" ? "233XXXXXXXXX" : newMethod.type === "CARD" ? "1234" : "XXXXXXXXXXX"}
                                        value={newMethod.type === "CARD" ? newMethod.last4 : newMethod.phone}
                                        onChange={(e) => setNewMethod({ ...newMethod, [newMethod.type === "CARD" ? 'last4' : 'phone']: e.target.value })}
                                        className="h-12 rounded-xl border-gray-100 bg-gray-50/50 font-bold text-sm"
                                        maxLength={newMethod.type === "CARD" ? 4 : undefined}
                                        required
                                    />
                                </div>

                                <DialogFooter className="pt-4">
                                    <Button type="submit" disabled={addMethodMutation.isPending} className="w-full h-12 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-500/10">
                                        {addMethodMutation.isPending ? <Loader2 className="animate-spin mr-2" size={16} /> : <Zap size={16} className="mr-2 fill-current" />}
                                        Integrate Method
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Saved Methods */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h2 className="text-lg font-bold text-gray-900 tracking-tight">Payment Gateways</h2>
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-tight">Stored Financial Endpoints</p>
                            </div>
                            <div className="w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center shadow-lg">
                                <CreditCard size={20} />
                            </div>
                        </div>

                        <div className="space-y-4">
                            {savedMethods && savedMethods.length > 0 ? (
                                savedMethods.map((method: any) => (
                                    <div key={method.id} className={cn(
                                        "flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 group",
                                        method.isDefault
                                            ? "bg-gray-900 text-white border-gray-900"
                                            : "bg-gray-50 border-gray-100 hover:border-blue-100 hover:bg-white"
                                    )}>
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-12 h-12 rounded-xl flex items-center justify-center border",
                                                method.isDefault ? "bg-white/10 border-white/5 text-blue-400" : "bg-white border-gray-100 text-gray-400"
                                            )}>
                                                {method.type === "MOMO" ? <Smartphone size={20} /> :
                                                    method.type === "BANK" ? <Building2 size={20} /> :
                                                        <CreditCard size={20} />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-sm">{method.provider}</p>
                                                    {method.isDefault && (
                                                        <span className="text-[9px] font-bold bg-blue-500 text-white px-2 py-0.5 rounded-md">Primary</span>
                                                    )}
                                                </div>
                                                <p className={cn("text-sm font-mono tracking-tight", method.isDefault ? "text-gray-400" : "text-gray-500")}>
                                                    {method.type === "CARD" ? `**** ${method.last4}` : method.phone}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {!method.isDefault && (
                                                <button
                                                    onClick={() => setDefaultMutation.mutate(method.id)}
                                                    className="p-2 rounded-lg bg-gray-900 text-white hover:bg-blue-600 transition-all font-bold text-[10px]"
                                                >
                                                    Set Primary
                                                </button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    if (confirm("Delete this payment method?")) {
                                                        deleteMethodMutation.mutate(method.id);
                                                    }
                                                }}
                                                className={cn(
                                                    "p-2 rounded-lg border transition-all",
                                                    method.isDefault ? "bg-white/10 border-white/5 text-white/40 hover:bg-red-500 hover:text-white" : "bg-white border-gray-100 text-gray-400 hover:bg-red-500 hover:text-white"
                                                )}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No methods saved</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-blue-600 p-8 rounded-2xl text-white relative overflow-hidden group shadow-xl shadow-blue-500/10">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-125 transition-transform duration-1000" />
                         <div className="relative z-10 space-y-6">
                            <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center">
                                <ShieldCheck size={24} className="text-white" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-bold tracking-tight leading-tight">Security Standards</h3>
                                <p className="text-xs text-blue-100/70 font-medium leading-relaxed">
                                    Your data is encrypted via top-tier Africa-wide financial clearing protocols. Settle accounts within 24 hours of verification.
                                </p>
                            </div>
                            <Link href="/support/safety" className="inline-flex items-center gap-2 text-xs font-bold bg-white text-blue-600 px-6 py-3 rounded-xl hover:bg-blue-50 transition-all">
                                Safety Guide <ArrowRight size={14} />
                            </Link>
                         </div>
                    </div>
                </div>

                {/* History Ledger */}
                <div className="lg:col-span-7">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                            <div className="space-y-1">
                                <h2 className="text-lg font-bold text-gray-900 tracking-tight">Financial Ledger</h2>
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-tight">Transaction Archive</p>
                            </div>
                            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                                <History size={20} />
                            </div>
                        </div>

                        <div className="p-4 md:p-6 overflow-y-auto">
                            <div className="space-y-3">
                                {payments && payments.length > 0 ? (
                                    payments.map((payment: any) => (
                                        <div key={payment.id} className="flex items-center justify-between p-4 md:p-6 hover:bg-gray-50 rounded-2xl transition-all duration-300 group/row border border-transparent hover:border-gray-100">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-[10px] uppercase shrink-0",
                                                    payment.status === "SUCCESS" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                                                )}>
                                                    PAID
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-sm text-gray-900 mb-0.5">
                                                        {payment.booking?.hostel?.name || "Stay Payment"}
                                                    </h4>
                                                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium">
                                                        <span>{format(new Date(payment.createdAt), "MMM d, yyyy")}</span>
                                                        <span className="w-1 h-1 rounded-full bg-gray-200" />
                                                        <span>VIA {payment.provider}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right space-y-2">
                                                <p className="text-lg font-bold text-gray-900 tracking-tight">
                                                    ₵{(payment.amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </p>
                                                <Link
                                                    href={`/account/payments/receipt/${payment.id}`}
                                                    className="inline-flex items-center gap-1.5 text-blue-600 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg text-[10px] font-bold transition-all"
                                                    target="_blank"
                                                >
                                                    <Download size={14} /> Receipt
                                                </Link>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-20 text-center space-y-4">
                                        <Activity size={32} className="mx-auto text-gray-200" />
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No transactions found</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {payments && payments.length > 5 && (
                             <div className="mt-auto p-8 border-t border-gray-50 bg-gray-50/50 text-center">
                                <Link href="/account/payments/history" className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors">
                                    View Full History <ChevronRight size={16} />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
