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
    X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { GHANA_BANKS, GHANA_MOMO_PROVIDERS } from "@/lib/constants";

const payoutSchema = z.object({
    type: z.enum(["BANK", "MOBILE_MONEY"]),
    provider: z.string().min(2, "Provider name is required"),
    bankCode: z.string().optional(),
    accountNumber: z.string().min(8, "Account number is too short"),
    accountName: z.string().min(3, "Account name is required"),
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
            toast.success("Payout method added successfully!");
            setShowForm(false);
            reset();
        },
        onError: (err: any) => toast.error(err.response?.data?.message || "Failed to add payout method"),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/payouts/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["payout-methods"] });
            toast.success("Payout method removed");
        },
    });

    const setDefaultMutation = useMutation({
        mutationFn: (id: string) => api.patch(`/payouts/${id}/default`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["payout-methods"] });
            toast.success("Default payout method updated");
        },
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
        <div className="flex h-[60vh] items-center justify-center">
            <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
    );

    return (
        <div className="max-w-4xl space-y-10 pb-20">
            {/* Header */}
            <div className="flex items-start justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-100">
                            Financials
                        </span>
                    </div>
                    <h1 className="text-4xl font-black text-gray-950 tracking-tight leading-none mb-3">
                        Payout Settings <span className="text-blue-600">.</span>
                    </h1>
                    <p className="text-gray-500 font-medium text-lg">Manage where you receive your hostel income.</p>
                </div>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-3 bg-gray-950 text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200 group active:scale-[0.98]"
                    >
                        <Plus size={16} className="group-hover:rotate-90 transition-transform" />
                        Add Method
                    </button>
                )}
            </div>

            {/* Add Form */}
            {showForm && (
                <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 md:p-10 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-black text-gray-950 tracking-tight">New Payout Method</h2>
                            <p className="text-sm text-gray-400 font-medium mt-1">Add a bank account or mobile money number</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => { setShowForm(false); reset(); }}
                            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-900"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit((v) => createMutation.mutate(v))} className="space-y-6">
                        {/* Type Selector */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Method Type</label>
                            <div className="grid grid-cols-2 gap-3">
                                {(["MOBILE_MONEY", "BANK"] as const).map((t) => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => reset({ ...watch(), type: t })}
                                        className={cn(
                                            "flex items-center gap-3 p-5 rounded-2xl border-2 font-black text-sm transition-all",
                                            selectedType === t
                                                ? "border-gray-950 bg-gray-950 text-white shadow-lg"
                                                : "border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200"
                                        )}
                                    >
                                        {t === "MOBILE_MONEY" ? <Phone size={18} /> : <Building2 size={18} />}
                                        {t === "MOBILE_MONEY" ? "Mobile Money" : "Bank Account"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Provider</label>
                                <select
                                    {...register("provider")}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        const list = selectedType === "BANK" ? GHANA_BANKS : GHANA_MOMO_PROVIDERS;
                                        const found = list.find(l => l.name === val);
                                        if (found) setValue("bankCode", found.code);
                                        register("provider").onChange(e);
                                    }}
                                    className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-5 text-sm font-bold focus:ring-4 focus:ring-blue-100 outline-none transition-all appearance-none text-gray-950"
                                >
                                    <option value="">Select provider</option>
                                    {selectedType === "BANK"
                                        ? GHANA_BANKS.map(bank => <option key={bank.code} value={bank.name}>{bank.name}</option>)
                                        : GHANA_MOMO_PROVIDERS.map(momo => <option key={momo.code} value={momo.name}>{momo.name}</option>)
                                    }
                                </select>
                                {errors.provider && <p className="text-[10px] text-red-500 font-bold">{errors.provider.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    {selectedType === "MOBILE_MONEY" ? "Phone Number" : "Account Number"}
                                </label>
                                <input
                                    {...register("accountNumber")}
                                    placeholder={selectedType === "MOBILE_MONEY" ? "0244123456" : "Enter account number"}
                                    className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-5 text-sm font-bold focus:ring-4 focus:ring-blue-100 outline-none transition-all text-gray-950 placeholder:text-gray-300"
                                />
                                {errors.accountNumber && <p className="text-[10px] text-red-500 font-bold">{errors.accountNumber.message}</p>}
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Account Name</label>
                                <input
                                    {...register("accountName")}
                                    placeholder="Full name as registered"
                                    className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-5 text-sm font-bold focus:ring-4 focus:ring-blue-100 outline-none transition-all text-gray-950 placeholder:text-gray-300"
                                />
                                {errors.accountName && <p className="text-[10px] text-red-500 font-bold">{errors.accountName.message}</p>}
                            </div>
                        </div>

                        <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all">
                            <input type="checkbox" {...register("isDefault")} id="isDefault" className="w-5 h-5 rounded-lg border-gray-300 text-blue-600 focus:ring-blue-600" />
                            <div>
                                <p className="text-sm font-black text-gray-950">Set as primary payout method</p>
                                <p className="text-xs text-gray-400 font-medium">Payouts will default to this account</p>
                            </div>
                        </label>

                        <div className="flex gap-4 pt-2">
                            <button
                                type="submit"
                                disabled={createMutation.isPending}
                                className="flex-1 bg-blue-600 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                            >
                                {createMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                Save Payout Method
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Methods List */}
            <div className="space-y-4">
                {methods?.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-gray-100 rounded-[3rem] p-20 text-center space-y-6">
                        <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto transform rotate-3">
                            <CreditCard className="text-gray-200" size={40} />
                        </div>
                        <div className="max-w-xs mx-auto">
                            <h3 className="text-2xl font-black text-gray-950 tracking-tight mb-2">No payout methods</h3>
                            <p className="text-gray-500 font-medium">Add a bank account or mobile money number to receive your hostel earnings.</p>
                        </div>
                        <button
                            onClick={() => setShowForm(true)}
                            className="inline-flex items-center gap-2 text-blue-600 font-black text-sm uppercase tracking-widest hover:underline"
                        >
                            Add first method <Plus size={14} />
                        </button>
                    </div>
                ) : (
                    methods?.map((method: any) => (
                        <div key={method.id} className={cn(
                            "group bg-white rounded-[2rem] border p-8 transition-all duration-300 flex items-center gap-8",
                            method.isDefault
                                ? "border-blue-200 shadow-lg shadow-blue-50"
                                : "border-gray-100 hover:border-gray-200 hover:shadow-lg"
                        )}>
                            <div className={cn(
                                "w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-inner shrink-0",
                                method.type === "BANK" ? "bg-blue-50 text-blue-600" : "bg-yellow-50 text-yellow-600"
                            )}>
                                {method.type === "BANK" ? <Building2 size={26} /> : <Phone size={26} />}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="font-black text-base text-gray-950 uppercase tracking-tight">{method.provider}</h3>
                                    {method.isDefault && (
                                        <span className="bg-blue-600 text-white px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest">Default</span>
                                    )}
                                </div>
                                <p className="text-xl font-black font-mono tracking-wider text-gray-950">{method.accountNumber}</p>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">{method.accountName}</p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                {!method.isDefault && (
                                    <button
                                        onClick={() => setDefaultMutation.mutate(method.id)}
                                        disabled={setDefaultMutation.isPending}
                                        className="p-3 rounded-xl border border-gray-100 bg-white hover:bg-blue-50 hover:border-blue-200 text-gray-400 hover:text-blue-600 transition-all"
                                        title="Set as Default"
                                    >
                                        <CheckCircle2 size={18} />
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        if (confirm(`Remove ${method.provider} ending in ${method.accountNumber.slice(-4)}?`)) {
                                            deleteMutation.mutate(method.id);
                                        }
                                    }}
                                    disabled={deleteMutation.isPending}
                                    className="p-3 rounded-xl border border-gray-100 bg-white hover:bg-red-50 hover:border-red-200 text-gray-400 hover:text-red-500 transition-all"
                                    title="Remove Method"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Security Notice */}
            <div className="bg-white rounded-[2rem] border border-gray-100 p-8 flex items-start gap-5">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0 text-blue-600">
                    <ShieldCheck size={22} />
                </div>
                <div>
                    <h4 className="text-sm font-black text-gray-950 mb-1">Bank-Level Security</h4>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed">
                        Your payout information is encrypted and stored securely using industry-standard protocols. We only use these details to transfer your earnings. Payouts are processed immediately upon booking confirmation for verified accounts.
                    </p>
                </div>
            </div>
        </div>
    );
}
