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
import { Input } from "@/components/ui/input";
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
        setEmailNotifications(newValue); // Optimistic update
        try {
            await api.patch("/users/me", { emailNotifications: newValue });
            toast.success("Notification preferences updated");
        } catch (error) {
            setEmailNotifications(!newValue); // Revert
            toast.error("Failed to update settings");
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
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Account Settings</h1>
                <p className="text-gray-500">Manage your preferences and security settings.</p>
            </div>

            <div className="space-y-6">
                {/* Notifications */}
                <div className="bg-white rounded-3xl border p-6 shadow-sm">
                    <h3 className="flex items-center gap-2 font-bold text-lg mb-4">
                        <Bell size={20} className="text-gray-400" /> Notifications
                    </h3>
                    <div className="flex items-center justify-between py-2">
                        <div>
                            <p className="font-medium text-gray-900">Email Notifications</p>
                            <p className="text-sm text-gray-500">Receive updates about your bookings and payments.</p>
                        </div>
                        <button
                            onClick={handleNotificationToggle}
                            className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 ${emailNotifications ? 'bg-blue-600' : 'bg-gray-200'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${emailNotifications ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </div>

                {/* Security */}
                <div className="bg-white rounded-3xl border p-6 shadow-sm">
                    <h3 className="flex items-center gap-2 font-bold text-lg mb-4">
                        <Shield size={20} className="text-gray-400" /> Security
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-2">
                            <div>
                                <p className="font-medium text-gray-900">Password</p>
                                <p className="text-sm text-gray-500">Secure your account with a strong password.</p>
                            </div>

                            <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
                                <DialogTrigger asChild>
                                    <button className="text-sm font-bold text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors">
                                        Change
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Change Password</DialogTitle>
                                        <DialogDescription>
                                            Enter your current password to verify your identity, then create a new one.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleChangePassword} className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="current">Current Password</Label>
                                            <Input
                                                id="current"
                                                type="password"
                                                value={passwordData.oldPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="new">New Password</Label>
                                            <Input
                                                id="new"
                                                type="password"
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="confirm">Confirm New Password</Label>
                                            <Input
                                                id="confirm"
                                                type="password"
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <DialogFooter>
                                            <Button type="button" variant="outline" onClick={() => setIsPasswordModalOpen(false)}>Cancel</Button>
                                            <Button type="submit" disabled={isChangingPassword}>
                                                {isChangingPassword ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                                                Update Password
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
