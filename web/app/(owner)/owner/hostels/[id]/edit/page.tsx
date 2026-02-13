"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
    Building2,
    MapPin,
    Info,
    Check,
    ChevronLeft,
    Loader2,
    Wifi,
    Wind,
    Utensils,
    Waves,
    Car,
    ShieldCheck,
    Coffee,
    School,
    Plus,
    Trash2,
    Save,
    BedDouble,
    DollarSign,
    Users as UsersIcon
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const hostelSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    city: z.string().min(2, "City is required"),
    addressLine: z.string().min(5, "Address is required"),
    university: z.string().optional().or(z.literal("")),
    amenities: z.array(z.string()),
    images: z.array(z.string()),
    isPublished: z.boolean(),
});

const roomSchema = z.object({
    name: z.string().min(2, "Room name is required"),
    capacity: z.number().min(1),
    totalUnits: z.number().min(1),
    pricePerTerm: z.number().min(1),
    description: z.string().optional(),
});

const AMENITIES = [
    { id: "WiFi", icon: Wifi },
    { id: "AC", icon: Wind },
    { id: "Laundry", icon: Utensils },
    { id: "Swimming Pool", icon: Waves },
    { id: "Parking", icon: Car },
    { id: "Security", icon: ShieldCheck },
    { id: "Study Room", icon: Coffee },
    { id: "Generator", icon: Building2 },
];

const UNIVERSITIES = [
    "University of Ghana",
    "KNUST",
    "UCC",
    "University of Education, Winneba",
    "GIMPA",
    "Ashesi University",
    "Valley View University",
];

