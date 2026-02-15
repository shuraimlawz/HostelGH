"use client";

import { Bell, Lock, Shield, Moon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function TenantSettingsPage() {
    const [notifications, setNotifications] = useState(true);

    const handleSave = () => {
        toast.success("Settings saved successfully");
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
                            onClick={() => setNotifications(!notifications)}
                            className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 ${notifications ? 'bg-blue-600' : 'bg-gray-200'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${notifications ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </div>

                {/* Security */}
                <div className="bg-white rounded-3xl border p-6 shadow-sm">
                    <h3 className="flex items-center gap-2 font-bold text-lg mb-4">
                        <Shield size={20} className="text-gray-400" /> Security
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-2 border-b border-gray-50">
                            <div>
                                <p className="font-medium text-gray-900">Password</p>
                                <p className="text-sm text-gray-500">Last changed 3 months ago</p>
                            </div>
                            <button className="text-sm font-bold text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors">
                                Change
                            </button>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <div>
                                <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                                <p className="text-sm text-gray-500">Add an extra layer of security to your account.</p>
                            </div>
                            <button className="text-sm font-bold text-green-600 hover:bg-green-50 px-4 py-2 rounded-lg transition-colors">
                                Enable
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        onClick={handleSave}
                        className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-all active:scale-[0.98]"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
