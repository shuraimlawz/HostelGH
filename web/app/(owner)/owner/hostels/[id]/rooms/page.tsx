"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import {
    Plus,
    Building2,
    Users,
    Trash2,
    Edit2,
    ChevronLeft,
    Loader2,
    Zap,
    Wind,
    Droplets,
    Flame,
    Check,
    X,
    LayoutDashboard
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import RoomModal from "@/components/owner/RoomModal";

export default function RoomManagementPage() {
    const { id: hostelId } = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState<any>(null);

    const { data: rooms, isLoading: roomsLoading } = useQuery({
        queryKey: ["hostel-rooms", hostelId],
        queryFn: async () => {
            const res = await api.get(`/rooms/hostel/${hostelId}`);
            return res.data;
        }
    });

    const { data: hostel, isLoading: hostelLoading } = useQuery({
        queryKey: ["owner-hostel", hostelId],
        queryFn: async () => {
            const res = await api.get(`/hostels/${hostelId}`);
            return res.data;
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (roomId: string) => api.delete(`/rooms/${roomId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["hostel-rooms", hostelId] });
            toast.success("Room type removed");
        },
        onError: (err: any) => toast.error(err.message || "Failed to delete room")
    });

    if (roomsLoading || hostelLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto pb-20 space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                    <Link
                        href="/owner/hostels"
                        className="inline-flex items-center gap-2 text-xs font-black text-gray-400 hover:text-gray-950 transition-colors uppercase tracking-widest group"
                    >
                        <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Properties
                    </Link>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-2.5 py-1 bg-purple-50 text-purple-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-purple-100">
                                Inventory Control
                            </span>
                        </div>
                        <h1 className="text-4xl font-black text-gray-950 tracking-tight leading-none mb-2">
                            {hostel?.name} <span className="text-blue-600">Rooms</span>
                        </h1>
                        <p className="text-gray-500 font-medium">Manage pricing, capacity and availability for {hostel?.name}.</p>
                    </div>
                </div>

                <button
                    onClick={() => {
                        setEditingRoom(null);
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-3 bg-gray-950 text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200 group active:scale-[0.98]"
                >
                    <Plus size={16} className="group-hover:rotate-90 transition-transform" />
                    <span>Add Room Type</span>
                </button>
            </div>

            {/* Room Cards Grid */}
            {rooms?.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-gray-100 rounded-[3rem] p-20 text-center space-y-6">
                    <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 transform rotate-3">
                        <LayoutDashboard className="text-gray-300" size={40} />
                    </div>
                    <div className="max-w-md mx-auto">
                        <h3 className="text-2xl font-black text-gray-950 tracking-tight mb-2">No rooms added yet</h3>
                        <p className="text-gray-500 font-medium">Add your different room configurations (e.g. 4-in-a-room) to start receiving bookings.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {rooms.map((room: any) => (
                        <div key={room.id} className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col">
                            <div className="flex justify-between items-start mb-6">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-gray-950 tracking-tight group-hover:text-blue-600 transition-colors uppercase">{room.roomConfiguration}</h3>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{room.name}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setEditingRoom(room);
                                            setIsModalOpen(true);
                                        }}
                                        className="w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-400 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all border border-transparent hover:border-blue-100"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (confirm("Permanently delete this room type?")) {
                                                deleteMutation.mutate(room.id);
                                            }
                                        }}
                                        className="w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-400 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all border border-transparent hover:border-red-100"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-5 mb-8">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-black text-gray-950 tracking-tighter">₵{room.pricePerTerm.toLocaleString()}</span>
                                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">/ semester</span>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-gray-50 rounded-2xl p-4 border border-transparent transition-all">
                                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                                            <Users size={12} />
                                            <span className="text-[8px] font-black uppercase tracking-widest">Capacity</span>
                                        </div>
                                        <p className="text-lg font-black text-gray-950">{room.capacity} Per Room</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-2xl p-4 border border-transparent transition-all">
                                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                                            <Building2 size={12} />
                                            <span className="text-[8px] font-black uppercase tracking-widest">Inventory</span>
                                        </div>
                                        <p className="text-lg font-black text-gray-950">{room.totalUnits} Units</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 pt-2">
                                    {room.hasAC && (
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                                            <Wind size={12} />
                                            <span className="text-[9px] font-black uppercase tracking-widest">Air Con</span>
                                        </div>
                                    )}
                                    {room.gender !== "MIXED" && (
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-white rounded-xl border border-gray-800">
                                            <span className="text-[9px] font-black uppercase tracking-widest">{room.gender}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "w-2 h-2 rounded-full",
                                        room.availableSlots > 0 ? "bg-emerald-500 animate-pulse" : "bg-red-500"
                                    )} />
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                        {room.availableSlots} Slots Available
                                    </span>
                                </div>
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    {Math.round((room.availableSlots / (room.totalUnits * room.capacity)) * 100)}% Free
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <RoomModal
                    hostelId={hostelId as string}
                    room={editingRoom}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        queryClient.invalidateQueries({ queryKey: ["hostel-rooms", hostelId] });
                    }}
                />
            )}
        </div>
    );
}
