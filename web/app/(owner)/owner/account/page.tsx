"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { User, Mail, Phone, Shield, Camera, Loader2, Bell, XCircle } from "lucide-react";
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

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-purple-600" size={40} />
                    <p className="text-sm font-black text-gray-400 uppercase tracking-widest animate-pulse">Syncing Proprietor Data...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-20">
                <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900 mb-2">Unauthorized Access</h1>
                <p className="text-gray-500 font-medium">Please log in to manage your hub.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                    <span className="px-2.5 py-1 bg-purple-50 text-purple-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-purple-100">
                        Management
                    </span>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                        <Shield size={12} className="text-purple-400" /> Secure Hub
                    </div>
                </div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
                    Account Settings <span className="text-purple-600">.</span>
                </h1>
                <p className="text-gray-500 font-medium text-base">Manage your proprietor profile and security preferences.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Profile Avatar Card */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm text-center relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-full -mr-8 -mt-8 grayscale group-hover:grayscale-0 transition-all opacity-50" />
                        <div className="relative z-10 space-y-4">
                            <div className="relative inline-block">
                                <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-purple-800 text-white rounded-[2rem] flex items-center justify-center text-3xl font-black shadow-xl rotate-3 group-hover:rotate-0 transition-transform">
                                    {formData.firstName ? formData.firstName[0] : (user.email ? user.email[0].toUpperCase() : "O")}
                                </div>
                                <button className="absolute -bottom-2 -right-2 bg-white border border-gray-100 shadow-xl rounded-xl p-2.5 hover:scale-110 transition-all text-gray-400 hover:text-purple-600">
                                    <Camera size={16} />
                                </button>
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-gray-900 italic uppercase tracking-tight">
                                    {formData.firstName ? `${formData.firstName} ${formData.lastName}` : "Proprietor"}
                                </h2>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">{user.email}</p>
                            </div>
                            <div className="pt-4">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-purple-100/50">
                                    {user.role} Partner
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Forms Section */}
                <div className="lg:col-span-8 space-y-8">
                    {/* General Settings */}
                    <form onSubmit={handleUpdate} className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm space-y-8">
                        <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest italic">General Identity</h3>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                <span className="text-[10px] font-bold text-gray-400">Identity Mode</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">First Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-purple-600 transition-all font-bold text-gray-900 text-sm"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        placeholder="Add first name"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Last Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-purple-600 transition-all font-bold text-gray-900 text-sm"
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
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="tel"
                                    className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-purple-600 transition-all font-bold text-gray-900 text-sm"
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
                                className="w-full md:w-auto px-10 py-4 bg-gray-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3 active:scale-[0.98]"
                            >
                                {updating ? <Loader2 className="animate-spin text-purple-400" size={18} /> : null}
                                {updating ? "Securing Changes..." : "Secure Profile"}
                            </button>
                        </div>
                    </form>

                    {/* Security Hub */}
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm space-y-6">
                        <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest italic">Security Hub</h3>
                            <Shield size={20} className="text-blue-600" />
                        </div>

                        <div className="flex items-center justify-between p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                            <div>
                                <p className="font-black text-gray-900 uppercase tracking-widest text-[11px] mb-1">System Password</p>
                                <p className="text-xs text-gray-400 font-medium">Rotate your password periodically.</p>
                            </div>

                            <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
                                <DialogTrigger asChild>
                                    <button className="text-[10px] font-black uppercase tracking-widest text-purple-600 hover:bg-white px-6 py-3 rounded-xl border border-purple-100 bg-white shadow-sm transition-all hover:shadow-md">
                                        Update
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md rounded-[2.5rem] border-gray-100 shadow-2xl">
                                    <DialogHeader>
                                        <DialogTitle className="font-black italic uppercase tracking-wider">Secure Rotation</DialogTitle>
                                        <DialogDescription className="text-xs font-medium text-gray-500">
                                            Confirm your identity by entering your previous password.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleChangePassword} className="space-y-6 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="current" className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Current Credential</Label>
                                            <PasswordField
                                                id="current"
                                                value={passwordData.oldPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                                required
                                                className="rounded-2xl border-gray-100"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="new" className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">New Credential</Label>
                                            <PasswordField
                                                id="new"
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                required
                                                className="rounded-2xl border-gray-100"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="confirm" className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Confirm New Credential</Label>
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
                                            <Button type="submit" disabled={isChangingPassword} className="rounded-xl font-black uppercase tracking-widest text-[10px] bg-purple-600 hover:bg-purple-700">
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
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm space-y-6">
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest italic">Preference Hub</h3>
                        <div className="flex items-center justify-between p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border shadow-sm text-purple-600 group-hover:scale-110 transition-transform">
                                    <Bell size={24} />
                                </div>
                                <div>
                                    <p className="font-black text-gray-900 uppercase tracking-widest text-[11px] mb-1">Email Drifts</p>
                                    <p className="text-xs text-gray-400 font-medium">System alerts & booking notifications.</p>
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
                                    } catch (error) {
                                        toast.error("Process failed");
                                        setFormData({ ...formData, emailNotifications: previousValue });
                                    }
                                }}
                                className={`w-12 h-6 rounded-full transition-all duration-300 flex items-center px-1 shadow-inner ${formData.emailNotifications ? 'bg-purple-600' : 'bg-gray-200'}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${formData.emailNotifications ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-red-50/50 rounded-[2.5rem] p-8 border border-red-100 space-y-6">
                        <div className="flex items-center justify-between border-b border-red-100/50 pb-6">
                            <h3 className="text-sm font-black text-red-900 uppercase tracking-widest italic leading-none">Termination Zone</h3>
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
