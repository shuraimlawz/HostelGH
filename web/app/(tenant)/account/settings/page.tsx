"use client";

import { Bell, Shield, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { PasswordField } from "@/components/ui/PasswordField";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function TenantSettingsPage() {
    const { user } = useAuth();
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    // Password Change State
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passwordData, setPasswordData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    useEffect(() => {
        if (user) {
            // In a real app we might fetch this specific setting if it's not on the user object yet,
            // but assuming we added it to the user model, we might need to refresh the user or fetch profile.
            // For now, let's assume it defaults to true or we fetch it. 
            // Since we added it to schema but auth context user might not have it updated yet without refresh.
            // Let's implement a fetchProfile or just assume true for now/fetch strictly.
            // Better: Fetch current settings on mount.
            fetchSettings();
        }
    }, [user]);

    const fetchSettings = async () => {
        try {
            const { data } = await api.get("/users/me");
            setEmailNotifications(data.emailNotifications ?? true);
        } catch (error) {
            console.error("Failed to fetch settings", error);
        }
    };

    const handleNotificationToggle = async () => {
        const newValue = !emailNotifications;
        const previousValue = emailNotifications;

        setEmailNotifications(newValue); // Optimistic update

        try {
            await api.patch("/users/me", { emailNotifications: newValue });
            toast.success("Notification preferences updated");
        } catch (error: any) {
            setEmailNotifications(previousValue); // Revert
            console.error("Failed to update settings", error);
            toast.error(error.response?.data?.message || "Failed to update settings");
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

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="mb-8 font-black">
                <h1 className="text-3xl font-black tracking-tight mb-2 uppercase italic tracking-wider">Account Settings</h1>
                <p className="text-gray-500 font-medium">Manage your preferences and security settings.</p>
            </div>

            <div className="space-y-6">
                {/* Notifications */}
                <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                    <h3 className="flex items-center gap-3 font-black text-gray-900 uppercase tracking-widest text-sm mb-6">
                        <Bell size={20} className="text-blue-600" /> Notifications
                    </h3>
                    <div className="flex items-center justify-between py-2">
                        <div>
                            <p className="font-bold text-gray-900">Email Notifications</p>
                            <p className="text-sm text-gray-400 font-medium">Receive updates about your bookings and payments.</p>
                        </div>
                        <button
                            onClick={handleNotificationToggle}
                            className={`w-12 h-6 rounded-full transition-all duration-300 flex items-center px-1 shadow-inner ${emailNotifications ? 'bg-blue-600' : 'bg-gray-200'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${emailNotifications ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </div>

                {/* Security */}
                <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                    <h3 className="flex items-center gap-3 font-black text-gray-900 uppercase tracking-widest text-sm mb-6">
                        <Shield size={20} className="text-blue-600" /> Security
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-2">
                            <div>
                                <p className="font-bold text-gray-900">Password Control</p>
                                <p className="text-sm text-gray-400 font-medium">Secure your account with a strong, rotated password.</p>
                            </div>

                            <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
                                <DialogTrigger asChild>
                                    <button className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 px-6 py-2.5 rounded-xl border border-blue-100 transition-all">
                                        Update
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md rounded-[2.5rem] border-gray-100 shadow-2xl">
                                    <DialogHeader>
                                        <DialogTitle className="font-black italic uppercase tracking-wider">Change Password</DialogTitle>
                                        <DialogDescription className="text-xs font-medium text-gray-500">
                                            Enter your current password to verify your identity, then create a new one.
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
                                            <Button type="submit" disabled={isChangingPassword} className="rounded-xl font-black uppercase tracking-widest text-[10px] bg-blue-600 hover:bg-blue-700">
                                                {isChangingPassword ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                                                Confirm Change
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
