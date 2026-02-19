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
    MessageSquare,
    Zap,
    Droplets,
    Flame,
    Clock,
    Image as ImageIcon,
    Trash2
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import ImageUpload from "@/components/common/ImageUpload";

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
    { id: "WiFi", label: "Wi-Fi", icon: Wifi },
    { id: "AC", label: "Air Con", icon: Wind },
    { id: "Laundry", label: "Laundry", icon: Utensils },
    { id: "Swimming Pool", label: "Pool", icon: Waves },
    { id: "Parking", label: "Parking", icon: Car },
    { id: "Security", label: "Security", icon: ShieldCheck },
    { id: "Study Room", label: "Study Room", icon: Coffee },
    { id: "Generator", label: "Generator", icon: Building2 },
];

const STEPS = [
    { id: 1, label: "Basic Info", icon: Info },
    { id: 2, label: "Location", icon: MapPin },
    { id: 3, label: "Features", icon: Zap },
    { id: 4, label: "Photos", icon: ImageIcon },
];

export default function NewHostelPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
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

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setLoading(true);
        try {
            await api.post("/hostels", { ...values, isPublished: true });
            toast.success("Hostel created and live!");
            router.push("/owner/hostels");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to create hostel");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-20">
            {/* Back & Header */}
            <Link
                href="/owner/hostels"
                className="inline-flex items-center gap-2 text-xs font-black text-gray-400 hover:text-gray-900 mb-10 transition-colors group uppercase tracking-widest"
            >
                <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Back to Hostels
            </Link>

            <div className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-100">
                        New Listing
                    </span>
                </div>
                <h1 className="text-4xl font-black text-gray-950 tracking-tight leading-none mb-3">
                    List a Property <span className="text-blue-600">.</span>
                </h1>
                <p className="text-gray-500 font-medium text-lg">Add your hostel and start receiving bookings from students.</p>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center gap-2 mb-12">
                {STEPS.map((step, i) => (
                    <div key={step.id} className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setCurrentStep(step.id)}
                            className={cn(
                                "flex items-center gap-2.5 px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border",
                                currentStep === step.id
                                    ? "bg-gray-950 text-white border-gray-950 shadow-lg shadow-gray-200"
                                    : currentStep > step.id
                                        ? "bg-blue-50 text-blue-600 border-blue-100"
                                        : "bg-white text-gray-400 border-gray-100 hover:border-gray-200"
                            )}
                        >
                            {currentStep > step.id ? (
                                <Check size={12} />
                            ) : (
                                <step.icon size={12} />
                            )}
                            {step.label}
                        </button>
                        {i < STEPS.length - 1 && (
                            <div className={cn(
                                "h-px flex-1 max-w-8 transition-all",
                                currentStep > step.id ? "bg-blue-300" : "bg-gray-100"
                            )} />
                        )}
                    </div>
                ))}
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Step 1: Basic Info */}
                {currentStep === 1 && (
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 md:p-12 shadow-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                                <Info size={22} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-gray-950 tracking-tight">Basic Information</h2>
                                <p className="text-sm text-gray-400 font-medium mt-0.5">Name and describe your property</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Hostel Name</label>
                                <div className="relative">
                                    <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        {...form.register("name")}
                                        className="w-full pl-14 pr-5 py-5 bg-gray-50 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold text-gray-950 placeholder:text-gray-300 text-lg"
                                        placeholder="e.g. Sunrise Ridge Hostel"
                                    />
                                </div>
                                {form.formState.errors.name && (
                                    <p className="text-xs text-red-500 ml-1 font-bold">{form.formState.errors.name.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                                <textarea
                                    {...form.register("description")}
                                    rows={5}
                                    className="w-full px-6 py-5 bg-gray-50 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all font-medium text-gray-950 placeholder:text-gray-300 resize-none"
                                    placeholder="What makes your hostel special? Describe the atmosphere, location benefits, and what students will love about it..."
                                />
                                {form.formState.errors.description && (
                                    <p className="text-xs text-red-500 ml-1 font-bold">{form.formState.errors.description.message}</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Location */}
                {currentStep === 2 && (
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 md:p-12 shadow-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
                            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                                <MapPin size={22} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-gray-950 tracking-tight">Location & Proximity</h2>
                                <p className="text-sm text-gray-400 font-medium mt-0.5">Help students find you easily</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">City</label>
                                <input
                                    {...form.register("city")}
                                    className="w-full px-6 py-5 bg-gray-50 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold text-gray-950 placeholder:text-gray-300"
                                    placeholder="e.g. Kumasi"
                                />
                                {form.formState.errors.city && (
                                    <p className="text-xs text-red-500 ml-1 font-bold">{form.formState.errors.city.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Address Line</label>
                                <input
                                    {...form.register("addressLine")}
                                    className="w-full px-6 py-5 bg-gray-50 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold text-gray-950 placeholder:text-gray-300"
                                    placeholder="e.g. 12th Lane, East Legon"
                                />
                                {form.formState.errors.addressLine && (
                                    <p className="text-xs text-red-500 ml-1 font-bold">{form.formState.errors.addressLine.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <MessageSquare size={12} className="text-green-500" /> WhatsApp Number
                                </label>
                                <input
                                    {...form.register("whatsappNumber")}
                                    className="w-full px-6 py-5 bg-gray-50 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold text-gray-950 placeholder:text-gray-300"
                                    placeholder="e.g. 0541234567"
                                />
                                <p className="text-[10px] text-gray-400 ml-1 font-bold">Students contact you via WhatsApp</p>
                                {form.formState.errors.whatsappNumber && (
                                    <p className="text-xs text-red-500 ml-1 font-bold">{form.formState.errors.whatsappNumber.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Clock size={12} className="text-blue-500" /> Distance to Campus
                                </label>
                                <input
                                    {...form.register("distanceToCampus")}
                                    className="w-full px-6 py-5 bg-gray-50 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold text-gray-950 placeholder:text-gray-300"
                                    placeholder="e.g. 5 mins walk / 10 mins trotro"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Features */}
                {currentStep === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        {/* Utilities */}
                        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 md:p-12 shadow-sm space-y-8">
                            <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
                                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                                    <Zap size={22} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-gray-950 tracking-tight">Included Utilities</h2>
                                    <p className="text-sm text-gray-400 font-medium mt-0.5">What's covered in the rent?</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {[
                                    { id: "water", label: "Water", icon: Droplets, color: "text-blue-500", bg: "bg-blue-50" },
                                    { id: "light", label: "Electricity", icon: Zap, color: "text-yellow-500", bg: "bg-yellow-50" },
                                    { id: "gas", label: "Gas / Cooking", icon: Flame, color: "text-orange-500", bg: "bg-orange-50" }
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
                                                "flex items-center gap-4 p-6 rounded-2xl border-2 transition-all",
                                                isSelected
                                                    ? "border-gray-950 bg-gray-950 text-white"
                                                    : "border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200"
                                            )}
                                        >
                                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", isSelected ? "bg-white/10" : util.bg)}>
                                                <util.icon size={20} className={isSelected ? "text-white" : util.color} />
                                            </div>
                                            <span className="text-sm font-black uppercase tracking-wider">{util.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Amenities */}
                        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 md:p-12 shadow-sm space-y-8">
                            <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
                                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
                                    <Check size={22} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-gray-950 tracking-tight">Amenities</h2>
                                    <p className="text-sm text-gray-400 font-medium mt-0.5">Select all available facilities</p>
                                </div>
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
                                                "flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all active:scale-95 cursor-pointer",
                                                isSelected
                                                    ? "border-gray-950 bg-gray-950 text-white shadow-xl shadow-gray-200"
                                                    : "border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200 hover:text-gray-600"
                                            )}
                                        >
                                            <item.icon size={24} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Photos */}
                {currentStep === 4 && (
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 md:p-12 shadow-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                                <ImageIcon size={22} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-gray-950 tracking-tight">Property Photos</h2>
                                <p className="text-sm text-gray-400 font-medium mt-0.5">Good photos attract 3x more bookings</p>
                            </div>
                        </div>

                        <ImageUpload
                            value={form.watch("images")}
                            onChange={(urls) => form.setValue("images", urls)}
                        />
                        {form.formState.errors.images && (
                            <p className="text-xs text-red-500 font-bold">{form.formState.errors.images.message}</p>
                        )}
                    </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between gap-4 pt-4">
                    {currentStep > 1 ? (
                        <button
                            type="button"
                            onClick={() => setCurrentStep(s => s - 1)}
                            className="px-8 py-4 bg-white border border-gray-200 text-gray-900 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-gray-50 transition-all"
                        >
                            ← Previous
                        </button>
                    ) : (
                        <div />
                    )}

                    {currentStep < STEPS.length ? (
                        <button
                            type="button"
                            onClick={() => setCurrentStep(s => s + 1)}
                            className="px-8 py-4 bg-gray-950 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-gray-200 hover:bg-black transition-all active:scale-[0.98]"
                        >
                            Continue →
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-12 py-4 bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-[0.98] flex items-center gap-3 disabled:opacity-60"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : null}
                            {loading ? "Publishing..." : "Publish My Hostel →"}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
