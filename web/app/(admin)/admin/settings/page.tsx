"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { User, Mail, Shield, Loader2, Bell, Lock } from "lucide-react";

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
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                <p className="text-gray-500 font-medium">Loading settings...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-20">
                <h1 className="text-2xl font-bold">Please log in to view settings.</h1>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Admin Settings</h1>
                <p className="text-gray-500">Manage your admin account and system preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl border p-6 shadow-sm text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                            {formData.firstName ? formData.firstName[0] : (user.email ? user.email[0].toUpperCase() : "A")}
                        </div>
                        <h2 className="text-lg font-bold mb-1">
                            {formData.firstName ? `${formData.firstName} ${formData.lastName}` : "Admin User"}
                        </h2>
                        <p className="text-gray-500 text-sm mb-4">{user.email}</p>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase">
                            <Shield size={12} />
                            {user.role}
                        </div>
                    </div>
                </div>

                {/* Settings Forms */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Profile Settings */}
                    <form onSubmit={handleUpdate} className="bg-white rounded-2xl border p-6 shadow-sm space-y-4">
                        <h3 className="text-lg font-bold mb-4">Profile Information</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">First Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        placeholder="John"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Last Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Email Address</label>
                            <div className="relative opacity-60">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="email"
                                    disabled
                                    className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl cursor-not-allowed"
                                    value={user.email}
                                />
                            </div>
                            <p className="text-xs text-gray-400">Email cannot be changed</p>
                        </div>

                        <button
                            type="submit"
                            disabled={updating}
                            className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            {updating && <Loader2 className="animate-spin" size={18} />}
                            {updating ? "Saving..." : "Save Changes"}
                        </button>
                    </form>

                    {/* System Preferences */}
                    <div className="bg-white rounded-2xl border p-6 shadow-sm">
                        <h3 className="text-lg font-bold mb-4">System Preferences</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <Bell size={20} className="text-gray-600" />
                                    <div>
                                        <p className="font-medium text-sm">Email Notifications</p>
                                        <p className="text-xs text-gray-500">Receive system alerts via email</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={formData.emailNotifications}
                                        onChange={async (e) => {
                                            const newValue = e.target.checked;
                                            setFormData({ ...formData, emailNotifications: newValue });
                                            try {
                                                await api.patch("/users/me", { emailNotifications: newValue });
                                                toast.success("Notification preferences updated");
                                            } catch (error) {
                                                toast.error("Failed to update notification settings");
                                                setFormData({ ...formData, emailNotifications: !newValue });
                                            }
                                        }}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
