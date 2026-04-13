"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { 
    User, 
    Mail, 
    Phone, 
    Shield, 
    Camera, 
    Loader2, 
    Bell, 
    XCircle, 
    ArrowRightLeft, 
    TriangleAlert, 
    Landmark, 
    Smartphone, 
    Check,
    Lock,
    ShieldCheck,
    ChevronRight,
    ArrowUpRight
} from "lucide-react";
import { PasswordField } from "@/components/ui/PasswordField";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";

export default function OwnerAccountPage() {
    const { user, isLoading, updateUser } = useAuth();
    const [updating, setUpdating] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        emailNotifications: true,
    });

    // Password Change State
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passwordData, setPasswordData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Account Type Change State
    const [isAccountTypeModalOpen, setIsAccountTypeModalOpen] = useState(false);
    const [isSwitchingType, setIsSwitchingType] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await api.get("/users/me");
                setFormData({
                    firstName: data.firstName || "",
                    lastName: data.lastName || "",
                    phone: data.phone || "",
                    emailNotifications: data.emailNotifications ?? true,
                });
            } catch (error) {
                console.error("Failed to fetch data", error);
            }
        };

        if (user && !isLoading) fetchProfile();
    }, [user, isLoading]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating(true);
        try {
            const { data } = await api.patch("/users/me", formData);
            updateUser(data);
            toast.success("Operational identity secured!");
        } catch (error: any) {
            toast.error(error.message || "Failed to update profile");
        } finally {
            setUpdating(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("Security mismatch: Passwords do not align");
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error("Entropy error: Password too short");
            return;
        }

        setIsChangingPassword(true);
        try {
            await api.patch("/auth/password", {
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
            });
            toast.success("Security keys rotated successfully");
            setIsPasswordModalOpen(false);
            setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to change password");
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!confirm("CRITICAL: Are you absolutely sure? This will purge all associated hostels, bookings, and financial history permanently.")) return;

        try {
            await api.delete("/users/me");
            toast.success("Account purged from network.");
            localStorage.clear();
            window.location.href = "/";
        } catch (error: any) {
            toast.error(error.message || "Failed to delete account");
        }
    };

    const handleSwitchAccountType = async () => {
        setIsSwitchingType(true);
        try {
            const { data } = await api.patch("/auth/role", { role: "TENANT" });
            updateUser(data.user);
            localStorage.setItem("accessToken", data.accessToken);
            toast.success("Protocol switched to Resident.");
            window.location.href = "/tenant";
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to switch account type");
            setIsSwitchingType(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center bg-white transition-colors duration-300">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-blue-600" size={40} />
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.5em] animate-pulse">Syncing Owner Matrix...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-40">
                <h1 className="text-2xl font-black uppercase tracking-tighter italic text-foreground mb-2">Access Unauthorized <span className="text-blue-600">.</span></h1>
                <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest">Login required for management access.</p>
            </div>
        );
    }

    return (
        <div className="max-w-[1200px] mx-auto px-4 py-12 space-y-16">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-black text-white rounded-full text-[9px] font-black uppercase tracking-[0.3em] border border-white/10 shadow-xl">
                            Management Portal
                        </span>
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={14} className="text-blue-500" />
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest italic">Core Vault Access</span>
                        </div>
                    </div>
                    <h1 className="text-5xl font-black text-foreground tracking-tighter uppercase italic leading-none">
                        Owner Identity <span className="text-blue-600 NOT-italic opacity-40">.</span>
                    </h1>
                    <p className="text-muted-foreground text-[11px] font-bold uppercase tracking-[0.1em] max-w-sm">
                        Synchronize your management profile and payout protocols.
                    </p>
                </div>

                <div className="bg-blue-600 text-white p-6 rounded-[2.5rem] flex items-center gap-4 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full -mr-12 -mt-12 blur-2xl group-hover:scale-125 transition-transform duration-700" />
                    <div className="relative z-10 w-12 h-12 flex items-center justify-center rounded-2xl bg-white/10 border border-white/20">
                        <Lock size={20} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-white/50 uppercase tracking-widest leading-none mb-1">Account Status</p>
                        <p className="text-[11px] font-bold uppercase tracking-widest">Active Operator</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
                {/* Sidebar: Profile & Payout Status */}
                <div className="xl:col-span-4 space-y-10">
                    <div className="bg-white rounded-[3.5rem] border border-muted p-10 shadow-sm text-center relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700 blur-3xl opacity-0 group-hover:opacity-100" />
                        
                        <div className="relative z-10 space-y-8">
                            <div className="relative inline-block">
                                <div className="w-32 h-32 bg-black text-white rounded-[2.5rem] flex items-center justify-center text-4xl font-black shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500 overflow-hidden border-4 border-white">
                                    {user.avatarUrl ? (
                                        <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        formData.firstName ? formData.firstName[0] : (user.email ? user.email[0].toUpperCase() : "O")
                                    )}
                                </div>
                                <button
                                    onClick={() => document.getElementById('avatar-upload')?.click()}
                                    className="absolute -bottom-2 -right-2 bg-white border-2 border-muted shadow-xl rounded-2xl p-3 hover:scale-110 transition-all text-blue-600 hover:bg-black hover:text-white"
                                >
                                    <Camera size={18} />
                                </button>
                                <input id="avatar-upload" type="file" accept="image/*" className="hidden" 
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        const loadingToast = toast.loading("Syndicating image data...");
                                        try {
                                            const fd = new FormData();
                                            fd.append('file', file);
                                            const res = await api.post("/hostels/upload", fd);
                                            const imageUrl = res.data.url;
                                            await api.patch("/users/me", { avatarUrl: imageUrl });
                                            updateUser({ ...user!, avatarUrl: imageUrl });
                                            toast.success("Visual identity updated!", { id: loadingToast });
                                        } catch (error: any) {
                                            toast.error(error.message || "Upload failure", { id: loadingToast });
                                        }
                                    }}
                                />
                            </div>
                            
                            <div className="space-y-1">
                                <h2 className="text-2xl font-black text-foreground italic uppercase tracking-tighter leading-none">
                                    {formData.firstName ? `${formData.firstName} ${formData.lastName}` : "Operations Leader"}
                                </h2>
                                <p className="text-[11px] text-muted-foreground font-black uppercase tracking-widest">{user.email}</p>
                            </div>

                            <div className="pt-4">
                                <div className="inline-flex items-center gap-3 px-6 py-3 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] border border-white/10 shadow-xl">
                                    {user.role} CHANNEL
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Hub - Modernized */}
                    <div className="bg-black text-white rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden group border border-white/5">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full -mr-32 -mt-32 blur-[100px] opacity-40 group-hover:scale-125 transition-transform duration-1000" />
                        <div className="relative z-10 space-y-10">
                            <div className="flex items-center justify-between">
                                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 backdrop-blur-md">
                                    <Shield size={28} className="text-blue-400" />
                                </div>
                                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">Vault 01</span>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black italic uppercase tracking-tight leading-none">Protection Hub <span className="text-blue-500 NOT-italic">.</span></h3>
                                <p className="text-[11px] text-white/40 font-bold leading-relaxed uppercase tracking-widest">
                                    Your data is encrypted with enterprise-grade protocols.
                                </p>
                            </div>
                            <div className="pt-4 border-t border-white/10 space-y-4">
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white cursor-pointer transition-colors group/item">
                                    SECURITY LOG <ChevronRight size={14} className="group-hover/item:translate-x-1 transition-transform" />
                                </div>
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white cursor-pointer transition-colors group/item">
                                    ACTIVE SESSIONS <ChevronRight size={14} className="group-hover/item:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="xl:col-span-8 space-y-10">
                    {/* General Settings */}
                    <form onSubmit={handleUpdate} className="bg-white rounded-[3.5rem] border border-muted p-10 shadow-sm space-y-10 group">
                        <div className="flex items-center justify-between border-b border-muted pb-8">
                            <div className="space-y-1">
                                <h3 className="text-xl font-black text-foreground uppercase tracking-tight italic">Profile Identity</h3>
                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em]">Operational baseline data</p>
                            </div>
                            <div className="w-10 h-10 bg-muted/30 rounded-2xl flex items-center justify-center text-muted-foreground group-hover:rotate-12 transition-transform duration-500">
                                <User size={20} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground ml-1 italic leading-none">First Name</label>
                                <input
                                    type="text"
                                    className="w-full px-6 py-5 bg-muted/20 border-2 border-transparent rounded-[1.5rem] outline-none focus:bg-white focus:border-black transition-all font-black text-foreground text-sm uppercase tracking-tight"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground ml-1 italic leading-none">Last Name</label>
                                <input
                                    type="text"
                                    className="w-full px-6 py-5 bg-muted/20 border-2 border-transparent rounded-[1.5rem] outline-none focus:bg-white focus:border-black transition-all font-black text-foreground text-sm uppercase tracking-tight"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground ml-1 italic leading-none">Mobile Matrix Contact</label>
                            <div className="relative">
                                <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={18} />
                                <input
                                    type="tel"
                                    className="w-full pl-16 pr-6 py-5 bg-muted/20 border-2 border-transparent rounded-[1.5rem] outline-none focus:bg-white focus:border-black transition-all font-black text-foreground text-sm uppercase tracking-tight"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+233 XX XXX XXXX"
                                />
                            </div>
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={updating}
                                className="w-full md:w-auto px-12 py-5 bg-black text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] hover:bg-blue-600 transition-all shadow-2xl flex items-center justify-center gap-4 active:scale-[0.98] group/btn shadow-[0_20px_40px_rgba(0,0,0,0.1)]"
                            >
                                {updating ? <Loader2 className="animate-spin text-blue-400" size={20} /> : <ShieldCheck size={20} className="group-hover/btn:scale-110 transition-transform" />}
                                {updating ? "SECURING UPDATES..." : "AUTHORIZE IDENTITY CHANGE"}
                            </button>
                        </div>
                    </form>

                    {/* Settlement Hub (Direct Payouts) */}
                    <SettlementSettings />

                    {/* Security Hub */}
                    <div className="bg-white rounded-[3.5rem] border border-muted p-10 shadow-sm space-y-10 group">
                        <div className="flex items-center justify-between border-b border-muted pb-8">
                            <div className="space-y-1">
                                <h3 className="text-xl font-black text-foreground uppercase tracking-tight italic">Security Nexus</h3>
                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em]">Access control & key rotation</p>
                            </div>
                            <Lock size={20} className="text-blue-500 group-hover:scale-110 transition-transform" />
                        </div>

                        <div className="flex items-center justify-between p-8 bg-muted/20 rounded-[2.5rem] border border-muted group/item hover:border-blue-600 transition-all">
                            <div className="space-y-1">
                                <p className="font-black text-foreground uppercase tracking-[0.2em] text-[12px] italic">Access Keys</p>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Rotate password for channel security.</p>
                            </div>

                            <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
                                <DialogTrigger asChild>
                                    <button className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 bg-white hover:bg-black hover:text-white px-8 py-4 rounded-xl border border-blue-600/10 shadow-xl transition-all active:scale-95">
                                        ROTATE KEYS
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md rounded-[3rem] border-muted shadow-2xl p-10">
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl font-black italic uppercase tracking-wider mb-2">Rotate Access Keys</DialogTitle>
                                        <DialogDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                            Confirm authorization by providing current keys.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleChangePassword} className="space-y-8 py-6">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground ml-1 italic">Current Key</Label>
                                            <PasswordField
                                                value={passwordData.oldPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                                className="rounded-2xl bg-muted/30 border-none px-6 py-6"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground ml-1 italic">New Access Key</Label>
                                            <PasswordField
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                className="rounded-2xl bg-muted/30 border-none px-6 py-6"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground ml-1 italic">Confirm New Key</Label>
                                            <PasswordField
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                className="rounded-2xl bg-muted/30 border-none px-6 py-6"
                                            />
                                        </div>
                                        <DialogFooter className="gap-4 pt-4">
                                            <Button type="button" variant="outline" onClick={() => setIsPasswordModalOpen(false)} className="rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] py-6">ABORT</Button>
                                            <Button type="submit" disabled={isChangingPassword} className="rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] bg-black text-white hover:bg-blue-600 py-6 grow">
                                                {isChangingPassword ? <Loader2 className="animate-spin mr-3" size={20} /> : <Check className="mr-3" size={20} />}
                                                AUTHORIZE ROTATION
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    {/* Signaling Hub */}
                    <div className="bg-white rounded-[3.5rem] border border-muted p-10 shadow-sm space-y-10">
                        <div className="flex items-center justify-between border-b border-muted pb-8">
                            <div className="space-y-1">
                                <h3 className="text-xl font-black text-foreground uppercase tracking-tight italic">Signaling Hub</h3>
                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em]">Network notification protocols</p>
                            </div>
                            <Bell size={20} className="text-blue-500" />
                        </div>
                        <div className="flex items-center justify-between p-8 bg-muted/20 rounded-[2.5rem] border border-muted group hover:border-blue-600/20 transition-all">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border shadow-sm group-hover:scale-110 transition-transform">
                                    <Mail size={24} className="text-blue-600" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-black text-foreground uppercase tracking-[0.2em] text-[12px] italic">Email Signaling</p>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Management alerts & Payout logs.</p>
                                </div>
                            </div>
                            <button
                                onClick={async () => {
                                    const newValue = !formData.emailNotifications;
                                    setFormData({ ...formData, emailNotifications: newValue });
                                    try {
                                        await api.patch("/users/me", { emailNotifications: newValue });
                                        toast.success("Protocol updated");
                                    } catch (error: any) {
                                        toast.error("Signal failure");
                                        setFormData({ ...formData, emailNotifications: !newValue });
                                    }
                                }}
                                className={cn(
                                    "w-14 h-8 rounded-full transition-all duration-500 flex items-center px-1.5 shadow-inner",
                                    formData.emailNotifications ? 'bg-blue-600' : 'bg-muted-foreground/20'
                                )}
                            >
                                <div className={cn(
                                    "w-5 h-5 bg-white rounded-full shadow-xl transition-transform duration-500",
                                    formData.emailNotifications ? 'translate-x-6' : 'translate-x-0'
                                )} />
                            </button>
                        </div>
                    </div>

                    {/* Account Type / Role Management */}
                    <div className="bg-orange-50 text-orange-950 rounded-[3.5rem] border-2 border-orange-200 p-10 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full -mr-32 -mt-32 blur-[80px] group-hover:scale-125 transition-transform duration-1000" />
                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="w-14 h-14 bg-white/50 rounded-2xl flex items-center justify-center border border-orange-200 backdrop-blur-md">
                                    <ArrowRightLeft size={28} className="text-orange-600" />
                                </div>
                                <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-none">Role Migration</h3>
                            </div>
                            
                            <div className="p-8 bg-white/40 rounded-[2.5rem] border border-orange-200 space-y-6">
                                <div className="space-y-2">
                                    <p className="font-black uppercase tracking-[0.2em] text-[12px] italic">Switch to Resident Account</p>
                                    <p className="text-[10px] text-orange-900/60 font-bold leading-relaxed uppercase tracking-widest">
                                        CRITICAL: This will purge all your business listings and history.
                                    </p>
                                </div>

                                <Dialog open={isAccountTypeModalOpen} onOpenChange={setIsAccountTypeModalOpen}>
                                    <DialogTrigger asChild>
                                        <button className="w-full bg-orange-600 text-white hover:bg-orange-700 py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] transition-all shadow-xl shadow-orange-200">
                                            MIGRATE TO STUDENT
                                        </button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md rounded-[3rem] border-orange-200 shadow-2xl p-10">
                                        <DialogHeader>
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 border border-red-200">
                                                    <TriangleAlert size={32} />
                                                </div>
                                                <DialogTitle className="text-2xl font-black italic uppercase tracking-wider text-red-600 leading-none">IRREVERSIBLE <br/>PROTOCOL</DialogTitle>
                                            </div>
                                            <DialogDescription className="text-[11px] font-bold text-gray-600 leading-loose uppercase tracking-[0.05em] pt-4 border-t border-muted">
                                                Switching to a <span className="text-black font-black">RESIDENT</span> account will 
                                                <span className="text-red-600 font-black"> permanently purge</span> all your listings, rooms, and history. De-registration is final.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter className="gap-4 pt-10">
                                            <Button type="button" variant="outline" onClick={() => setIsAccountTypeModalOpen(false)} className="rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] py-7 grow border-gray-200 opacity-50 hover:opacity-100">ABORT</Button>
                                            <Button
                                                onClick={handleSwitchAccountType}
                                                disabled={isSwitchingType}
                                                className="rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] bg-red-600 hover:bg-red-700 text-white py-7 grow-[2]"
                                            >
                                                {isSwitchingType ? <Loader2 className="animate-spin mr-3" size={20} /> : null}
                                                {isSwitchingType ? "PURGING DATA..." : "I UNDERSTAND, MIGRATE"}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-red-600 text-white rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-[100px] group-hover:scale-125 transition-transform duration-1000" />
                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 backdrop-blur-md">
                                    <XCircle size={24} className="text-white" />
                                </div>
                                <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-none">Termination <br/>Drill</h3>
                            </div>
                            <p className="text-[11px] text-white/50 font-bold leading-relaxed uppercase tracking-widest max-w-sm">
                                Full system de-registration. This purge wipes all records from the HostelGH core matrix.
                            </p>
                            <button
                                onClick={handleDeleteAccount}
                                className="inline-flex items-center gap-4 text-[11px] font-black bg-white text-red-600 px-10 py-5 rounded-2xl hover:bg-black hover:text-white transition-all uppercase tracking-[0.4em] shadow-xl shadow-black/20"
                            >
                                PURGE ACCOUNT <ArrowUpRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SettlementSettings() {
    const [isSaving, setIsSaving] = useState(false);
    const [method, setMethod] = useState<"MOBILE_MONEY" | "BANK">("MOBILE_MONEY");
    const [accountDetail, setAccountDetail] = useState({
        accountNumber: "",
        bankCode: "",
        bankName: "",
        accountName: "",
    });

    const { data: currentSettlement, isLoading: settlementLoading, refetch: refetchSettlement } = useQuery({
        queryKey: ["settlement-me"],
        queryFn: async () => {
            const res = await api.get("/wallets/settlement/me");
            return res.data;
        }
    });

    const { data: banksData, isLoading: banksLoading } = useQuery({
        queryKey: ["paystack-banks"],
        queryFn: async () => {
            const res = await api.get("/wallets/banks");
            return res.data;
        }
    });

    useEffect(() => {
        if (currentSettlement) {
            setMethod(currentSettlement.method);
            setAccountDetail({
                accountNumber: currentSettlement.accountNumber,
                bankCode: currentSettlement.bankCode,
                bankName: currentSettlement.bankName,
                accountName: currentSettlement.accountName,
            });
        }
    }, [currentSettlement]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await api.post("/wallets/settlement", {
                ...accountDetail,
                method
            });
            toast.success("Payout protocol synchronized!");
            refetchSettlement();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Protocol link failure");
        } finally {
            setIsSaving(false);
        }
    };

    const banks = banksData?.data || [];
    const filteredBanks = banks.filter((b: any) => 
        method === "MOBILE_MONEY" ? b.type === "ghipss" : b.type === "nuban"
    );

    return (
        <div className="bg-white rounded-[3.5rem] border border-muted p-10 shadow-sm space-y-10 group/settle">
            <div className="flex items-center justify-between border-b border-muted pb-8">
                <div>
                    <h3 className="text-xl font-black text-foreground uppercase tracking-tight italic leading-none mb-1">Direct Settlement</h3>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em]">Paystack Payout Nexus</p>
                </div>
                <div className="bg-blue-600 text-white p-3 rounded-2xl group-hover/settle:rotate-12 transition-transform duration-500 shadow-xl">
                    <Landmark size={24} />
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
                <div className="grid grid-cols-2 gap-6">
                    <button
                        type="button"
                        onClick={() => setMethod("MOBILE_MONEY")}
                        className={cn(
                            "flex items-center justify-center gap-4 p-5 rounded-[1.5rem] border-2 transition-all font-black uppercase tracking-[0.3em] text-[10px]",
                            method === "MOBILE_MONEY" 
                                ? "bg-black text-white border-black shadow-xl" 
                                : "bg-muted/20 border-transparent text-muted-foreground hover:bg-muted/40"
                        )}
                    >
                        <Smartphone size={18} /> MOBILE MONEY
                    </button>
                    <button
                        type="button"
                        onClick={() => setMethod("BANK")}
                        className={cn(
                            "flex items-center justify-center gap-4 p-5 rounded-[1.5rem] border-2 transition-all font-black uppercase tracking-[0.3em] text-[10px]",
                            method === "BANK" 
                                ? "bg-black text-white border-black shadow-xl" 
                                : "bg-muted/20 border-transparent text-muted-foreground hover:bg-muted/40"
                        )}
                    >
                        <Landmark size={18} /> BANK CHANNEL
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground ml-1 italic leading-none">Network Provider</label>
                        <div className="relative">
                            <select
                                disabled={banksLoading}
                                className="w-full px-6 py-5 bg-muted/20 border-2 border-transparent rounded-[1.5rem] outline-none focus:bg-white focus:border-black transition-all font-black text-foreground text-sm appearance-none cursor-pointer uppercase tracking-tight"
                                value={accountDetail.bankCode}
                                onChange={(e) => {
                                    const b = banks.find((x: any) => x.code === e.target.value);
                                    setAccountDetail({ ...accountDetail, bankCode: e.target.value, bankName: b?.name || "" });
                                }}
                                required
                            >
                                <option value="">{banksLoading ? "SYNCING..." : "SELECT GATEWAY"}</option>
                                {filteredBanks.map((b: any) => (
                                    <option key={b.code} value={b.code}>{b.name.toUpperCase()}</option>
                                ))}
                            </select>
                            <ChevronRight size={18} className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-muted-foreground/30 pointer-events-none" />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground ml-1 italic leading-none">
                            {method === "MOBILE_MONEY" ? "MoMo Number" : "Account Number"}
                        </label>
                        <input
                            type="text"
                            className="w-full px-6 py-5 bg-muted/20 border-2 border-transparent rounded-[1.5rem] outline-none focus:bg-white focus:border-black transition-all font-black text-foreground text-sm uppercase tracking-tight"
                            value={accountDetail.accountNumber}
                            onChange={(e) => setAccountDetail({ ...accountDetail, accountNumber: e.target.value })}
                            placeholder={method === "MOBILE_MONEY" ? "055XXXXXXX" : "XXXXXXXXXX"}
                            required
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground ml-1 italic leading-none">Verified Holder Name</label>
                    <input
                        type="text"
                        className="w-full px-6 py-5 bg-muted/20 border-2 border-transparent rounded-[1.5rem] outline-none focus:bg-white focus:border-black transition-all font-black text-foreground text-sm uppercase tracking-tight placeholder:opacity-20"
                        value={accountDetail.accountName}
                        onChange={(e) => setAccountDetail({ ...accountDetail, accountName: e.target.value })}
                        placeholder="ENTER LEGAL NAME"
                        required
                    />
                    <div className="flex items-center gap-2 text-[9px] text-muted-foreground font-black uppercase tracking-widest ml-1 mt-2 opacity-50">
                        <ShieldAlert size={12} />
                        MUST ALIGN WITH {method === "MOBILE_MONEY" ? "WALLET" : "BANK"} RECORDS
                    </div>
                </div>

                <div className="pt-6 flex flex-col md:flex-row items-center gap-6">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full md:w-auto px-12 py-5 bg-black text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] hover:bg-blue-600 transition-all shadow-2xl flex items-center justify-center gap-4 active:scale-[0.98] disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="animate-spin text-blue-400" size={20} /> : <Check size={20} />}
                        {isSaving ? "AUTHORIZING NEXUS..." : currentSettlement ? "SYNC UPDATED ACCOUNT" : "LINK PAYOUT PROTOCOL"}
                    </button>
                    {currentSettlement && (
                        <div className="flex items-center gap-3 px-6 py-3 bg-emerald-500/10 text-emerald-600 rounded-2xl border border-emerald-500/10 text-[9px] font-black uppercase tracking-[0.3em] shadow-sm">
                            <ShieldCheck size={16} /> ACTIVE NEXUS LINK
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
}

function ShieldAlert({ size }: { size: number }) {
    return (
        <svg 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
        >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
        </svg>
    )
}
