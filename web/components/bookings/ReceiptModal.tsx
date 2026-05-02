"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { X, Download, Loader2, CheckCircle2, Building2, MapPin, Calendar, CreditCard, Hash } from "lucide-react";
import { useEffect } from "react";

interface ReceiptModalProps {
    bookingId: string;
    onClose: () => void;
}

function formatGHS(pesewas: number) {
    return `₵${(pesewas / 100).toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const STATUS_COLOR: Record<string, string> = {
    SUCCESS: "#16a34a",
    PENDING: "#d97706",
    FAILED: "#dc2626",
    REFUNDED: "#6366f1",
};

export default function ReceiptModal({ bookingId, onClose }: ReceiptModalProps) {
    const { data: receipt, isLoading, isError } = useQuery({
        queryKey: ["receipt", bookingId],
        queryFn: async () => {
            const { data } = await api.get(`/bookings/${bookingId}/receipt`);
            return data;
        },
        staleTime: 60 * 1000,
    });

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    // Lock body scroll
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);

    const handlePrint = () => window.print();

    const paymentStatusColor = receipt?.paymentStatus
        ? (STATUS_COLOR[receipt.paymentStatus] ?? "#6b7280")
        : "#6b7280";

    return (
        <>
            {/* Print-only styles injected in head via style tag */}
            <style>{`
                @media print {
                    body > *:not(#hostelgh-receipt-printroot) { display: none !important; }
                    #hostelgh-receipt-printroot { display: block !important; position: static !important; }
                    .receipt-modal-overlay { background: none !important; padding: 0 !important; }
                    .receipt-modal-close-btn,
                    .receipt-modal-download-btn,
                    .receipt-modal-header-bar { display: none !important; }
                    .receipt-card {
                        box-shadow: none !important;
                        border: 1px solid #e5e7eb !important;
                        max-width: 100% !important;
                        margin: 0 !important;
                        border-radius: 0 !important;
                    }
                    @page { margin: 12mm; }
                }
            `}</style>

            <div
                id="hostelgh-receipt-printroot"
                className="receipt-modal-overlay fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm overflow-y-auto py-8 px-4"
                onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            >
                <div className="receipt-card relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">

                    {/* Action Bar (hidden on print) */}
                    <div className="receipt-modal-header-bar flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-white/10">
                        <div className="flex items-center gap-2 text-white">
                            <Building2 size={16} className="text-blue-400" />
                            <span className="text-sm font-bold tracking-tight">HostelGH Receipt</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handlePrint}
                                className="receipt-modal-download-btn inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition-colors"
                            >
                                <Download size={13} /> Download PDF
                            </button>
                            <button
                                onClick={onClose}
                                className="receipt-modal-close-btn w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
                            >
                                <X size={15} />
                            </button>
                        </div>
                    </div>

                    {/* Receipt Body */}
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                            <Loader2 size={32} className="animate-spin mb-3 text-blue-500" />
                            <p className="text-sm font-medium">Loading receipt...</p>
                        </div>
                    )}

                    {isError && (
                        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                            <p className="text-sm font-semibold text-red-500">Failed to load receipt</p>
                            <p className="text-xs mt-1">Please try again later.</p>
                        </div>
                    )}

                    {receipt && (
                        <div className="p-8">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-8">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-2xl font-black text-gray-900 tracking-tight">HostelGH</span>
                                        <span className="text-[10px] font-bold uppercase tracking-widest bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Ghana</span>
                                    </div>
                                    <p className="text-xs text-gray-400 font-medium">Official Payment Receipt</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Receipt No.</p>
                                    <p className="text-sm font-black text-gray-800 font-mono">{receipt.receiptNumber}</p>
                                    {receipt.paidAt && (
                                        <p className="text-xs text-gray-500 mt-1">{format(new Date(receipt.paidAt), "dd MMM yyyy, h:mm a")}</p>
                                    )}
                                </div>
                            </div>

                            {/* Status stamp */}
                            {receipt.paymentStatus === "SUCCESS" && (
                                <div
                                    className="flex items-center gap-2 rounded-xl px-4 py-3 mb-8 border"
                                    style={{ background: "#f0fdf4", borderColor: "#bbf7d0" }}
                                >
                                    <CheckCircle2 size={18} style={{ color: "#16a34a" }} />
                                    <span className="text-sm font-bold" style={{ color: "#15803d" }}>
                                        Payment Confirmed — Secured with HostelGH
                                    </span>
                                </div>
                            )}

                            {/* Two columns: Hostel + Tenant */}
                            <div className="grid grid-cols-2 gap-6 mb-8">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Hostel</p>
                                    <div className="space-y-1">
                                        <p className="font-bold text-gray-900 text-sm">{receipt.hostel.name}</p>
                                        <div className="flex items-start gap-1.5 text-xs text-gray-500">
                                            <MapPin size={11} className="mt-0.5 shrink-0 text-blue-500" />
                                            <span>{receipt.hostel.addressLine}, {receipt.hostel.city}</span>
                                        </div>
                                        {receipt.hostel.university && (
                                            <p className="text-xs text-gray-400">Near {receipt.hostel.university}</p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Issued To</p>
                                    <div className="space-y-1">
                                        <p className="font-bold text-gray-900 text-sm">{receipt.tenant.firstName} {receipt.tenant.lastName}</p>
                                        <p className="text-xs text-gray-500">{receipt.tenant.email}</p>
                                        {receipt.tenant.phone && <p className="text-xs text-gray-500">{receipt.tenant.phone}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Stay dates */}
                            <div className="flex items-center gap-4 mb-8 p-4 rounded-xl bg-gray-50 border border-gray-100">
                                <Calendar size={16} className="text-blue-500 shrink-0" />
                                <div className="flex gap-6 text-sm">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Move-in</p>
                                        <p className="font-bold text-gray-800">{format(new Date(receipt.startDate), "dd MMM yyyy")}</p>
                                    </div>
                                    <div className="w-px bg-gray-200" />
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Move-out</p>
                                        <p className="font-bold text-gray-800">{format(new Date(receipt.endDate), "dd MMM yyyy")}</p>
                                    </div>
                                    {receipt.slotNumber && (
                                        <>
                                            <div className="w-px bg-gray-200" />
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Slot #</p>
                                                <p className="font-bold text-gray-800">{receipt.slotNumber}</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Line items */}
                            <div className="mb-8">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Room Details</p>
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-100">
                                            <th className="text-left pb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">Room</th>
                                            <th className="text-center pb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">Qty</th>
                                            <th className="text-right pb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">Unit Price</th>
                                            <th className="text-right pb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {receipt.items.map((item: any, i: number) => (
                                            <tr key={i} className="border-b border-gray-50">
                                                <td className="py-3">
                                                    <p className="font-semibold text-gray-800">{item.roomName}</p>
                                                    <p className="text-[10px] text-gray-400">{item.roomConfiguration} · {item.gender}</p>
                                                </td>
                                                <td className="text-center text-gray-700 font-medium">{item.quantity}</td>
                                                <td className="text-right text-gray-700 font-medium">{formatGHS(item.unitPrice)}</td>
                                                <td className="text-right font-bold text-gray-800">{formatGHS(item.subtotal)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Totals */}
                            <div className="border-t-2 border-gray-100 pt-4 space-y-2 mb-8">
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-gray-700">{formatGHS(receipt.amounts.baseAmount)}</span>
                                </div>
                                {receipt.amounts.platformFee > 0 && (
                                    <div className="flex justify-between text-sm text-gray-500">
                                        <span>Platform Fee</span>
                                        <span className="font-medium text-gray-700">{formatGHS(receipt.amounts.platformFee)}</span>
                                    </div>
                                )}
                                {receipt.amounts.processingFee > 0 && (
                                    <div className="flex justify-between text-sm text-gray-500">
                                        <span>Processing Fee</span>
                                        <span className="font-medium text-gray-700">{formatGHS(receipt.amounts.processingFee)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                                    <span className="font-black text-gray-900 text-base">Total Paid</span>
                                    <span className="font-black text-gray-900 text-2xl">{formatGHS(receipt.amounts.totalPaid)}</span>
                                </div>
                                <p className="text-[10px] text-right text-gray-400">{receipt.amounts.currency}</p>
                            </div>

                            {/* Payment reference + method */}
                            <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50 mb-8">
                                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                                    <CreditCard size={14} className="text-blue-600" />
                                </div>
                                <div className="flex-1 grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Payment Method</p>
                                        <p className="font-semibold text-gray-700">{receipt.paymentMethod?.replace(/_/g, " ") ?? "—"}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Provider</p>
                                        <p className="font-semibold text-gray-700">{receipt.paymentProvider ?? "—"}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Transaction Reference</p>
                                        <div className="flex items-center gap-2">
                                            <Hash size={12} className="text-gray-400" />
                                            <p className="font-mono text-xs font-bold text-gray-800 break-all">{receipt.receiptNumber}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <p className="text-[10px] text-gray-400 leading-5 max-w-xs">
                                    This is an official HostelGH payment receipt. Keep this for your records as proof of payment.
                                </p>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Issued on</p>
                                    <p className="text-xs font-bold text-gray-600">{format(new Date(receipt.createdAt), "dd MMM yyyy")}</p>
                                    <p className="text-[10px] text-gray-400">hostelgh.com</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
