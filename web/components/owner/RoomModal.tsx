"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
    X,
    Building2,
    Users,
    DollarSign,
    Zap,
    Wind,
    Shield,
    Droplets,
    Flame,
    Loader2,
    Image as ImageIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import ImageUpload from "@/components/common/ImageUpload";

const roomSchema = z.object({
    name: z.string().min(2, "Name is required"),
    roomConfiguration: z.string().min(2, "Configuration is required (e.g. 4-in-a-room)"),
    description: z.string().optional(),
    capacity: z.number().min(1, "Capacity must be at least 1"),
    totalUnits: z.number().min(1, "Total units must be at least 1"),
    pricePerTerm: z.number().min(1, "Price is required"),
    gender: z.enum(["MALE", "FEMALE", "MIXED"]),
    hasAC: z.boolean().default(false),
    utilitiesIncluded: z.array(z.string()).default([]),
    images: z.array(z.string()).min(1, "At least one image is required"),
});

interface RoomModalProps {
    hostelId: string;
    room?: any;
    onClose: () => void;
    onSuccess: () => void;
}

export default function RoomModal({ hostelId, room, onClose, onSuccess }: RoomModalProps) {
    const isEditing = !!room;

    const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<z.infer<typeof roomSchema>>({
        resolver: zodResolver(roomSchema) as any,
        defaultValues: room ? {
            ...room,
            utilitiesIncluded: room.utilitiesIncluded || [],
        } : {
            name: "",
            roomConfiguration: "",
            description: "",
            capacity: 4,
            totalUnits: 1,
            pricePerTerm: 0,
            gender: "MIXED",
            hasAC: false,
            utilitiesIncluded: [],
            images: [],
        }
    });

    const onSubmit = async (values: z.infer<typeof roomSchema>) => {
        try {
            const totalSlots = values.capacity * values.totalUnits;
            const payload = {
                ...values,
                totalSlots,
                availableSlots: totalSlots, // Default to full availability on create
            };

            if (isEditing) {
                // For editing, we might want to preserve availableSlots if we don't handle inventory changes yet
                // But for now, let's just update based on new total if not specified
                await api.patch(`/rooms/${room.id}`, payload);
                toast.success("Room type updated successfully");
            } else {
                await api.post(`/rooms/${hostelId}`, payload);
                toast.success("New room type added");
            }
            onSuccess();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to save room type");
        }
    };

    const utilities = [
        { id: "water", label: "Water", icon: Droplets },
        { id: "light", label: "Electricity", icon: Zap },
        { id: "gas", label: "Gas", icon: Flame },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-950/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-8 md:p-12">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h2 className="text-2xl font-black text-gray-950 tracking-tight">
                                {isEditing ? "Edit Room Configuration" : "Add New Room Type"}
                            </h2>
                            <p className="text-sm text-gray-500 font-medium">Define pricing and capacity for this room type.</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-2xl text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        {/* Photos */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Room Photos *</label>
                            <ImageUpload
                                value={watch("images")}
                                onChange={(urls) => setValue("images", urls)}
                                maxImages={5}
                            />
                            {errors.images && <p className="text-xs text-red-500 font-bold ml-1">{errors.images.message}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Basic Info */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Room Title</label>
                                <input
                                    {...register("name")}
                                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold text-gray-950"
                                    placeholder="e.g. Standard 4-in-1"
                                />
                                {errors.name && <p className="text-xs text-red-500 font-bold ml-1">{errors.name.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Configuration (Display Name)</label>
                                <input
                                    {...register("roomConfiguration")}
                                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold text-gray-950"
                                    placeholder="e.g. 4-in-a-room"
                                />
                                {errors.roomConfiguration && <p className="text-xs text-red-500 font-bold ml-1">{errors.roomConfiguration.message}</p>}
                            </div>

                            {/* Pricing & Capacity */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Price per Semester (₵)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="number"
                                        {...register("pricePerTerm", { valueAsNumber: true })}
                                        className="w-full pl-14 pr-6 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold text-gray-950"
                                        placeholder="2500"
                                    />
                                </div>
                                {errors.pricePerTerm && <p className="text-xs text-red-500 font-bold ml-1">{errors.pricePerTerm.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Students Per Room</label>
                                <div className="relative">
                                    <Users className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="number"
                                        {...register("capacity", { valueAsNumber: true })}
                                        className="w-full pl-14 pr-6 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold text-gray-950"
                                        placeholder="4"
                                    />
                                </div>
                                {errors.capacity && <p className="text-xs text-red-500 font-bold ml-1">{errors.capacity.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Total Rooms Available</label>
                                <div className="relative">
                                    <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="number"
                                        {...register("totalUnits", { valueAsNumber: true })}
                                        className="w-full pl-14 pr-6 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold text-gray-950"
                                        placeholder="10"
                                    />
                                </div>
                                {errors.totalUnits && <p className="text-xs text-red-500 font-bold ml-1">{errors.totalUnits.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Gender Specification</label>
                                <select
                                    {...register("gender")}
                                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold text-gray-950 appearance-none"
                                >
                                    <option value="MIXED">Mixed / Any</option>
                                    <option value="MALE">Male Only</option>
                                    <option value="FEMALE">Female Only</option>
                                </select>
                            </div>
                        </div>

                        {/* Amenities */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Room Features</label>
                            <div className="flex flex-wrap gap-4">
                                <button
                                    type="button"
                                    onClick={() => setValue("hasAC", !watch("hasAC"))}
                                    className={cn(
                                        "flex items-center gap-3 px-6 py-3 rounded-2xl border-2 transition-all font-bold text-xs uppercase tracking-widest",
                                        watch("hasAC")
                                            ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100"
                                            : "bg-gray-50 border-transparent text-gray-400 hover:border-gray-200"
                                    )}
                                >
                                    <Wind size={16} />
                                    <span>Air Conditioning</span>
                                </button>

                                {utilities.map((util) => {
                                    const isSelected = watch("utilitiesIncluded")?.includes(util.id);
                                    return (
                                        <button
                                            key={util.id}
                                            type="button"
                                            onClick={() => {
                                                const current = watch("utilitiesIncluded") || [];
                                                const updated = isSelected
                                                    ? current.filter(u => u !== util.id)
                                                    : [...current, util.id];
                                                setValue("utilitiesIncluded", updated);
                                            }}
                                            className={cn(
                                                "flex items-center gap-3 px-6 py-3 rounded-2xl border-2 transition-all font-bold text-xs uppercase tracking-widest",
                                                isSelected
                                                    ? "bg-gray-950 border-gray-950 text-white shadow-lg shadow-gray-200"
                                                    : "bg-gray-50 border-transparent text-gray-400 hover:border-gray-200"
                                            )}
                                        >
                                            <util.icon size={16} />
                                            <span>{util.label} Included</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="animate-spin" size={18} />
                                ) : (
                                    <Zap size={18} />
                                )}
                                {isEditing ? "Update Room Type" : "Create Room Type"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
