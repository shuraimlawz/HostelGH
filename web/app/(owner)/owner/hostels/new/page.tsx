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
    ShieldAlert,
    ArrowRight,
    ArrowLeft,
    Users,
    Eye
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
    policiesText: z.string().optional(),
    genderCategory: z.enum(["MALE", "FEMALE", "MIXED"]).optional(),
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
    { id: 1, label: "Identity", icon: Info },
    { id: 2, label: "Location", icon: MapPin },
    { id: 3, label: "Specs", icon: Zap },
    { id: 4, label: "Visuals", icon: ImageIcon },
];

const DRAFT_KEY = "hostel_listing_draft";

export default function NewHostelPage() {
    const router = useRouter();
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
            policiesText: "",
            genderCategory: "MIXED",
        }
    });

    // ─── Draft Persistence: Load ───
    useEffect(() => {
        const savedDraft = localStorage.getItem(DRAFT_KEY);
        if (savedDraft) {
            try {
                const draft = JSON.parse(savedDraft);
                if (draft.formData) {
                    Object.keys(draft.formData).forEach((key) => {
                        form.setValue(key as any, draft.formData[key]);
                    });
                    if (draft.formData.amenities) {
                        setSelectedAmenities(draft.formData.amenities);
                    }
                }
                if (draft.currentStep) {
                    setCurrentStep(draft.currentStep);
                }
                toast.success("Progress Restored");
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
            await new Promise(r => setTimeout(r, 900));
            setPublishStage('verifying');
            const res = await api.post("/hostels", values);
            await new Promise(r => setTimeout(r, 700));
            localStorage.removeItem(DRAFT_KEY);
            setPublishStage('done');
            setPublishResult({ requiresVerification: res.data?.requiresVerification ?? true });
        } catch (error: any) {
            setPublishStage('error');
            toast.error(error.message);
        }
    };

    const isPublishing = publishStage !== 'idle' && publishStage !== 'error';

    const stages = [
        { key: 'uploading', label: 'TRANSMITTING ASSET DATA...' },
        { key: 'verifying', label: 'VERIFYING COMPLIANCE...' },
        { key: 'done', label: 'DEPLOYMENT COMPLETE' },
    ];

    return (
        <div className="max-w-4xl mx-auto pb-20 relative px-4">

            {/* ─── Publishing Overlay ─── */}
            {(publishStage !== 'idle') && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-xl" />

                    <div className="relative z-10 bg-white border border-gray-100 rounded-3xl shadow-2xl p-10 max-w-sm w-full text-center animate-in zoom-in-95 duration-700">

                        {publishStage === 'done' && publishResult ? (
                            <div className="space-y-8">
                                <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-blue-500/20 border border-white/20">
                                    <Check className="text-white" size={40} />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight uppercase">
                                        {publishResult.requiresVerification ? 'Processing' : 'Asset Live'}
                                    </h2>
                                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                                        {publishResult.requiresVerification 
                                            ? "Your asset has been queued for manual verification. Expected turn-around: 24 cycles."
                                            : "Your asset is now operational and visible to primary users."
                                        }
                                    </p>
                                </div>
                                <button
                                    onClick={() => router.push('/owner/hostels')}
                                    className="w-full h-14 bg-gray-900 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-xl"
                                >
                                    Return to Archive
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-10">
                                <div className="relative w-20 h-20 mx-auto">
                                    <div className="absolute inset-0 rounded-2xl border-2 border-blue-600/10" />
                                    <div className="absolute inset-0 rounded-2xl border-2 border-blue-600 border-t-transparent animate-spin" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Building2 className="text-blue-600 animate-pulse" size={28} />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h2 className="text-[11px] font-bold text-gray-400 tracking-[0.3em] uppercase">Transmitting Session</h2>

                                    <div className="space-y-3 text-left">
                                        {stages.map((s, i) => {
                                            const stageOrder = ['uploading', 'verifying', 'done'];
                                            const currentIdx = stageOrder.indexOf(publishStage);
                                            const stageIdx = stageOrder.indexOf(s.key);
                                            const isDone = stageIdx < currentIdx;
                                            const isActive = stageIdx === currentIdx;

                                            return (
                                                <div key={s.key} className={cn(
                                                    "flex items-center gap-4 p-4 rounded-2xl border transition-all duration-500",
                                                    isActive ? "bg-blue-50 border-blue-100 shadow-sm" : "bg-gray-50/50 border-gray-100/50 opacity-60"
                                                )}>
                                                    <div className={cn(
                                                        "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-bold border",
                                                        isDone ? "bg-blue-600 text-white border-blue-500" : isActive ? "bg-white text-blue-600 border-blue-200 shadow-sm" : "bg-white text-gray-300 border-gray-200"
                                                    )}>
                                                        {isDone ? <Check size={12} /> : i + 1}
                                                    </div>
                                                    <p className={cn(
                                                        "text-[10px] font-bold uppercase tracking-widest",
                                                        isActive ? "text-blue-700" : isDone ? "text-gray-900" : "text-gray-300"
                                                    )}>{s.label}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Back & Header */}
            <Link
                href="/owner/hostels"
                className="inline-flex items-center gap-3 text-[11px] font-bold text-gray-400 hover:text-gray-900 mb-10 transition-all group uppercase tracking-widest"
            >
                <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Hub Overview
            </Link>

            <div className="mb-12 space-y-4">
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-gray-900 text-white rounded-full text-[9px] font-bold uppercase tracking-widest border border-white/10 shadow-xl">
                        Asset Deployment
                    </span>
                </div>
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold text-gray-900 tracking-tighter uppercase leading-tight">
                        Commission New Listing
                    </h1>
                    <p className="text-gray-400 font-bold text-[11px] uppercase tracking-widest max-w-xl">Initialize security protocols and deploy a new property asset into the primary fleet.</p>
                </div>
                <div className="h-1.5 w-16 bg-blue-600 rounded-full" />
            </div>

            {/* Step Indicator */}
            <div className="flex items-center gap-3 mb-12 overflow-x-auto no-scrollbar pb-4 -mx-1 px-1">
                {STEPS.map((step, i) => (
                    <div key={step.id} className="flex items-center gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={() => setCurrentStep(step.id)}
                            className={cn(
                                "flex items-center h-12 gap-3 px-6 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border",
                                currentStep === step.id
                                    ? "bg-gray-900 text-white border-gray-900 shadow-xl shadow-gray-200/50"
                                    : currentStep > step.id
                                        ? "bg-blue-50 text-blue-600 border-blue-100"
                                        : "bg-white text-gray-400 border-gray-100 hover:border-gray-300"
                            )}
                        >
                            <div className={cn(
                                "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border",
                                currentStep === step.id ? "bg-white/10 border-white/20" : currentStep > step.id ? "bg-white border-blue-200" : "bg-gray-50 border-gray-100"
                            )}>
                                {currentStep > step.id ? <Check size={12} /> : <step.icon size={12} />}
                            </div>
                            <span className="hidden sm:inline">{step.label}</span>
                        </button>
                        {i < STEPS.length - 1 && (
                            <div className={cn(
                                "w-6 h-0.5 rounded-full transition-all",
                                currentStep > step.id ? "bg-blue-200" : "bg-gray-100"
                            )} />
                        )}
                    </div>
                ))}
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Step 1: Basic Info */}
                {currentStep === 1 && (
                    <div className="bg-white border border-gray-100 p-8 md:p-10 rounded-3xl shadow-2xl shadow-gray-100/50 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex items-center gap-5 pb-6 border-b border-gray-50">
                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100/50">
                                <Info size={24} />
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Identity Registry</h2>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Baseline property identification parameters</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Commercial Designation</label>
                                <div className="relative">
                                    <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                    <input
                                        {...form.register("name")}
                                        className="w-full pl-14 pr-6 h-14 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all text-sm font-bold text-gray-900 placeholder:text-gray-300"
                                        placeholder="e.g. SKYLINE RESIDENCES"
                                    />
                                </div>
                                {form.formState.errors.name && (
                                    <p className="text-[10px] text-red-600 font-bold uppercase tracking-widest ml-1">{form.formState.errors.name.message}</p>
                                )}
                            </div>

                            <div className="space-y-3">
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Operational Context</label>
                                <textarea
                                    {...form.register("description")}
                                    rows={5}
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all text-sm font-bold text-gray-900 placeholder:text-gray-300 resize-none"
                                    placeholder="Provide detailed technical and aesthetic summary..."
                                />
                                {form.formState.errors.description && (
                                    <p className="text-[10px] text-red-600 font-bold uppercase tracking-widest ml-1">{form.formState.errors.description.message}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Occupancy Tier</label>
                                    <div className="relative">
                                        <Users className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                        <select
                                            {...form.register("genderCategory")}
                                            className="w-full pl-14 pr-10 h-14 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all text-[11px] font-bold uppercase tracking-widest text-gray-900 appearance-none cursor-pointer"
                                        >
                                            <option value="MIXED">Neutral (Mixed Population)</option>
                                            <option value="MALE">Male Core Operations</option>
                                            <option value="FEMALE">Female Core Operations</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Protocols & Stipulations</label>
                                <textarea
                                    {...form.register("policiesText")}
                                    rows={4}
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all text-sm font-bold text-gray-900 placeholder:text-gray-300 resize-none"
                                    placeholder="House rules and contractual security stipulations..."
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Location */}
                {currentStep === 2 && (
                    <div className="bg-white border border-gray-100 p-8 md:p-10 rounded-3xl shadow-2xl shadow-gray-100/50 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex items-center gap-5 pb-6 border-b border-gray-50">
                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100/50">
                                <MapPin size={24} />
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Zone Deployment</h2>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Physical coordinates and accessibility parameters</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Municipal Sector</label>
                                <input
                                    {...form.register("city")}
                                    className="w-full px-6 h-14 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all text-sm font-bold text-gray-900 placeholder:text-gray-300"
                                    placeholder="e.g. ACCRA"
                                />
                                {form.formState.errors.city && (
                                    <p className="text-[10px] text-red-600 font-bold uppercase tracking-widest ml-1">{form.formState.errors.city.message}</p>
                                )}
                            </div>

                            <div className="space-y-3">
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Street Address</label>
                                <input
                                    {...form.register("addressLine")}
                                    className="w-full px-6 h-14 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all text-sm font-bold text-gray-900 placeholder:text-gray-300"
                                    placeholder="PLT 22B, RING ROAD"
                                />
                                {form.formState.errors.addressLine && (
                                    <p className="text-[10px] text-red-600 font-bold uppercase tracking-widest ml-1">{form.formState.errors.addressLine.message}</p>
                                )}
                            </div>

                            <div className="space-y-3">
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                    <MessageSquare size={14} className="text-emerald-500" /> Comm-Link (WhatsApp)
                                </label>
                                <input
                                    {...form.register("whatsappNumber")}
                                    className="w-full px-6 h-14 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all text-sm font-bold text-gray-900 placeholder:text-gray-300"
                                    placeholder="e.g. 0541234567"
                                />
                                {form.formState.errors.whatsappNumber && (
                                    <p className="text-[10px] text-red-600 font-bold uppercase tracking-widest ml-1">{form.formState.errors.whatsappNumber.message}</p>
                                )}
                            </div>

                            <div className="space-y-3">
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                    <Clock size={14} className="text-blue-500" /> Campus Proximity
                                </label>
                                <input
                                    {...form.register("distanceToCampus")}
                                    className="w-full px-6 h-14 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all text-sm font-bold text-gray-900 placeholder:text-gray-300"
                                    placeholder="e.g. 5 MINS TRANSIT"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Features */}
                {currentStep === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* Utilities */}
                        <div className="bg-white border border-gray-100 p-8 md:p-10 rounded-3xl shadow-2xl shadow-gray-100/50 space-y-10">
                            <div className="flex items-center gap-5 pb-6 border-b border-gray-50">
                                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shadow-sm border border-amber-100/50">
                                    <Zap size={24} />
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Core Provisions</h2>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Included baseline utility infrastructure</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {[
                                    { id: "water", label: "Aqua Unit", icon: Droplets, color: 'text-blue-600', activeBg: 'bg-blue-600' },
                                    { id: "light", label: "Energy Pack", icon: Zap, color: 'text-amber-600', activeBg: 'bg-amber-600' },
                                    { id: "gas", label: "Fuel System", icon: Flame, color: 'text-orange-600', activeBg: 'bg-orange-600' }
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
                                                "flex items-center h-14 gap-4 px-6 rounded-2xl border transition-all active:scale-95 group",
                                                isSelected
                                                    ? cn(util.activeBg, "text-white border-transparent shadow-xl")
                                                    : "bg-gray-50 border-gray-100 text-gray-400 hover:border-gray-200"
                                            )}
                                        >
                                            <util.icon size={18} className={cn("transition-transform group-hover:scale-110", isSelected ? "text-white" : util.color)} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">{util.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Amenities */}
                        <div className="bg-white border border-gray-100 p-8 md:p-10 rounded-3xl shadow-2xl shadow-gray-100/50 space-y-10">
                            <div className="flex items-center gap-5 pb-6 border-b border-gray-50">
                                <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-gray-200">
                                    <Check size={24} />
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Asset Modules</h2>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Hardware and infrastructure add-ons</p>
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
                                                "flex flex-col items-center justify-center gap-3 h-32 rounded-2xl border transition-all active:scale-95 cursor-pointer group",
                                                isSelected
                                                    ? "bg-gray-900 text-white border-gray-900 shadow-xl"
                                                    : "bg-gray-50/50 border-gray-100 text-gray-300 hover:border-blue-500/20 hover:text-gray-900"
                                            )}
                                        >
                                            <item.icon size={28} className={cn("transition-all group-hover:scale-110", isSelected ? "text-blue-400" : "text-gray-300")} />
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-center px-2">{item.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Photos */}
                {currentStep === 4 && (
                    <div className="bg-white border border-gray-100 p-8 md:p-10 rounded-3xl shadow-2xl shadow-gray-100/50 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex items-center gap-5 pb-6 border-b border-gray-50">
                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100/50">
                                <ImageIcon size={24} />
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Visual Verification</h2>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Capture operational reality and aesthetic value</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 shadow-inner">
                            <ImageUpload
                                value={form.watch("images")}
                                onChange={(urls) => form.setValue("images", urls)}
                            />
                        </div>
                        {form.formState.errors.images && (
                            <p className="text-[10px] text-red-600 font-bold uppercase tracking-widest ml-1">{form.formState.errors.images.message}</p>
                        )}

                        <div className="flex items-start gap-4 p-5 bg-blue-50 rounded-2xl border border-blue-100">
                            <ShieldAlert size={20} className="text-blue-600 shrink-0 mt-1" />
                            <p className="text-[9px] font-bold text-blue-700 uppercase tracking-widest leading-relaxed">
                                Professional grade imagery increases asset verification speed by approximately 40%. Ensure high luminosity and clear architectural focus.
                            </p>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div className={cn("flex items-center justify-between gap-6 pt-6", isPublishing && "pointer-events-none opacity-30")}>
                    {currentStep > 1 ? (
                        <button
                            type="button"
                            onClick={() => setCurrentStep(s => s - 1)}
                            className="h-14 px-8 bg-white border border-gray-100 text-gray-400 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:text-gray-900 hover:border-gray-200 transition-all active:scale-95 flex items-center gap-3"
                        >
                            <ArrowLeft size={16} /> Reverse Step
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
                                
                                const isValid = await form.trigger(fieldsToValidate);
                                if (isValid) {
                                    setCurrentStep(s => s + 1);
                                } else {
                                    toast.error("PROTOCOL BREACH", { description: "Required sectors require attention." });
                                }
                            }}
                            className="h-14 px-10 bg-gray-900 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-gray-200 hover:bg-black transition-all active:scale-95 flex items-center gap-3"
                        >
                            Advance Phase <ArrowRight size={16} />
                        </button>
                    ) : (
                        <button
                            type="button"
                            disabled={publishStage !== 'idle'}
                            onClick={async () => {
                                const isValid = await form.trigger();
                                if (isValid) {
                                    form.handleSubmit(onSubmit)();
                                } else {
                                    toast.error("VALIDATION ERROR");
                                }
                            }}
                            className="h-14 px-12 bg-blue-600 text-white rounded-2xl font-bold text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Building2 size={18} />
                            Execute Deployment
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
