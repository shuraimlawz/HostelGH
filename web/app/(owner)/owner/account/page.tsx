"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { User, Mail, Phone, Shield, Camera, Loader2, Bell, XCircle, ArrowRightLeft, TriangleAlert, Landmark, Smartphone, Check } from "lucide-react";
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
            toast.success("Profile updated successfully!");
        } catch (error: any) {
            toast.error(error.message || "Failed to update profile");
        } finally {
            setUpdating(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setIsChangingPassword(true);
        try {
            await api.patch("/auth/password", {
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
            });
            toast.success("Password changed successfully");
            setIsPasswordModalOpen(false);
            setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to change password");
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!confirm("Are you absolutely sure you want to delete your account? This action is permanent and all your data will be lost.")) return;

        try {
            await api.delete("/users/me");
            toast.success("Account deleted successfully.");
            // Log out and redirect
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
            toast.success("Account switched to Student successfully!");
            window.location.href = "/tenant"; // Redirect manually to guarantee fresh context
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to switch account type");
            setIsSwitchingType(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-primary" size={40} />
                    <p className="text-sm font-black text-muted-foreground uppercase tracking-widest animate-pulse">Syncing Owner Data...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-20">
                <h1 className="text-2xl font-black uppercase tracking-tight text-foreground mb-2">Unauthorized Access</h1>
                <p className="text-muted-foreground font-medium">Please log in to manage your account.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                    <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-[9px] font-black uppercase tracking-widest border border-primary/20">
                        Management
                    </span>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                        <Shield size={12} className="text-primary/60" /> Secure Account
                    </div>
                </div>
                <h1 className="text-3xl font-black text-foreground tracking-tight mb-2">
                    Account Settings <span className="text-primary">.</span>
                </h1>
                <p className="text-muted-foreground font-medium text-base">Manage your owner profile and security preferences.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Profile Avatar Card */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-card rounded-[2.5rem] border border-border p-8 shadow-sm text-center relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -mr-8 -mt-8 transition-all opacity-50" />
                        <div className="relative z-10 space-y-4">
                            <div className="relative inline-block">
                                <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary-foreground text-background rounded-[2rem] flex items-center justify-center text-3xl font-black shadow-xl rotate-3 group-hover:rotate-0 transition-transform relative z-0">
                                    {user.avatarUrl ? (
                                        <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-[2rem]" />
                                    ) : (
                                        formData.firstName ? formData.firstName[0] : (user.email ? user.email[0].toUpperCase() : "O")
                                    )}
                                </div>
                                <button
                                    onClick={() => document.getElementById('avatar-upload')?.click()}
                                    className="absolute -bottom-2 -right-2 bg-card border border-border shadow-xl rounded-xl p-2.5 hover:scale-110 transition-all text-muted-foreground hover:text-primary"
                                >
                                    <Camera size={16} />
                                </button>
                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        const loadingToast = toast.loading("Uploading avatar...");
                                        try {
                                            const formData = new FormData();
                                            formData.append('file', file);
                                            // Using the same upload endpoint as hostels 
                                            const res = await api.post("/hostels/upload", formData);
                                            const imageUrl = res.data.url;

                                            await api.patch("/users/me", { avatarUrl: imageUrl });
                                            updateUser({ ...user!, avatarUrl: imageUrl });
                                            toast.success("Avatar updated!", { id: loadingToast });
                                        } catch (error: any) {
                                            toast.error(error.message || "Upload failed", { id: loadingToast });
                                        }
                                    }}
                                />
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-xl font-black text-foreground italic uppercase tracking-tight">
                                    {formData.firstName ? `${formData.firstName} ${formData.lastName}` : "Owner"}
                                </h2>
                                {user.avatarUrl && (
                                    <div className="absolute inset-0 w-24 h-24 rounded-[2rem] overflow-hidden rotate-3 group-hover:rotate-0 transition-transform">
                                        <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>
                            <div className="pt-4">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest border border-primary/20">
                                    {user.role} Account
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Forms Section */}
                <div className="lg:col-span-8 space-y-8">
                    {/* General Settings */}
                    <form onSubmit={handleUpdate} className="bg-card rounded-[2.5rem] border border-border p-8 shadow-sm space-y-8">
                        <div className="flex items-center justify-between border-b border-border pb-6">
                            <h3 className="text-sm font-black text-foreground uppercase tracking-widest italic">General Info</h3>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                <span className="text-[10px] font-bold text-muted-foreground">Active Mode</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">First Name</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        className="w-full pl-5 pr-5 py-4 bg-muted/30 border border-transparent rounded-2xl outline-none focus:bg-background focus:border-primary transition-all font-bold text-foreground text-sm"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        placeholder="Add first name"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Last Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                    <input
                                        type="text"
                                        className="w-full pl-12 pr-5 py-4 bg-muted/30 border border-transparent rounded-2xl outline-none focus:bg-background focus:border-primary transition-all font-bold text-foreground text-sm"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        placeholder="Add last name"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Business Contact</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                <input
                                    type="tel"
                                    className="w-full pl-12 pr-5 py-4 bg-muted/30 border border-transparent rounded-2xl outline-none focus:bg-background focus:border-primary transition-all font-bold text-foreground text-sm"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+233 XXX XXX XXX"
                                />
                            </div>
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={updating}
                                className="w-full md:w-auto px-10 py-4 bg-foreground text-background rounded-2xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-foreground/5 flex items-center justify-center gap-3 active:scale-[0.98]"
                            >
                                {updating ? <Loader2 className="animate-spin text-primary" size={18} /> : null}
                                {updating ? "Securing Changes..." : "Secure Profile"}
                            </button>
                        </div>
                    </form>

                    {/* Security Hub */}
                    <div className="bg-card rounded-[2.5rem] border border-border p-8 shadow-sm space-y-6">
                        <div className="flex items-center justify-between border-b border-border pb-6">
                            <h3 className="text-sm font-black text-foreground uppercase tracking-widest italic">Security Settings</h3>
                            <Shield size={20} className="text-primary" />
                        </div>

                        <div className="flex items-center justify-between p-6 bg-muted/30 rounded-[2rem] border border-border">
                            <div>
                                <p className="font-black text-foreground uppercase tracking-widest text-[11px] mb-1">Password</p>
                                <p className="text-xs text-muted-foreground font-medium">Rotate your password periodically.</p>
                            </div>

                            <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
                                <DialogTrigger asChild>
                                    <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:bg-background px-6 py-3 rounded-xl border border-primary/10 bg-background shadow-sm transition-all hover:shadow-md">
                                        Update
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md rounded-[2.5rem] border-gray-100 shadow-2xl">
                                    <DialogHeader>
                                        <DialogTitle className="font-black italic uppercase tracking-wider">Update Password</DialogTitle>
                                        <DialogDescription className="text-xs font-medium text-gray-500">
                                            Confirm your identity by entering your current password.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleChangePassword} className="space-y-6 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="current" className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Current Password</Label>
                                            <PasswordField
                                                id="current"
                                                value={passwordData.oldPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                                required
                                                className="rounded-2xl border-gray-100"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="new" className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">New Password</Label>
                                            <PasswordField
                                                id="new"
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                required
                                                className="rounded-2xl border-gray-100"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="confirm" className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Confirm New Password</Label>
                                            <PasswordField
                                                id="confirm"
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                required
                                                className="rounded-2xl border-gray-100"
                                            />
                                        </div>
                                        <DialogFooter className="gap-2">
                                            <Button type="button" variant="outline" onClick={() => setIsPasswordModalOpen(false)} className="rounded-xl font-black uppercase tracking-widest text-[10px]">Back</Button>
                                            <Button type="submit" disabled={isChangingPassword} className="rounded-xl font-black uppercase tracking-widest text-[10px] bg-primary text-background hover:bg-primary/90">
                                                {isChangingPassword ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                                                Verify & Change
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    {/* Preferences Hub */}
                    <div className="bg-card rounded-[2.5rem] border border-border p-8 shadow-sm space-y-6">
                        <h3 className="text-sm font-black text-foreground uppercase tracking-widest italic">Preferences</h3>
                        <div className="flex items-center justify-between p-6 bg-muted/30 rounded-[2rem] border border-border">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-background rounded-2xl flex items-center justify-center border shadow-sm text-primary group-hover:scale-110 transition-transform">
                                    <Bell size={24} />
                                </div>
                                <div>
                                    <p className="font-black text-foreground uppercase tracking-widest text-[11px] mb-1">Email Notifications</p>
                                    <p className="text-xs text-muted-foreground font-medium">System alerts & booking notifications.</p>
                                </div>
                            </div>
                            <button
                                onClick={async () => {
                                    const newValue = !formData.emailNotifications;
                                    const previousValue = formData.emailNotifications;
                                    setFormData({ ...formData, emailNotifications: newValue });
                                    try {
                                        await api.patch("/users/me", { emailNotifications: newValue });
                                        toast.success("Preferences updated");
                                    } catch (error: any) {
                                        toast.error(error.message || "Process failed");
                                        setFormData({ ...formData, emailNotifications: previousValue });
                                    }
                                }}
                                className={`w-12 h-6 rounded-full transition-all duration-300 flex items-center px-1 shadow-inner ${formData.emailNotifications ? 'bg-primary' : 'bg-muted'}`}
                            >
                                <div className={`w-4 h-4 bg-background rounded-full shadow-md transition-transform duration-300 ${formData.emailNotifications ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    </div>

                    {/* Settlement Hub (Direct Payouts) */}
                    <SettlementSettings />

                    {/* Account Type / Role Management */}
                    <div className="bg-orange-50/50 rounded-[2.5rem] border border-orange-100 p-8 shadow-sm space-y-6">
                        <div className="flex items-center justify-between border-b border-orange-100 pb-6">
                            <h3 className="text-sm font-black text-orange-950 uppercase tracking-widest italic">Account Type</h3>
                            <ArrowRightLeft size={20} className="text-orange-600" />
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white/60 rounded-[2rem] border border-orange-100">
                            <div>
                                <p className="font-black text-orange-950 uppercase tracking-widest text-[11px] mb-1">Switch to Student / Resident</p>
                                <p className="text-xs text-orange-900/70 font-medium">Change how you use HostelGH.</p>
                            </div>

                            <Dialog open={isAccountTypeModalOpen} onOpenChange={setIsAccountTypeModalOpen}>
                                <DialogTrigger asChild>
                                    <button className="text-[10px] font-black uppercase tracking-widest text-orange-700 bg-orange-100 hover:bg-orange-200 px-6 py-3 rounded-xl transition-all shadow-sm shrink-0 whitespace-nowrap">
                                        Switch Account
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md rounded-[2.5rem] border-orange-100 shadow-2xl">
                                    <DialogHeader>
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                                <TriangleAlert size={20} />
                                            </div>
                                            <DialogTitle className="font-black italic uppercase tracking-wider text-red-600">Critical Action</DialogTitle>
                                        </div>
                                        <DialogDescription className="text-sm font-medium text-gray-600 leading-relaxed pt-2">
                                            Switching to a <span className="font-bold text-gray-900">Student / Resident</span> account will
                                            <span className="font-bold text-red-600"> permanently delete</span> all your listed hostels, rooms, booking history as an owner, and payout records. This action cannot be undone.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter className="gap-3 sm:gap-0 mt-4">
                                        <Button type="button" variant="outline" onClick={() => setIsAccountTypeModalOpen(false)} className="rounded-xl font-black uppercase tracking-widest text-[10px]">Cancel</Button>
                                        <Button
                                            onClick={handleSwitchAccountType}
                                            disabled={isSwitchingType}
                                            variant="destructive"
                                            className="rounded-xl font-black uppercase tracking-widest text-[10px] bg-red-600 hover:bg-red-700"
                                        >
                                            {isSwitchingType ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                                            {isSwitchingType ? "Switching..." : "I Understand, Switch Now"}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-red-50/50 rounded-[2.5rem] p-8 border border-red-100 space-y-6">
                        <div className="flex items-center justify-between border-b border-red-100/50 pb-6">
                            <h3 className="text-sm font-black text-red-900 uppercase tracking-widest italic leading-none">Danger Zone</h3>
                            <XCircle size={20} className="text-red-600" />
                        </div>
                        <p className="text-red-800 text-xs font-medium leading-relaxed">
                            Deleting your account is permanent. All hostel data and financial records will be purged immediately.
                        </p>
                        <button
                            onClick={handleDeleteAccount}
                            className="w-full md:w-auto px-8 py-3 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-100 active:scale-[0.98]"
                        >
                            Terminate Account
                        </button>
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
            toast.success("Payout account linked successfully!");
            refetchSettlement();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to link payout account");
        } finally {
            setIsSaving(false);
        }
    };

    const banks = banksData?.data || [];
    const filteredBanks = banks.filter((b: any) => 
        method === "MOBILE_MONEY" ? b.type === "ghipss" : b.type === "nuban"
    );

    return (
        <div className="bg-card rounded-[2.5rem] border border-border p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-6">
                <div>
                    <h3 className="text-sm font-black text-foreground uppercase tracking-widest italic leading-none mb-1">Direct Payouts</h3>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Auto-Settlement Hub</p>
                </div>
                <div className="bg-primary/10 p-2 rounded-xl text-primary border border-primary/20">
                    <Landmark size={20} />
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Method Toggles */}
                <div className="grid grid-cols-2 gap-4">
                    <button
                        type="button"
                        onClick={() => setMethod("MOBILE_MONEY")}
                        className={cn(
                            "flex items-center justify-center gap-3 p-4 rounded-2xl border transition-all font-black uppercase tracking-widest text-[10px]",
                            method === "MOBILE_MONEY" 
                                ? "bg-foreground text-background border-foreground" 
                                : "bg-muted/30 border-transparent text-muted-foreground hover:bg-muted"
                        )}
                    >
                        <Smartphone size={16} /> Mobile Money
                    </button>
                    <button
                        type="button"
                        onClick={() => setMethod("BANK")}
                        className={cn(
                            "flex items-center justify-center gap-3 p-4 rounded-2xl border transition-all font-black uppercase tracking-widest text-[10px]",
                            method === "BANK" 
                                ? "bg-foreground text-background border-foreground" 
                                : "bg-muted/30 border-transparent text-muted-foreground hover:bg-muted"
                        )}
                    >
                        <Landmark size={16} /> Bank Account
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Select Provider</label>
                        <select
                            disabled={banksLoading}
                            className="w-full px-5 py-4 bg-muted/30 border border-transparent rounded-2xl outline-none focus:bg-background focus:border-primary transition-all font-bold text-foreground text-sm appearance-none cursor-pointer"
                            value={accountDetail.bankCode}
                            onChange={(e) => {
                                const b = banks.find((x: any) => x.code === e.target.value);
                                setAccountDetail({ ...accountDetail, bankCode: e.target.value, bankName: b?.name || "" });
                            }}
                            required
                        >
                            <option value="">{banksLoading ? "Syncing Networks..." : "Choose Provider"}</option>
                            {filteredBanks.map((b: any) => (
                                <option key={b.code} value={b.code}>{b.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                            {method === "MOBILE_MONEY" ? "Phone Number" : "Account Number"}
                        </label>
                        <input
                            type="text"
                            className="w-full px-5 py-4 bg-muted/30 border border-transparent rounded-2xl outline-none focus:bg-background focus:border-primary transition-all font-bold text-foreground text-sm"
                            value={accountDetail.accountNumber}
                            onChange={(e) => setAccountDetail({ ...accountDetail, accountNumber: e.target.value })}
                            placeholder={method === "MOBILE_MONEY" ? "055XXXXXXX" : "XXXXXXXXXX"}
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Account Holder Name</label>
                    <input
                        type="text"
                        className="w-full px-5 py-4 bg-muted/30 border border-transparent rounded-2xl outline-none focus:bg-background focus:border-primary transition-all font-bold text-foreground text-sm"
                        value={accountDetail.accountName}
                        onChange={(e) => setAccountDetail({ ...accountDetail, accountName: e.target.value })}
                        placeholder="John Doe"
                        required
                    />
                    <p className="text-[9px] text-muted-foreground font-black uppercase tracking-wider ml-1 mt-1 opacity-60">
                        Must match the name on your {method === "MOBILE_MONEY" ? "Momo" : "Bank"} account.
                    </p>
                </div>

                <div className="pt-4 flex flex-col md:flex-row gap-4">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="px-10 py-4 bg-foreground text-background rounded-2xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-foreground/5 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="animate-spin text-primary" size={18} /> : <Check size={18} />}
                        {isSaving ? "Authorizing with Paystack..." : currentSettlement ? "Update Account" : "Link Account"}
                    </button>
                    {currentSettlement && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 text-[9px] font-black uppercase tracking-widest">
                            <Check size={14} /> Active for Direct Payouts
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
}