export default function EditHostelPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const hostelId = params.id as string;

    const [activeTab, setActiveTab] = useState<"details" | "rooms">("details");
    const [isSaving, setIsSaving] = useState(false);
    const [isAddingRoom, setIsAddingRoom] = useState(false);

    // Fetch Hostel Data
    const { data: hostel, isLoading } = useQuery({
        queryKey: ["hostel", hostelId],
        queryFn: async () => {
            const res = await api.get(`/hostels/public/${hostelId}`);
            return res.data;
        }
    });

    const form = useForm<z.infer<typeof hostelSchema>>({
        resolver: zodResolver(hostelSchema),
        defaultValues: {
            name: "",
            description: "",
            city: "",
            addressLine: "",
            university: "",
            amenities: [],
            images: [],
            isPublished: false,
        }
    });

    useEffect(() => {
        if (hostel) {
            form.reset({
                name: hostel.name,
                description: hostel.description || "",
                city: hostel.city,
                addressLine: hostel.addressLine,
                university: hostel.university || "",
                amenities: hostel.amenities || [],
                images: hostel.images || [],
                isPublished: hostel.isPublished,
            });
        }
    }, [hostel, form]);

    const onUpdateHostel = async (values: z.infer<typeof hostelSchema>) => {
        setIsSaving(true);
        try {
            await api.patch(`/hostels/${hostelId}`, values);
            toast.success("Hostel updated successfully");
            queryClient.invalidateQueries({ queryKey: ["hostel", hostelId] });
        } catch (error: any) {
            toast.error("Failed to update hostel");
        } finally {
            setIsSaving(false);
        }
    };

    const addRoomMutation = useMutation({
        mutationFn: async (values: z.infer<typeof roomSchema>) => {
            return api.post(`/rooms/${hostelId}`, values);
        },
        onSuccess: () => {
            toast.success("Room added successfully");
            setIsAddingRoom(false);
            queryClient.invalidateQueries({ queryKey: ["hostel", hostelId] });
        },
        onError: () => toast.error("Failed to add room")
    });

    const deleteRoomMutation = useMutation({
        mutationFn: async (roomId: string) => {
            return api.delete(`/rooms/${roomId}`);
        },
        onSuccess: () => {
            toast.success("Room removed");
            queryClient.invalidateQueries({ queryKey: ["hostel", hostelId] });
        },
        onError: (err: any) => toast.error(err.response?.data?.message || "Failed to remove room")
    });

    if (isLoading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto" size={40} /></div>;

    return (
        <div className="max-w-5xl mx-auto pb-20">
            <div className="flex items-center justify-between mb-8">
                <Link
                    href="/owner/hostels"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-black transition-colors group"
                >
                    <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </Link>
                <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab("details")}
                        className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all", activeTab === "details" ? "bg-white shadow-sm text-black" : "text-gray-500")}
                    >
                        Property Details
                    </button>
                    <button
                        onClick={() => setActiveTab("rooms")}
                        className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all", activeTab === "rooms" ? "bg-white shadow-sm text-black" : "text-gray-500")}
                    >
                        Room Types
                    </button>
                </div>
            </div>

            <div className="mb-10 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight mb-2 underline decoration-blue-500 underline-offset-8 decoration-4">{hostel.name}</h1>
                    <p className="text-gray-500 text-lg">Manage your property details and available inventory.</p>
                </div>
                <div className="flex items-center gap-3 bg-white p-2 border rounded-2xl shadow-sm">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-2">Status:</span>
                    <button
                        onClick={() => onUpdateHostel({ ...form.getValues(), isPublished: !hostel.isPublished })}
                        className={cn(
                            "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                            hostel.isPublished ? "bg-green-500 text-white shadow-lg shadow-green-200" : "bg-gray-200 text-gray-600"
                        )}
                    >
                        {hostel.isPublished ? "Published" : "Draft"}
                    </button>
                </div>
            </div>

            {activeTab === "details" ? (
                <form onSubmit={form.handleSubmit(onUpdateHostel)} className="space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <section className="bg-white rounded-[2rem] border p-8 shadow-sm space-y-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Info size={20} className="text-blue-500" />
                                Basic Info
                            </h2>
                            <div className="space-y-4">
                                <input {...form.register("name")} className="w-full px-5 py-4 bg-gray-50 rounded-2xl outline-none border focus:border-black transition-all" placeholder="Hostel Name" />
                                <textarea {...form.register("description")} rows={5} className="w-full px-5 py-4 bg-gray-50 rounded-2xl outline-none border focus:border-black transition-all resize-none" placeholder="Description" />
                            </div>
                        </section>

                        <section className="bg-white rounded-[2rem] border p-8 shadow-sm space-y-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <MapPin size={20} className="text-green-500" />
                                Location
                            </h2>
                            <div className="space-y-4">
                                <input {...form.register("city")} className="w-full px-5 py-4 bg-gray-50 rounded-2xl outline-none border focus:border-black transition-all" placeholder="City" />
                                <input {...form.register("addressLine")} className="w-full px-5 py-4 bg-gray-50 rounded-2xl outline-none border focus:border-black transition-all" placeholder="Address Line" />
                                <select {...form.register("university")} className="w-full px-5 py-4 bg-gray-50 rounded-2xl outline-none border focus:border-black transition-all appearance-none">
                                    <option value="">Select University</option>
                                    {UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
                                </select>
                            </div>
                        </section>
                    </div>

                    <section className="bg-white rounded-[2rem] border p-10 shadow-sm space-y-8">
                        <h2 className="text-xl font-bold">Amenities</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {AMENITIES.map(a => (
                                <button
                                    key={a.id} type="button"
                                    onClick={() => {
                                        const curr = form.getValues("amenities");
                                        const next = curr.includes(a.id) ? curr.filter(x => x !== a.id) : [...curr, a.id];
                                        form.setValue("amenities", next);
                                    }}
                                    className={cn(
                                        "flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all",
                                        form.watch("amenities").includes(a.id) ? "border-black bg-black text-white" : "border-gray-50 bg-gray-50 text-gray-500"
                                    )}
                                >
                                    <a.icon size={24} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">{a.id}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    <div className="flex justify-end">
                        <button
                            disabled={isSaving}
                            className="flex items-center gap-2 bg-black text-white px-10 py-4 rounded-2xl font-bold hover:opacity-90 transition-all active:scale-[0.98] shadow-xl shadow-black/10 disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            Save All Changes
                        </button>
                    </div>
                </form>
            ) : (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {hostel.rooms.map((room: any) => (
                            <div key={room.id} className="bg-white rounded-3xl border p-8 shadow-sm group hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                        <BedDouble size={24} />
                                    </div>
                                    <button
                                        onClick={() => deleteRoomMutation.mutate(room.id)}
                                        className="p-2 text-red-100 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                                <h3 className="text-xl font-bold mb-2">{room.name}</h3>
                                <div className="grid grid-cols-3 gap-4 mt-6">
                                    <div className="bg-gray-50 rounded-2xl p-4">
                                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                                            <UsersIcon size={12} />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">Pax</span>
                                        </div>
                                        <p className="font-bold">{room.capacity}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-2xl p-4">
                                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                                            <Building2 size={12} />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">Units</span>
                                        </div>
                                        <p className="font-bold">{room.totalUnits}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-2xl p-4">
                                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                                            <DollarSign size={12} />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">Price</span>
                                        </div>
                                        <p className="font-bold">₵{room.pricePerTerm / 100}</p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {isAddingRoom ? (
                            <AddRoomForm
                                onCancel={() => setIsAddingRoom(false)}
                                onSave={(v: any) => addRoomMutation.mutate(v)}
                                isLoading={addRoomMutation.isPending}
                            />
                        ) : (
                            <button
                                onClick={() => setIsAddingRoom(true)}
                                className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-12 flex flex-col items-center justify-center gap-3 text-gray-400 hover:bg-gray-100 hover:border-gray-300 transition-all group"
                            >
                                <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Plus size={24} />
                                </div>
                                <span className="font-bold text-sm">Add Room Type</span>
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function AddRoomForm({ onCancel, onSave, isLoading }: any) {
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(roomSchema),
        defaultValues: {
            name: "",
            capacity: 2,
            totalUnits: 10,
            pricePerTerm: 150000,
        }
    });

    const onSubmit = (values: any) => {
        onSave({
            ...values,
            pricePerTerm: values.pricePerTerm * 100
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-3xl border-2 border-black p-8 shadow-xl shadow-black/5 flex flex-col">
            <h3 className="text-xl font-bold mb-6">New Room Type</h3>
            <div className="space-y-4 flex-1">
                <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Label</label>
                    <input {...register("name")} className="w-full px-5 py-4 bg-gray-50 rounded-2xl border outline-none focus:border-black" placeholder="e.g. 2-in-1 Premium" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Capacity</label>
                        <input type="number" {...register("capacity", { valueAsNumber: true })} className="w-full px-5 py-4 bg-gray-50 rounded-2xl border outline-none focus:border-black" />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Units</label>
                        <input type="number" {...register("totalUnits", { valueAsNumber: true })} className="w-full px-5 py-4 bg-gray-50 rounded-2xl border outline-none focus:border-black" />
                    </div>
                </div>
                <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Price (₵)</label>
                    <input type="number" {...register("pricePerTerm", { valueAsNumber: true })} className="w-full px-5 py-4 bg-gray-50 rounded-2xl border outline-none focus:border-black" placeholder="1500" />
                    <p className="text-[10px] text-gray-400 mt-1">* Enter amount in Cedis (converted internally)</p>
                </div>
            </div>
            <div className="flex gap-3 mt-8">
                <button type="button" onClick={onCancel} className="flex-1 py-4 font-bold text-gray-500 hover:bg-gray-50 rounded-2xl transition-colors text-sm">Cancel</button>
                <button
                    disabled={isLoading}
                    className="flex-1 bg-black text-white py-4 rounded-2xl font-bold shadow-lg shadow-black/10 hover:opacity-90 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
                >
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                    Save Type
                </button>
            </div>
        </form>
    );
}
