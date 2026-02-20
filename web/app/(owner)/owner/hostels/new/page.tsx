"use client";

import { useState, useEffect } from "react";
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

const DRAFT_KEY = "hostel_listing_draft";

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

    // ─── Draft Persistence: Load ───
    useEffect(() => {
        const savedDraft = localStorage.getItem(DRAFT_KEY);
        if (savedDraft) {
            try {
                const draft = JSON.parse(savedDraft);
                // Restore form fields
                if (draft.formData) {
                    Object.keys(draft.formData).forEach((key) => {
                        form.setValue(key as any, draft.formData[key]);
                    });
                    if (draft.formData.amenities) {
                        setSelectedAmenities(draft.formData.amenities);
                    }
                }
                // Restore UI State
                if (draft.currentStep) {
                    setCurrentStep(draft.currentStep);
                }

                toast.success("Draft restored", {
                    description: "We've recovered your previous progress."
                });
            } catch (e) {
                console.error("Failed to restore draft", e);
            }
        }
    }, [form]);

    // ─── Draft Persistence: Save ───
    useEffect(() => {
        const subscription = form.watch((value) => {
            const draft = {
                formData: value,
                currentStep: currentStep,
                updatedAt: new Date().toISOString()
            };
            localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        });
        return () => subscription.unsubscribe();
    }, [form.watch, currentStep]);

    const toggleAmenity = (id: string) => {
        const updated = selectedAmenities.includes(id)
            ? selectedAmenities.filter(a => a !== id)
            : [...selectedAmenities, id];
        setSelectedAmenities(updated);
        form.setValue("amenities", updated);
    };

    const [publishStage, setPublishStage] = useState<'idle' | 'uploading' | 'verifying' | 'done' | 'error'>('idle');
    const [publishResult, setPublishResult] = useState<{ requiresVerification: boolean } | null>(null);

    // Close overlay on error to allow user to see toast and fix issues (e.g. subscription limits)
    useEffect(() => {
        if (publishStage === 'error') {
            const timer = setTimeout(() => {
                setPublishStage('idle');
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [publishStage]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setPublishStage('uploading');
        try {
            // Stage 1: simulate upload/transmission feel
            await new Promise(r => setTimeout(r, 900));
            setPublishStage('verifying');

            // Stage 2: actual API call
            const res = await api.post("/hostels", values);
            await new Promise(r => setTimeout(r, 700));

            // Clear draft on success
            localStorage.removeItem(DRAFT_KEY);

            setPublishStage('done');
            setPublishResult({ requiresVerification: res.data?.requiresVerification ?? true });
        } catch (error: any) {
            setPublishStage('error');
            toast.error(error.response?.data?.message || "Failed to submit hostel");
        }
    };

    const isPublishing = publishStage !== 'idle' && publishStage !== 'error';

    const stages = [
        { key: 'uploading', label: 'Transmitting property data...' },
        { key: 'verifying', label: 'Queuing for admin verification...' },
        { key: 'done', label: 'Submission complete!' },
    ];

    return (
        <div className="max-w-5xl mx-auto pb-20 relative">

            {/* ─── Publishing Full-Page Overlay ─── */}
            {(publishStage !== 'idle') && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop blur */}
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-md" />

                    <div className="relative z-10 bg-white border border-gray-100 rounded-[3rem] shadow-2xl shadow-gray-200 p-12 max-w-md w-full mx-4 text-center animate-in zoom-in-95 duration-300">

                        {publishStage === 'done' && publishResult ? (
                            // ── Success State ──
                            <>
                                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-blue-100">
                                    <Check className="text-blue-600" size={36} />
                                </div>
                                <h2 className="text-2xl font-black text-gray-950 tracking-tight mb-3">
                                    {publishResult.requiresVerification ? 'Under Review' : 'Hostel Published!'}
                                </h2>
                                {publishResult.requiresVerification ? (
                                    <p className="text-gray-500 text-sm font-medium leading-relaxed mb-8">
                                        Your hostel has been submitted. Because this is your <strong className="text-gray-900">first listing</strong>, our team needs to verify your property before it goes live. We'll notify you once approved — usually within 24 hours.
                                    </p>
                                ) : (
                                    <p className="text-gray-500 text-sm font-medium leading-relaxed mb-8">
                                        Your hostel is now live and discoverable by students!
                                    </p>
                                )}
                                {publishResult.requiresVerification && (
                                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-8 text-left">
                                        <p className="text-[11px] font-black text-blue-700 uppercase tracking-widest mb-2">What happens next?</p>
                                        <ul className="space-y-1.5 text-xs text-blue-600 font-medium">
                                            <li className="flex items-center gap-2"><Check size={10} className="shrink-0" />Admin team reviews your listing</li>
                                            <li className="flex items-center gap-2"><Check size={10} className="shrink-0" />You get notified on approval</li>
                                            <li className="flex items-center gap-2"><Check size={10} className="shrink-0" />Future hostels auto-publish</li>
                                        </ul>
                                    </div>
                                )}
                                <button
                                    onClick={() => router.push('/owner/hostels')}
                                    className="w-full bg-gray-950 text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200"
                                >
                                    View My Hostels →
                                </button>
                            </>
                        ) : (
                            // ── Loading / Progress State ──
                            <>
                                {/* Animated ring */}
                                <div className="relative w-24 h-24 mx-auto mb-8">
                                    <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
                                    <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Building2 className="text-blue-600" size={28} />
                                    </div>
                                </div>

                                <h2 className="text-xl font-black text-gray-950 tracking-tight mb-2">Publishing Your Hostel</h2>
                                <p className="text-gray-400 text-sm font-medium mb-8">Please wait — do not close this page.</p>

                                <div className="space-y-3 text-left">
                                    {stages.map((s, i) => {
                                        const stageOrder = ['uploading', 'verifying', 'done'];
                                        const currentIdx = stageOrder.indexOf(publishStage);
                                        const stageIdx = stageOrder.indexOf(s.key);
                                        const isDone = stageIdx < currentIdx;
                                        const isActive = stageIdx === currentIdx;

                                        return (
                                            <div key={s.key} className={cn(
                                                "flex items-center gap-3 p-3 rounded-xl transition-all",
                                                isActive ? "bg-blue-50 border border-blue-100" : "bg-gray-50"
                                            )}>
                                                <div className={cn(
                                                    "w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black",
                                                    isDone ? "bg-blue-600 text-white" : isActive ? "bg-blue-100 text-blue-600" : "bg-gray-200 text-gray-400"
                                                )}>
                                                    {isDone ? <Check size={10} /> : i + 1}
                                                </div>
                                                <p className={cn(
                                                    "text-xs font-bold",
                                                    isActive ? "text-blue-700" : isDone ? "text-gray-600" : "text-gray-400"
                                                )}>{s.label}</p>
                                                {isActive && <div className="ml-auto w-3 h-3 rounded-full bg-blue-400 animate-pulse" />}
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
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
                <div className={cn("flex items-center justify-between gap-4 pt-4", isPublishing && "pointer-events-none opacity-30")}>
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
                            onClick={async () => {
                                let fieldsToValidate: any[] = [];
                                if (currentStep === 1) fieldsToValidate = ["name", "description"];
                                if (currentStep === 2) fieldsToValidate = ["city", "addressLine", "whatsappNumber"];
                                if (currentStep === 3) fieldsToValidate = []; // Optional

                                const isValid = await form.trigger(fieldsToValidate);
                                if (isValid) {
                                    setCurrentStep(s => s + 1);
                                } else {
                                    toast.error("Please fix errors before continuing");
                                }
                            }}
                            className="px-8 py-4 bg-gray-950 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-gray-200 hover:bg-black transition-all active:scale-[0.98]"
                        >
                            Continue →
                        </button>
                    ) : (
                        <button
                            type="button" // Change to button to manually trigger submit with validation check
                            disabled={publishStage !== 'idle'}
                            onClick={async () => {
                                const isValid = await form.trigger();
                                if (isValid) {
                                    form.handleSubmit(onSubmit)();
                                } else {
                                    toast.error("Please fill in all required fields", {
                                        description: Object.values(form.formState.errors).map((e: any) => e.message).join(", ")
                                    });
                                    // Debug log
                                    console.error("Form Validation Errors:", form.formState.errors);
                                }
                            }}
                            className="px-12 py-4 bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-[0.98] flex items-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <Building2 size={16} />
                            Publish My Hostel →
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
