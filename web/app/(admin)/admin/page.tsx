"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
    Zap,
    Globe,
    DollarSign,
    CheckCircle2,
    XCircle,
    UserCircle,
    Eye,
    LifeBuoy,
    Settings,
    Bell,
    ListChecks,
    Wallet,
    FileText,
    ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { io, Socket } from "socket.io-client";

export default function AdminDashboardPage() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState("overview");
    const [realTimeFeed, setRealTimeFeed] = useState<any[]>([]);

    // --- SOCKET INTEGRATION ---
    useEffect(() => {
        const socketUrl = process.env.NEXT_PUBLIC_API_URL || "https://hostelgh.onrender.com";
        const socket: Socket = io(`${socketUrl}/admin-events`, {
            auth: { token: localStorage.getItem("accessToken") }
        });

        socket.on("activity", (data) => {
            setRealTimeFeed(prev => [data, ...prev].slice(0, 50));
            toast.info(`Activity: ${data.event}`);
            if (data.event === 'HOSTEL_VERIFIED') queryClient.invalidateQueries({ queryKey: ["admin-verification-queue"] });
        });

        return () => { socket.disconnect(); };
    }, [queryClient]);

    // --- DATA FETCHING ---
    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ["admin-stats"],
        queryFn: async () => (await api.get("/admin/stats")).data
    });

    const { data: financials, isLoading: financialsLoading } = useQuery({
        queryKey: ["admin-financials"],
        queryFn: async () => (await api.get("/admin/financials")).data
    });

    const { data: verificationQueue, isLoading: queueLoading } = useQuery({
        queryKey: ["admin-verification-queue"],
        queryFn: async () => (await api.get("/admin/verification-queue")).data
    });

    const { data: disputes, isLoading: disputesLoading } = useQuery({
        queryKey: ["admin-disputes"],
        queryFn: async () => (await api.get("/admin/disputes")).data
    });

    const { data: analytics } = useQuery({
        queryKey: ["admin-analytics"],
        queryFn: async () => (await api.get("/admin/analytics")).data
    });

    const { data: activity } = useQuery({
        queryKey: ["admin-activity"],
        queryFn: async () => (await api.get("/admin/activity")).data
    });

    const { data: notificationCounts } = useQuery({
        queryKey: ["admin-notifications-counts"],
        queryFn: async () => (await api.get("/admin/notifications/counts")).data,
        refetchInterval: 30000
    });

    // --- MUTATIONS ---
    const verifyHostel = useMutation({
        mutationFn: async (id: string) => api.patch(`/admin/hostels/${id}/verify`),
        onSuccess: () => {
            toast.success("Hostel verified & published");
            queryClient.invalidateQueries({ queryKey: ["admin-verification-queue"] });
        }
    });

    const verifyOwner = useMutation({
        mutationFn: async (id: string) => api.patch(`/admin/users/${id}/verify`),
        onSuccess: () => {
            toast.success("Owner identity verified");
            queryClient.invalidateQueries({ queryKey: ["admin-verification-queue"] });
        }
    });

    const impersonateMutation = useMutation({
        mutationFn: async (userId: string) => api.post(`/admin/users/${userId}/impersonate`),
        onSuccess: (res) => {
            const { token } = res.data;
            localStorage.setItem("accessToken", token);
            toast.success("Logging in as user...");
            window.location.href = "/tenant"; 
        }
    });

    if (statsLoading || financialsLoading || queueLoading) return (
        <div className="flex h-[60vh] items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-center">
                <Loader2 className="animate-spin text-blue-600" size={32} />
                <p className="text-sm font-medium text-gray-400">Loading dashboard...</p>
            </div>
        </div>
    );

    const activityList = Array.isArray(activity) ? activity : (activity?.activities || []);
    const pendingApprovals = (verificationQueue?.hostels?.length || 0) + (verificationQueue?.owners?.length || 0);
    const pendingPayoutAmount = financials?.pendingPayouts || 0;
    const pendingPayoutCount = notificationCounts?.payouts || 0;
    const pendingHostels = notificationCounts?.hostels || verificationQueue?.hostels?.length || 0;
    const totalRevenue = financials?.totalVolume || stats?.revenue || 0;

    return (
        <div className="max-w-[1400px] mx-auto space-y-10 pb-20 pt-4 px-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Administration</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Admin Overview</h1>
                    <p className="text-gray-500 text-sm max-w-md">Monitor platform activity, verify hostels, and manage users.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <Link href="/admin/settings" className="h-10 px-5 rounded-xl bg-white border border-gray-100 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm">
                        <Settings size={14} /> Configure
                    </Link>
                    <Link href="/admin/logs" className="h-10 px-5 rounded-xl bg-gray-900 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 shadow-lg shadow-gray-900/10">
                        <Activity size={14} /> System Logs
                    </Link>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-10" onValueChange={setActiveTab}>
                <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
                    <TabsList className="bg-gray-50 p-1 rounded-xl border border-gray-100 w-max inline-flex">
                        <TabsTrigger value="overview" className="rounded-lg px-6 py-2.5 font-bold uppercase tracking-widest text-[10px]">Overview</TabsTrigger>
                        <TabsTrigger value="approvals" className="rounded-lg px-6 py-2.5 font-bold uppercase tracking-widest text-[10px]">
                            Approvals <span className="ml-1.5 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-md text-[8px]">{pendingApprovals}</span>
                        </TabsTrigger>
                        <TabsTrigger value="financials" className="rounded-lg px-6 py-2.5 font-bold uppercase tracking-widest text-[10px]">Financials</TabsTrigger>
                        <TabsTrigger value="disputes" className="rounded-lg px-6 py-2.5 font-bold uppercase tracking-widest text-[10px]">
                            Disputes <span className="ml-1.5 px-1.5 py-0.5 bg-red-100 text-red-700 rounded-md text-[8px]">{disputes?.length || 0}</span>
                        </TabsTrigger>
                        <TabsTrigger value="activity" className="rounded-lg px-6 py-2.5 font-bold uppercase tracking-widest text-[10px]">Live Pulse</TabsTrigger>
                    </TabsList>
                </div>

                {/* --- OVERVIEW --- */}
                <TabsContent value="overview" className="space-y-10 animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                        <StatCard label="Live Hostels" value={stats?.liveHostels || 0} icon={Building2} />
                        <StatCard label="Total Users" value={stats?.totalUsers || 0} icon={Users} trend={stats?.trends?.users} up />
                        <StatCard label="Total Bookings" value={stats?.bookings || 0} icon={CalendarCheck} />
                        <StatCard label="Total Revenue" value={`GH₵ ${(totalRevenue / 100).toLocaleString()}`} icon={DollarSign} />
                        <StatCard label="Pending Action" value={pendingApprovals} icon={ListChecks} />
                        <StatCard label="Active Disputes" value={disputes?.length || 0} icon={LifeBuoy} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-8">
                            <RevenueChart data={analytics?.monthlyData} />
                        </div>
                        <div className="lg:col-span-4">
                            <div className="bg-gray-900 rounded-2xl p-8 min-h-[400px] shadow-xl relative overflow-hidden text-white border border-gray-800">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                                <h2 className="text-xl font-bold tracking-tight mb-8">Admin Links</h2>
                                <div className="space-y-4 relative z-10">
                                    <QuickActionLink href="/admin/users" label="User Management" sub="Control platform access" icon={Users} />
                                    <QuickActionLink href="/admin/hostels" label="Hostel Management" sub="Moderate live hostels" icon={Building2} />
                                    <QuickActionLink href="/admin/bookings" label="Reservations" sub="Monitor booking activity" icon={CalendarCheck} />
                                    <button className="w-full bg-white/5 hover:bg-white/10 rounded-xl p-5 text-left transition-all border border-white/5 flex items-center justify-between group">
                                        <div>
                                            <p className="font-bold text-[11px] uppercase tracking-wider mb-1">Detailed View</p>
                                            <p className="text-[10px] text-white/40">Technical settings</p>
                                        </div>
                                        <Zap size={14} className="text-white/20 group-hover:text-blue-400 transition-colors" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-5">
                            <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-6 shadow-sm">
                                <h2 className="text-xl font-bold tracking-tight flex items-center gap-3">
                                    <Bell size={20} className="text-blue-600" /> Pending Actions
                                </h2>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Pending Hostels</p>
                                            <p className="text-lg font-bold text-gray-900">{pendingHostels}</p>
                                        </div>
                                        <Link href="/admin/hostels" className="text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:underline">Review Queue</Link>
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Pending Payouts</p>
                                            <p className="text-lg font-bold text-gray-900">GH₵ {(pendingPayoutAmount / 100).toLocaleString()}</p>
                                        </div>
                                        <Link href="/admin/payments" className="text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:underline">Disburse</Link>
                                    </div>
                                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100/50">
                                        <div className="flex items-center gap-2 mb-1">
                                            <CheckCircle2 size={14} className="text-emerald-600" />
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Health Check</p>
                                        </div>
                                        <p className="text-xs text-emerald-700 font-medium">All systems synchronized and operational.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="lg:col-span-7">
                            <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-6 shadow-sm">
                                <h2 className="text-xl font-bold tracking-tight flex items-center gap-3">
                                    <FileText size={20} className="text-blue-600" /> Control Parameters
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <ConfigLink href="/admin/settings" label="Settings Hub" sub="Access & Preferences" icon={Settings} />
                                    <ConfigLink href="/admin/stats" label="Platform Stats" sub="Growth Metrics" icon={TrendingUp} />
                                    <ConfigLink href="/admin/logs" label="Activity History" sub="System event logs" icon={Activity} />
                                    <ConfigLink href="/admin/users" label="Users List" sub="Manage platform users" icon={Users} />
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* --- APPROVALS --- */}
                <TabsContent value="approvals" className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Hostel Verification Queue */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-6 shadow-sm">
                            <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                                <h2 className="text-xl font-bold tracking-tight flex items-center gap-3">
                                    <Building2 size={24} className="text-blue-600" /> Hostel Verification
                                </h2>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Queue: {verificationQueue?.hostels?.length || 0}</span>
                            </div>
                            <div className="space-y-4">
                                {verificationQueue?.hostels?.map((hostel: any) => (
                                    <div key={hostel.id} className="p-5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between group hover:border-blue-200 transition-colors">
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="w-14 h-14 rounded-xl bg-gray-200 overflow-hidden shrink-0 shadow-inner">
                                                {hostel.images?.[0] ? (
                                                    <img src={hostel.images[0]} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400"><Building2 size={24} /></div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-sm text-gray-900 truncate">{hostel.name}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest truncate">{hostel.city} • {hostel.owner?.firstName}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => verifyHostel.mutate(hostel.id)} 
                                                className="w-10 h-10 flex items-center justify-center bg-white text-emerald-600 rounded-xl border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                                title="Approve"
                                            >
                                                <CheckCircle2 size={18} />
                                            </button>
                                            <Link 
                                                href={`/hostels/${hostel.id}`} 
                                                className="w-10 h-10 flex items-center justify-center bg-white text-gray-400 rounded-xl border border-gray-100 hover:text-gray-900 transition-all shadow-sm"
                                                title="Preview"
                                            >
                                                <Eye size={18} />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                                {(!verificationQueue?.hostels || verificationQueue?.hostels?.length === 0) && (
                                    <div className="text-center py-12 border border-dashed border-gray-100 rounded-2xl">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">All listings are up to date</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Owner KYC Queue */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-6 shadow-sm">
                            <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                                <h2 className="text-xl font-bold tracking-tight flex items-center gap-3">
                                    <UserCircle size={24} className="text-blue-600" /> User Verification
                                </h2>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Queue: {verificationQueue?.owners?.length || 0}</span>
                            </div>
                            <div className="space-y-4">
                                {verificationQueue?.owners?.map((owner: any) => (
                                    <div key={owner.id} className="p-5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between group hover:border-blue-200 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100 shadow-sm">{owner.firstName?.[0]}</div>
                                            <div>
                                                <p className="font-bold text-sm text-gray-900">{owner.firstName} {owner.lastName}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{owner.ghanaCardId || 'No ID linked'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <button className="h-9 px-5 bg-gray-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-black shadow-sm">
                                                        View Identity
                                                    </button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-xl rounded-2xl p-8">
                                                    <DialogHeader>
                                                        <DialogTitle className="text-xl font-bold tracking-tight">Identity Document: {owner.firstName}</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="py-6">
                                                        <img src={owner.ghanaCardUrl} alt="Ghana Card" className="w-full rounded-xl shadow-lg border border-gray-100" />
                                                    </div>
                                                    <DialogFooter className="gap-2">
                                                        <Button onClick={() => verifyOwner.mutate(owner.id)} className="bg-emerald-600 text-white rounded-xl uppercase font-bold tracking-widest text-[10px] h-12 grow">Confirm Accuracy</Button>
                                                        <Button variant="outline" className="rounded-xl uppercase font-bold tracking-widest text-[10px] h-12 text-red-600 border-red-100 hover:bg-red-50">Reject</Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                            <button 
                                                onClick={() => impersonateMutation.mutate(owner.id)} 
                                                className="w-10 h-10 flex items-center justify-center bg-white text-gray-400 rounded-xl border border-gray-100 hover:text-blue-600 transition-all shadow-sm"
                                                title="Shadow Mode"
                                            >
                                                <Zap size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {(!verificationQueue?.owners || verificationQueue?.owners?.length === 0) && (
                                    <div className="text-center py-12 border border-dashed border-gray-100 rounded-2xl">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">All owners are verified</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* --- DISPUTES --- */}
                <TabsContent value="disputes" className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-8 shadow-sm">
                        <h2 className="text-xl font-bold tracking-tight flex items-center gap-3">
                            <LifeBuoy size={24} className="text-red-500" /> Dispute Resolution
                        </h2>
                        <div className="space-y-4">
                            {disputes?.map((dispute: any) => (
                                <div key={dispute.id} className="p-6 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col md:flex-row md:items-start justify-between gap-6 hover:border-red-100 transition-colors">
                                    <div className="space-y-4 max-w-2xl">
                                        <div className="flex items-center gap-3">
                                            <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-lg text-[9px] font-bold uppercase tracking-widest border border-red-200/50">{dispute.status}</span>
                                            <p className="text-sm font-bold text-gray-900 uppercase tracking-tight">Booking #{dispute.bookingId.slice(-6).toUpperCase()}</p>
                                        </div>
                                        <p className="text-gray-600 text-sm font-medium leading-relaxed border-l-2 border-red-500 pl-4">
                                            "{dispute.reason}"
                                        </p>
                                        <div className="flex items-center gap-6 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                            <span className="flex items-center gap-1.5"><UserCircle size={12} /> Tenant: {dispute.booking?.tenant?.firstName}</span>
                                            <span className="flex items-center gap-1.5"><Building2 size={12} /> Property: {dispute.booking?.hostel?.name}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <button className="h-10 px-6 bg-gray-900 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-black transition-all">Mediate</button>
                                        <button className="h-10 px-6 bg-white text-red-600 rounded-xl font-bold uppercase tracking-widest text-[10px] border border-red-100 hover:bg-red-50 transition-all">Override</button>
                                    </div>
                                </div>
                            ))}
                            {(!disputes || disputes.length === 0) && (
                                <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-100">
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Network conflict level: Zero</p>
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>

                {/* --- ACTIVITY --- */}
                <TabsContent value="activity" className="space-y-10 animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        <div className="lg:col-span-4">
                            <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-6 h-full shadow-sm">
                                <h2 className="text-xl font-bold tracking-tight flex items-center gap-3 text-blue-600"> <Zap size={24} className="fill-current" /> Live Capture</h2>
                                <div className="space-y-4">
                                    {realTimeFeed.map((data: any, i: number) => (
                                        <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 border-l-4 border-l-blue-500 animate-in slide-in-from-right-4 duration-500">
                                            <Activity size={16} className="text-blue-600" />
                                            <div>
                                                <p className="text-[11px] font-bold text-gray-900 uppercase tracking-tight">{data.event.replace(/_/g, ' ')}</p>
                                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{new Date(data.timestamp).toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {realTimeFeed.length === 0 && (
                                        <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest text-center py-20">Monitoring strategic signals...</p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="lg:col-span-8">
                            <ActivityList activities={activityList} />
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

// --- SUB-COMPONENTS ---

function StatCard({ label, value, icon: Icon, trend, up }: any) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all group overflow-hidden">
            <div className="flex items-start justify-between mb-6">
                <div className="p-3 rounded-xl bg-gray-50 text-blue-600 group-hover:scale-110 transition-transform border border-gray-100">
                    <Icon size={24} />
                </div>
                {trend !== undefined && (
                    <div className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border",
                        up ? "bg-emerald-50 text-emerald-600 border-emerald-200/50" : "bg-red-50 text-red-600 border-red-200/50"
                    )}>
                        {up ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                        {trend > 0 ? '+' : ''}{trend}%
                    </div>
                )}
            </div>
            <h3 className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">{label}</h3>
            <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
        </div>
    );
}

function RevenueChart({ data }: any) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                <h2 className="text-xl font-bold tracking-tight">Revenue Overview</h2>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Monthly Growth</span>
                </div>
            </div>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(243, 244, 246, 0.8)" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 600 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 600 }} tickFormatter={(val) => `₵${val}`} dx={-10} />
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#fff', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                            labelStyle={{ fontWeight: 800, fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

function ActivityList({ activities }: any) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 h-full shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-50 pb-4 mb-8">
                <h2 className="text-xl font-bold tracking-tight">System Audit Log</h2>
                <button className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline">Download Report</button>
            </div>
            <div className="space-y-4">
                {activities.slice(0, 10).map((log: any, i: number) => (
                    <div key={i} className="flex items-center gap-6 p-5 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100">
                        <div className={cn("w-1.5 h-10 rounded-full shrink-0 shadow-sm", log.type === "success" ? "bg-emerald-500" : log.type === "warning" ? "bg-amber-500" : "bg-blue-600")} />
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-800">
                                <span className="text-blue-600 uppercase tracking-widest text-[10px] mr-2 font-bold">{log.user || 'SYSTEM'}</span>
                                {log.action || log.details}
                            </p>
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1.5">{new Date(log.time || log.createdAt).toLocaleString()}</p>
                        </div>
                        <ChevronRight className="text-gray-200" size={16} />
                    </div>
                ))}
            </div>
        </div>
    );
}

function QuickActionLink({ href, label, sub, icon: Icon }: any) {
    return (
        <Link href={href} className="w-full bg-white/5 hover:bg-white/10 rounded-xl p-5 text-left transition-all border border-white/5 flex items-center justify-between group">
            <div>
                <p className="font-bold text-[11px] uppercase tracking-wider mb-1">{label}</p>
                <p className="text-[10px] text-white/40">{sub}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                <Icon size={16} className="text-white/40 group-hover:text-white" />
            </div>
        </Link>
    );
}

function ConfigLink({ href, label, sub, icon: Icon }: any) {
    return (
        <Link href={href} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-5 hover:bg-white hover:shadow-md transition-all group">
            <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-900 truncate">{label}</p>
                <p className="text-[10px] text-gray-400 font-bold mt-1 truncate">{sub}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-gray-900 text-white flex items-center justify-center group-hover:bg-blue-600 transition-colors shrink-0">
                <Icon size={16} />
            </div>
        </Link>
    );
}
