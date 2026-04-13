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
    KeyRound 
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
            <div className="flex flex-col items-center justify-center min-h-[80vh] bg-white">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.5em] animate-pulse">Establishing Identity Link...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-40">
                <h1 className="text-2xl font-black uppercase tracking-tighter italic">Access denied <span className="text-blue-600">.</span></h1>
                <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest mt-2">Authentication required.</p>
            </div>
        );
    }

    const profileFields = [formData.firstName, formData.lastName, formData.phone];
    const completedFields = profileFields.filter(Boolean).length;
    const profileCompletion = Math.round((completedFields / profileFields.length) * 100);

    return (
        <div className="max-w-[1200px] mx-auto px-4 py-12 space-y-16">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-blue-600/10 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-[0.3em] border border-blue-600/20">
                            Identity Portal
                        </span>
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={14} className="text-blue-500" />
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest italic">Encrypted Connection</span>
                        </div>
                    </div>
                    <h1 className="text-5xl font-black text-foreground tracking-tighter uppercase italic leading-none">
                        Self Profile <span className="text-blue-600 NOT-italic opacity-40">.</span>
                    </h1>
                    <p className="text-muted-foreground text-[11px] font-bold uppercase tracking-[0.1em] max-w-sm">
                        Manage your core credentials and network verification status.
                    </p>
                </div>

                {/* Completion Badge */}
                <div className="bg-black text-white p-6 rounded-[2.5rem] border border-white/5 flex items-center gap-6 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/20 rounded-full -mr-12 -mt-12 blur-2xl group-hover:scale-125 transition-transform duration-700" />
                    <div className="relative z-10 w-12 h-12 flex items-center justify-center rounded-full border-2 border-white/10 p-1">
                        <svg className="w-full h-full -rotate-90">
                            <circle
                                cx="20" cy="20" r="18"
                                className="fill-none stroke-white/5 stroke-2"
                            />
                            <circle
                                cx="20" cy="20" r="18"
                                className="fill-none stroke-blue-500 stroke-2 transition-all duration-1000"
                                strokeDasharray={113}
                                strokeDashoffset={113 - (113 * profileCompletion) / 100}
                                strokeLinecap="round"
                            />
                        </svg>
                        <span className="absolute text-[10px] font-black">{profileCompletion}%</span>
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">Identity Strength</p>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-blue-400">
                            {profileCompletion < 100 ? "Optimization Required" : "Fully Optimized"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left Sidebar: Avatar & Quick Info */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white rounded-[3rem] border border-muted p-10 shadow-sm text-center relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700 blur-3xl" />
                        
                        <div className="relative z-10 space-y-6">
                            <div className="relative inline-block">
                                <div className="w-32 h-32 bg-black text-white rounded-[2.5rem] flex items-center justify-center text-4xl font-black shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500 overflow-hidden border-4 border-white">
                                    {user.avatarUrl ? (
                                        <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        formData.firstName ? formData.firstName[0] : (user.email ? user.email[0].toUpperCase() : "S")
                                    )}
                                </div>
                                <button className="absolute -bottom-2 -right-2 bg-white border-2 border-muted shadow-xl rounded-2xl p-3 hover:scale-110 transition-all text-blue-600 hover:bg-black hover:text-white">
                                    <Camera size={18} />
                                </button>
                            </div>

                            <div className="space-y-1">
                                <h2 className="text-2xl font-black text-foreground italic uppercase tracking-tighter">
                                    {formData.firstName ? `${formData.firstName} ${formData.lastName}` : "Authenticated Student"}
                                </h2>
                                <p className="text-[11px] text-muted-foreground font-black uppercase tracking-widest">{user.email}</p>
                            </div>

                            <div className="pt-4">
                                <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-blue-600/10 text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-blue-600/10">
                                    <Shield size={14} />
                                    {user.role} Verified
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Security Sidebar Card */}
                    <div className="bg-black text-white rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group border border-white/5">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/20 rounded-full -mr-20 -mt-20 blur-3xl opacity-50 group-hover:scale-125 transition-transform duration-700" />
                        <div className="relative z-10 space-y-6">
                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 backdrop-blur-md">
                                <KeyRound size={24} className="text-blue-400" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black italic uppercase tracking-tight leading-none">Security Drills <span className="text-blue-500 NOT-italic">.</span></h3>
                                <p className="text-[10px] text-white/40 font-bold leading-relaxed uppercase tracking-widest">
                                    Update your encryption keys and active session protocols.
                                </p>
                            </div>
                            <button className="w-full bg-white text-black py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-blue-600 hover:text-white transition-all">
                                UPDATE KEYS
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Content: Forms & Detailed Settings */}
                <div className="lg:col-span-8 space-y-10">
                    {/* Identity Form */}
                    <form onSubmit={handleUpdate} className="bg-white rounded-[3.5rem] border border-muted p-10 shadow-sm space-y-10 group">
                        <div className="flex items-center justify-between border-b border-muted pb-8">
                            <div className="space-y-1">
                                <h3 className="text-lg font-black text-foreground uppercase tracking-tight italic">Identity Matrix</h3>
                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Core personal credentials</p>
                            </div>
                            <div className="w-10 h-10 bg-muted/30 rounded-2xl flex items-center justify-center text-muted-foreground">
                                <User size={20} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1 italic">First Name</label>
                                <input
                                    type="text"
                                    className="w-full px-6 py-5 bg-muted/30 border-2 border-transparent rounded-[1.5rem] outline-none focus:bg-white focus:border-black transition-all font-black text-foreground text-sm uppercase tracking-tight placeholder:text-muted-foreground/30"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    placeholder="ENGAGE FIRST NAME"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1 italic">Last Name</label>
                                <input
                                    type="text"
                                    className="w-full px-6 py-5 bg-muted/30 border-2 border-transparent rounded-[1.5rem] outline-none focus:bg-white focus:border-black transition-all font-black text-foreground text-sm uppercase tracking-tight placeholder:text-muted-foreground/30"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    placeholder="ENGAGE LAST NAME"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1 italic">Mobile Link</label>
                                <div className="relative">
                                    <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={18} />
                                    <input
                                        type="tel"
                                        className="w-full pl-16 pr-6 py-5 bg-muted/30 border-2 border-transparent rounded-[1.5rem] outline-none focus:bg-white focus:border-black transition-all font-black text-foreground text-sm uppercase tracking-tight"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+233 XX XXX XXXX"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 opacity-60 grayscale cursor-not-allowed">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1 italic">Email (Locked)</label>
                                <div className="relative">
                                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={18} />
                                    <input
                                        type="email"
                                        disabled
                                        className="w-full pl-16 pr-6 py-5 bg-muted/10 border-2 border-transparent rounded-[1.5rem] font-black text-foreground text-sm uppercase tracking-tight overflow-hidden text-ellipsis"
                                        value={user.email}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={updating}
                                className="w-full md:w-auto px-12 py-5 bg-black text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] hover:bg-blue-600 transition-all shadow-2xl flex items-center justify-center gap-4 active:scale-[0.98] group/btn"
                            >
                                {updating ? <Loader2 className="animate-spin text-blue-400" size={20} /> : <ShieldCheck size={20} className="group-hover/btn:scale-110 transition-transform" />}
                                {updating ? "UPDATING MATRIX..." : "AUTHORIZE IDENTITY UPDATE"}
                            </button>
                        </div>
                    </form>

                    {/* Drift Preferences */}
                    <div className="bg-white rounded-[3.5rem] border border-muted p-10 shadow-sm space-y-8">
                        <div className="flex items-center justify-between border-b border-muted pb-8">
                            <div className="space-y-1">
                                <h3 className="text-lg font-black text-foreground uppercase tracking-tight italic">Communication Drift</h3>
                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Network signaling protocols</p>
                            </div>
                            <Bell size={20} className="text-blue-500" />
                        </div>

                        <div className="flex items-center justify-between p-8 bg-muted/20 rounded-[2.5rem] border border-muted group hover:border-blue-600/20 transition-colors">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border shadow-sm group-hover:scale-110 transition-transform">
                                    <Mail size={24} className="text-blue-600" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-black text-foreground uppercase tracking-[0.2em] text-[12px] italic">Email Signaling</p>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Invoices, Stays & Nexus alerts.</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setFormData(prev => ({ ...prev, emailNotifications: !prev.emailNotifications }))}
                                className={cn(
                                    "w-14 h-8 rounded-full transition-all duration-500 flex items-center px-1.5 shadow-inner",
                                    formData.emailNotifications ? "bg-blue-600" : "bg-muted-foreground/20"
                                )}
                            >
                                <div className={cn(
                                    "w-5 h-5 bg-white rounded-full shadow-xl transition-transform duration-500",
                                    formData.emailNotifications ? "translate-x-6" : "translate-x-0"
                                )} />
                            </button>
                        </div>
                    </div>

                    {/* Danger Protocol */}
                    <div className="bg-red-500 text-white rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-[80px] group-hover:scale-125 transition-transform duration-1000" />
                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 backdrop-blur-md">
                                    <Trash2 size={24} className="text-white" />
                                </div>
                                <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-none">Termination <br/>Protocol</h3>
                            </div>
                            <p className="text-[11px] text-white/50 font-bold leading-relaxed uppercase tracking-widest max-w-sm">
                                Deleting your identity will purge all stay history, secured payments, and network credentials. This drift is irreversible.
                            </p>
                            <button 
                                onClick={handleDeleteAccount}
                                className="inline-flex items-center gap-4 text-[11px] font-black bg-white text-red-600 px-10 py-5 rounded-2xl hover:bg-red-50 transition-all uppercase tracking-[0.4em] shadow-xl shadow-black/20"
                            >
                                PURGE IDENTITY <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
