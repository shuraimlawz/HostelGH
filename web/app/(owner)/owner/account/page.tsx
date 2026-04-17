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
    UserCircle,
    CheckCircle2,
    ShieldAlert,
    CreditCard,
    KeyRound
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
        if (!confirm("Are you absolutely sure? This will purge all associated hostels, bookings, and financial history permanently.")) return;

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
            <div className="flex h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                    <p className="text-sm font-medium text-gray-400">Syncing owner matrix...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-40">
                <h1 className="text-2xl font-bold text-gray-900">Access Unauthorized</h1>
                <p className="text-gray-500 font-medium text-sm mt-2">Login required for management access.</p>
            </div>
        );
    }

    return (
        <div className="max-w-[1200px] mx-auto px-4 py-12 space-y-12 pb-20 pt-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Management Portal</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Owner Identity</h1>
                    <p className="text-gray-500 text-sm max-w-md">Synchronize your management profile and payout protocols.</p>
                </div>

                <div className="bg-white border border-gray-100 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
                    <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Account Status</p>
                        <p className="text-xs font-bold text-gray-900 uppercase">Active Operator</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* Sidebar: Profile Info */}
                <div className="xl:col-span-4 space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm text-center space-y-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700 blur-3xl opacity-0 group-hover:opacity-100" />
                        
                        <div className="relative z-10 space-y-6">
                            <div className="relative inline-block">
                                <div className="w-32 h-32 bg-gray-900 text-white rounded-2xl flex items-center justify-center text-4xl font-bold shadow-xl overflow-hidden border border-gray-800">
                                    {user.avatarUrl ? (
                                        <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="uppercase">
                                            {formData.firstName ? formData.firstName[0] : (user.email ? user.email[0] : "O")}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => document.getElementById('avatar-upload')?.click()}
                                    className="absolute -bottom-2 -right-2 bg-white border border-gray-100 shadow-sm rounded-xl p-2.5 hover:bg-gray-50 transition-all text-blue-600"
                                    title="Change avatar"
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
                                            toast.success("Identity visual updated!", { id: loadingToast });
                                        } catch (error: any) {
                                            toast.error(error.message || "Upload failure", { id: loadingToast });
                                        }
                                    }}
                                />
                            </div>
                            
                            <div className="space-y-1">
                                <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                                    {formData.firstName ? `${formData.firstName} ${formData.lastName}` : "Operations Leader"}
                                </h2>
                                <p className="text-sm text-gray-500 font-medium">{user.email}</p>
                            </div>

                            <div className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-blue-100">
                                {user.role} Hub Verified
                            </div>
                        </div>
                    </div>

                    {/* Security Hub Card */}
                    <div className="bg-gray-900 text-white rounded-2xl p-8 relative overflow-hidden group border border-gray-800 shadow-xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-2xl opacity-60 group-hover:scale-110 transition-transform" />
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                                    <KeyRound size={24} className="text-blue-400" />
                                </div>
                                <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Protocol V1</span>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold tracking-tight">Vault Protocol</h3>
                                <p className="text-xs text-gray-400 font-medium leading-relaxed">
                                    Your property data and revenue streams are encrypted via enterprise-grade protocols.
                                </p>
                            </div>
                            <div className="pt-4 border-t border-white/5 space-y-3">
                                <button className="w-full text-left text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-white flex items-center justify-between transition-colors group/item">
                                    Audit Access Log <ChevronRight size={14} className="group-hover/item:translate-x-1 transition-transform" />
                                </button>
                                <button className="w-full text-left text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-white flex items-center justify-between transition-colors group/item">
                                    Session Control <ChevronRight size={14} className="group-hover/item:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="xl:col-span-8 space-y-8">
                    {/* General Settings */}
                    <form onSubmit={handleUpdate} className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-8">
                        <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                            <div className="space-y-0.5">
                                <h3 className="text-lg font-bold text-gray-900 tracking-tight">Profile Identity</h3>
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Operational baseline data</p>
                            </div>
                            <UserCircle size={20} className="text-blue-600" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-500 ml-1">First Name</Label>
                                <input
                                    type="text"
                                    className="w-full h-12 px-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-sm"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-500 ml-1">Last Name</Label>
                                <input
                                    type="text"
                                    className="w-full h-12 px-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-sm"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-500 ml-1">Mobile Matrix Contact</Label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="tel"
                                        className="w-full h-12 pl-12 pr-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-sm"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+233 XX XXX XXXX"
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-2 opacity-60 cursor-not-allowed">
                                <Label className="text-xs font-bold text-gray-500 ml-1">Email (Locked)</Label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="email"
                                        disabled
                                        className="w-full h-12 pl-12 pr-4 bg-gray-100 border border-gray-100 rounded-xl font-bold text-sm text-gray-500"
                                        value={user.email}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={updating}
                                className="w-full md:w-auto px-10 h-12 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/10 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                {updating ? <Loader2 className="animate-spin text-white" size={18} /> : <CheckCircle2 size={18} />}
                                {updating ? "Saving Update..." : "Authorize Identity Change"}
                            </button>
                        </div>
                    </form>

                    {/* Settlement Hub (Direct Payouts) */}
                    <div className="animate-in fade-in duration-700 delay-150">
                        <SettlementSettings />
                    </div>

                    {/* Security Hub */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-8">
                        <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                            <div className="space-y-0.5">
                                <h3 className="text-lg font-bold text-gray-900 tracking-tight">Security Nexus</h3>
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Access control & key rotation</p>
                            </div>
                            <Lock size={20} className="text-blue-600" />
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-100 transition-all gap-4">
                            <div className="space-y-1 text-center md:text-left">
                                <p className="text-sm font-bold text-gray-900">Access Key Rotation</p>
                                <p className="text-[11px] text-gray-500 font-medium">Update password to maintain channel integrity.</p>
                            </div>

                            <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
                                <DialogTrigger asChild>
                                    <button className="h-10 px-6 bg-white text-gray-900 rounded-lg text-xs font-bold border border-gray-200 hover:border-gray-900 transition-all">
                                        Rotate Keys
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md rounded-2xl p-8 border-gray-100">
                                    <DialogHeader>
                                        <DialogTitle className="text-xl font-bold tracking-tight">Rotate Access Keys</DialogTitle>
                                        <DialogDescription className="text-xs text-gray-400 font-medium">
                                            Confirm authorization by providing current keys.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleChangePassword} className="space-y-6 py-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-gray-500 ml-1">Current Key</Label>
                                            <PasswordField
                                                value={passwordData.oldPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                                className="h-12 rounded-xl bg-gray-50 border-gray-100 px-4"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-gray-500 ml-1">New Access Key</Label>
                                            <PasswordField
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                className="h-12 rounded-xl bg-gray-50 border-gray-100 px-4"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-gray-500 ml-1">Confirm New Key</Label>
                                            <PasswordField
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                className="h-12 rounded-xl bg-gray-50 border-gray-100 px-4"
                                            />
                                        </div>
                                        <DialogFooter className="gap-2 pt-2">
                                            <Button type="button" variant="outline" onClick={() => setIsPasswordModalOpen(false)} className="rounded-xl h-11 text-xs font-bold border-gray-200">ABORT</Button>
                                            <Button type="submit" disabled={isChangingPassword} className="rounded-xl h-11 text-xs font-bold bg-gray-900 text-white hover:bg-black grow">
                                                {isChangingPassword ? <Loader2 className="animate-spin mr-2" size={14} /> : <CheckCircle2 className="mr-2" size={14} />}
                                                Authorize Rotation
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    {/* Signaling Settings */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-6">
                        <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                            <div className="space-y-0.5">
                                <h3 className="text-lg font-bold text-gray-900 tracking-tight">Signal Matrix</h3>
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Network communication protocols</p>
                            </div>
                            <Bell size={20} className="text-blue-600" />
                        </div>
                        <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-blue-100 transition-colors">
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm group-hover:scale-110 transition-transform">
                                    <Mail size={20} className="text-blue-600" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-sm font-bold text-gray-900">Email Signaling</p>
                                    <p className="text-[11px] text-gray-500 font-medium">Management alerts & Payout logs.</p>
                                </div>
                            </div>
                            <button
                                onClick={async () => {
                                    const newValue = !formData.emailNotifications;
                                    setFormData({ ...formData, emailNotifications: newValue });
                                    try {
                                        await api.patch("/users/me", { emailNotifications: newValue });
                                        toast.success("Signal protocol updated");
                                    } catch (error: any) {
                                        toast.error("Signal failure");
                                        setFormData({ ...formData, emailNotifications: !newValue });
                                    }
                                }}
                                className={cn(
                                    "w-12 h-7 rounded-full transition-all duration-300 flex items-center px-1",
                                    formData.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
                                )}
                            >
                                <div className={cn(
                                    "w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300",
                                    formData.emailNotifications ? 'translate-x-5' : 'translate-x-0'
                                )} />
                            </button>
                        </div>
                    </div>

                    {/* Role Management */}
                    <div className="bg-amber-50 rounded-2xl border border-amber-100 p-8 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full -mr-16 -mt-16 blur-2xl" />
                        <div className="relative z-10 space-y-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="space-y-2 text-center md:text-left">
                                    <div className="flex items-center justify-center md:justify-start gap-3">
                                        <ArrowRightLeft size={24} className="text-amber-600" />
                                        <h3 className="text-xl font-bold text-amber-900 tracking-tight leading-none uppercase">Role Migration</h3>
                                    </div>
                                    <p className="text-xs font-medium text-amber-700 leading-relaxed max-w-sm">
                                        Permanently switch to a Resident (Tenant) account. This will purge all business history.
                                    </p>
                                </div>

                                <Dialog open={isAccountTypeModalOpen} onOpenChange={setIsAccountTypeModalOpen}>
                                    <DialogTrigger asChild>
                                        <button className="h-12 px-8 bg-amber-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-amber-700 transition-all shadow-lg shadow-amber-900/10">
                                            Migrate to Student
                                        </button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md rounded-2xl p-8 border-amber-100 shadow-2xl">
                                        <DialogHeader>
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center shadow-inner">
                                                    <TriangleAlert size={28} className="text-rose-600" />
                                                </div>
                                                <DialogTitle className="text-xl font-bold tracking-tight text-rose-600 uppercase">Irreversible De-registration</DialogTitle>
                                            </div>
                                            <DialogDescription className="text-sm text-gray-500 font-medium leading-relaxed pt-2">
                                                Switching to <span className="text-gray-900 font-bold">RESIDENT</span> status will <span className="text-rose-600 font-bold underline">delete all properties and bookings permanently</span>. This action is terminal.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter className="gap-2 pt-6">
                                            <Button type="button" variant="outline" onClick={() => setIsAccountTypeModalOpen(false)} className="rounded-xl h-11 text-xs font-bold border-gray-200">CANCEL</Button>
                                            <Button
                                                onClick={handleSwitchAccountType}
                                                disabled={isSwitchingType}
                                                className="rounded-xl h-11 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white grow"
                                            >
                                                {isSwitchingType ? <Loader2 className="animate-spin mr-2" size={14} /> : null}
                                                {isSwitchingType ? "PURGING..." : "I CONFIRM, MIGRATE ACCOUNT"}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    </div>

                    {/* Danger Protocol */}
                    <div className="bg-rose-50 border border-rose-100 rounded-2xl p-8 relative overflow-hidden group">
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="space-y-2 text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start gap-3">
                                    <XCircle size={24} className="text-rose-600" />
                                    <h3 className="text-xl font-bold text-rose-900 tracking-tight leading-none uppercase">Termination Drill</h3>
                                </div>
                                <p className="text-xs font-medium text-rose-700 leading-relaxed max-w-sm">
                                    Full system de-registration. This purge wipes all records from the HostelGH core matrix.
                                </p>
                            </div>
                            <button 
                                onClick={handleDeleteAccount}
                                className="h-12 px-8 bg-rose-600 text-white rounded-xl font-bold text-xs hover:bg-rose-700 transition-all uppercase tracking-widest shadow-lg shadow-rose-900/10"
                            >
                                Purge Account
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
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-8 group/settle">
            <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                <div className="space-y-0.5">
                    <h3 className="text-lg font-bold text-gray-900 tracking-tight">Direct Settlement</h3>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-widest leading-none">Paystack Payout Nexus</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm">
                    <Landmark size={20} />
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-2 gap-4">
                    <button
                        type="button"
                        onClick={() => setMethod("MOBILE_MONEY")}
                        className={cn(
                            "flex items-center justify-center gap-3 h-12 rounded-xl border transition-all font-bold text-xs uppercase tracking-widest",
                            method === "MOBILE_MONEY" 
                                ? "bg-gray-900 text-white border-gray-900 shadow-lg" 
                                : "bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100"
                        )}
                    >
                        <Smartphone size={16} /> MoMo
                    </button>
                    <button
                        type="button"
                        onClick={() => setMethod("BANK")}
                        className={cn(
                            "flex items-center justify-center gap-3 h-12 rounded-xl border transition-all font-bold text-xs uppercase tracking-widest",
                            method === "BANK" 
                                ? "bg-gray-900 text-white border-gray-900 shadow-lg" 
                                : "bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100"
                        )}
                    >
                        <Landmark size={16} /> Bank
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-500 ml-1">Network Provider</Label>
                        <div className="relative">
                            <select
                                disabled={banksLoading}
                                className="w-full h-12 px-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-sm appearance-none cursor-pointer"
                                value={accountDetail.bankCode}
                                onChange={(e) => {
                                    const b = banks.find((x: any) => x.code === e.target.value);
                                    setAccountDetail({ ...accountDetail, bankCode: e.target.value, bankName: b?.name || "" });
                                }}
                                required
                            >
                                <option value="">{banksLoading ? "Syncing..." : "Select Gateway"}</option>
                                {filteredBanks.map((b: any) => (
                                    <option key={b.code} value={b.code}>{b.name.toUpperCase()}</option>
                                ))}
                            </select>
                            <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-gray-300 pointer-events-none" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-500 ml-1">
                            {method === "MOBILE_MONEY" ? "MoMo Number" : "Account Number"}
                        </Label>
                        <input
                            type="text"
                            className="w-full h-12 px-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-sm"
                            value={accountDetail.accountNumber}
                            onChange={(e) => setAccountDetail({ ...accountDetail, accountNumber: e.target.value })}
                            placeholder={method === "MOBILE_MONEY" ? "055XXXXXXX" : "XXXXXXXXXX"}
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-500 ml-1">Verified Holder Name</Label>
                    <input
                        type="text"
                        className="w-full h-12 px-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-sm"
                        value={accountDetail.accountName}
                        onChange={(e) => setAccountDetail({ ...accountDetail, accountName: e.target.value })}
                        placeholder="Legal name on account"
                        required
                    />
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest ml-1 mt-2">
                        <ShieldAlert size={12} />
                        Must exactly match financial records
                    </div>
                </div>

                <div className="pt-2 flex flex-col md:flex-row items-center gap-6">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="h-12 px-10 bg-gray-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-black/5 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="animate-spin text-white" size={16} /> : <CheckCircle2 size={16} />}
                        {isSaving ? "Authorizing..." : currentSettlement ? "Sync Settlement Link" : "Engage Payout Nexus"}
                    </button>
                    {currentSettlement && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 text-[10px] font-bold uppercase tracking-widest">
                            <ShieldCheck size={14} /> Active Nexus Link
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
}
