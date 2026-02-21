"use client";

import { api } from "@/lib/api";
import { useState } from "react";

export default function BookingModal({
    open,
    onClose,
    hostelId,
    roomId,
}: {
    open: boolean;
    onClose: () => void;
    hostelId: string;
    roomId: string;
}) {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [done, setDone] = useState(false);

    if (!open) return null;

    async function submit() {
        setErr(null);
        setLoading(true);
        try {
            await api.post("/bookings", {
                hostelId,
                startDate,
                endDate,
                notes,
                items: [{ roomId, quantity }],
            });
            setDone(true);
        } catch (e: any) {
            setErr(e.message || "Booking failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-[110]">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="w-full max-w-lg rounded-3xl bg-white border shadow-xl">
                    <div className="px-6 py-4 border-b flex items-center justify-between">
                        <div className="font-semibold">Request booking</div>
                        <button onClick={onClose} className="rounded-full px-3 py-1 text-sm hover:bg-gray-100">
                            ✕
                        </button>
                    </div>

                    <div className="p-6 space-y-4">
                        {done ? (
                            <div className="rounded-2xl border bg-green-50 p-4">
                                Booking request submitted ✅ Waiting for owner approval.
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-sm text-gray-700">Start date</label>
                                        <input
                                            type="date"
                                            className="mt-1 w-full rounded-2xl border px-4 py-3"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-700">End date</label>
                                        <input
                                            type="date"
                                            className="mt-1 w-full rounded-2xl border px-4 py-3"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm text-gray-700">Quantity</label>
                                    <input
                                        type="number"
                                        min={1}
                                        className="mt-1 w-full rounded-2xl border px-4 py-3"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Number(e.target.value))}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm text-gray-700">Notes (optional)</label>
                                    <textarea
                                        className="mt-1 w-full rounded-2xl border px-4 py-3"
                                        rows={3}
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Any extra info..."
                                    />
                                </div>

                                {err && <div className="text-sm text-red-600">{err}</div>}

                                <button
                                    disabled={loading}
                                    onClick={submit}
                                    className="w-full rounded-2xl bg-black text-white py-3 hover:opacity-90 disabled:opacity-60"
                                >
                                    {loading ? "Submitting..." : "Submit request"}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
