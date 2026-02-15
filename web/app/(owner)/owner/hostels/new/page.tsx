"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
    Trash2,
    Image as ImageIcon,
    MessageSquare,
    Zap,
    Droplets,
    Flame,
    Clock
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import ImageUpload from "@/components/common/ImageUpload";
import { REGIONAL_UNIVERSITIES } from "@/lib/constants";

const formSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    city: z.string().min(2, "City is required"),
    addressLine: z.string().min(5, "Address is required"),
    university: z.string().optional().or(z.literal("")),
    whatsappNumber: z.string().regex(/^(0|233)[0-9]{9}$/, "Invalid Ghana number (e.g. 0244123456)"),
    distanceToCampus: z.string().optional().or(z.literal("")),
    utilitiesIncluded: z.array(z.string()),
    amenities: z.array(z.string()),
    images: z.array(z.string()),
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

export default function NewHostelPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            city: "",
            addressLine: "",
            university: "",
            whatsappNumber: "",
            distanceToCampus: "",
            utilitiesIncluded: [],
            amenities: [],
            images: [],
        }
    });

    const toggleAmenity = (id: string) => {
        const updated = selectedAmenities.includes(id)
            ? selectedAmenities.filter(a => a !== id)
            : [...selectedAmenities, id];
        setSelectedAmenities(updated);
        form.setValue("amenities", updated);
    };

    const removeImage = (index: number) => {
        const currentImages = form.getValues("images");
        const updated = currentImages.filter((_, i) => i !== index);
        form.setValue("images", updated);
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setLoading(true);
        try {
            await api.post("/hostels", values);
            toast.success("Hostel created successfully!");
            router.push("/owner/hostels");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to create hostel");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <Link
                href="/owner/hostels"
                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-black mb-8 transition-colors group"
            >
                <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Back to Hostels
            </Link>

            <div className="mb-10">
                <h1 className="text-4xl font-bold tracking-tight mb-2">Create New Hostel</h1>
                <p className="text-gray-500 text-lg">List your property and start hosting students today.</p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
                {/* Basic Info Section */}
                <section className="bg-white rounded-[2rem] border p-8 md:p-10 shadow-sm space-y-8">
                    <div className="flex items-center gap-3 pb-6 border-b">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                            <Info size={20} />
                        </div>
                        <h2 className="text-xl font-bold">Basic Information</h2>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1 uppercase tracking-wider">Hostel Name</label>
                            <div className="relative">
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    {...form.register("name")}
                                    className="w-full pl-12 pr-5 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-black transition-all font-medium"
                                    placeholder="e.g. Sunny Ridge Hostel"
                                />
                            </div>
                            {form.formState.errors.name && (
                                <p className="text-xs text-red-500 ml-1 font-medium">{form.formState.errors.name.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1 uppercase tracking-wider">Description</label>
                            <textarea
                                {...form.register("description")}
                                rows={4}
                                className="w-full px-5 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-black transition-all font-medium resize-none"
                                placeholder="Describe what makes your hostel unique..."
                            />
                            {form.formState.errors.description && (
                                <p className="text-xs text-red-500 ml-1 font-medium">{form.formState.errors.description.message}</p>
                            )}
                        </div>
                    </div>
                </section>

                {/* Location Section */}
                <section className="bg-white rounded-[2rem] border p-8 md:p-10 shadow-sm space-y-8">
                    <div className="flex items-center gap-3 pb-6 border-b">
                        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                            <MapPin size={20} />
                        </div>
                        <h2 className="text-xl font-bold">Location & Proximity</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1 uppercase tracking-wider">City</label>
                            <input
                                {...form.register("city")}
                                className="w-full px-5 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-black transition-all font-medium"
                                placeholder="e.g. Accra"
                            />
                            {form.formState.errors.city && (
                                <p className="text-xs text-red-500 ml-1 font-medium">{form.formState.errors.city.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1 uppercase tracking-wider">Address Line</label>
                            <input
                                {...form.register("addressLine")}
                                className="w-full px-5 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-black transition-all font-medium"
                                placeholder="e.g. 12th Lane, East Legon"
                            />
                            {form.formState.errors.addressLine && (
                                <p className="text-xs text-red-500 ml-1 font-medium">{form.formState.errors.addressLine.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1 uppercase tracking-wider flex items-center gap-2">
                                <MessageSquare size={14} className="text-green-500" /> WhatsApp Number
                            </label>
                            <input
                                {...form.register("whatsappNumber")}
                                className="w-full px-5 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-black transition-all font-medium"
                                placeholder="e.g. 0541234567"
                            />
                            <p className="text-[10px] text-gray-400 ml-1 uppercase font-bold tracking-tighter">Students will contact you via this number</p>
                            {form.formState.errors.whatsappNumber && (
                                <p className="text-xs text-red-500 ml-1 font-medium">{form.formState.errors.whatsappNumber.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1 uppercase tracking-wider flex items-center gap-2">
                                <Clock size={14} className="text-blue-500" /> Distance to Campus
                            </label>
                            <input
                                {...form.register("distanceToCampus")}
                                className="w-full px-5 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-black transition-all font-medium"
                                placeholder="e.g. 5 mins walk / 10 mins trotro"
                            />
                            {form.formState.errors.distanceToCampus && (
                                <p className="text-xs text-red-500 ml-1 font-medium">{form.formState.errors.distanceToCampus.message}</p>
                            )}
                        </div>
                    </div>
                </section>

                {/* Utilities Section */}
                <section className="bg-white rounded-[2rem] border p-8 md:p-10 shadow-sm space-y-8">
                    <div className="flex items-center gap-3 pb-6 border-b">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                            <Zap size={20} />
                        </div>
                        <h2 className="text-xl font-bold">Included Utilities</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { id: "water", label: "Water Included", icon: Droplets, color: "text-blue-500" },
                            { id: "light", label: "Electricity Included", icon: Zap, color: "text-yellow-500" },
                            { id: "gas", label: "Gas/Cooking Included", icon: Flame, color: "text-orange-500" }
                        ].map((util) => {
                            const isSelected = form.watch("utilitiesIncluded")?.includes(util.id);
                            return (
                                <button
                                    key={util.id}
                                    type="button"
                                    onClick={() => {
                                        const current = form.getValues("utilitiesIncluded") || [];
                                        const updated = isSelected
                                            ? current.filter(u => u !== util.id)
                                            : [...current, util.id];
                                        form.setValue("utilitiesIncluded", updated);
                                    }}
                                    className={cn(
                                        "flex items-center gap-4 p-5 rounded-2xl border-2 transition-all",
                                        isSelected
                                            ? "border-black bg-black text-white"
                                            : "border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200"
                                    )}
                                >
                                    <util.icon size={20} className={isSelected ? "text-white" : util.color} />
                                    <span className="text-xs font-bold uppercase tracking-wider">{util.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* Amenities Section */}
                <section className="bg-white rounded-[2rem] border p-8 md:p-10 shadow-sm space-y-8">
                    <div className="flex items-center gap-3 pb-6 border-b">
                        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                            <Check size={20} />
                        </div>
                        <h2 className="text-xl font-bold">Amenities</h2>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {AMENITIES.map((item) => {
                            const isSelected = selectedAmenities.includes(item.id);
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => toggleAmenity(item.id)}
                                    className={cn(
                                        "flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all active:scale-95",
                                        isSelected
                                            ? "border-black bg-black text-white shadow-xl shadow-black/10"
                                            : "border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200"
                                    )}
                                >
                                    <item.icon size={24} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">{item.id}</span>
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* Images Section */}
                <section className="bg-white rounded-[2rem] border p-8 md:p-10 shadow-sm space-y-8">
                    <div className="flex items-center gap-3 pb-6 border-b">
                        <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                            <ImageIcon size={20} />
                        </div>
                        <h2 className="text-xl font-bold">Property Photos</h2>
                    </div>

                    <div className="space-y-6">
                        <ImageUpload
                            value={form.watch("images")}
                            onChange={(urls) => form.setValue("images", urls)}
                        />
                        {form.formState.errors.images && (
                            <p className="text-xs text-red-500 font-medium">{form.formState.errors.images.message}</p>
                        )}
                    </div>
                </section>

                <div className="pt-8">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-black text-white rounded-[1.5rem] font-bold text-lg hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-3 shadow-xl shadow-black/20"
                    >
                        {loading ? <Loader2 className="animate-spin" size={24} /> : null}
                        {loading ? "Creating Hostel..." : "Publish My Hostel"}
                    </button>
                </div>
            </form>
        </div>
    );
}
