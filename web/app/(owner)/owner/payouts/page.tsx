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
    TrendingUp,
    ChevronRight,
    Smartphone,
    Wallet
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
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [isRequesting, setIsRequesting] = useState(false);

    const { data: wallet, isLoading: walletLoading } = useQuery({
        queryKey: ["owner-wallet"],
        queryFn: async () => {
            const res = await api.get("/wallets/me");
            return res.data;
        }
    });

    const { data: history, isLoading: historyLoading } = useQuery({
        queryKey: ["payout-history"],
        queryFn: async () => {
            const res = await api.get("/payouts/history");
            return Array.isArray(res.data) ? res.data : [];
        }
    });

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
            toast.success("Payout method added");
            setShowForm(false);
            reset();
        },
        onError: (err: any) => toast.error(err.message),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/payouts/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["payout-methods"] });
            toast.success("Payout method removed");
        },
        onError: (err: any) => toast.error(err.message),
    });

    const setDefaultMutation = useMutation({
        mutationFn: (id: string) => api.patch(`/payouts/${id}/default`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["payout-methods"] });
            toast.success("Primary method updated");
        },
        onError: (err: any) => toast.error(err.message),
    });

    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<PayoutFormValues>({
        resolver: zodResolver(payoutSchema),
        defaultValues: {
            type: "MOBILE_MONEY",
            isDefault: false,
        }
    });

    const selectedType = watch("type");

    if (isLoading || walletLoading || historyLoading) return (
        <div className="flex h-[60vh] items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-center">
                <Loader2 className="animate-spin text-blue-600" size={32} />
                <p className="text-sm font-medium text-gray-400">Loading payout settings...</p>
            </div>
        </div>
    );

    const balance = (wallet?.balance || 0) / 100;

    const handleWithdrawal = async () => {
        const amount = parseFloat(withdrawAmount);
        if (isNaN(amount) || amount <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        if (amount > balance) {
            toast.error("Insufficient balance");
            return;
        }

        setIsRequesting(true);
        try {
            await api.post("/payouts/request", { amount: Math.round(amount * 100) });
            toast.success("Withdrawal request submitted for review");
            setIsWithdrawModalOpen(false);
            setWithdrawAmount("");
            queryClient.invalidateQueries({ queryKey: ["payout-history"] });
            queryClient.invalidateQueries({ queryKey: ["owner-wallet"] });
        } catch (error: any) {
            toast.error(error.message || "Request failed");
        } finally {
            setIsRequesting(false);
        }
    };

    return (
        <>
        <div className="max-w-[1400px] mx-auto space-y-10 pb-20 pt-4">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Earnings Distribution</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Payout Methods</h1>
                    <p className="text-gray-500 text-sm max-w-md">Manage where your earnings are sent (Bank or Mobile Money).</p>
                </div>

                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/10"
                    >
                        <Plus size={18} />
                        Add Payout Method
                    </button>
                )}
            </div>

            {/* Wallet Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-900 rounded-2xl p-8 text-white relative overflow-hidden group border border-gray-800 shadow-xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-transform duration-700" />
                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                                <Wallet size={24} className="text-blue-400" />
                            </div>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md">Wallet Balance</span>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">Available for Payout</p>
                            <h3 className="text-4xl font-bold tracking-tighter">₵{balance.toLocaleString()}</h3>
                        </div>
                        <button 
                            disabled={balance <= 0}
                            onClick={() => setIsWithdrawModalOpen(true)}
                            className="w-full h-12 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-all uppercase tracking-widest shadow-lg shadow-blue-900/10 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            Withdraw Funds <ArrowUpRight size={14} className="inline ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </button>
                    </div>
                </div>

                <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 p-8 shadow-sm flex flex-col justify-between">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <ShieldCheck size={20} className="text-emerald-500" />
                            <h3 className="font-bold text-gray-900 tracking-tight text-lg">Payout Security</h3>
                        </div>
                        <p className="text-sm text-gray-500 leading-relaxed font-medium">
                            To protect your earnings, all withdrawal requests undergo a manual verification process by our finance team. This ensures that payments are sent to the correct settlement accounts and prevents fraudulent activities.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Standard Processing</p>
                            <p className="text-xs font-bold text-gray-900">12 - 24 Hours</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Service Fee</p>
                            <p className="text-xs font-bold text-gray-900">0% Platform Fee</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Form or Lists */}
                <div className="lg:col-span-12 space-y-6">
                    {showForm && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                                <div className="space-y-1">
                                    <h2 className="text-lg font-bold text-gray-900 tracking-tight">Add New Payout Account</h2>
                                    <p className="text-xs text-gray-400 font-medium">Set up a new way to receive your money.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => { setShowForm(false); reset(); }}
                                    className="p-2 text-gray-400 hover:text-gray-900 hover:bg-white rounded-lg transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit((v) => createMutation.mutate(v))} className="p-8 space-y-8">
                                <div className="space-y-4">
                                    <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-widest">Account Type</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {(["MOBILE_MONEY", "BANK"] as const).map((t) => (
                                            <button
                                                key={t}
                                                type="button"
                                                onClick={() => reset({ ...watch(), type: t })}
                                                className={cn(
                                                    "flex items-center gap-4 px-6 py-5 rounded-xl border transition-all duration-300",
                                                    selectedType === t
                                                        ? "bg-gray-900 text-white border-gray-900 shadow-lg"
                                                        : "bg-white border-gray-100 text-gray-500 hover:border-gray-200"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-10 h-10 rounded-lg flex items-center justify-center",
                                                    selectedType === t ? "bg-white/10" : "bg-gray-50"
                                                )}>
                                                    {t === "MOBILE_MONEY" ? <Smartphone size={20} /> : <Building2 size={20} />}
                                                </div>
                                                <span className="font-bold text-sm">{t === "MOBILE_MONEY" ? "Mobile Money" : "Bank Account"}</span>
                                                {selectedType === t && <Check size={16} className="ml-auto text-blue-400" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 ml-1">Provider</label>
                                        <select
                                            {...register("provider")}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                const list = selectedType === "BANK" ? GHANA_BANKS : GHANA_MOMO_PROVIDERS;
                                                const found = list.find(l => l.name === val);
                                                if (found) setValue("bankCode", found.code);
                                            }}
                                            className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl px-4 text-sm font-bold focus:bg-white focus:border-blue-500 outline-none transition-all"
                                        >
                                            <option value="">Select Provider</option>
                                            {selectedType === "BANK"
                                                ? GHANA_BANKS.map(bank => <option key={bank.code} value={bank.name}>{bank.name}</option>)
                                                : GHANA_MOMO_PROVIDERS.map(momo => <option key={momo.code} value={momo.name}>{momo.name}</option>)
                                            }
                                        </select>
                                        {errors.provider && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.provider.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 ml-1">Account Number</label>
                                        <input
                                            {...register("accountNumber")}
                                            placeholder={selectedType === "MOBILE_MONEY" ? "024XXXXXXX" : "XXXXXXXXXXX"}
                                            className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl px-4 text-sm font-bold focus:bg-white focus:border-blue-500 outline-none transition-all"
                                        />
                                        {errors.accountNumber && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.accountNumber.message}</p>}
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-xs font-bold text-gray-500 ml-1">Account Holder Name</label>
                                        <input
                                            {...register("accountName")}
                                            placeholder="John Doe"
                                            className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl px-4 text-sm font-bold focus:bg-white focus:border-blue-500 outline-none transition-all"
                                        />
                                        {errors.accountName && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.accountName.message}</p>}
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row items-center gap-6 pt-4">
                                    <label className="flex-1 w-full flex items-center gap-4 cursor-pointer p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-all">
                                        <input type="checkbox" {...register("isDefault")} className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                        <div className="space-y-0.5">
                                            <p className="text-xs font-bold text-gray-900">Set as primary payout account</p>
                                            <p className="text-[10px] text-gray-400 font-medium">This account will receive all your earnings from bookings.</p>
                                        </div>
                                    </label>

                                    <button
                                        type="submit"
                                        disabled={createMutation.isPending}
                                        className="w-full md:w-auto px-10 h-12 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-500/10"
                                    >
                                        {createMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                                        Save Payout Method
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="space-y-4">
                        {methods?.length === 0 ? (
                            <div className="bg-white border border-gray-100 border-dashed rounded-2xl p-20 text-center space-y-4">
                                <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center mx-auto text-gray-300">
                                    <Wallet size={32} />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold text-gray-900">No payout methods</h3>
                                    <p className="text-sm text-gray-500 max-w-sm mx-auto">Add a bank account or mobile money wallet to receive your earnings.</p>
                                </div>
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="mt-2 px-8 py-3 bg-gray-900 text-white rounded-xl font-bold text-xs hover:bg-black transition-all"
                                >
                                    Add your first method
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {methods?.map((method: any) => (
                                    <div key={method.id} className={cn(
                                        "group bg-white rounded-2xl border p-6 transition-all duration-300",
                                        method.isDefault
                                            ? "border-gray-900 shadow-md"
                                            : "border-gray-100 hover:border-gray-200"
                                    )}>
                                        <div className="flex flex-col md:flex-row items-center gap-6">
                                            <div className={cn(
                                                "w-14 h-14 rounded-xl flex items-center justify-center shrink-0 border",
                                                method.isDefault ? "bg-gray-900 text-white border-gray-900" : "bg-gray-50 text-gray-400 border-gray-100"
                                            )}>
                                                {method.type === "BANK" ? <Building2 size={24} /> : <Smartphone size={24} />}
                                            </div>

                                            <div className="flex-1 text-center md:text-left">
                                                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                                    <h3 className="font-bold text-base text-gray-900">{method.provider}</h3>
                                                    {method.isDefault && (
                                                        <span className="bg-blue-600 text-white px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-tight">Primary</span>
                                                    )}
                                                </div>
                                                <p className="text-lg font-bold font-mono text-gray-900 leading-none">{method.accountNumber}</p>
                                                <div className="flex items-center justify-center md:justify-start gap-3 mt-1.5 opacity-60">
                                                    <p className="text-xs font-medium text-gray-500">{method.accountName}</p>
                                                    <div className="w-1 h-1 rounded-full bg-gray-300" />
                                                    <p className="text-xs font-medium text-gray-400">{method.type === "BANK" ? "Bank" : "Mobile Money"}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {!method.isDefault && (
                                                    <button
                                                        onClick={() => setDefaultMutation.mutate(method.id)}
                                                        className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-blue-600 font-bold text-[10px] transition-all"
                                                    >
                                                        Set Primary
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => {
                                                        if (confirm("Remove this payout method?")) {
                                                            deleteMutation.mutate(method.id);
                                                        }
                                                    }}
                                                    className="p-2.5 rounded-lg border border-gray-100 text-gray-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Payout History Section */}
                <div className="lg:col-span-12 space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="text-blue-600" size={20} />
                            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Withdrawal History</h2>
                        </div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recent Activity</span>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        {history.length === 0 ? (
                            <div className="p-16 text-center space-y-4">
                                <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center mx-auto text-gray-300">
                                    <Clock size={28} />
                                </div>
                                <p className="text-sm font-medium text-gray-500">No withdrawal requests found.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-50/50">
                                            <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                                            <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Amount</th>
                                            <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Recipient Info</th>
                                            <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {history.map((req: any) => (
                                            <tr key={req.id} className="hover:bg-gray-50/50 transition-all">
                                                <td className="px-8 py-6">
                                                    <p className="text-sm font-bold text-gray-900">
                                                        {new Date(req.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400 font-medium">
                                                        {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </td>
                                                <td className="px-8 py-6 font-mono font-bold text-gray-900">
                                                    ₵{(req.amount / 100).toLocaleString()}
                                                </td>
                                                <td className="px-8 py-6">
                                                    <p className="text-xs font-bold text-gray-900">{req.payoutMethodDetails?.provider || "Default Account"}</p>
                                                    <p className="text-[10px] text-gray-400 font-medium">{req.payoutMethodDetails?.accountNumber || "Direct Settlement"}</p>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={cn(
                                                        "px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                                                        req.status === "APPROVED" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                        req.status === "PENDING" ? "bg-blue-50 text-blue-600 border-blue-100" :
                                                        "bg-rose-50 text-rose-600 border-rose-100"
                                                    )}>
                                                        {req.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Compliance Info */}
                <div className="lg:col-span-12">
                    <div className="bg-gray-900 p-8 rounded-2xl text-white relative overflow-hidden group shadow-xl border border-gray-800">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                            <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
                                <ShieldCheck size={28} className="text-blue-500" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <h4 className="text-lg font-bold tracking-tight">Payout Rules</h4>
                                <p className="text-xs text-gray-400 font-medium leading-relaxed max-w-2xl">
                                    All payouts are secure. A 10% service fee is deducted before sending money. Payments are sent within 24 hours of booking verification (check-in confirmation).
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Withdraw Modal */}
        <Dialog open={isWithdrawModalOpen} onOpenChange={setIsWithdrawModalOpen}>
            <DialogContent className="sm:max-w-[480px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
                <div className="absolute inset-0 bg-white/80 backdrop-blur-xl z-0" />
                
                <div className="relative z-10">
                    <div className="p-8 pb-4 flex flex-col items-center text-center space-y-4 bg-blue-50/50">
                        <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-lg shadow-blue-100">
                            <ArrowUpRight size={32} />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black tracking-tight text-gray-900">WITHDRAW FUNDS</h2>
                            <p className="text-sm font-medium text-gray-500">Enter the amount you wish to transfer to your primary payout account.</p>
                        </div>
                    </div>

                    <div className="p-8 pt-6 space-y-6">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between px-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount (GHS)</label>
                                <span className="text-[10px] font-bold text-blue-600 uppercase">Max: ₵{balance.toLocaleString()}</span>
                            </div>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-400">₵</div>
                                <input 
                                    type="number"
                                    value={withdrawAmount}
                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full h-16 pl-12 pr-4 bg-gray-50 border border-gray-100 rounded-2xl font-mono text-2xl font-bold focus:bg-white focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
                            <Zap size={20} className="text-amber-600 shrink-0" />
                            <p className="text-[11px] font-medium text-amber-700 leading-relaxed">
                                Requests made before 12:00 PM GMT are typically processed on the same day. Minimum withdrawal is ₵10.00.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsWithdrawModalOpen(false)}
                                className="h-12 flex-1 rounded-2xl border border-gray-100 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleWithdrawal}
                                disabled={isRequesting || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
                                className="h-12 flex-1 rounded-2xl bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50"
                            >
                                {isRequesting ? <Loader2 className="animate-spin" /> : "Request Transfer"}
                            </button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
        </>
    );
}

import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
