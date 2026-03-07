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
    Send,
    ShieldAlert,
    Zap,
    Globe,
    DollarSign,
    CheckCircle2,
    XCircle,
    UserCircle,
    Eye,
    LifeBuoy
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
            // Invalidate relevant queries
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
            toast.success("Shadow Mode: Switching perspective...");
            window.location.href = "/dashboard"; // Redirect to tenant/owner dashboard
        }
    });

    // --- RENDER HELPERS ---
    if (statsLoading || financialsLoading || queueLoading) return (
        <div className="flex h-[80vh] items-center justify-center bg-background transition-colors duration-300">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p className="text-sm font-black text-muted-foreground uppercase tracking-widest animate-pulse">Syncing Command Center...</p>
            </div>
        </div>
    );

    const activityList = Array.isArray(activity) ? activity : (activity?.activities || []);

    return (
        <div className="max-w-[1600px] mx-auto space-y-10 pb-20 bg-background text-foreground transition-colors duration-300">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pt-4">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20">
                            Command & Control
                        </span>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                            <Globe size={12} className="text-primary" /> Active Oversight
                        </div>
                    </div>
                    <h1 className="text-3xl font-black text-foreground tracking-tight leading-none mb-3">
                        Strategic Dashboard <span className="text-primary">.</span>
                    </h1>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-10" onValueChange={setActiveTab}>
                <TabsList className="bg-muted/50 p-1 rounded-2xl border border-border">
                    <TabsTrigger value="overview" className="rounded-xl px-8 py-3 font-black uppercase tracking-widest text-[11px]">Overview</TabsTrigger>
                    <TabsTrigger value="approvals" className="rounded-xl px-8 py-3 font-black uppercase tracking-widest text-[11px]">Approvals ({verificationQueue?.hostels?.length + verificationQueue?.owners?.length})</TabsTrigger>
                    <TabsTrigger value="financials" className="rounded-xl px-8 py-3 font-black uppercase tracking-widest text-[11px]">Financials</TabsTrigger>
                    <TabsTrigger value="disputes" className="rounded-xl px-8 py-3 font-black uppercase tracking-widest text-[11px]">Disputes ({disputes?.length || 0})</TabsTrigger>
                    <TabsTrigger value="activity" className="rounded-xl px-8 py-3 font-black uppercase tracking-widest text-[11px]">Pulse</TabsTrigger>
                </TabsList>

                {/* --- OVERVIEW --- */}
                <TabsContent value="overview" className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard label="Total Volume" value={`₵${(financials?.totalVolume / 100).toLocaleString()}`} icon={DollarSign} trend={+12} up />
                        <StatCard label="Escrow Balance" value={`₵${(financials?.escrowBalance / 100).toLocaleString()}`} icon={ShieldAlert} trend={0} up />
                        <StatCard label="Pending Payouts" value={`₵${(financials?.pendingPayouts / 100).toLocaleString()}`} icon={TrendingUp} trend={-5} up={false} />
                        <StatCard label="Global Members" value={stats?.totalUsers || 0} icon={Users} trend={stats?.trends?.users} up />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        <div className="lg:col-span-8">
                            <RevenueChart data={analytics?.monthlyData} />
                        </div>
                        <div className="lg:col-span-4">
                            <div className="bg-foreground rounded-[3rem] p-10 min-h-[400px] shadow-2xl relative overflow-hidden text-background">
                                <h2 className="text-xl font-black italic uppercase tracking-tighter mb-8">Quick Actions</h2>
                                <div className="space-y-4 relative z-10">
                                    <QuickActionLink href="/admin/users" label="User Registry" sub="Control platform access" icon={Users} />
                                    <QuickActionLink href="/admin/hostels" label="Asset Control" sub="Moderate live hostels" icon={Building2} />
                                    <button className="w-full bg-background/5 hover:bg-background/10 rounded-[1.5rem] p-6 text-left transition-all border border-background/5 flex items-center justify-between group">
                                        <div>
                                            <p className="font-black text-[12px] uppercase tracking-wider mb-1">Drill-Down Mode</p>
                                            <p className="text-[9px] text-background/50">Enhanced diagnostics</p>
                                        </div>
                                        <Zap size={14} className="text-background/50 group-hover:text-primary transition-colors" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* --- APPROVALS --- */}
                <TabsContent value="approvals" className="space-y-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* Hostel Verification Queue */}
                        <div className="bg-card rounded-[3rem] border border-border p-10 space-y-8">
                            <h2 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                                <Building2 size={24} className="text-primary" /> Hostel Audit
                            </h2>
                            <div className="space-y-4">
                                {verificationQueue?.hostels?.map((hostel: any) => (
                                    <div key={hostel.id} className="p-6 rounded-[2rem] bg-muted/30 border border-border flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-2xl bg-muted overflow-hidden">
                                                {hostel.images?.[0] ? <img src={hostel.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-muted-foreground"><Activity size={20} /></div>}
                                            </div>
                                            <div>
                                                <p className="font-black text-sm italic">{hostel.name}</p>
                                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{hostel.city}, {hostel.university || 'Region'}</p>
                                                <p className="text-[9px] text-primary font-black uppercase tracking-widest mt-1">Owner: {hostel.owner?.firstName}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => verifyHostel.mutate(hostel.id)} className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl hover:bg-emerald-500 hover:text-white transition-all"><CheckCircle2 size={18} /></button>
                                            <button className="p-3 bg-red-500/10 text-red-600 rounded-xl hover:bg-red-500 hover:text-white transition-all"><XCircle size={18} /></button>
                                            <Link href={`/hostels/${hostel.id}`} className="p-3 bg-muted text-muted-foreground rounded-xl hover:bg-foreground hover:text-background transition-all"><Eye size={18} /></Link>
                                        </div>
                                    </div>
                                ))}
                                {verificationQueue?.hostels?.length === 0 && <p className="text-center py-10 text-muted-foreground text-[10px] font-black uppercase tracking-widest italic">All hostels are verified</p>}
                            </div>
                        </div>

                        {/* Owner KYC Queue */}
                        <div className="bg-card rounded-[3rem] border border-border p-10 space-y-8">
                            <h2 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                                <UserCircle size={24} className="text-primary" /> KYC Verification
                            </h2>
                            <div className="space-y-4">
                                {verificationQueue?.owners?.map((owner: any) => (
                                    <div key={owner.id} className="p-6 rounded-[2rem] bg-muted/30 border border-border flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black">{owner.firstName?.[0]}</div>
                                            <div>
                                                <p className="font-black text-sm italic">{owner.firstName} {owner.lastName}</p>
                                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{owner.ghanaCardId || 'No ID provided'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Dialog>
                                                <DialogTrigger asChild><button className="px-6 py-2.5 bg-foreground text-background text-[9px] font-black uppercase tracking-widest rounded-xl hover:opacity-90">View Card</button></DialogTrigger>
                                                <DialogContent className="sm:max-w-2xl bg-card border-border">
                                                    <DialogHeader><DialogTitle className="text-xl font-black uppercase italic">Ghana Card: {owner.firstName}</DialogTitle></DialogHeader>
                                                    <div className="py-6">
                                                        <img src={owner.ghanaCardUrl} alt="Ghana Card" className="w-full rounded-2xl shadow-xl border border-border" />
                                                    </div>
                                                    <DialogFooter className="gap-2">
                                                        <Button onClick={() => verifyOwner.mutate(owner.id)} className="bg-emerald-600 text-white rounded-xl uppercase font-black tracking-widest text-[10px]">Approve KYC</Button>
                                                        <Button variant="destructive" className="rounded-xl uppercase font-black tracking-widest text-[10px]">Reject</Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                            <button onClick={() => impersonateMutation.mutate(owner.id)} className="p-3 bg-muted text-muted-foreground rounded-xl hover:bg-foreground hover:text-background transition-all" title="Shadow Mode"><Zap size={18} /></button>
                                        </div>
                                    </div>
                                ))}
                                {verificationQueue?.owners?.length === 0 && <p className="text-center py-10 text-muted-foreground text-[10px] font-black uppercase tracking-widest italic">All owners are verified</p>}
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* --- DISPUTES --- */}
                <TabsContent value="disputes" className="space-y-10">
                    <div className="bg-card rounded-[3rem] border border-border p-10 space-y-8">
                        <h2 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                            <LifeBuoy size={24} className="text-red-500" /> Resolution Center
                        </h2>
                        <div className="space-y-4">
                            {disputes?.map((dispute: any) => (
                                <div key={dispute.id} className="p-8 rounded-[2.5rem] bg-muted/30 border border-border flex items-start justify-between">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <span className="px-3 py-1 bg-red-500/10 text-red-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-red-500/20">{dispute.status}</span>
                                            <p className="text-sm font-black italic">Booking #{dispute.bookingId.slice(-6).toUpperCase()}</p>
                                        </div>
                                        <p className="text-foreground text-sm font-medium">{dispute.reason}</p>
                                        <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                            <span>Tenant: {dispute.booking?.tenant?.firstName}</span>
                                            <span>Hostel: {dispute.booking?.hostel?.name}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-black uppercase tracking-widest text-[10px]">Mediate</button>
                                        <button className="px-6 py-3 bg-red-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px]">Override Payment</button>
                                    </div>
                                </div>
                            ))}
                            {(!disputes || disputes.length === 0) && <p className="text-center py-20 text-muted-foreground text-[11px] font-black uppercase tracking-widest italic">The system is currently stable. Zero active disputes.</p>}
                        </div>
                    </div>
                </TabsContent>

                {/* --- ACTIVITY --- */}
                <TabsContent value="activity" className="space-y-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        <div className="lg:col-span-4">
                            <div className="bg-card rounded-[3rem] border border-border p-10 space-y-8 h-full">
                                <h2 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3"> <Zap size={24} className="text-yellow-500" /> Real-Time Feed</h2>
                                <div className="space-y-6">
                                    {realTimeFeed.map((data: any, i: number) => (
                                        <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-muted/50 border border-border border-l-4 border-l-yellow-500 animate-in slide-in-from-right duration-500">
                                            <Activity size={16} className="text-yellow-600" />
                                            <div>
                                                <p className="text-[11px] font-black italic">{data.event}</p>
                                                <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">{new Date(data.timestamp).toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {realTimeFeed.length === 0 && <p className="text-[10px] text-muted-foreground italic uppercase tracking-widest font-black text-center py-10 opacity-50">Monitoring strategic signals...</p>}
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
        <div className="bg-card rounded-[2.5rem] border border-border p-8 shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-muted/50 rounded-full -mr-8 -mt-8" />
            <div className="relative z-10">
                <div className="flex items-start justify-between mb-8">
                    <div className="p-4 rounded-2xl bg-muted/50 group-hover:rotate-6 transition-transform">
                        <Icon className="text-primary" size={28} />
                    </div>
                    {trend !== undefined && (
                        <div className={cn(
                            "flex items-center gap-1 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border",
                            up ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                        )}>
                            {up ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                            {trend > 0 ? '+' : ''}{trend}%
                        </div>
                    )}
                </div>
                <h3 className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-1">{label}</h3>
                <p className="text-3xl font-black text-foreground tracking-tighter">{value}</p>
            </div>
        </div>
    );
}

function RevenueChart({ data }: any) {
    return (
        <div className="bg-card rounded-[3rem] border border-border p-10 shadow-sm space-y-6">
            <h2 className="text-xl font-black italic uppercase tracking-tighter">Strategic Volume</h2>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))', fontWeight: 900 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))', fontWeight: 900 }} tickFormatter={(val) => `₵${val}`} dx={-10} />
                        <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', backgroundColor: 'hsl(var(--card))', boxShadow: '0 20px 50px -12px rgba(0,0,0,0.2)' }} />
                        <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

function ActivityList({ activities }: any) {
    return (
        <div className="bg-card rounded-[3rem] border border-border p-10 h-full">
            <h2 className="text-xl font-black italic uppercase tracking-tighter mb-8">System Logs</h2>
            <div className="space-y-4">
                {activities.slice(0, 10).map((log: any, i: number) => (
                    <div key={i} className="flex items-center gap-6 p-6 rounded-[2rem] hover:bg-muted transition-all border border-transparent hover:border-border">
                        <div className={cn("w-2 h-10 rounded-full shrink-0", log.type === "success" ? "bg-emerald-500" : log.type === "warning" ? "bg-orange-500" : "bg-primary")} />
                        <div className="flex-1">
                            <p className="text-sm font-black text-foreground italic">
                                <span className="text-primary not-italic uppercase tracking-widest text-[10px] mr-2">{log.user || 'SYSTEM'}</span>
                                <span className="text-muted-foreground">{log.action || log.details}</span>
                            </p>
                            <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mt-1.5">{new Date(log.time || log.createdAt).toLocaleString()}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function QuickActionLink({ href, label, sub, icon: Icon }: any) {
    return (
        <Link href={href} className="w-full bg-background/5 hover:bg-background/10 rounded-[1.5rem] p-6 text-left transition-all border border-background/5 flex items-center justify-between group">
            <div>
                <p className="font-black text-[12px] uppercase tracking-wider mb-1">{label}</p>
                <p className="text-[9px] text-background/50">{sub}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-background/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                <Icon size={14} className="text-background/50 group-hover:text-background" />
            </div>
        </Link>
    );
}
