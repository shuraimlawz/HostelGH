"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { fetchPublicHostelById } from "@/lib/hostels";
import RoomTypeCard from "@/components/hostels/RoomTypeCard";
import { useState } from "react";
import BookingModal from "@/components/bookings/BookingModal";
import { useAuth } from "@/lib/auth-context";
import { useAuthModal } from "@/components/auth/AuthModalProvider";

export default function HostelDetailsPage() {
    const params = useParams<{ id: string }>();
    const hostelId = params.id;

    const { open } = useAuthModal();
    const { user } = useAuth();

    const { data, isLoading, isError } = useQuery({
        queryKey: ["hostel", hostelId],
        queryFn: () => fetchPublicHostelById(hostelId),
        enabled: !!hostelId,
    });

    const [bookingRoomId, setBookingRoomId] = useState<string | null>(null);

    async function onBook(roomId: string) {
        if (!user) {
            const ok = await open("login");
            if (!ok) return;
        }
        setBookingRoomId(roomId);
    }

    return (
        <section className="px-4">
            <div className="mx-auto max-w-6xl py-10">
                {isLoading && <div className="rounded-3xl border bg-white p-8 animate-pulse text-gray-500">Loading details...</div>}
                {isError && <div className="rounded-3xl border bg-white p-8 text-red-500">Failed to load hostel details.</div>}

                {data && (
                    <>
                        <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-6">
                            <div>
                                <div className="rounded-3xl border bg-gray-100 h-[320px] flex items-center justify-center text-gray-400">
                                    {/* Placeholder for hostel image */}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M3 21h18M5 21V7l8-4 8 4v14M8 21v-2a2 2 0 0 1 4 0v2" />
                                    </svg>
                                </div>
                                <h1 className="mt-6 text-2xl md:text-4xl font-semibold text-gray-900">{data.name}</h1>
                                <p className="text-gray-600 mt-2 flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                        <circle cx="12" cy="10" r="3" />
                                    </svg>
                                    {data.addressLine}, {data.city}, {data.region}
                                </p>
                                {data.description && <p className="mt-4 text-gray-700 leading-relaxed">{data.description}</p>}
                            </div>

                            <div className="rounded-3xl border bg-white p-6 h-fit sticky top-24 shadow-sm">
                                <div className="font-semibold text-lg mb-2">Quick info</div>
                                <div className="space-y-3 text-sm text-gray-600">
                                    <p>Explore the available room types below and request a booking directly from the owner.</p>
                                    <div className="p-3 bg-gray-50 rounded-xl border text-xs">
                                        <span className="font-semibold text-gray-800">Note:</span> Booking requires owner approval before any payment is made.
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12">
                            <h2 className="text-xl md:text-2xl font-semibold mb-6">Available Room Types</h2>
                            {data.rooms.length === 0 ? (
                                <div className="text-gray-500 italic">No rooms available for listing yet.</div>
                            ) : (
                                <div className="grid md:grid-cols-2 gap-4">
                                    {data.rooms.map((r) => (
                                        <RoomTypeCard key={r.id} room={r} onBook={onBook} />
                                    ))}
                                </div>
                            )}
                        </div>

                        <BookingModal
                            open={!!bookingRoomId}
                            onClose={() => setBookingRoomId(null)}
                            hostelId={data.id}
                            roomId={bookingRoomId ?? ""}
                        />
                    </>
                )}
            </div>
        </section>
    );
}
