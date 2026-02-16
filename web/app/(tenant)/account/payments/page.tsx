"use client";
// Forced fix for Vercel build

import { CreditCard, History, Download, Loader2, Plus, Trash2, CheckCircle2, MoreVertical, Smartphone, Building2 } from "lucide-react";
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
            toast.success("Payment method saved successfully");
            setIsAddModalOpen(false);
            setNewMethod({ type: "MOMO", provider: "MTN", phone: "", last4: "" });
            queryClient.invalidateQueries({ queryKey: ["saved-payment-methods"] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to save payment method");
        }
    });

    const deleteMethodMutation = useMutation({
        mutationFn: async (id: string) => {
            return api.delete(`/payment-methods/${id}`);
        },
        onSuccess: () => {
            toast.success("Payment method deleted");
            queryClient.invalidateQueries({ queryKey: ["saved-payment-methods"] });
        }
    });

    const setDefaultMutation = useMutation({
        mutationFn: async (id: string) => {
            return api.patch(`/payment-methods/${id}/default`);
        },
        onSuccess: () => {
            toast.success("Default payment method updated");
            queryClient.invalidateQueries({ queryKey: ["saved-payment-methods"] });
        }
    });

    const handleAddMethod = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMethod.type === "MOMO" && !/^233[0-9]{9}$/.test(newMethod.phone)) {
            toast.error("Please enter a valid Ghana phone number (233XXXXXXXXX)");
            return;
        }
        if (newMethod.type === "CARD" && !/^[0-9]{4}$/.test(newMethod.last4)) {
            toast.error("Please enter the last 4 digits of your card");
            return;
        }
        addMethodMutation.mutate(newMethod);
    };

    const isLoading = isPaymentsLoading || isMethodsLoading;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Payments & Billing</h1>
                <p className="text-gray-500">Manage your payment methods and view your transaction history.</p>
            </div>

            <div className="grid gap-8">
                {/* Payment Methods */}
                <div className="bg-white rounded-3xl border p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                                <CreditCard size={20} />
                            </div>
                            <h2 className="text-lg font-bold">Payment Methods</h2>
                        </div>

                        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                            <DialogTrigger asChild>
                                <button className="text-sm font-bold text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                                    <Plus size={16} /> Add Method
                                </button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Add Payment Method</DialogTitle>
                                    <DialogDescription>
                                        Save your payment details for faster checkout.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleAddMethod} className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Method Type</Label>
                                        <Select
                                            value={newMethod.type}
                                            onValueChange={(v) => {
                                                const defaultProvider = v === "MOMO" ? "MTN" : v === "CARD" ? "VISA" : "GCB Bank";
                                                setNewMethod({ ...newMethod, type: v, provider: defaultProvider });
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="MOMO">Mobile Money</SelectItem>
                                                <SelectItem value="CARD">Bank Card</SelectItem>
                                                <SelectItem value="BANK">Bank Transfer</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Provider / Bank Name</Label>
                                        {newMethod.type === "MOMO" ? (
                                            <Select
                                                value={newMethod.provider}
                                                onValueChange={(v) => setNewMethod({ ...newMethod, provider: v })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select provider" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="MTN">MTN Mobile Money</SelectItem>
                                                    <SelectItem value="VODAFONE">Vodafone Cash</SelectItem>
                                                    <SelectItem value="AIRTELTIGO">AirtelTigo Money</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        ) : newMethod.type === "CARD" ? (
                                            <Select
                                                value={newMethod.provider}
                                                onValueChange={(v) => setNewMethod({ ...newMethod, provider: v })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select provider" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="VISA">Visa</SelectItem>
                                                    <SelectItem value="MASTERCARD">Mastercard</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <Select
                                                value={newMethod.provider}
                                                onValueChange={(v) => setNewMethod({ ...newMethod, provider: v })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select bank" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {GHANA_BANKS.map(bank => (
                                                        <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </div>

                                    {newMethod.type === "MOMO" && (
                                        <div className="space-y-2">
                                            <Label htmlFor="momoNumber">MoMo Number</Label>
                                            <Input
                                                id="momoNumber"
                                                placeholder="233XXXXXXXXX"
                                                value={newMethod.phone}
                                                onChange={(e) => setNewMethod({ ...newMethod, phone: e.target.value })}
                                                required
                                            />
                                            <p className="text-[10px] text-gray-500 font-medium">Must start with 233, e.g. 233244123456</p>
                                        </div>
                                    )}

                                    {newMethod.type === "CARD" && (
                                        <div className="space-y-2">
                                            <Label htmlFor="last4">Last 4 Digits</Label>
                                            <Input
                                                id="last4"
                                                placeholder="1234"
                                                maxLength={4}
                                                value={newMethod.last4}
                                                onChange={(e) => setNewMethod({ ...newMethod, last4: e.target.value })}
                                                required
                                            />
                                        </div>
                                    )}

                                    {newMethod.type === "BANK" && (
                                        <div className="space-y-2">
                                            <Label htmlFor="accountNumber">Account Number</Label>
                                            <Input
                                                id="accountNumber"
                                                placeholder="Enter account number"
                                                value={newMethod.phone}
                                                onChange={(e) => setNewMethod({ ...newMethod, phone: e.target.value })}
                                                required
                                            />
                                        </div>
                                    )}
                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                                        <Button type="submit" disabled={addMethodMutation.isPending}>
                                            {addMethodMutation.isPending ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                                            Save Method
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="space-y-4">
                        {savedMethods && savedMethods.length > 0 ? (
                            savedMethods.map((method: any) => (
                                <div key={method.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border shadow-sm">
                                            {method.type === "MOMO" ? <Smartphone size={20} className="text-gray-400" /> :
                                                method.type === "BANK" ? <Building2 size={20} className="text-gray-400" /> :
                                                    <CreditCard size={20} className="text-gray-400" />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-gray-900">
                                                    {method.provider} • {method.type === "CARD" ? `**** ${method.last4}` : method.phone}
                                                </p>
                                                {method.isDefault && (
                                                    <span className="text-[8px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Default</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">{method.type}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {!method.isDefault && (
                                            <button
                                                onClick={() => setDefaultMutation.mutate(method.id)}
                                                className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline px-2"
                                            >
                                                Set Default
                                            </button>
                                        )}
                                        <button
                                            onClick={() => {
                                                if (confirm("Are you sure you want to delete this payment method?")) {
                                                    deleteMethodMutation.mutate(method.id);
                                                }
                                            }}
                                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                <p className="text-gray-500 mb-2">No payment methods saved yet.</p>
                                <p className="text-xs text-gray-400 px-4">Save your MoMo number for a seamless booking experience.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Transaction History */}
                <div className="bg-white rounded-3xl border p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
                            <History size={20} />
                        </div>
                        <h2 className="text-lg font-bold">Transaction History</h2>
                    </div>

                    <div className="space-y-4">
                        {payments && payments.length > 0 ? (
                            payments.map((payment: any) => (
                                <div key={payment.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100 gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                                            PAID
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 line-clamp-1">
                                                {payment.booking?.hostel?.name || "Hostel Booking"}
                                            </h4>
                                            <p className="text-xs text-gray-500">
                                                {format(new Date(payment.createdAt), "MMM d, yyyy")} • via {payment.provider}
                                            </p>
                                            <p className="text-[10px] text-gray-400 font-mono mt-0.5">Ref: {payment.reference}</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto">
                                        <p className="font-bold text-gray-900">
                                            {payment.currency} {(payment.amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </p>
                                        <Link
                                            href={`/account/payments/receipt/${payment.id}`}
                                            className="text-xs font-bold text-blue-600 hover:underline flex items-center justify-end gap-1 mt-1"
                                            target="_blank"
                                        >
                                            <Download size={12} /> Receipt
                                        </Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10">
                                <p className="text-gray-500">No transaction history found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
