"use client";

import { CreditCard, History, Download, Loader2, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";

export default function TenantPaymentsPage() {
    const { data: payments, isLoading } = useQuery({
        queryKey: ["tenant-payments"],
        queryFn: async () => {
            const { data } = await api.get("/payments/history");
            return Array.isArray(data) ? data : [];
        }
    });

    const handleAddMethod = () => {
        toast.info("Secure Payment Integration", {
            description: "Payments are securely handled by Paystack during checkout. You can save your card details there for future use.",
            duration: 5000,
        });
    };

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
                        <button
                            onClick={handleAddMethod}
                            className="text-sm font-bold text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <Plus size={16} /> Add Method
                        </button>
                    </div>

                    <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <p className="text-gray-500 mb-2">No payment methods saved explicitly.</p>
                        <p className="text-xs text-gray-400">Your cards are securely managed by Paystack during checkout.</p>
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
