"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { 
    User, 
    Mail, 
    Shield, 
    Loader2, 
    Bell, 
    Lock, 
    ShieldCheck, 
    ChevronRight,
    Camera,
    Zap,
    CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminSettingsPage() {
    const { user, isLoading, updateUser } = useAuth();
    const [updating, setUpdating] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
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
            toast.success("Settings updated successfully!");
        } catch (error: any) {
            toast.error(error.message || "Failed to update settings");
        } finally {
            setUpdating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-blue-600" size={40} />
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest animate-pulse">Syncing Admin Matrix...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-40">
                <h1 className="text-2xl font-bold uppercase tracking-tight text-gray-900 mb-2">Access Unauthorized <span className="text-blue-600">.</span></h1>
                <p className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">Login required for system terminal.</p>
            </div>
        );
    }

    return (
        <div className="max-w-[1200px] mx-auto px-4 py-12 space-y-16 pb-20 pt-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-gray-900 text-white rounded-full text-[9px] font-bold uppercase tracking-widest border border-white/10 shadow-xl">
                            System Control
                        </span>
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={14} className="text-blue-500" />
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Terminal Access 01</span>
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tighter uppercase leading-tight">
                        Admin Protocol <span className="text-blue-600 opacity-40">/</span> Control
                    </h1>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest max-w-sm">
                        Synchronize administrative profile and system preferences.
                    </p>
                </div>

                <div className="bg-blue-600 text-white p-6 rounded-2xl flex items-center gap-4 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-2xl group-hover:scale-125 transition-transform duration-700" />
                    <div className="relative z-10 w-12 h-12 flex items-center justify-center rounded-xl bg-white/10 border border-white/20">
                        <Lock size={20} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest leading-none mb-1">Authorization</p>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-white">Master Admin</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
                {/* Sidebar: Profile */}
                <div className="xl:col-span-4 space-y-10">
                    <div className="bg-white rounded-3xl border border-gray-100 p-10 shadow-sm text-center relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700 blur-3xl opacity-0 group-hover:opacity-100" />
                        
                        <div className="relative z-10 space-y-8">
                            <div className="relative inline-block">
                                <div className="w-32 h-32 bg-gray-900 text-white rounded-2xl flex items-center justify-center text-4xl font-bold shadow-2xl transition-transform duration-500 overflow-hidden border border-gray-100">
                                    {user.avatarUrl ? (
                                        <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        formData.firstName ? formData.firstName[0] : (user.email ? user.email[0].toUpperCase() : "A")
                                    )}
                                </div>
                                <button 
                                    onClick={() => document.getElementById('avatar-upload')?.click()}
                                    className="absolute -bottom-2 -right-2 bg-white border border-gray-100 shadow-xl rounded-xl p-3 hover:scale-110 transition-all text-blue-600 hover:bg-gray-900 hover:text-white"
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
                                <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-tight leading-none">
                                    {formData.firstName ? `${formData.firstName} ${formData.lastName}` : "Command Leader"}
                                </h2>
                                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">{user.email}</p>
                            </div>

                            <div className="pt-4">
                                <div className="inline-flex items-center gap-3 px-6 py-3 bg-gray-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest border border-white/10 shadow-xl">
                                    {user.role} CHANNEL
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Access Sidebar Card */}
                    <div className="bg-gray-950 text-white rounded-3xl p-10 shadow-2xl relative overflow-hidden group border border-white/5">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/10 rounded-full -mr-20 -mt-20 blur-3xl opacity-50 group-hover:scale-125 transition-transform duration-700" />
                        <div className="relative z-10 space-y-6">
                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 backdrop-blur-md">
                                <Zap size={24} className="text-blue-400" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold uppercase tracking-tight leading-none">System Nexus</h3>
                                <p className="text-[10px] text-gray-400 font-bold leading-relaxed uppercase tracking-widest">
                                    Execute high-level administrative tasks and network audits.
                                </p>
                            </div>
                            <button className="w-full bg-white text-gray-900 py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">
                                VIEW SYSTEM LOGS
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="xl:col-span-8 space-y-10">
                    {/* Identity Form */}
                    <form onSubmit={handleUpdate} className="bg-white rounded-3xl border border-gray-100 p-10 shadow-sm space-y-10 group">
                        <div className="flex items-center justify-between border-b border-gray-50 pb-8">
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Identity Matrix</h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Core administrative baseline</p>
                            </div>
                            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:rotate-12 transition-transform duration-500">
                                <User size={20} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1 leading-none">First Name</label>
                                <input
                                    type="text"
                                    className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-gray-900 text-sm uppercase tracking-tight"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1 leading-none">Last Name</label>
                                <input
                                    type="text"
                                    className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-gray-900 text-sm uppercase tracking-tight"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-3 opacity-60 grayscale cursor-not-allowed">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Email (Locked)</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    disabled
                                    className="w-full pl-6 pr-6 py-5 bg-gray-100 border border-gray-100 rounded-xl font-bold text-gray-500 text-sm uppercase tracking-tight overflow-hidden text-ellipsis"
                                    value={user.email}
                                />
                            </div>
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={updating}
                                className="w-full md:w-auto px-12 py-5 bg-blue-600 text-white rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/10 flex items-center justify-center gap-4 active:scale-[0.98] group/btn"
                            >
                                {updating ? <Loader2 className="animate-spin text-white" size={20} /> : <CheckCircle2 size={20} className="group-hover/btn:scale-110 transition-transform" />}
                                {updating ? "UPDATING MATRIX..." : "AUTHORIZE CHANGES"}
                            </button>
                        </div>
                    </form>

                    {/* Preferences Hub */}
                    <div className="bg-white rounded-3xl border border-gray-100 p-10 shadow-sm space-y-10">
                        <div className="flex items-center justify-between border-b border-gray-50 pb-8">
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Signal Protocol</h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Network signaling configuration</p>
                            </div>
                            <Bell size={20} className="text-blue-500" />
                        </div>

                        <div className="flex items-center justify-between p-8 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-blue-600/20 transition-all">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center border shadow-sm group-hover:scale-110 transition-transform">
                                    <Mail size={24} className="text-blue-600" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-bold text-gray-900 uppercase tracking-widest text-[12px]">Email Signaling</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">System alerts & critical logs.</p>
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
                                    formData.emailNotifications ? "bg-blue-600" : "bg-gray-200"
                                )}
                            >
                                <div className={cn(
                                    "w-5 h-5 bg-white rounded-full shadow-xl transition-transform duration-500",
                                    formData.emailNotifications ? "translate-x-6" : "translate-x-0"
                                )} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
