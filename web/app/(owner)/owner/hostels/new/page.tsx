"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
    Wifi, Wind, Utensils, Waves, Car, ShieldCheck, Coffee, Building2,
    Zap, Droplets, Flame, ChevronLeft, Loader2, CheckCircle2, MapPin, Sparkles
} from "lucide-react";

import Link from "next/link";
import { cn } from "@/lib/utils";
import ImageUpload from "@/components/common/ImageUpload";
import LocationPicker from "@/components/common/LocationPicker";
import { REGIONAL_UNIVERSITIES } from "@/lib/constants";

const formSchema = z.object({
    name: z.string().min(3, "Hostel name must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    city: z.string().min(2, "City is required"),
    addressLine: z.string().min(5, "Street address is required"),
    university: z.string().min(2, "Please select the nearest university"),
    whatsappNumber: z.string().regex(/^(0|233)[0-9]{9}$/, "Enter a valid Ghana number e.g. 0244123456"),
    distanceToCampus: z.string().optional().or(z.literal("")),
    utilitiesIncluded: z.array(z.string()),
    amenities: z.array(z.string()),
    images: z.array(z.string()).min(1, "Please upload at least one photo"),
    policiesText: z.string().optional(),
    genderCategory: z.enum(["MALE", "FEMALE", "MIXED"]).optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
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

const STEPS = ["Basic Info", "Location", "Amenities", "Photos"];
const DRAFT_KEY = "hostel_listing_draft";

const Field = ({ label, required, error, children }: {
    label: string; required?: boolean; error?: string; children: React.ReactNode;
}) => (
    <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">
            {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {children}
        {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
);

const inputCls = (hasError?: boolean) => cn(
    "w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-950 border rounded-lg text-sm text-gray-900 dark:text-white outline-none transition-colors placeholder:text-gray-400 dark:text-gray-500",
    hasError ? "border-red-300 focus:border-red-400 bg-red-50" : "border-gray-200 focus:border-blue-500 focus:bg-white dark:bg-gray-900"
);

export default function NewHostelPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [done, setDone] = useState(false);
    const [requiresVerification, setRequiresVerification] = useState(true);
    const [isPolishing, setIsPolishing] = useState(false);

    const handleAIPolish = async () => {
        const desc = form.getValues("description");
        if (!desc || desc.length < 10) return toast.error("Please enter a short description first (min 10 chars)");

        setIsPolishing(true);
        try {
            const { data } = await api.post("/ai/polish-description", { description: desc });
            form.setValue("description", data.polished);
            toast.success("Description polished by AI!");
        } catch (e: any) {
            toast.error("AI polishing failed. Make sure AI_API_KEY is configured.");
        } finally {
            setIsPolishing(false);
        }
    };


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "", description: "", city: "", addressLine: "",
            university: "", whatsappNumber: "", distanceToCampus: "",
            utilitiesIncluded: [], amenities: [], images: [],
            policiesText: "", genderCategory: "MIXED",
            latitude: undefined, longitude: undefined,
        }
    });

    const { formState: { errors } } = form;

    // Load draft
    useEffect(() => {
        const saved = localStorage.getItem(DRAFT_KEY);
        if (saved) {
            try {
                const draft = JSON.parse(saved);
                if (draft.formData) {
                    Object.keys(draft.formData).forEach(k => form.setValue(k as any, draft.formData[k]));
                    if (draft.formData.amenities) setSelectedAmenities(draft.formData.amenities);
                }
                if (draft.step) setStep(draft.step);
                toast.info("Draft restored");
            } catch { /* ignore */ }
        }
    }, []);

    // Save draft
    useEffect(() => {
        const sub = form.watch((value) => {
            localStorage.setItem(DRAFT_KEY, JSON.stringify({ formData: value, step }));
        });
        return () => sub.unsubscribe();
    }, [form.watch, step]);

    const toggleAmenity = (id: string) => {
        const updated = selectedAmenities.includes(id)
            ? selectedAmenities.filter(a => a !== id)
            : [...selectedAmenities, id];
        setSelectedAmenities(updated);
        form.setValue("amenities", updated);
    };

    const advance = async () => {
        const fieldsMap: Record<number, string[]> = {
            1: ["name", "description", "genderCategory"],
            2: ["city", "addressLine", "university", "whatsappNumber"],
            3: [],
            4: ["images"],
        };
        const ok = await form.trigger(fieldsMap[step] as any);
        if (ok) setStep(s => s + 1);
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsSubmitting(true);
        try {
            const res = await api.post("/hostels", values);
            localStorage.removeItem(DRAFT_KEY);
            setRequiresVerification(res.data?.requiresVerification ?? true);
            setDone(true);
        } catch (e: any) {
            toast.error(e.message || "Failed to create hostel");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Success screen
    if (done) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center p-6">
                <div className="max-w-sm w-full text-center space-y-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 size={32} className="text-green-600" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {requiresVerification ? "Submitted for Review" : "Hostel Listed!"}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 leading-relaxed">
                            {requiresVerification
                                ? "Your hostel has been submitted and is under review. It'll be visible once approved (usually within 24 hours)."
                                : "Your hostel is now live and visible to students."}
                        </p>
                    </div>
                    <button
                        onClick={() => router.push("/owner/hostels")}
                        className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
                    >
                        Go to My Hostels
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto pb-20 px-4">
            {/* Back link */}
            <div className="py-6">
                <Link href="/owner/hostels" className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:text-white transition-colors">
                    <ChevronLeft size={16} />
                    Back to my hostels
                </Link>
            </div>

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">List a hostel</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1">Fill in the details below to get your hostel in front of students.</p>
            </div>

            {/* Step progress */}
            <div className="flex items-center gap-2 mb-8">
                {STEPS.map((label, i) => {
                    const n = i + 1;
                    const done = step > n;
                    const active = step === n;
                    return (
                        <div key={n} className="flex items-center gap-2 flex-1 last:flex-initial">
                            <div className="flex items-center gap-2 shrink-0">
                                <div className={cn(
                                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors",
                                    done ? "bg-blue-600 text-white" : active ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400 dark:text-gray-500"
                                )}>
                                    {done ? <CheckCircle2 size={14} /> : n}
                                </div>
                                <span className={cn("text-sm hidden sm:inline", active ? "text-gray-900 dark:text-white font-medium" : done ? "text-blue-600" : "text-gray-400 dark:text-gray-500")}>
                                    {label}
                                </span>
                            </div>
                            {i < STEPS.length - 1 && (
                                <div className={cn("flex-1 h-px", step > n ? "bg-blue-200" : "bg-gray-200")} />
                            )}
                        </div>
                    );
                })}
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)}>
                {/* Step 1: Basic Info */}
                {step === 1 && (
                    <div className="space-y-5">
                        <div className="border-b pb-4 mb-6">
                            <h2 className="font-semibold text-gray-900 dark:text-white">Basic Information</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-0.5">Tell students what your hostel is about.</p>
                        </div>

                        <Field label="Hostel Name" required error={errors.name?.message}>
                            <input
                                {...form.register("name")}
                                className={inputCls(!!errors.name)}
                                placeholder="e.g. Skyline Residences"
                            />
                        </Field>

                        <Field 
                            label="Description" 
                            required 
                            error={errors.description?.message}
                        >
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Write about your hostel</span>
                                <button
                                    type="button"
                                    disabled={isPolishing}
                                    onClick={handleAIPolish}
                                    className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-md text-[10px] font-bold uppercase tracking-widest hover:bg-blue-100 transition-all disabled:opacity-50 border border-blue-100"
                                >
                                    {isPolishing ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                                    {isPolishing ? "Polishing..." : "AI Polish"}
                                </button>
                            </div>
                            <textarea
                                {...form.register("description")}
                                rows={4}
                                className={inputCls(!!errors.description) + " resize-none"}
                                placeholder="Describe what makes your hostel great — facilities, atmosphere, environment..."
                            />
                        </Field>


                        <Field label="Who can stay here?" required>
                            <select {...form.register("genderCategory")} className={inputCls()}>
                                <option value="MIXED">Mixed — both male and female</option>
                                <option value="MALE">Male students only</option>
                                <option value="FEMALE">Female students only</option>
                            </select>
                        </Field>

                        <Field label="House Rules & Policies">
                            <textarea
                                {...form.register("policiesText")}
                                rows={3}
                                className={inputCls() + " resize-none"}
                                placeholder="e.g. No loud music after 10pm, no pets, guests must sign in..."
                            />
                        </Field>
                    </div>
                )}

                {/* Step 2: Location */}
                {step === 2 && (
                    <div className="space-y-5">
                        <div className="border-b pb-4 mb-6">
                            <h2 className="font-semibold text-gray-900 dark:text-white">Location & Contact</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-0.5">Help students find and contact you.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Field label="City" required error={errors.city?.message}>
                                <input
                                    {...form.register("city")}
                                    className={inputCls(!!errors.city)}
                                    placeholder="e.g. Kumasi"
                                />
                            </Field>
                            <Field label="Street Address" required error={errors.addressLine?.message}>
                                <input
                                    {...form.register("addressLine")}
                                    className={inputCls(!!errors.addressLine)}
                                    placeholder="e.g. Plt 22B, Ring Road"
                                />
                            </Field>
                        </div>

                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-3">
                            <div className="flex items-center gap-2 text-blue-700">
                                <MapPin size={14} />
                                <p className="text-xs font-bold uppercase tracking-wide">Pin Your Location on Map</p>
                            </div>
                            <p className="text-xs text-blue-500">Search your hostel address below to pin it on the map. Students will see exactly where you are.</p>
                            <LocationPicker
                                onSelect={(data) => {
                                    form.setValue("latitude", data.lat);
                                    form.setValue("longitude", data.lng);
                                    if (data.city && !form.getValues("city")) {
                                        form.setValue("city", data.city);
                                    }
                                    if (data.region) form.setValue("addressLine", form.getValues("addressLine") || data.display_name.split(",")[0]);
                                }}
                            />
                            {form.watch("latitude") && (
                                <p className="text-xs text-emerald-600 font-medium">
                                    ✓ Coordinates: {form.watch("latitude")?.toFixed(4)}, {form.watch("longitude")?.toFixed(4)}
                                </p>
                            )}
                        </div>

                        <Field label="Nearest University / Campus" required error={errors.university?.message}>
                            <select {...form.register("university")} className={inputCls(!!errors.university)}>
                                <option value="">Select a university</option>
                                {REGIONAL_UNIVERSITIES.map(group => (
                                    <optgroup key={group.region} label={group.region}>
                                        {group.unis.map(u => (
                                            <option key={u} value={u}>{u}</option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                        </Field>

                        <Field label="Distance to Campus">
                            <input
                                {...form.register("distanceToCampus")}
                                className={inputCls()}
                                placeholder="e.g. 5 minutes walk"
                            />
                        </Field>

                        <Field label="WhatsApp Number" required error={errors.whatsappNumber?.message}>
                            <input
                                {...form.register("whatsappNumber")}
                                className={inputCls(!!errors.whatsappNumber)}
                                placeholder="e.g. 0541234567"
                            />
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                This enables the "Book via WhatsApp" button — students can message you directly from your hostel page.
                            </p>
                        </Field>
                    </div>
                )}

                {/* Step 3: Amenities */}
                {step === 3 && (
                    <div className="space-y-6">
                        <div className="border-b pb-4 mb-2">
                            <h2 className="font-semibold text-gray-900 dark:text-white">Amenities & Utilities</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-0.5">Select everything that's available at your hostel.</p>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-3">Utilities included in rent</p>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { id: "water", label: "Water", icon: Droplets },
                                    { id: "light", label: "Electricity", icon: Zap },
                                    { id: "gas", label: "Gas", icon: Flame },
                                ].map(util => {
                                    const isOn = form.watch("utilitiesIncluded")?.includes(util.id);
                                    return (
                                        <button
                                            key={util.id}
                                            type="button"
                                            onClick={() => {
                                                const curr = form.getValues("utilitiesIncluded") || [];
                                                form.setValue("utilitiesIncluded", isOn
                                                    ? curr.filter(u => u !== util.id)
                                                    : [...curr, util.id]);
                                            }}
                                            className={cn(
                                                "flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-colors",
                                                isOn ? "bg-blue-600 text-white border-blue-600" : "bg-white dark:bg-gray-900 border-gray-200 text-gray-600 hover:border-gray-300"
                                            )}
                                        >
                                            <util.icon size={14} />
                                            {util.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-3">Facilities</p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {AMENITIES.map(item => {
                                    const isOn = selectedAmenities.includes(item.id);
                                    return (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => toggleAmenity(item.id)}
                                            className={cn(
                                                "flex flex-col items-center gap-2 py-4 rounded-lg border text-sm transition-colors",
                                                isOn ? "bg-blue-50 border-blue-300 text-blue-700" : "bg-white dark:bg-gray-900 border-gray-200 text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:border-gray-300"
                                            )}
                                        >
                                            <item.icon size={18} />
                                            <span className="text-xs">{item.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Photos */}
                {step === 4 && (
                    <div className="space-y-5">
                        <div className="border-b pb-4 mb-6">
                            <h2 className="font-semibold text-gray-900 dark:text-white">Photos</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-0.5">Good photos significantly increase bookings. Upload at least one.</p>
                        </div>

                        <ImageUpload
                            value={form.watch("images")}
                            onChange={(urls) => form.setValue("images", urls)}
                        />
                        {errors.images && (
                            <p className="text-xs text-red-500">{errors.images.message as string}</p>
                        )}
                    </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between pt-8 mt-8 border-t">
                    {step > 1 ? (
                        <button
                            type="button"
                            onClick={() => setStep(s => s - 1)}
                            className="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 dark:bg-gray-950 transition-colors"
                        >
                            Back
                        </button>
                    ) : <div />}

                    {step < STEPS.length ? (
                        <button
                            type="button"
                            onClick={advance}
                            className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Continue
                        </button>
                    ) : (
                        <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={async () => {
                                const ok = await form.trigger();
                                if (ok) form.handleSubmit(onSubmit)();
                                else toast.error("Please fill in all required fields");
                            }}
                            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {isSubmitting && <Loader2 size={15} className="animate-spin" />}
                            {isSubmitting ? "Saving..." : "List Hostel"}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
