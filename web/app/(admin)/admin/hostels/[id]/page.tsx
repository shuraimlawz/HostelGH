"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import {
    ChevronLeft,
    ShieldCheck,
    Building2,
    Users,
    MapPin,
    Star,
    ExternalLink,
    CheckCircle2,
    XCircle,
    Loader2,
    ArrowUpRight,
    MessageCircle,
    Calendar,
    Clock,
    DollarSign,
    Lock,
    Unlock,
    Activity,
    Info,
    BedDouble
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

export default function HostelAuditPage() {
    const { id } = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: hostel, isLoading, isError } = useQuery({
        queryKey: ["admin-hostel", id],
        queryFn: async () => {
            const res = await api.get(`/admin/hostels/${id}`);
            return res.data;
        }
    });

    const verifyHostelMutation = useMutation({
        mutationFn: async () => api.patch(`/admin/hostels/${id}/verify`),
        onSuccess: () => {
            toast.success("Hostel verified and published");
            queryClient.invalidateQueries({ queryKey: ["admin-hostel", id] });
        },
        onError: (err: any) => toast.error(err.message)
    });

    const toggleFeatureMutation = useMutation({
        mutationFn: async (featured: boolean) => api.patch(`/admin/hostels/${id}/feature`, { featured }),
        onSuccess: (_, variables) => {
            toast.success(variables ? "Hostel featured" : "Hostel unfeatured");
            queryClient.invalidateQueries({ queryKey: ["admin-hostel", id] });
        },
        onError: (err: any) => toast.error(err.message)
    });

    const updateStatusMutation = useMutation({
        mutationFn: async (published: boolean) => api.patch(`/admin/hostels/${id}`, { published }),
        onSuccess: (_, variables) => {
            toast.success(variables ? "Hostel published" : "Hostel unpublished");
            queryClient.invalidateQueries({ queryKey: ["admin-hostel", id] });
        },
        onError: (err: any) => toast.error(err.message)
    });

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center">
                    <Loader2 className="animate-spin text-blue-600" size={40} />
                    <p className="text-sm font-medium text-gray-400 uppercase tracking-widest">Loading Strategic Asset Log...</p>
                </div>
            </div>
        );
    }

    if (isError || !hostel) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="bg-white p-12 rounded-[3rem] border border-gray-100 shadow-xl text-center space-y-6">
                    <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center text-red-500 mx-auto">
                        <XCircle size={40} />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-gray-900">Asset Not Found</h2>
                        <p className="text-gray-500 max-w-xs">The requested hostel record could not be retrieved from the infrastructure log.</p>
                    </div>
                    <button onClick={() => router.back()} className="h-12 px-8 bg-gray-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-all">
                        Return to Panel
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto space-y-12 pb-24 pt-8 px-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-6">
                    <button 
                        onClick={() => router.back()}
                        className="group flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors"
                    >
                        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Back to Inventory</span>
                    </button>
                    
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">{hostel.name}</h1>
                            <div className={cn(
                                "h-7 px-3 flex items-center rounded-lg text-[9px] font-bold uppercase tracking-widest border",
                                hostel.isPublished 
                                    ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                                    : "bg-gray-100 text-gray-400 border-gray-200"
                            )}>
                                {hostel.isPublished ? "Live Listing" : "Internal Draft"}
                            </div>
                        </div>
                        <div className="flex items-center gap-6 text-gray-400">
                            <div className="flex items-center gap-2">
                                <MapPin size={16} />
                                <span className="text-xs font-medium">{hostel.addressLine}, {hostel.city}</span>
                            </div>
                            <div className="flex items-center gap-2 border-l pl-6 border-gray-100">
                                <Activity size={16} />
                                <span className="text-xs font-medium uppercase tracking-widest text-blue-600">Audit ID: {hostel.id}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    {hostel.pendingVerification && (
                        <button 
                            onClick={() => verifyHostelMutation.mutate()}
                            disabled={verifyHostelMutation.isPending}
                            className="h-14 px-8 bg-emerald-600 text-white rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-900/10 flex items-center gap-3"
                        >
                            {verifyHostelMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={18} />}
                            Approve & Publish
                        </button>
                    )}
                    
                    <button 
                        onClick={() => updateStatusMutation.mutate(!hostel.isPublished)}
                        disabled={updateStatusMutation.isPending}
                        className={cn(
                            "h-14 px-8 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-3",
                            hostel.isPublished 
                                ? "bg-white border-2 border-orange-100 text-orange-600 hover:bg-orange-50" 
                                : "bg-white border-2 border-emerald-100 text-emerald-600 hover:bg-emerald-50"
                        )}
                    >
                        {hostel.isPublished ? <Lock size={18} /> : <Unlock size={18} />}
                        {hostel.isPublished ? "Take Offline" : "Publish Now"}
                    </button>

                    <button 
                        onClick={() => toggleFeatureMutation.mutate(!hostel.isFeatured)}
                        disabled={toggleFeatureMutation.isPending}
                        className={cn(
                            "h-14 px-8 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-3",
                            hostel.isFeatured
                                ? "bg-blue-600 text-white shadow-xl shadow-blue-900/20"
                                : "bg-white border-2 border-gray-100 text-gray-400 hover:border-gray-900 hover:text-gray-900"
                        )}
                    >
                        <Star size={18} className={hostel.isFeatured ? "fill-current" : ""} />
                        {hostel.isFeatured ? "Revoke Featured" : "Promote Asset"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-12">
                    {/* Media Gallery */}
                    <div className="grid grid-cols-2 gap-4">
                        {hostel.images?.slice(0, 4).map((img: string, i: number) => (
                            <div key={i} className={cn(
                                "relative overflow-hidden rounded-[2.5rem] bg-gray-50 border border-gray-100",
                                i === 0 ? "col-span-2 aspect-[21/9]" : "aspect-square"
                            )}>
                                <img src={img} className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>

                    {/* Room Inventory */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tight flex items-center gap-3">
                                <BedDouble className="text-blue-600" />
                                Room Configurations
                            </h2>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{hostel.rooms?.length || 0} Types Registered</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {hostel.rooms?.map((room: any) => (
                                <div key={room.id} className="bg-white rounded-[2rem] border border-gray-100 p-6 space-y-6 hover:shadow-lg transition-all">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-gray-900">{room.name}</h3>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{room.roomConfiguration}</p>
                                        </div>
                                        <div className="h-8 px-3 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold flex items-center">
                                            ₵{(room.pricePerTerm / 100).toLocaleString()} / Sem
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                                            <p className="text-[8px] font-bold text-gray-400 uppercase">Pax</p>
                                            <p className="text-xs font-bold text-gray-900">{room.capacity}</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                                            <p className="text-[8px] font-bold text-gray-400 uppercase">Units</p>
                                            <p className="text-xs font-bold text-gray-900">{room.totalUnits}</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                                            <p className="text-[8px] font-bold text-gray-400 uppercase">Stock</p>
                                            <p className="text-xs font-bold text-emerald-600">{room.availableSlots}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Audit Sidebar */}
                <div className="space-y-8">
                    {/* Proprietor Card */}
                    <div className="bg-gray-900 rounded-[3rem] p-10 text-white space-y-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                        
                        <div className="space-y-2">
                            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em]">Proprietor Details</p>
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white font-bold text-xl border border-white/10 backdrop-blur-md">
                                    {hostel.owner?.firstName?.[0]}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold tracking-tight">{hostel.owner?.firstName} {hostel.owner?.lastName}</h3>
                                    <p className="text-xs text-gray-400">{hostel.owner?.email}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Phone</span>
                                <span className="text-xs font-medium">{hostel.whatsappNumber || "---"}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Onboarded</span>
                                <span className="text-xs font-medium">{new Date(hostel.owner?.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <Link 
                            href={`/admin/users/${hostel.ownerId}`}
                            className="w-full h-12 bg-white text-gray-900 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-400 hover:text-white transition-all mt-4"
                        >
                            View Proprietor Profile <ArrowUpRight size={14} />
                        </Link>
                    </div>

                    {/* Stats & Metadata */}
                    <div className="bg-white rounded-[3rem] border border-gray-100 p-10 space-y-10">
                        <div className="space-y-6">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                <Activity size={16} className="text-emerald-500" />
                                Asset Performance
                            </h3>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-2xl space-y-1">
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">Total Bookings</p>
                                    <p className="text-xl font-bold text-gray-900">{hostel._count?.bookings || 0}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl space-y-1">
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">Avg Rating</p>
                                    <p className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <Star size={16} className="fill-orange-400 text-orange-400" />
                                        {hostel.averageRating?.toFixed(1) || "N/A"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                <Info size={16} className="text-blue-500" />
                                Infrastructure Meta
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                        <Calendar size={14} />
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-bold text-gray-400 uppercase">Created On</p>
                                        <p className="text-[11px] font-bold text-gray-900">{new Date(hostel.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                        <Clock size={14} />
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-bold text-gray-400 uppercase">Last Registry Update</p>
                                        <p className="text-[11px] font-bold text-gray-900">{new Date(hostel.updatedAt).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button 
                            className="w-full h-14 bg-gray-50 text-gray-400 border border-dashed border-gray-200 rounded-2xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 cursor-not-allowed"
                        >
                            <Calendar size={18} />
                            View Audit History
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
