"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Link from "next/link";
import {
    Users,
    Building2,
    CalendarCheck,
    TrendingUp,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    Loader2,
    Send,
    ShieldAlert,
    Zap,
    Globe,
    DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboardPage() {
    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ["admin-stats"],
        queryFn: async () => {
            const res = await api.get("/admin/stats");
            return res.data;
        }
    });

    const { data: analytics, isLoading: analyticsLoading } = useQuery({
        queryKey: ["admin-analytics"],
        queryFn: async () => {
            const res = await api.get("/admin/analytics");
            return res.data;
        }
    });

    const { data: activity, isLoading: activityLoading } = useQuery({
        queryKey: ["admin-activity"],
        queryFn: async () => {
            const res = await api.get("/admin/activity");
            return res.data; // Expecting array or { data: [] }
        }
    });

    const { data: payouts, isLoading: payoutsLoading } = useQuery({
        queryKey: ["admin-payouts"],
        queryFn: async () => {
            const res = await api.get("/admin/payouts");
            return res.data;
        }
    });

    const [broadcastOpen, setBroadcastOpen] = useState(false);
    const [broadcastForm, setBroadcastForm] = useState({ title: "", message: "", type: "info", target: "all" });

    const broadcastMutation = useMutation({
        mutationFn: async (data: any) => {
            return api.post("/admin/broadcast", data);
        },
        onSuccess: () => {
            toast.success("Broadcast deployed strategically");
            setBroadcastOpen(false);
            setBroadcastForm({ title: "", message: "", type: "info", target: "all" });
        },
        onError: () => toast.error("Deployment failed")
    });

    const statCards = [
        {
            label: "Global Members",
            value: stats?.totalUsers || 0,
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50/50",
            trend: stats?.trends?.users || 0,
            up: (stats?.trends?.users || 0) >= 0
        },
        {
            label: "Verified Assets",
            value: stats?.liveHostels || 0,
            icon: Building2,
            color: "text-emerald-600",
            bg: "bg-emerald-50/50",
            trend: 0,
            up: true
        },
        {
            label: "Platform Drifts",
            value: stats?.bookings || 0,
            icon: CalendarCheck,
            color: "text-purple-600",
            bg: "bg-purple-50/50",
            trend: stats?.trends?.bookings || 0,
            up: (stats?.trends?.bookings || 0) >= 0
        },
        {
            label: "Settled Revenue",
            value: `₵${((stats?.revenue || 0) / 100).toLocaleString()}`,
            icon: TrendingUp,
            color: "text-indigo-600",
            bg: "bg-indigo-50/50",
            trend: 0,
            up: true
        },
    ];

    if (statsLoading || activityLoading || payoutsLoading || analyticsLoading) return (
        <div className="flex h-[80vh] items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-blue-600" size={40} />
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest animate-pulse">Syncing Command Center...</p>
            </div>
        </div>
    );

    // Helper to safely get activity list
    const activityList = Array.isArray(activity) ? activity : (activity?.data || []);

    return (
        <div className="max-w-[1600px] mx-auto space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pt-4">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100/50">
                            Super Admin
                        </span>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                            <Globe size={12} className="text-blue-400" /> Platform Governance
                        </div>
                    </div>
                    <h1 className="text-4xl font-black text-gray-950 tracking-tight leading-none mb-3">
                        Command Center <span className="text-blue-600">.</span>
                    </h1>
                    <p className="text-gray-500 font-medium text-lg max-w-xl">
                        Monitor global activity, manage strategic assets, and deploy platform-wide broadcasts.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <Dialog open={broadcastOpen} onOpenChange={setBroadcastOpen}>
                        <DialogTrigger asChild>
                            <button className="bg-gray-950 text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200 flex items-center gap-3 group active:scale-[0.98]">
                                <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                Deploy Broadcast
                            </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg rounded-[2.5rem] border-gray-100 shadow-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black italic uppercase tracking-wider">Strategic Broadcast</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6 py-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Target Segment</Label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['all', 'tenants', 'owners'].map((t) => (
                                            <button
                                                key={t}
                                                onClick={() => setBroadcastForm({ ...broadcastForm, target: t })}
                                                className={cn(
                                                    "py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all",
                                                    broadcastForm.target === t
                                                        ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100"
                                                        : "bg-white text-gray-400 border-gray-100 hover:border-blue-200 hover:text-blue-600"
                                                )}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Message Header</Label>
                                    <input
                                        className="w-full bg-gray-50 border-transparent rounded-2xl p-4 font-bold text-gray-900 focus:bg-white focus:border-blue-600 transition-all outline-none text-sm"
                                        placeholder="e.g. System Upgrade Notice"
                                        value={broadcastForm.title}
                                        onChange={e => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Detailed Intel</Label>
                                    <textarea
                                        className="w-full bg-gray-50 border-transparent rounded-2xl p-4 font-bold text-gray-900 focus:bg-white focus:border-blue-600 transition-all outline-none text-sm h-32 resize-none"
                                        placeholder="Describe the alert..."
                                        value={broadcastForm.message}
                                        onChange={e => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    onClick={() => broadcastMutation.mutate(broadcastForm)}
                                    disabled={broadcastMutation.isPending || !broadcastForm.title}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-6 font-black uppercase tracking-widest text-[11px] shadow-xl shadow-blue-100"
                                >
                                    {broadcastMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : <Send size={16} className="mr-2" />}
                                    Deploy Signal
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => (
                    <div key={stat.label} className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50/50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                        <div className="relative z-10">
                            <div className="flex items-start justify-between mb-8">
                                <div className={cn("p-4 rounded-2xl group-hover:rotate-6 transition-transform", stat.bg)}>
                                    <stat.icon className={stat.color} size={28} />
                                </div>
                                <div className={cn(
                                    "flex items-center gap-1 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border",
                                    stat.up ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"
                                )}>
                                    {stat.up ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                    {stat.trend > 0 ? '+' : ''}{stat.trend}%
                                </div>
                            </div>
                            <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</h3>
                            <p className="text-4xl font-black text-gray-950 tracking-tighter">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Column: Analytics & Activity */}
                <div className="lg:col-span-8 space-y-10">

                    {/* Analytics Chart */}
                    <div className="bg-white rounded-[3rem] border border-gray-100 p-10 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                    <DollarSign size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black italic uppercase tracking-tighter">Revenue Flow</h2>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">6 Month Trend</p>
                                </div>
                            </div>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={analytics?.monthlyData || []}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 600 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 600 }} tickFormatter={(value) => `₵${value}`} dx={-10} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
                                        itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#1f2937' }}
                                        labelStyle={{ fontSize: '10px', fontWeight: 'bold', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px' }}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Activity Logs */}
                    <div className="bg-white rounded-[3rem] border border-gray-100 p-10 shadow-sm space-y-8">
                        <div className="flex items-center justify-between border-b border-gray-50 pb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gray-950 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-gray-200">
                                    <Activity size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black italic uppercase tracking-tighter">System Pulse</h2>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Global Activity Stream</p>
                                </div>
                            </div>
                            <Link href="/admin/logs" className="px-6 py-2.5 bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-600 rounded-xl hover:bg-gray-950 hover:text-white transition-all">
                                All Logs
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {activityList.map((log: any, i: number) => (
                                <div key={i} className="flex items-center gap-6 p-6 rounded-[2rem] hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 group">
                                    <div className={cn(
                                        "w-2 h-10 rounded-full shrink-0",
                                        log.type === "success" && "bg-emerald-500",
                                        log.type === "info" && "bg-blue-500",
                                        log.type === "warning" && "bg-orange-500"
                                    )} />
                                    <div className="flex-1">
                                        <p className="text-sm font-black text-gray-950 italic">
                                            <span className="text-blue-600 not-italic uppercase tracking-widest text-[11px] mr-2">{log.user?.firstName || 'System'}</span>
                                            <span className="text-gray-600">{log.action || log.details}</span>
                                        </p>
                                        <div className="flex items-center gap-3 mt-1.5">
                                            <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest flex items-center gap-1">
                                                <CalendarCheck size={10} /> {new Date(log.createdAt || log.time).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {activityList.length === 0 && (
                                <div className="text-center py-20 bg-gray-50/50 rounded-[2rem] border border-dashed border-gray-200">
                                    <Activity className="mx-auto text-gray-300 mb-4" size={32} />
                                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest italic">Zero activity detected</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Strategic Hub & Payouts */}
                <div className="lg:col-span-4 space-y-10">
                    <div className="bg-gray-950 rounded-[3rem] p-10 flex flex-col justify-between relative overflow-hidden min-h-[450px] shadow-2xl">
                        <div className="relative z-10 space-y-8">
                            <div>
                                <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-1">Strategic Hub</h2>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">System Overrides</p>
                            </div>

                            <div className="space-y-4">
                                <Link href="/admin/users" className="w-full bg-white/5 hover:bg-white/10 text-white rounded-[1.5rem] p-6 text-left transition-all border border-white/5 flex items-center justify-between group">
                                    <div>
                                        <p className="font-black text-[12px] uppercase tracking-wider mb-1">User Registry</p>
                                        <p className="text-[9px] text-gray-500 font-medium">Control platform access</p>
                                    </div>
                                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                                        <Users size={14} className="text-gray-400 group-hover:text-white" />
                                    </div>
                                </Link>

                                <Link href="/admin/hostels" className="w-full bg-white/5 hover:bg-white/10 text-white rounded-[1.5rem] p-6 text-left transition-all border border-white/5 flex items-center justify-between group">
                                    <div>
                                        <p className="font-black text-[12px] uppercase tracking-wider mb-1">Asset Control</p>
                                        <p className="text-[9px] text-gray-500 font-medium">Moderate live hostels</p>
                                    </div>
                                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                                        <Building2 size={14} className="text-gray-400 group-hover:text-white" />
                                    </div>
                                </Link>

                                <button className="w-full bg-white/5 hover:bg-white/10 text-white rounded-[1.5rem] p-6 text-left transition-all border border-white/5 flex items-center justify-between group">
                                    <div>
                                        <p className="font-black text-[12px] uppercase tracking-wider mb-1">Maintenence Mode</p>
                                        <p className="text-[9px] text-gray-500 font-medium">Platform downtime</p>
                                    </div>
                                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-orange-600 transition-colors">
                                        <Zap size={14} className="text-gray-400 group-hover:text-white" />
                                    </div>
                                </button>
                            </div>
                        </div>

                        <div className="mt-8 relative z-10">
                            <div className="bg-blue-600 rounded-2xl p-6 shadow-2xl shadow-blue-900/50 group cursor-pointer hover:scale-[1.02] transition-transform">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-[9px] font-black text-blue-100 uppercase tracking-widest">Platform Core</p>
                                    <ShieldAlert size={16} className="text-blue-200" />
                                </div>
                                <p className="text-white font-black text-2xl tracking-tighter leading-none mb-1 group-hover:italic transition-all">GH-CORE-V1.2</p>
                                <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest opacity-60 italic">Stable Internal Release</p>
                            </div>
                        </div>

                        {/* Background Accents */}
                        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-[120px] -mr-40 -mt-40" />
                        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/10 rounded-full blur-[120px] -ml-40 -mb-40" />
                    </div>

                    {/* Pending Payouts (moved to right col) */}
                    <div className="bg-white rounded-[3rem] border border-gray-100 p-10 shadow-sm space-y-8">
                        <div className="flex items-center gap-4 border-b border-gray-50 pb-8">
                            <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 border border-orange-100 shadow-xl shadow-orange-50">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black italic uppercase tracking-tighter">Settlement Queue</h2>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Financial Clearances</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {payouts?.map((payout: any) => (
                                <div key={payout.id} className="flex items-center justify-between p-6 rounded-[2rem] hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-xl border border-gray-100 flex items-center justify-center text-gray-900 font-black text-sm">
                                            {payout.owner.firstName?.[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-gray-950 italic">
                                                ₵{(payout.amount / 100).toLocaleString()}
                                                <span className="text-gray-400 font-medium not-italic ml-2 text-[11px] uppercase tracking-widest">For {payout.owner.firstName}</span>
                                            </p>
                                            <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-1">
                                                {new Date(payout.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => api.patch(`/admin/payouts/${payout.id}`, { status: "PAID" }).then(() => toast.success("Settlement verified"))}
                                        className="px-6 py-2.5 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 active:scale-95"
                                    >
                                        Pay
                                    </button>
                                </div>
                            ))}
                            {(!payouts || payouts.length === 0) && (
                                <div className="text-center py-12">
                                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest italic leading-relaxed">Financial queue is clear.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
