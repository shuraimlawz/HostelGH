"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
    Bell, Lock, Shield, LogOut, Loader2, Save,
    ChevronRight, Eye, EyeOff, AlertTriangle, CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { DashCard, SectionHeader } from "@/components/dashboard/DashComponents";

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
    return (
        <button
            type="button"
            onClick={onChange}
            className={cn(
                "relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0",
                checked ? "bg-primary" : "bg-muted border border-border"
            )}
        >
            <span className={cn("absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200", checked ? "translate-x-5" : "translate-x-0")} />
        </button>
    );
}

export default function TenantSettingsPage() {
    const { user, logout } = useAuth();
    const [showCurrentPw, setShowCurrentPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);
    const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [notifs, setNotifs] = useState({ email: true, sms: false, bookingUpdates: true, promotions: false });

    const changePwMutation = useMutation({
        mutationFn: (data: typeof pwForm) => api.post("/auth/change-password", data),
        onSuccess: () => {
            toast.success("Password changed successfully");
            setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        },
        onError: (err: any) => toast.error(err?.response?.data?.message ?? "Failed to change password")
    });

    const handlePwSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (pwForm.newPassword !== pwForm.confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }
        if (pwForm.newPassword.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }
        changePwMutation.mutate(pwForm);
    };

    return (
        <div className="max-w-3xl mx-auto px-4 pb-20 pt-16 md:pt-6 space-y-6">

            <div>
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Tenant Account</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Settings</h1>
                <p className="text-muted-foreground text-sm font-medium mt-1">Manage your account security and notification preferences.</p>
            </div>

            {/* Notifications */}
            <DashCard className="p-6">
                <SectionHeader title="Notification Preferences" sub="Choose how you receive updates" />
                <div className="space-y-1">
                    {[
                        { key: "email", label: "Email Notifications", desc: "Receive updates via email" },
                        { key: "sms", label: "SMS Notifications", desc: "Receive text message alerts" },
                        { key: "bookingUpdates", label: "Booking Updates", desc: "Get notified about booking status changes" },
                        { key: "promotions", label: "Promotions & Offers", desc: "Receive deals and platform news" },
                    ].map(({ key, label, desc }) => (
                        <div key={key} className="flex items-center justify-between py-4 border-b border-border last:border-0">
                            <div className="flex items-start gap-4">
                                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                    <Bell size={15} className="text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-foreground">{label}</p>
                                    <p className="text-xs text-muted-foreground font-medium">{desc}</p>
                                </div>
                            </div>
                            <Toggle checked={(notifs as any)[key]} onChange={() => setNotifs(n => ({ ...n, [key]: !(n as any)[key] }))} />
                        </div>
                    ))}
                </div>
            </DashCard>

            {/* Change Password */}
            <DashCard className="p-6">
                <SectionHeader title="Change Password" sub="Update your account password" />
                <form onSubmit={handlePwSubmit} className="space-y-4">
                    {[
                        { key: "currentPassword", label: "Current Password", show: showCurrentPw, toggle: () => setShowCurrentPw(s => !s) },
                        { key: "newPassword", label: "New Password", show: showNewPw, toggle: () => setShowNewPw(s => !s) },
                        { key: "confirmPassword", label: "Confirm New Password", show: showNewPw, toggle: () => setShowNewPw(s => !s) },
                    ].map(({ key, label, show, toggle }) => (
                        <div key={key} className="space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{label}</label>
                            <div className="relative">
                                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type={show ? "text" : "password"}
                                    value={(pwForm as any)[key]}
                                    onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                                    placeholder="••••••••"
                                    required
                                    minLength={key !== "currentPassword" ? 8 : 1}
                                    className="w-full h-11 pl-11 pr-12 rounded-xl bg-muted border border-border text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                                />
                                <button type="button" onClick={toggle} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                    {show ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>
                    ))}

                    {pwForm.newPassword && pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword && (
                        <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5 font-medium">
                            <AlertTriangle size={12} /> Passwords do not match
                        </p>
                    )}
                    {pwForm.newPassword.length > 0 && pwForm.newPassword.length < 8 && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5 font-medium">
                            <AlertTriangle size={12} /> Password must be at least 8 characters
                        </p>
                    )}

                    <div className="pt-2">
                        <button type="submit" disabled={changePwMutation.isPending}
                            className="h-11 px-6 bg-primary text-primary-foreground rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-opacity shadow-md shadow-primary/20 disabled:opacity-50">
                            {changePwMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            Update Password
                        </button>
                    </div>
                </form>
            </DashCard>

            {/* Security */}
            <DashCard className="p-6">
                <SectionHeader title="Security" sub="Account security overview" />
                <div className="space-y-3">
                    {[
                        { icon: CheckCircle2, label: "Password Set", desc: "Your account has a password.", ok: true },
                        { icon: Shield, label: "Account Verified", desc: user?.isVerified ? "Your identity has been confirmed." : "Get verified to access all features.", ok: user?.isVerified },
                        { icon: Shield, label: "Identity Check", desc: user?.isVerified ? "Ghana Card confirmed." : "Upload your Ghana Card to get fully verified.", ok: user?.isVerified },
                    ].map(({ icon: Icon, label, desc, ok }) => (
                        <div key={label} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-muted/30">
                            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                                ok ? "bg-emerald-50 dark:bg-emerald-500/10" : "bg-amber-50 dark:bg-amber-500/10"
                            )}>
                                <Icon size={16} className={ok ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-foreground">{label}</p>
                                <p className="text-xs text-muted-foreground font-medium">{desc}</p>
                            </div>
                            <span className={cn("text-[10px] font-bold uppercase tracking-wider shrink-0",
                                ok ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                            )}>{ok ? "✓" : "!"}</span>
                        </div>
                    ))}
                </div>
            </DashCard>

            {/* Danger Zone */}
            <DashCard className="p-6 border-red-200 dark:border-red-500/20">
                <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle size={16} className="text-red-500" />
                    <h3 className="text-sm font-bold text-red-600 dark:text-red-400">Danger Zone</h3>
                </div>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-200 dark:border-red-500/20">
                        <div>
                            <p className="text-sm font-bold text-foreground">Sign Out</p>
                            <p className="text-xs text-muted-foreground font-medium">Sign out of your account on this device</p>
                        </div>
                        <button onClick={() => logout()} className="h-9 px-4 bg-card border border-border text-foreground rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:border-red-500/20 dark:hover:text-red-400 transition-all">
                            <LogOut size={13} /> Sign Out
                        </button>
                    </div>
                </div>
            </DashCard>
        </div>
    );
}
