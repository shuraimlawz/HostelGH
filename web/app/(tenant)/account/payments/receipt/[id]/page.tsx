"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Loader2, Download, CheckCircle2, MapPin } from "lucide-react";
import { format } from "date-fns";
import { useRef } from "react";
import { useAuth } from "@/lib/auth-context";

export default function ReceiptPage({ params }: { params: { id: string } }) {
    const { user } = useAuth();
    const receiptRef = useRef<HTMLDivElement>(null);

    const { data: payment, isLoading, error } = useQuery({
        queryKey: ["payment-receipt", params.id],
        queryFn: async () => {
            // We can reuse the verify endpoint or fetch specifically. 
            // Since we don't have a specific GET /payments/:id, we might need to add one or use the history.
            // For now, let's assume we can fetch it via the verify endpoint if we had the reference, 
            // BUT we only have ID. Let's add a GET /payments/:id endpoint or filter from history (inefficient).
            // BETTER: Add GET /payments/:id to controller.

            // For this iteration, let's try to get it from a new endpoint we should make: GET /payments/:id
            const { data } = await api.get(`/payments/${params.id}`);
            return data;
        },
        retry: false
    });

    const handlePrint = () => {
        window.print();
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    if (error || !payment) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <h1 className="text-2xl font-bold text-red-600">Receipt not found</h1>
                <p className="text-gray-500">The receipt you are looking for does not exist or you do not have permission to view it.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 flex flex-col items-center">
            <div className="max-w-2xl w-full bg-white shadow-xl rounded-3xl overflow-hidden print:shadow-none print:rounded-none" ref={receiptRef}>
                {/* Header */}
                <div className="bg-[#1877F2] p-8 text-white relative overflow-hidden">
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <CheckCircle2 size={24} className="text-white" />
                                </div>
                                <h1 className="text-2xl font-bold">Payment Receipt</h1>
                            </div>
                            <p className="text-blue-100 text-sm">Thank you for your business.</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-3xl font-black">{payment.currency} {(payment.amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
                            <p className="text-blue-100 text-sm font-mono mt-1">{payment.reference}</p>
                        </div>
                    </div>
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                </div>

                {/* Body */}
                <div className="p-8 space-y-8">
                    {/* User & Date Info */}
                    <div className="grid grid-cols-2 gap-8 pb-8 border-b border-gray-100">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Billed To</p>
                            <p className="font-bold text-gray-900">{user?.firstName} {user?.lastName}</p>
                            <p className="text-sm text-gray-500">{user?.email}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Payment Date</p>
                            <p className="font-bold text-gray-900">{format(new Date(payment.createdAt), "MMMM d, yyyy")}</p>
                            <p className="text-sm text-gray-500">{format(new Date(payment.createdAt), "h:mm a")}</p>
                        </div>
                    </div>

                    {/* Property Details */}
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Property Details</p>
                        <div className="bg-gray-50 rounded-2xl p-6 flex flex-col md:flex-row md:items-center gap-6">
                            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-sm text-blue-600">
                                <MapPin size={32} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">{payment.booking?.hostel?.name}</h3>
                                <p className="text-gray-500 text-sm mb-2">{payment.booking?.hostel?.city}, {payment.booking?.hostel?.addressLine}</p>
                                <div className="flex flex-wrap gap-2 text-xs">
                                    <span className="px-2 py-1 bg-white border rounded-md text-gray-600">
                                        Check-in: {format(new Date(payment.booking?.startDate), "MMM d, yyyy")}
                                    </span>
                                    <span className="px-2 py-1 bg-white border rounded-md text-gray-600">
                                        Check-out: {format(new Date(payment.booking?.endDate), "MMM d, yyyy")}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Line Items */}
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Payment Summary</p>
                        <div className="border rounded-2xl overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="py-3 px-4 font-bold text-gray-700">Description</th>
                                        <th className="py-3 px-4 font-bold text-gray-700 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    <tr>
                                        <td className="py-4 px-4">
                                            <p className="font-bold text-gray-900">Hostel Booking Reservation</p>
                                            <p className="text-gray-500 text-xs">Full payment via {payment.provider}</p>
                                        </td>
                                        <td className="py-4 px-4 text-right font-bold text-gray-900">
                                            {payment.currency} {(payment.amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                </tbody>
                                <tfoot className="bg-gray-50">
                                    <tr>
                                        <td className="py-4 px-4 font-bold text-gray-900">Total Paid</td>
                                        <td className="py-4 px-4 text-right font-black text-gray-900 text-lg">
                                            {payment.currency} {(payment.amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center pt-8 border-t border-gray-100">
                        <p className="text-gray-400 text-sm">HostelGH Inc. • Accra, Ghana</p>
                        <p className="text-gray-300 text-xs mt-1">Receipt generated automatically.</p>
                    </div>
                </div>
            </div>

            {/* Print Action */}
            <div className="mt-8 print:hidden">
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full font-bold hover:shadow-xl hover:-translate-y-1 transition-all active:translate-y-0 active:shadow-sm"
                >
                    <Download size={18} /> Download / Print Record
                </button>
            </div>

            <style jsx global>{`
                @media print {
                    @page { margin: 0; }
                    body { background: white; }
                    .print\\:hidden { display: none; }
                    .print\\:shadow-none { box-shadow: none; }
                    .print\\:rounded-none { border-radius: 0; }
                }
            `}</style>
        </div>
    );
}
