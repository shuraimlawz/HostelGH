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
    Image as ImageIcon
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
        <div className="max-w-4xl mx-auto pb-20 relative">

            {/* ─── Publishing Overlay ─── */}
            {(publishStage !== 'idle') && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

                    <div className="relative z-10 bg-card border border-border rounded-sm shadow-2xl p-8 max-w-sm w-full text-center animate-in zoom-in-95 duration-300">

                        {publishStage === 'done' && publishResult ? (
                            <>
                                <div className="w-16 h-16 bg-primary/10 rounded-sm flex items-center justify-center mx-auto mb-6 border border-primary/20">
                                    <Check className="text-primary" size={32} />
                                </div>
                                <h2 className="text-xl font-black text-foreground tracking-tight uppercase italic mb-2">
                                    {publishResult.requiresVerification ? 'Processing' : 'Asset Live'} <span className="text-primary NOT-italic">.</span>
                                </h2>
                                <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest leading-relaxed mb-6">
                                    {publishResult.requiresVerification 
                                        ? "Your asset has been queued for manual verification. Expected turn-around: 24 hours."
                                        : "Your asset is now operational and visible to secondary users."
                                    }
                                </p>
                                <button
                                    onClick={() => router.push('/owner/hostels')}
                                    className="w-full bg-foreground text-background py-3 rounded-sm font-black text-[10px] uppercase tracking-[0.2em] hover:opacity-90 transition-all"
                                >
                                    Return to Hub
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="relative w-16 h-16 mx-auto mb-8">
                                    <div className="absolute inset-0 rounded-sm border-2 border-primary/10" />
                                    <div className="absolute inset-0 rounded-sm border-2 border-primary border-t-transparent animate-spin" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Building2 className="text-primary" size={20} />
                                    </div>
                                </div>

                                <h2 className="text-sm font-black text-foreground tracking-[0.2em] uppercase italic mb-6">Transmitting Session</h2>

                                <div className="space-y-2 text-left">
                                    {stages.map((s, i) => {
                                        const stageOrder = ['uploading', 'verifying', 'done'];
                                        const currentIdx = stageOrder.indexOf(publishStage);
                                        const stageIdx = stageOrder.indexOf(s.key);
                                        const isDone = stageIdx < currentIdx;
                                        const isActive = stageIdx === currentIdx;

                                        return (
                                            <div key={s.key} className={cn(
                                                "flex items-center gap-3 p-2 rounded-sm border transition-all",
                                                isActive ? "bg-primary/5 border-primary/20" : "bg-muted/30 border-transparent"
                                            )}>
                                                <div className={cn(
                                                    "w-5 h-5 rounded-sm flex items-center justify-center shrink-0 text-[8px] font-black",
                                                    isDone ? "bg-primary text-white" : isActive ? "bg-primary/20 text-primary" : "bg-border text-muted-foreground"
                                                )}>
                                                    {isDone ? <Check size={10} /> : i + 1}
                                                </div>
                                                <p className={cn(
                                                    "text-[9px] font-black uppercase tracking-widest",
                                                    isActive ? "text-primary" : isDone ? "text-foreground" : "text-muted-foreground"
                                                )}>{s.label}</p>
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
                className="inline-flex items-center gap-2 text-[10px] font-black text-muted-foreground hover:text-foreground mb-8 transition-colors group uppercase tracking-[0.2em]"
            >
                <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                Hub Overview
            </Link>

            <div className="mb-10">
                <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-foreground text-background rounded-sm text-[8px] font-black uppercase tracking-[0.2em]">
                        Unit Deployment
                    </span>
                </div>
                <h1 className="text-3xl font-black text-foreground tracking-tight uppercase italic mb-2">
                    Deploy Listing <span className="text-primary NOT-italic">.</span>
                </h1>
                <p className="text-muted-foreground font-bold text-[11px] uppercase tracking-widest">Commission a new property asset into the primary fleet.</p>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center gap-2 mb-10 overflow-x-auto no-scrollbar pb-2">
                {STEPS.map((step, i) => (
                    <div key={step.id} className="flex items-center gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={() => setCurrentStep(step.id)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-sm text-[9px] font-black uppercase tracking-[0.2em] transition-all border",
                                currentStep === step.id
                                    ? "bg-foreground text-background border-foreground shadow-lg shadow-foreground/5"
                                    : currentStep > step.id
                                        ? "bg-primary/10 text-primary border-primary/20"
                                        : "bg-background text-muted-foreground border-border hover:border-foreground/20"
                            )}
                        >
                            {currentStep > step.id ? (
                                <Check size={10} />
                            ) : (
                                <step.icon size={10} />
                            )}
                            {step.label}
                        </button>
                        {i < STEPS.length - 1 && (
                            <div className={cn(
                                "w-4 h-[1px] transition-all",
                                currentStep > step.id ? "bg-primary/30" : "bg-border"
                            )} />
                        )}
                    </div>
                ))}
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Step 1: Basic Info */}
                {currentStep === 1 && (
                    <div className="bg-card border border-border p-6 rounded-sm shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center gap-3 pb-4 border-b border-border">
                            <div className="w-10 h-10 bg-muted rounded-sm flex items-center justify-center text-foreground">
                                <Info size={18} />
                            </div>
                            <div>
                                <h2 className="text-sm font-black text-foreground uppercase tracking-widest italic">Asset Identity</h2>
                                <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Base identification and purpose</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-0.5">Commercial Name</label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={14} />
                                    <input
                                        {...form.register("name")}
                                        className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-sm outline-none focus:border-primary transition-all text-xs font-bold uppercase tracking-tight placeholder:text-muted-foreground/30"
                                        placeholder="e.g. SKYLINE RESIDENCES"
                                    />
                                </div>
                                {form.formState.errors.name && (
                                    <p className="text-[9px] text-red-500 font-black uppercase tracking-widest">{form.formState.errors.name.message}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-0.5">Operational Summary</label>
                                <textarea
                                    {...form.register("description")}
                                    rows={4}
                                    className="w-full px-4 py-2.5 bg-background border border-border rounded-sm outline-none focus:border-primary transition-all text-xs font-bold uppercase tracking-tight placeholder:text-muted-foreground/30 resize-none"
                                    placeholder="Brief technical and aesthetic description of the asset..."
                                />
                                {form.formState.errors.description && (
                                    <p className="text-[9px] text-red-500 font-black uppercase tracking-widest">{form.formState.errors.description.message}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-0.5">Gender Vector</label>
                                    <select
                                        {...form.register("genderCategory")}
                                        className="w-full px-4 py-2.5 bg-background border border-border rounded-sm outline-none focus:border-primary transition-all text-xs font-black uppercase tracking-widest appearance-none cursor-pointer"
                                    >
                                        <option value="MIXED">Neutral (Mixed Population)</option>
                                        <option value="MALE">Male Specific</option>
                                        <option value="FEMALE">Female Specific</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-0.5">Protocol & Compliance</label>
                                <textarea
                                    {...form.register("policiesText")}
                                    rows={3}
                                    className="w-full px-4 py-2.5 bg-background border border-border rounded-sm outline-none focus:border-primary transition-all text-xs font-bold uppercase tracking-tight placeholder:text-muted-foreground/30 resize-none"
                                    placeholder="House rules and contractual stipulations..."
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Location */}
                {currentStep === 2 && (
                    <div className="bg-card border border-border p-6 rounded-sm shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center gap-3 pb-4 border-b border-border">
                            <div className="w-10 h-10 bg-muted rounded-sm flex items-center justify-center text-foreground">
                                <MapPin size={18} />
                            </div>
                            <div>
                                <h2 className="text-sm font-black text-foreground uppercase tracking-widest italic">Zone Deployment</h2>
                                <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Physical coordinates and accessibility</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-0.5">Municipal Zone</label>
                                <input
                                    {...form.register("city")}
                                    className="w-full px-4 py-2.5 bg-background border border-border rounded-sm outline-none focus:border-primary transition-all text-xs font-bold uppercase tracking-tight placeholder:text-muted-foreground/30"
                                    placeholder="e.g. ACCRA"
                                />
                                {form.formState.errors.city && (
                                    <p className="text-[9px] text-red-500 font-black uppercase tracking-widest">{form.formState.errors.city.message}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-0.5">Street Identification</label>
                                <input
                                    {...form.register("addressLine")}
                                    className="w-full px-4 py-2.5 bg-background border border-border rounded-sm outline-none focus:border-primary transition-all text-xs font-bold uppercase tracking-tight placeholder:text-muted-foreground/30"
                                    placeholder="PLT 22B, RING ROAD"
                                />
                                {form.formState.errors.addressLine && (
                                    <p className="text-[9px] text-red-500 font-black uppercase tracking-widest">{form.formState.errors.addressLine.message}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-0.5 flex items-center gap-2">
                                    <MessageSquare size={10} /> Comm-Link (WhatsApp)
                                </label>
                                <input
                                    {...form.register("whatsappNumber")}
                                    className="w-full px-4 py-2.5 bg-background border border-border rounded-sm outline-none focus:border-primary transition-all text-xs font-bold uppercase tracking-tight placeholder:text-muted-foreground/30"
                                    placeholder="e.g. 0541234567"
                                />
                                {form.formState.errors.whatsappNumber && (
                                    <p className="text-[9px] text-red-500 font-black uppercase tracking-widest">{form.formState.errors.whatsappNumber.message}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-0.5 flex items-center gap-2">
                                    <Clock size={10} /> Campus Proximity
                                </label>
                                <input
                                    {...form.register("distanceToCampus")}
                                    className="w-full px-4 py-2.5 bg-background border border-border rounded-sm outline-none focus:border-primary transition-all text-xs font-bold uppercase tracking-tight placeholder:text-muted-foreground/30"
                                    placeholder="e.g. 5 MINS TRANSIT"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Features */}
                {currentStep === 3 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {/* Utilities */}
                        <div className="bg-card border border-border p-6 rounded-sm shadow-sm space-y-6">
                            <div className="flex items-center gap-3 pb-4 border-b border-border">
                                <div className="w-10 h-10 bg-muted rounded-sm flex items-center justify-center text-foreground">
                                    <Zap size={18} />
                                </div>
                                <div>
                                    <h2 className="text-sm font-black text-foreground uppercase tracking-widest italic">Core Provisions</h2>
                                    <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Included baseline services</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {[
                                    { id: "water", label: "H2O Unit", icon: Droplets },
                                    { id: "light", label: "Energy Pack", icon: Zap },
                                    { id: "gas", label: "Fuel System", icon: Flame }
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
                                                "flex items-center gap-3 p-3 rounded-sm border transition-all",
                                                isSelected
                                                    ? "bg-foreground text-background border-foreground shadow-lg shadow-foreground/5"
                                                    : "bg-muted/30 border-transparent text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                                            )}
                                        >
                                            <util.icon size={14} className={isSelected ? "text-background" : "text-primary"} />
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em]">{util.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Amenities */}
                        <div className="bg-card border border-border p-6 rounded-sm shadow-sm space-y-6">
                            <div className="flex items-center gap-3 pb-4 border-b border-border">
                                <div className="w-10 h-10 bg-muted rounded-sm flex items-center justify-center text-foreground">
                                    <Check size={18} />
                                </div>
                                <div>
                                    <h2 className="text-sm font-black text-foreground uppercase tracking-widest italic">Asset Modules</h2>
                                    <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Hardware and software add-ons</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {AMENITIES.map((item) => {
                                    const isSelected = selectedAmenities.includes(item.id);
                                    return (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => toggleAmenity(item.id)}
                                            className={cn(
                                                "flex flex-col items-center gap-2 p-4 rounded-sm border transition-all active:scale-95 cursor-pointer",
                                                isSelected
                                                    ? "bg-foreground text-background border-foreground shadow-lg shadow-foreground/5"
                                                    : "bg-muted/30 border-transparent text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                                            )}
                                        >
                                            <item.icon size={16} />
                                            <span className="text-[8px] font-black uppercase tracking-[0.2em]">{item.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Photos */}
                {currentStep === 4 && (
                    <div className="bg-card border border-border p-6 rounded-sm shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center gap-3 pb-4 border-b border-border">
                            <div className="w-10 h-10 bg-muted rounded-sm flex items-center justify-center text-foreground">
                                <ImageIcon size={18} />
                            </div>
                            <div>
                                <h2 className="text-sm font-black text-foreground uppercase tracking-widest italic">Visual Verification</h2>
                                <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Capture operational reality</p>
                            </div>
                        </div>

                        <ImageUpload
                            value={form.watch("images")}
                            onChange={(urls) => form.setValue("images", urls)}
                        />
                        {form.formState.errors.images && (
                            <p className="text-[9px] text-red-500 font-black uppercase tracking-widest italic">{form.formState.errors.images.message}</p>
                        )}
                    </div>
                )}

                {/* Navigation */}
                <div className={cn("flex items-center justify-between gap-4 pt-4", isPublishing && "pointer-events-none opacity-30")}>
                    {currentStep > 1 ? (
                        <button
                            type="button"
                            onClick={() => setCurrentStep(s => s - 1)}
                            className="px-6 py-2.5 bg-background border border-border text-foreground rounded-sm font-black text-[10px] uppercase tracking-widest hover:bg-muted transition-all"
                        >
                            ← Reverse
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
                            className="px-6 py-2.5 bg-foreground text-background rounded-sm font-black text-[10px] uppercase tracking-widest shadow-xl shadow-foreground/5 hover:opacity-90 transition-all active:scale-[0.98]"
                        >
                            Advance →
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
                            className="px-8 py-2.5 bg-primary text-white rounded-sm font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/10 hover:opacity-90 transition-all active:scale-[0.98] flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <Building2 size={14} />
                            Execute Deployment
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
