"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { 
    User, 
    Mail, 
    Phone, 
    Shield, 
    Camera, 
    Loader2, 
    ArrowRight, 
    ShieldCheck, 
    Bell, 
    Trash2, 
    KeyRound,
    UserCircle,
    CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AccountPage() {
    const { user, isLoading, updateUser } = useAuth();
    const [updating, setUpdating] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        emailNotifications: true,
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get("/users/me");
                const data = res.data;
                setFormData({
                    firstName: data.firstName || "",
                    lastName: data.lastName || "",
                    phone: data.phone || "",
                    emailNotifications: data.emailNotifications ?? true,
                });
            } catch (error) {
                console.error("Failed to fetch profile", error);
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
            toast.success("Identity updated successfully!");
        } catch (error: any) {
            toast.error(error.message || "Failed to update profile");
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!confirm("Are you absolutely sure you want to delete your account? This action is permanent and all your data will be lost.")) return;

        try {
            await api.delete("/users/me");
            toast.success("Account purged successfully.");
            localStorage.clear();
            window.location.href = "/";
        } catch (error: any) {
            toast.error(error.message || "Failed to delete account");
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
                <p className="text-sm font-medium text-gray-400">Syncing identity data...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-40">
                <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
                <p className="text-gray-500 font-medium text-sm mt-2">Authentication required to view this portal.</p>
            </div>
        );
    }

    const profileFields = [formData.firstName, formData.lastName, formData.phone, user.avatarUrl];
    const completedFields = profileFields.filter(Boolean).length;
    const profileCompletion = Math.round((completedFields / profileFields.length) * 100);

    return (
        <div className="max-w-[1200px] mx-auto px-4 py-12 space-y-12 pb-20 pt-4">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Personal Identification</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Profile Settings</h1>
                    <p className="text-gray-500 text-sm max-w-md">Manage your core credentials and network verification status.</p>
                </div>

                {/* Completion Badge */}
                <div className="bg-white border border-gray-100 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-50 relative">
                        <svg className="w-full h-full -rotate-90">
                            <circle
                                cx="24" cy="24" r="20"
                                className="fill-none stroke-blue-100 stroke-2"
                            />
                            <circle
                                cx="24" cy="24" r="20"
                                className="fill-none stroke-blue-600 stroke-2 transition-all duration-1000"
                                strokeDasharray={125.6}
                                strokeDashoffset={125.6 - (125.6 * profileCompletion) / 100}
                                strokeLinecap="round"
                            />
                        </svg>
                        <span className="absolute text-[10px] font-bold text-blue-700">{profileCompletion}%</span>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Identity Strength</p>
                        <p className="text-xs font-bold text-gray-900">
                            {profileCompletion < 100 ? "Optimization Required" : "Fully Optimized"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Sidebar: Avatar & Quick Info */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm text-center space-y-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700 blur-3xl" />
                        
                        <div className="relative z-10 space-y-6">
                            <div className="relative inline-block">
                                <div className="w-32 h-32 bg-gray-50 text-blue-600 rounded-2xl flex items-center justify-center text-4xl font-bold shadow-inner overflow-hidden border border-gray-100">
                                    {user.avatarUrl ? (
                                        <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="uppercase">
                                            {formData.firstName ? formData.firstName[0] : (user.email ? user.email[0] : "S")}
                                        </div>
                                    )}
                                </div>
                                <button 
                                    onClick={() => document.getElementById('avatar-upload')?.click()}
                                    className="absolute -bottom-2 -right-2 bg-white border border-gray-100 shadow-sm rounded-xl p-2.5 hover:bg-gray-50 transition-all text-blue-600"
                                >
                                    <Camera size={18} />
                                </button>
                                <input 
                                    id="avatar-upload" 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
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
                                <h2 className="text-xl font-bold text-gray-900 tracking-tight leading-none">
                                    {formData.firstName ? `${formData.firstName} ${formData.lastName}` : "Auth Resident"}
                                </h2>
                                <p className="text-sm text-gray-500 font-medium">{user.email}</p>
                            </div>

                            <div className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-emerald-100">
                                <ShieldCheck size={14} />
                                {user.role} ID Verified
                            </div>
                        </div>
                    </div>

                    {/* Security Quick Link */}
                    <div className="bg-gray-900 text-white rounded-2xl p-8 relative overflow-hidden group border border-gray-800 shadow-xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-transform duration-700" />
                        <div className="relative z-10 space-y-6">
                            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                                <KeyRound size={24} className="text-blue-400" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold tracking-tight">Security Protocol</h3>
                                <p className="text-xs text-gray-400 font-medium leading-relaxed">
                                    Update your encryption keys and active session protocols.
                                </p>
                            </div>
                            <button className="w-full bg-white text-gray-900 h-11 rounded-xl font-bold text-xs hover:bg-blue-600 hover:text-white transition-all">
                                Update Access Keys
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Content: Forms & Detailed Settings */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Identity Form */}
                    <form onSubmit={handleUpdate} className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-8">
                        <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                            <div className="space-y-0.5">
                                <h3 className="text-lg font-bold text-gray-900 tracking-tight">Identity Matrix</h3>
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Core personal credentials</p>
                            </div>
                            <UserCircle size={20} className="text-blue-600" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 ml-1">First Name</label>
                                <input
                                    type="text"
                                    className="w-full h-12 px-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-sm"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 ml-1">Last Name</label>
                                <input
                                    type="text"
                                    className="w-full h-12 px-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-sm"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 ml-1">Mobile Link</label>
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

                            <div className="space-y-2 opacity-60">
                                <label className="text-xs font-bold text-gray-500 ml-1">Email (Locked)</label>
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
                                {updating ? "Saving Changes..." : "Authorize Identity Update"}
                            </button>
                        </div>
                    </form>

                    {/* Preferences & Notifications */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-6">
                        <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                            <div className="space-y-0.5">
                                <h3 className="text-lg font-bold text-gray-900 tracking-tight">Signal Preferences</h3>
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Network communication protocols</p>
                            </div>
                            <Bell size={20} className="text-blue-600" />
                        </div>

                        <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-blue-100 transition-colors">
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm group-hover:scale-110 transition-transform">
                                    <Mail size={20} className="text-blue-600" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-gray-900">Email Signaling</p>
                                    <p className="text-[11px] text-gray-500 font-medium">Stays, Invoices & Platform updates.</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setFormData(prev => ({ ...prev, emailNotifications: !prev.emailNotifications }))}
                                className={cn(
                                    "w-12 h-7 rounded-full transition-all duration-300 flex items-center px-1",
                                    formData.emailNotifications ? "bg-blue-600" : "bg-gray-200"
                                )}
                            >
                                <div className={cn(
                                    "w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300",
                                    formData.emailNotifications ? "translate-x-5" : "translate-x-0"
                                )} />
                            </button>
                        </div>
                    </div>

                    {/* Danger Protocol */}
                    <div className="bg-rose-50 border border-rose-100 rounded-2xl p-8 relative overflow-hidden group">
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="space-y-2 text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start gap-3">
                                    <Trash2 size={24} className="text-rose-600" />
                                    <h3 className="text-xl font-bold text-rose-900 tracking-tight leading-none uppercase">Termination Protocol</h3>
                                </div>
                                <p className="text-xs font-medium text-rose-700 leading-relaxed max-w-sm">
                                    Deleting your identity will purge all stay history, secured payments, and network credentials. This action is irreversible.
                                </p>
                            </div>
                            <button 
                                onClick={handleDeleteAccount}
                                className="h-12 px-8 bg-rose-600 text-white rounded-xl font-bold text-xs hover:bg-rose-700 transition-all uppercase tracking-widest shadow-lg shadow-rose-900/10"
                            >
                                Purge Identity
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
