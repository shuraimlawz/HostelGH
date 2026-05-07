"use client";

import { Bell, Shield, Loader2, CheckCircle2, XCircle, ArrowRightLeft } from "lucide-react";
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
import { cn } from "@/lib/utils";

export default function TenantSettingsPage() {
    const { user, updateUser } = useAuth();
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    // Password Change State
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passwordData, setPasswordData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Account Type Change State
    const [isAccountTypeModalOpen, setIsAccountTypeModalOpen] = useState(false);
    const [isSwitchingType, setIsSwitchingType] = useState(false);

    useEffect(() => {
        if (user) {
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
            toast.error(error.message);
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
            toast.error(error.message);
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleSwitchAccountType = async () => {
        setIsSwitchingType(true);
        try {
            const { data } = await api.patch("/auth/role", { role: "OWNER" });
            updateUser(data.user);
            localStorage.setItem("accessToken", data.accessToken);
            toast.success("Account switched to Proprietor successfully!");
            window.location.href = "/owner"; // Redirect manually to guarantee fresh context
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to switch account type");
            setIsSwitchingType(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-12 pb-20 pt-4">
            <div className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight mb-2 uppercase tracking-widest text-gray-900 dark:text-white">Security & Preferences</h1>
                <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 font-bold text-xs uppercase tracking-widest">Manage your platform identity and signaling protocols.</p>
            </div>

            <div className="space-y-6">
                {/* Notifications */}
                <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] border border-gray-100 p-8 shadow-sm group hover:border-blue-500/10 transition-all">
                    <h3 className="flex items-center gap-3 font-bold text-gray-900 dark:text-white uppercase tracking-widest text-[11px] mb-8">
                        <Bell size={20} className="text-blue-600" /> Notifications
                    </h3>
                    <div className="flex items-center justify-between py-2">
                        <div className="space-y-1">
                            <p className="font-bold text-gray-900 dark:text-white uppercase tracking-tight text-sm">Email Signaling</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">Receive updates about your bookings and payments.</p>
                        </div>
                        <button
                            onClick={handleNotificationToggle}
                            className={`w-14 h-8 rounded-full transition-all duration-300 flex items-center px-1.5 shadow-inner ${emailNotifications ? 'bg-blue-600' : 'bg-gray-200'}`}
                        >
                            <div className={`w-5 h-5 bg-white dark:bg-gray-900 rounded-full shadow-lg transition-transform duration-300 ${emailNotifications ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </div>

                {/* Security */}
                <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] border border-gray-100 p-8 shadow-sm group hover:border-blue-500/10 transition-all">
                    <h3 className="flex items-center gap-3 font-bold text-gray-900 dark:text-white uppercase tracking-widest text-[11px] mb-8">
                        <Shield size={20} className="text-blue-600" /> Security Matrix
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-2">
                            <div className="space-y-1">
                                <p className="font-bold text-gray-900 dark:text-white uppercase tracking-tight text-sm">Password Control</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">Secure your account with a strong, rotated password.</p>
                            </div>

                            <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
                                <DialogTrigger asChild>
                                    <button className="text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:bg-blue-50 px-6 py-2.5 rounded-xl border border-blue-100 transition-all">
                                        Update Access
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md rounded-[1.5rem] border-gray-100 shadow-2xl">
                                    <DialogHeader>
                                        <DialogTitle className="font-bold uppercase tracking-widest text-gray-900 dark:text-white">Change Password</DialogTitle>
                                        <DialogDescription className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 pt-1">
                                            Enter your current password to verify identity.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleChangePassword} className="space-y-6 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="current" className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 ml-1">Current Password</Label>
                                            <PasswordField
                                                id="current"
                                                value={passwordData.oldPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                                required
                                                className="rounded-xl border-gray-100 h-14"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="new" className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 ml-1">New Password</Label>
                                            <PasswordField
                                                id="new"
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                required
                                                className="rounded-xl border-gray-100 h-14"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="confirm" className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 ml-1">Confirm New Password</Label>
                                            <PasswordField
                                                id="confirm"
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                required
                                                className="rounded-xl border-gray-100 h-14"
                                            />
                                        </div>
                                        <DialogFooter className="gap-3 mt-4">
                                            <Button type="button" variant="outline" onClick={() => setIsPasswordModalOpen(false)} className="rounded-xl font-bold uppercase tracking-widest text-[10px] grow">Cancel</Button>
                                            <Button type="submit" disabled={isChangingPassword} className="rounded-xl font-bold uppercase tracking-widest text-[10px] bg-blue-600 hover:bg-blue-700 grow">
                                                {isChangingPassword ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                                                Authorize Change
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>

                {/* Account Type Management */}
                <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] border border-blue-100 p-8 shadow-sm group hover:border-blue-500/10 transition-all">
                    <h3 className="flex items-center gap-3 font-bold text-gray-900 dark:text-white uppercase tracking-widest text-[11px] mb-8">
                        <ArrowRightLeft size={20} className="text-blue-600" /> Account Context
                    </h3>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 bg-blue-50/30 rounded-2xl border border-blue-50">
                        <div className="space-y-1">
                            <p className="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-tight">Switch to Proprietor/Owner</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest leading-relaxed">Unlock tools to list hostels, manage tenants, and receive payouts.</p>
                        </div>

                        <Dialog open={isAccountTypeModalOpen} onOpenChange={setIsAccountTypeModalOpen}>
                            <DialogTrigger asChild>
                                <button className="text-[10px] font-bold uppercase tracking-widest text-blue-700 bg-blue-100 hover:bg-blue-200 px-6 py-3 rounded-xl transition-all shadow-sm shrink-0 whitespace-nowrap">
                                    Switch Account
                                </button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md rounded-[1.5rem] border-blue-100 shadow-2xl">
                                <DialogHeader>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                            <Shield size={20} />
                                        </div>
                                        <DialogTitle className="font-bold uppercase tracking-widest text-blue-600">Upgrade Context</DialogTitle>
                                    </div>
                                    <DialogDescription className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 leading-relaxed pt-2">
                                        Switching to a <span className="text-gray-900 dark:text-white underline">Proprietor Account</span> will enable property management protocols. Your student history will be preserved securely.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter className="gap-3 mt-6">
                                    <Button type="button" variant="outline" onClick={() => setIsAccountTypeModalOpen(false)} className="rounded-xl font-bold uppercase tracking-widest text-[10px] grow">Cancel</Button>
                                    <Button
                                        onClick={handleSwitchAccountType}
                                        disabled={isSwitchingType}
                                        className="rounded-xl font-bold uppercase tracking-widest text-[10px] bg-blue-600 hover:bg-blue-700 grow"
                                    >
                                        {isSwitchingType ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                                        Authorize Switch
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>
        </div>
    );
}
