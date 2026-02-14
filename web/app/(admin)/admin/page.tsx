"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
    Users,
    Building2,
    CalendarCheck,
    TrendingUp,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
    { label: "Total Users", value: "1,284", icon: Users, color: "text-blue-600", bg: "bg-blue-50", trend: "+12%", up: true },
    { label: "Live Hostels", value: "452", icon: Building2, color: "text-emerald-600", bg: "bg-emerald-50", trend: "+5%", up: true },
    { label: "Bookings", value: "2,840", icon: CalendarCheck, color: "text-purple-600", bg: "bg-purple-50", trend: "+18%", up: true },
    { label: "Platform Revenue", value: "₵428.5k", icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-50", trend: "-2%", up: false },
];

export default function AdminDashboardPage() {
    // In a real app, we'd fetch these from /admin/stats
    // For now, let's just make it look stunning.

    return (
        <div className="space-y-12">
            <div>
                <h1 className="text-4xl font-black tracking-tight text-gray-950 mb-3">Systems Overview</h1>
                <p className="text-gray-500 text-lg font-medium">Real-time health and performance metrics for HostelGH.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white rounded-[2rem] border p-8 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all group">
                        <div className="flex items-start justify-between mb-6">
                            <div className={cn("p-4 rounded-2xl group-hover:scale-110 transition-transform duration-500", stat.bg)}>
                                <stat.icon className={stat.color} size={28} />
                            </div>
                            <div className={cn(
                                "flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                stat.up ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                            )}>
                                {stat.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                {stat.trend}
                            </div>
                        </div>
                        <h3 className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">{stat.label}</h3>
                        <p className="text-4xl font-black text-gray-950 tracking-tighter">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-[3rem] border p-10 shadow-sm space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-900 border">
                                <Activity size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">System Activity</h2>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Global logs</p>
                            </div>
                        </div>
                        <button className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline">View All Logs</button>
                    </div>

                    <div className="space-y-4">
                        {[
                            { user: "Issaka K.", action: "Registered a new hostel", time: "2 mins ago", type: "success" },
                            { user: "System", action: "Automatic payout batch processed", time: "1 hour ago", type: "info" },
                            { user: "Admin", action: "Updated security protocols", time: "3 hours ago", type: "warning" },
                            { user: "Sarah A.", action: "Booking confirmed (PAY_SUCCESS)", time: "5 hours ago", type: "success" },
                        ].map((log, i) => (
                            <div key={i} className="flex items-center gap-4 p-5 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group">
                                <div className={cn(
                                    "w-3 h-3 rounded-full shrink-0",
                                    log.type === "success" && "bg-emerald-500 shadow-sm shadow-emerald-200",
                                    log.type === "info" && "bg-blue-500 shadow-sm shadow-blue-200",
                                    log.type === "warning" && "bg-orange-500 shadow-sm shadow-orange-200"
                                )} />
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-gray-900">
                                        <span className="text-blue-600">{log.user}</span> {log.action}
                                    </p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{log.time}</p>
                                </div>
                                <button className="opacity-0 group-hover:opacity-100 px-3 py-1 text-[10px] font-black text-gray-400 hover:text-black transition-all">Details</button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-gray-950 rounded-[3rem] p-10 flex flex-col justify-between relative overflow-hidden">
                    <div className="relative z-10 space-y-6">
                        <h2 className="text-2xl font-bold text-white tracking-tight">Admin Quick Actions</h2>
                        <div className="space-y-3">
                            <button className="w-full bg-white/10 hover:bg-white/20 text-white rounded-2xl p-4 text-left transition-all border border-white/5 flex items-center justify-between group">
                                <div>
                                    <p className="font-bold text-sm">Broadcast Message</p>
                                    <p className="text-[10px] text-gray-500">Alert all active users</p>
                                </div>
                                <ArrowUpRight className="text-gray-600 group-hover:text-white" size={18} />
                            </button>
                            <button className="w-full bg-white/10 hover:bg-white/20 text-white rounded-2xl p-4 text-left transition-all border border-white/5 flex items-center justify-between group">
                                <div>
                                    <p className="font-bold text-sm">System Maintenance</p>
                                    <p className="text-[10px] text-gray-500">Configure downtime</p>
                                </div>
                                <ArrowUpRight className="text-gray-600 group-hover:text-white" size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="relative z-10 bg-blue-600 rounded-2xl p-6 shadow-2xl shadow-blue-900/50">
                        <p className="text-white font-black text-2xl tracking-tighter mb-1">GH-PLATFORM-V1.2</p>
                        <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest">Internal Build Ready</p>
                    </div>

                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px]" />
                </div>
            </div>
        </div>
    );
}
