"use client";

import { CreditCard, History, Download } from "lucide-react";

export default function TenantPaymentsPage() {
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
                        <button className="text-sm font-bold text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors">
                            + Add Method
                        </button>
                    </div>

                    <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <p className="text-gray-500 mb-2">No payment methods saved yet.</p>
                        <p className="text-xs text-gray-400">Add a card or Mobile Money wallet for faster checkout.</p>
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
                        {/* Placeholder Transaction */}
                        {[1].map((_, i) => (
                            <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center font-bold text-xs">
                                        PAID
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Booking Payment</h4>
                                        <p className="text-xs text-gray-500">Feb 14, 2026 • via Paystack</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-900">GHS 2,500.00</p>
                                    <button className="text-xs font-bold text-blue-600 hover:underline flex items-center justify-end gap-1 mt-1">
                                        <Download size={12} /> Receipt
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
