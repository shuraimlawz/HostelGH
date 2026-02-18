"use client";

import { Shield, CheckCircle, AlertTriangle, LifeBuoy, Heart, Search, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SafetyPage() {
    return (
        <div className="max-w-5xl mx-auto px-6 py-20">
            {/* Immersive Safety Header */}
            <div className="text-center space-y-6 mb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-50 text-green-600 rounded-[2rem] mb-6 shadow-sm border border-green-100">
                    <Shield className="w-10 h-10" />
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight text-gray-900 leading-tight">
                    Your safety is our <br className="hidden md:block" />
                    <span className="text-green-600">top priority.</span>
                </h1>
                <p className="text-gray-500 text-xl max-w-2xl mx-auto font-medium">
                    We've built a multi-layered verification system to ensure every student finds a safe and secure home away from home.
                </p>
            </div>

            {/* Verification Cards */}
            <div className="grid md:grid-cols-2 gap-8 mb-32 animate-in fade-in zoom-in-95 duration-700 delay-200">
                <div className="p-10 rounded-[2.5rem] border-2 border-gray-50 bg-white hover:border-blue-100 hover:shadow-2xl transition-all space-y-6 group">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm border border-blue-100">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight">Verified Listings</h3>
                        <p className="text-gray-500 font-medium leading-relaxed">
                            Every single listing on HostelGH undergoes a mandatory 12-point verification process. We verify property ownership, location, and amenity accuracy before anything goes live.
                        </p>
                    </div>
                </div>

                <div className="p-10 rounded-[2.5rem] border-2 border-gray-50 bg-white hover:border-orange-100 hover:shadow-2xl transition-all space-y-6 group">
                    <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm border border-orange-100">
                        <Shield size={32} />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight">Protect Your Data</h3>
                        <p className="text-gray-500 font-medium leading-relaxed">
                            Always keep your communication and transactions within the platform. Our secure system is designed to protect your personal details and guarantee your payment.
                        </p>
                    </div>
                </div>
            </div>

            {/* Interactive Tips Section */}
            <section className="space-y-12 bg-gray-900 p-10 md:p-20 rounded-[4rem] text-white">
                <div className="text-center space-y-4 mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-white text-xs font-black uppercase tracking-widest mb-4">
                        <Heart size={14} className="text-red-400 fill-red-400" />
                        Community Tips
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight">Safety Tips for Students</h2>
                    <p className="text-gray-400 text-lg font-medium max-w-xl mx-auto">Essential advice from our community to ensure you have a secure experience.</p>
                </div>

                <div className="grid gap-6 max-w-4xl mx-auto">
                    {[
                        { tip: "Visit the hostel during daylight if possible before check-in.", icon: Search },
                        { tip: "Always tell someone where you are going when visiting a new location.", icon: Bell },
                        { tip: "Inspect the room and common areas meticulously upon arrival.", icon: CheckCircle },
                        { tip: "Lock your doors consistently and keep valuables in a secure place.", icon: Shield },
                        { tip: "Report any suspicious behavior or discrepancies immediately.", icon: AlertTriangle }
                    ].map((item, i) => (
                        <div key={i} className="flex gap-6 p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all group">
                            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white text-gray-900 flex items-center justify-center font-black shadow-lg group-hover:scale-110 transition-transform">
                                <item.icon size={24} />
                            </div>
                            <p className="text-lg md:text-xl font-medium leading-relaxed text-gray-100 self-center">{item.tip}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Modern Crisis/Problem UX */}
            <div className="mt-32 text-center space-y-10 animate-in fade-in duration-1000">
                <div className="relative inline-block group">
                    <div className="absolute inset-0 bg-red-100 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
                    <div className="relative w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                        <LifeBuoy className="w-10 h-10 animate-pulse" />
                    </div>
                </div>
                <div className="space-y-4 max-w-2xl mx-auto">
                    <h3 className="text-3xl font-black text-gray-900 tracking-tight">See something concerning?</h3>
                    <p className="text-gray-500 text-lg font-medium">
                        If you encounter a listing or user that violates our community standards, please report it. Our response team reviews reports 24/7.
                    </p>
                </div>
                <div className="pt-4">
                    <button className="bg-red-600 text-white px-12 py-5 rounded-2xl font-black text-xl hover:bg-red-700 hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center gap-3 mx-auto">
                        <AlertTriangle size={24} />
                        Report an Issue
                    </button>
                    <p className="mt-6 text-sm font-bold text-gray-400 uppercase tracking-widest">
                        Response time: &lt; 30 minutes
                    </p>
                </div>
            </div>
        </div>
    );
}
