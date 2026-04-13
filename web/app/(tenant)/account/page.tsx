"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { User, Mail, Phone, Shield, Camera, Loader2 } from "lucide-react";

export default function AccountPage() {
    const { user, isLoading, updateUser } = useAuth();
    const [updating, setUpdating] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        phone: "",
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
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                <p className="text-gray-500 font-medium">Loading your profile...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-20">
                <h1 className="text-2xl font-bold">Please log in to view your account.</h1>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="mb-10">
                <h1 className="text-2xl font-black tracking-tight text-gray-900 mb-2">Personal Info</h1>
                <p className="text-gray-500 font-medium text-base tracking-tight">Manage the information we use to verify your identity.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Profile Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-3xl border p-8 shadow-sm text-center">
                        <div className="relative inline-block mb-6">
                            <div className="w-24 h-24 bg-black text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto">
                                {formData.firstName ? formData.firstName[0] : (user.email ? user.email[0].toUpperCase() : "U")}
                            </div>
                            <button className="absolute bottom-0 right-0 bg-white border shadow-sm rounded-full p-2 hover:bg-gray-50 transition-colors">
                                <Camera size={16} />
                            </button>
                        </div>
                        <h2 className="text-xl font-bold mb-1">
                            {formData.firstName ? `${formData.firstName} ${formData.lastName}` : "Add your name"}
                        </h2>
                        <p className="text-gray-500 text-sm mb-6">{user.email}</p>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">
                            <Shield size={12} />
                            {user.role} Account
                        </div>
                    </div>
                </div>

                {/* Forms Section */}
                <div className="lg:col-span-2 space-y-8">
                    <form onSubmit={handleUpdate} className="bg-white rounded-3xl border p-8 shadow-sm space-y-6">
                        <h3 className="text-xl font-bold mb-4">Profile Info</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 ml-1">First Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        className="w-full pl-12 pr-5 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-black transition-all"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        placeholder="John"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 ml-1">Last Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        className="w-full pl-12 pr-5 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-black transition-all"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 ml-1">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="tel"
                                    className="w-full pl-12 pr-5 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-black transition-all"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+233 24 000 0000"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 ml-1">Email</label>
                            <div className="relative opacity-60">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="email"
                                    disabled
                                    className="w-full pl-12 pr-5 py-4 bg-gray-100 rounded-2xl cursor-not-allowed"
                                    value={user.email}
                                />
                            </div>
                            <p className="text-xs text-gray-400 ml-1">Email cannot be changed.</p>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={updating}
                                className="w-full md:w-auto px-8 py-4 bg-black text-white rounded-2xl font-bold hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                {updating && <Loader2 className="animate-spin" size={18} />}
                                {updating ? "Saving Changes..." : "Save Changes"}
                            </button>
                        </div>
                    </form>

                    <div className="bg-red-50 rounded-3xl p-8 border border-red-100">
                        <h3 className="text-xl font-bold text-red-900 mb-2">Danger Zone</h3>
                        <p className="text-red-800 text-sm mb-6">Once you delete your account, there is no going back. Please be certain.</p>
                        <button
                            onClick={handleDeleteAccount}
                            className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
                        >
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
