"use client";

import { formatGhs } from "@/lib/hostels";

type Room = {
    id: string;
    name: string;
    description?: string | null;
    capacity: number;
    totalUnits: number;
    pricePerTerm: number;
};

export default function RoomTypeCard({
    room,
    onBook,
}: {
    room: Room;
    onBook: (roomId: string) => void;
}) {
    return (
        <div className="rounded-3xl border bg-white p-5">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="font-semibold">{room.name}</div>
                    <div className="text-sm text-gray-600 mt-1">
                        Capacity: {room.capacity} • Units: {room.totalUnits}
                    </div>
                    {room.description && (
                        <div className="text-sm text-gray-700 mt-2">{room.description}</div>
                    )}
                </div>

                <div className="text-right">
                    <div className="font-semibold">{formatGhs(room.pricePerTerm)}</div>
                    <div className="text-xs text-gray-500">per term</div>
                </div>
            </div>

            <button
                onClick={() => onBook(room.id)}
                className="mt-4 w-full rounded-2xl bg-black text-white py-2 hover:opacity-90"
            >
                Book this room
            </button>
        </div>
    );
}
