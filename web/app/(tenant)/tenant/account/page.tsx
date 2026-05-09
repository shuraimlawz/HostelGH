"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
    User, Mail, Phone, ShieldCheck, Camera, Save, Loader2,
    CheckCircle2, AlertCircle, Upload, FileImage, ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { DashCard, SectionHeader, Skeleton } from "@/components/dashboard/DashComponents";
import Link from "next/link";

export default function TenantProfilePage() {
    const { user: authUser } = useAuth();
    const queryClient = useQueryClient();
    const [editing, setEditing] = useState(false);

    const { data: profile, isLoading } = useQuery({
        queryKey: ["tenant-profile"],
        queryFn: async () => (await api.get("/auth/me")).data
    });

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        phone: "",
    });

    const updateMutation = useMutation({
        mutationFn: (data: typeof form) => api.patch("/users/me", data),
        onSuccess: () => {
            toast.success("Profile updated successfully");
            queryClient.invalidateQueries({ queryKey: ["tenant-profile"] });
            setEditing(false);
        },
        onError: (err: any) => toast.error(err?.response?.data?.message ?? "Update failed")
    });

    const handleEdit = () => {
        setForm({
            firstName: profile?.firstName ?? "",
            lastName: profile?.lastName ?? "",
            phone: profile?.phone ?? "",
        });
        setEditing(true);
    };

    const u = profile ?? authUser;
    const fullName = [u?.firstName, u?.lastName].filter(Boolean).join(" ") || "Student";
    const profileFields = [u?.firstName, u?.lastName, u?.phone, u?.emailVerified];
    const pct = Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100);

    return (
        <div className="max-w-4xl mx-auto px-4 pb-20 pt-16 md:pt-6 space-y-6">

            <div>
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Student Portal</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">My Profile</h1>
                <p className="text-muted-foreground text-sm font-medium mt-1">Manage your personal information and account details.</p>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-40" />
                    <Skeleton className="h-64" />
                </div>
            ) : (
                <>
                    {/* Profile Card */}
                    <DashCard className="p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                            {/* Avatar */}
                            <div className="relative shrink-0">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-blue-500/20">
                                    {u?.avatarUrl
                                        ? <img src={u.avatarUrl} alt={fullName} className="w-full h-full object-cover rounded-2xl" />
                                        : fullName[0]?.toUpperCase()
                                    }
                                </div>
                                <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-lg flex items-center justify-center shadow-md hover:opacity-90 transition-opacity">
                                    <Camera size={12} className="text-white" />
                                </button>
                            </div>

                            <div className="flex-1 min-w-0">
                                <h2 className="text-xl font-bold text-foreground">{fullName}</h2>
                                <p className="text-sm text-muted-foreground font-medium">{u?.email}</p>
                                <div className="flex flex-wrap items-center gap-2 mt-3">
                                    <span className="h-6 px-2.5 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider">Student</span>
                                    {u?.isVerified && <span className="h-6 px-2.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><ShieldCheck size={10} /> Verified</span>}
                                    {!u?.emailVerified && <span className="h-6 px-2.5 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><AlertCircle size={10} /> Email Unverified</span>}
                                </div>
                            </div>

                            <button onClick={editing ? () => setEditing(false) : handleEdit}
                                className={cn("h-10 px-5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shrink-0",
                                    editing ? "bg-muted text-muted-foreground border border-border hover:bg-card" : "bg-primary text-primary-foreground hover:opacity-90 shadow-md shadow-primary/20"
                                )}>
                                {editing ? "Cancel" : "Edit Profile"}
                            </button>
                        </div>

                        {/* Profile Completeness */}
                        <div className="mt-6 pt-5 border-t border-border space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-muted-foreground">Profile completion</span>
                                <span className="text-xs font-bold text-primary">{pct}%</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                            </div>
                            {pct < 100 && (
                                <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1.5 font-medium">
                                    <AlertCircle size={11} /> Complete your profile to unlock all features
                                </p>
                            )}
                        </div>
                    </DashCard>

                    {/* Edit Form */}
                    {editing ? (
                        <DashCard className="p-6">
                            <SectionHeader title="Edit Information" sub="Update your personal details" />
                            <form onSubmit={(e) => { e.preventDefault(); updateMutation.mutate(form); }} className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[
                                        { key: "firstName", label: "First Name", placeholder: "Your first name" },
                                        { key: "lastName", label: "Last Name", placeholder: "Your last name" },
                                    ].map(({ key, label, placeholder }) => (
                                        <div key={key} className="space-y-1.5">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{label}</label>
                                            <input
                                                value={(form as any)[key]}
                                                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                                placeholder={placeholder}
                                                className="w-full h-11 px-4 rounded-xl bg-muted border border-border text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Phone Number</label>
                                    <div className="relative">
                                        <Phone size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                        <input
                                            value={form.phone}
                                            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                            placeholder="+233 XX XXX XXXX"
                                            className="w-full h-11 pl-11 pr-4 rounded-xl bg-muted border border-border text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button type="submit" disabled={updateMutation.isPending}
                                        className="h-11 px-6 bg-primary text-primary-foreground rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-opacity shadow-md shadow-primary/20 disabled:opacity-50">
                                        {updateMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                        Save Changes
                                    </button>
                                    <button type="button" onClick={() => setEditing(false)} className="h-11 px-6 bg-muted border border-border text-muted-foreground rounded-xl font-bold text-xs uppercase tracking-widest hover:text-foreground transition-colors">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </DashCard>
                    ) : (
                        /* Info Display */
                        <DashCard className="p-6">
                            <SectionHeader title="Personal Information" sub="Your registered account details" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { icon: User, label: "First Name", val: u?.firstName ?? "Not set" },
                                    { icon: User, label: "Last Name", val: u?.lastName ?? "Not set" },
                                    { icon: Mail, label: "Email Address", val: u?.email },
                                    { icon: Phone, label: "Phone Number", val: u?.phone ?? "Not set" },
                                ].map(({ icon: Icon, label, val }) => (
                                    <div key={label} className="flex items-start gap-4 p-4 bg-muted/50 rounded-xl border border-border">
                                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                            <Icon size={15} className="text-primary" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
                                            <p className="text-sm font-bold text-foreground truncate">{val}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </DashCard>
                    )}

                    {/* Verification Status */}
                    <DashCard className="p-6">
                        <SectionHeader title="Account Verification" sub="Your identity and security status" />
                        <div className="space-y-3">
                            {[
                                { label: "Email Verified", ok: u?.emailVerified, desc: u?.emailVerified ? "Your email address has been confirmed." : "Please verify your email to secure your account." },
                                { label: "Identity Verified", ok: u?.isVerified, desc: u?.isVerified ? "Your identity has been verified by HostelGH." : u?.verificationStatus === "PENDING" ? "Verification is under review." : "Upload your Ghana Card to get verified." },
                            ].map(({ label, ok, desc }) => (
                                <div key={label} className="flex items-start gap-4 p-4 rounded-xl border border-border bg-muted/30">
                                    <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                                        ok ? "bg-emerald-50 dark:bg-emerald-500/10" : "bg-amber-50 dark:bg-amber-500/10"
                                    )}>
                                        {ok ? <CheckCircle2 size={17} className="text-emerald-600 dark:text-emerald-400" /> : <AlertCircle size={17} className="text-amber-600 dark:text-amber-400" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-foreground">{label}</p>
                                        <p className="text-xs text-muted-foreground font-medium mt-0.5">{desc}</p>
                                    </div>
                                    <span className={cn("h-6 px-2.5 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center shrink-0",
                                        ok ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                                           : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                                    )}>
                                        {ok ? "Verified" : "Pending"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </DashCard>
                </>
            )}
        </div>
    );
}
