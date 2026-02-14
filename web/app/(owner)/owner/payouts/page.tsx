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
    MoreVertical,
    Check,
    Lock
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
            toast.success("Payout method added!");
            setShowForm(false);
            reset();
        },
        onError: (err: any) => toast.error(err.response?.data?.message || "Failed to add payout method"),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/payouts/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["payout-methods"] });
            toast.success("Method removed");
        },
    });

    const setDefaultMutation = useMutation({
        mutationFn: (id: string) => api.patch(`/payouts/${id}/default`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["payout-methods"] });
            toast.success("Default method updated");
        },
    });

    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<PayoutFormValues>({
        resolver: zodResolver(payoutSchema),
        defaultValues: {
            type: "BANK",
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
        <div className="max-w-4xl space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Payout Settings</h1>
                    <p className="text-gray-500">Manage where you receive your hostel income.</p>
                </div>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-black/10 hover:opacity-90 active:scale-95 transition-all"
                    >
                        <Plus size={18} /> Add Method
                    </button>
                )}
            </div>

            {showForm && (
                <div className="bg-white rounded-[2.5rem] border p-8 md:p-10 shadow-xl shadow-gray-200/20 animate-in fade-in slide-in-from-top-4 duration-500">
                    <h2 className="text-xl font-bold mb-8">Add Payout Method</h2>
                    <form onSubmit={handleSubmit((v) => createMutation.mutate(v))} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Method Type</label>
                                <div className="flex gap-2">
                                    {(["BANK", "MOBILE_MONEY"] as const).map((t) => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => reset({ ...watch(), type: t })}
                                            className={cn(
                                                "flex-1 py-3 rounded-xl border font-bold text-xs uppercase tracking-widest transition-all",
                                                selectedType === t ? "bg-black text-white border-black" : "bg-white text-gray-500 hover:bg-gray-50"
                                            )}
                                        >
                                            {t.replace('_', ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Provider Name</label>
                                <select
                                    {...register("provider")}
                                    className="w-full h-12 bg-gray-50 border rounded-xl px-4 text-sm font-medium focus:ring-2 focus:ring-black outline-none transition-all appearance-none"
                                >
                                    <option value="">Select a provider</option>
                                    {selectedType === "BANK" ? (
                                        GHANA_BANKS.map(bank => <option key={bank} value={bank}>{bank}</option>)
                                    ) : (
                                        GHANA_MOMO_PROVIDERS.map(momo => <option key={momo} value={momo}>{momo}</option>)
                                    )}
                                </select>
                                {errors.provider && <p className="text-[10px] text-red-500 font-bold">{errors.provider.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Account Number</label>
                                <input
                                    {...register("accountNumber")}
                                    placeholder="Enter number"
                                    className="w-full h-12 bg-gray-50 border rounded-xl px-4 text-sm font-medium focus:ring-2 focus:ring-black outline-none transition-all"
                                />
                                {errors.accountNumber && <p className="text-[10px] text-red-500 font-bold">{errors.accountNumber.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Account Name</label>
                                <input
                                    {...register("accountName")}
                                    placeholder="Enter full name"
                                    className="w-full h-12 bg-gray-50 border rounded-xl px-4 text-sm font-medium focus:ring-2 focus:ring-black outline-none transition-all"
                                />
                                {errors.accountName && <p className="text-[10px] text-red-500 font-bold">{errors.accountName.message}</p>}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 py-2">
                            <input type="checkbox" {...register("isDefault")} id="isDefault" className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black" />
                            <label htmlFor="isDefault" className="text-sm font-bold text-gray-600">Set as default payout method</label>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={createMutation.isPending}
                                className="flex-1 bg-black text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-black/10 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                {createMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                                Save Method
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-8 border border-gray-200 rounded-2xl font-bold text-sm hover:bg-gray-50 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6">
                {methods?.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-gray-100 rounded-[2.5rem] p-20 text-center space-y-6">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                            <CreditCard className="text-gray-200" size={40} />
                        </div>
                        <div className="max-w-xs mx-auto">
                            <h3 className="text-xl font-bold">No payout methods</h3>
                            <p className="text-gray-500 mt-2">Add a bank account or mobile money number to receive payments from your tenants.</p>
                        </div>
                    </div>
                ) : (
                    methods?.map((method: any) => (
                        <div key={method.id} className={cn(
                            "group bg-white rounded-[2.5rem] border p-8 md:p-10 shadow-sm transition-all duration-300 flex flex-col md:flex-row items-center gap-8",
                            method.isDefault ? "border-blue-200 bg-blue-50/10 shadow-md shadow-blue-50" : "hover:shadow-lg"
                        )}>
                            <div className={cn(
                                "w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-inner",
                                method.type === "BANK" ? "bg-blue-100 text-blue-600" : "bg-yellow-100 text-yellow-700"
                            )}>
                                {method.type === "BANK" ? <Building2 size={24} /> : <Phone size={24} />}
                            </div>

                            <div className="flex-1 space-y-1 text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                    <h3 className="font-bold text-lg leading-tight uppercase tracking-tight">{method.provider}</h3>
                                    {method.isDefault && (
                                        <span className="bg-blue-600 text-white px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest">DEFAULT</span>
                                    )}
                                </div>
                                <p className="text-xl font-black font-mono tracking-wider">{method.accountNumber}</p>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{method.accountName}</p>
                            </div>

                            <div className="flex gap-2">
                                {!method.isDefault && (
                                    <button
                                        onClick={() => setDefaultMutation.mutate(method.id)}
                                        className="p-4 rounded-2xl border bg-white hover:bg-gray-50 text-gray-400 hover:text-blue-600 transition-all"
                                        title="Set as Default"
                                    >
                                        <CheckCircle2 size={20} />
                                    </button>
                                )}
                                <button
                                    onClick={() => deleteMutation.mutate(method.id)}
                                    className="p-4 rounded-2xl border bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all"
                                    title="Remove Method"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="bg-gray-50 rounded-[2.5rem] p-8 border border-gray-100 flex items-start gap-4">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center shrink-0">
                    <Lock size={18} className="text-gray-400" />
                </div>
                <div className="space-y-1">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-gray-400">Security Notice</h4>
                    <p className="text-xs text-gray-500 leading-relaxed font-medium">Your payout information is encrypted and stored securely. We only use these details to transfer your earnings. Payouts are processed immediately upon booking confirmation for verified accounts. </p>
                </div>
            </div>
        </div>
    );
}
