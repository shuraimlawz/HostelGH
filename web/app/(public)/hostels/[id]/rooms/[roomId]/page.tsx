"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useAuthModal } from "@/components/auth/AuthModalProvider";
import {
    MapPin,
    Wind,
    ShieldCheck,
    Info,
    ChevronLeft,
    CheckCircle2,
    Users,
    Clock,
    MessageCircle,
    UserCheck,
    User,
    Building2,
    ArrowRight,
    Loader2,
    Sparkles,
    ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import BookingModal from "@/components/bookings/BookingModal";
import ContentGate from "@/components/auth/ContentGate";

// WhatsApp SVG icon
function WhatsAppIcon({ size = 20, className = "" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
    );
}

function buildWhatsAppUrl(whatsappNumber: string, message: string): string {
    const normalized = whatsappNumber.startsWith("0") ? `233${whatsappNumber.slice(1)}` : whatsappNumber.startsWith("+") ? whatsappNumber.slice(1) : whatsappNumber;
    return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export default function RoomDetailPage() {
    const params = useParams<{ id: string, roomId: string }>();
    const { id: hostelId, roomId } = params;
    const router = useRouter();
    const { user } = useAuth();
    const { open } = useAuthModal();
    const [selectedImage, setSelectedImage] = useState(0);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

    const { data: room, isLoading, isError } = useQuery({
        queryKey: ["room", roomId],
        queryFn: async () => {
            const res = await api.get(`/rooms/${roomId}`);
            return res.data;
        },
        enabled: !!roomId,
    });

    const { data: myBookings } = useQuery({
        queryKey: ["my-bookings"],
        queryFn: async () => {
            const res = await api.get("/bookings/me");
            return res.data;
        },
        enabled: !!user,
    });

    const hasBooking = myBookings?.some((b: any) => b.hostelId === hostelId && (b.status === 'PAYMENT_SECURED' || b.status === 'APPROVED' || b.status === 'RESERVED' || b.status === 'COMPLETED'));

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading Room Profile...</p>
            </div>
        </div>
    );

    if (isError || !room) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
            <div className="max-w-md w-full bg-white rounded-[2.5rem] p-12 text-center space-y-6 border border-gray-100 shadow-xl">
                <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto">
                    <ShieldAlert size={40} />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">Room Not Found</h2>
                    <p className="text-sm text-gray-400 font-medium">This room listing might have been removed or is currently unavailable.</p>
                </div>
                <button onClick={() => router.back()} className="w-full h-14 bg-gray-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg">
                    Return to Hostel
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white">
            {/* Header / Nav */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-50 px-6 py-4 flex items-center justify-between">
                <button onClick={() => router.back()} className="flex items-center gap-3 text-gray-400 hover:text-gray-900 transition-colors group">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-gray-900 group-hover:text-white transition-all shadow-sm">
                        <ChevronLeft size={20} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Back to {room.hostel.name}</span>
                </button>
                <div className="flex items-center gap-3">
                    <div className="hidden md:flex flex-col items-end">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Pricing From</p>
                        <p className="text-lg font-bold text-gray-900 tracking-tighter uppercase leading-none">₵{(room.pricePerTerm / 100).toLocaleString()} <span className="text-[10px] text-gray-400">/ Term</span></p>
                    </div>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-6 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-16">
                {/* Left: Gallery & Main Info */}
                <div className="lg:col-span-8 space-y-12">
                    {/* Gallery */}
                    <div className="space-y-6">
                        <div className="aspect-[16/10] bg-gray-50 rounded-[3rem] overflow-hidden border border-gray-100 shadow-2xl relative group">
                            {room.images?.[selectedImage] ? (
                                <img src={room.images[selectedImage]} alt={room.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-200">
                                    <Building2 size={80} strokeWidth={1} />
                                    <p className="text-[10px] font-bold uppercase tracking-widest mt-4">No Interior Views Available</p>
                                </div>
                            )}
                            <div className="absolute top-8 left-8 flex gap-3">
                                <span className={cn(
                                    "px-5 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 border shadow-2xl backdrop-blur-md",
                                    room.gender === 'MALE' ? "bg-blue-600/90 text-white border-white/20" :
                                        room.gender === 'FEMALE' ? "bg-pink-600/90 text-white border-white/20" :
                                            "bg-gray-900/90 text-white border-white/10"
                                )}>
                                    {room.gender === 'MALE' ? <User size={14} /> : room.gender === 'FEMALE' ? <UserCheck size={14} /> : <Users size={14} />}
                                    {room.gender} Exclusive
                                </span>
                            </div>
                        </div>

                        {room.images?.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                {room.images.map((img: string, idx: number) => (
                                    <button 
                                        key={idx} 
                                        onClick={() => setSelectedImage(idx)}
                                        className={cn(
                                            "w-32 aspect-square rounded-2xl overflow-hidden border-2 transition-all shrink-0 shadow-sm",
                                            selectedImage === idx ? "border-blue-600 scale-95" : "border-transparent opacity-60 hover:opacity-100"
                                        )}
                                    >
                                        <img src={img} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Room Details */}
                    <div className="space-y-12">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-blue-600">
                                <Sparkles size={20} />
                                <span className="text-[11px] font-bold uppercase tracking-[0.3em]">Premium Room Listing</span>
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 tracking-tighter uppercase leading-[0.9]">{room.name}</h1>
                            <div className="flex flex-wrap items-center gap-6 pt-4">
                                <div className="flex items-center gap-3 bg-gray-50 px-6 py-3 rounded-2xl border border-gray-100">
                                    <Users size={18} className="text-gray-400" />
                                    <span className="text-xs font-bold text-gray-900 uppercase tracking-tight">{room.capacity} Student Capacity</span>
                                </div>
                                <div className="flex items-center gap-3 bg-gray-50 px-6 py-3 rounded-2xl border border-gray-100">
                                    <Clock size={18} className="text-gray-400" />
                                    <span className="text-xs font-bold text-gray-900 uppercase tracking-tight">{room.roomConfiguration || "Standard Layout"}</span>
                                </div>
                                {room.hasAC && (
                                    <div className="flex items-center gap-3 bg-blue-50 text-blue-600 px-6 py-3 rounded-2xl border border-blue-100">
                                        <Wind size={18} />
                                        <span className="text-xs font-bold uppercase tracking-tight">Full AC System</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3">
                                <Info size={16} className="text-blue-500" /> Room Description
                            </h3>
                            <p className="text-gray-600 text-xl leading-relaxed font-medium max-w-3xl">
                                {room.description || `A comfortable ${room.capacity}-person room at ${room.hostel.name}, perfectly situated for easy access to campus activities and academic facilities.`}
                            </p>
                        </div>

                        <div className="pt-12 border-t border-gray-50 grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.3em]">Included Utilities</h3>
                                <div className="grid gap-4">
                                    {room.utilitiesIncluded?.map((u: string) => (
                                        <div key={u} className="flex items-center gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-emerald-200 transition-colors">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                                                <CheckCircle2 size={20} />
                                            </div>
                                            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-900">{u}</span>
                                        </div>
                                    )) || <p className="text-xs text-gray-400 font-medium italic">Standard utilities apply.</p>}
                                </div>
                            </div>
                            <div className="space-y-6">
                                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.3em]">Hostel Location</h3>
                                <div className="p-8 bg-gray-900 rounded-[2.5rem] text-white space-y-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
                                    <MapPin size={32} className="text-blue-400" />
                                    <div className="space-y-2 relative z-10">
                                        <p className="text-lg font-bold tracking-tight leading-snug">{room.hostel.addressLine}</p>
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{room.hostel.city}</p>
                                    </div>
                                    <div className="pt-6 border-t border-white/5 flex items-center gap-3 text-blue-400 relative z-10">
                                        <Clock size={16} />
                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{room.hostel.distanceToCampus || "Near campus gate"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Booking Sidebar */}
                <div className="lg:col-span-4">
                    <div className="sticky top-28 space-y-8">
                        <div className="bg-white rounded-[3rem] border border-gray-100 p-10 shadow-2xl shadow-gray-200/50 space-y-10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-125 transition-transform duration-1000" />
                            
                            <div className="space-y-8 relative z-10">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                                        <Building2 size={16} />
                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Live Pricing</span>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-6xl font-bold text-gray-900 tracking-tighter uppercase leading-none">₵{(room.pricePerTerm / 100).toLocaleString()}</span>
                                        <span className="text-xs font-bold text-gray-400 uppercase">/ Term</span>
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pt-2 flex items-center gap-2">
                                        <CheckCircle2 size={12} className="text-emerald-500" /> Academic Year 2024/2025
                                    </p>
                                </div>

                                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Availability</span>
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-[9px] font-bold uppercase",
                                            room.availableSlots > 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                                        )}>
                                            {room.availableSlots > 0 ? 'Active Slots' : 'Full'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div 
                                                className={cn("h-full transition-all duration-1000", room.availableSlots > 0 ? "bg-emerald-500" : "bg-red-500")}
                                                style={{ width: `${(room.availableSlots / room.totalSlots) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-bold text-gray-900">{room.availableSlots} / {room.totalSlots}</span>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4">
                                    <ContentGate message="Sign in to book this room" className="rounded-3xl">
                                        {room.availableSlots > 0 ? (
                                            <>
                                                <button 
                                                    onClick={() => setIsBookingModalOpen(true)}
                                                    className="w-full h-16 bg-gray-900 text-white rounded-[1.5rem] font-bold text-xs uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-3"
                                                >
                                                    Reserve This Room
                                                    <ArrowRight size={18} />
                                                </button>
                                                <BookingModal 
                                                    open={isBookingModalOpen}
                                                    onClose={() => setIsBookingModalOpen(false)}
                                                    hostelId={hostelId} 
                                                    roomId={roomId}
                                                    room={room}
                                                    hostelName={room.hostel.name}
                                                />
                                            </>
                                        ) : (
                                            <button disabled className="w-full h-16 bg-gray-100 text-gray-400 rounded-[1.5rem] font-bold text-xs uppercase tracking-[0.2em] cursor-not-allowed">
                                                No Slots Available
                                            </button>
                                        )}
                                    </ContentGate>

                                    {room.hostel.whatsappNumber && (
                                        <ContentGate message="Sign in to contact manager" className="rounded-3xl">
                                            <a 
                                                href={buildWhatsAppUrl(
                                                    room.hostel.whatsappNumber, 
                                                    hasBooking 
                                                        ? `Hello, I have a confirmed booking for ${room.name} at ${room.hostel.name}. I'd like to discuss check-in details.` 
                                                        : `Hello, I'm interested in the ${room.name} room at ${room.hostel.name} I saw on HostelGH.`
                                                )}
                                                target="_blank"
                                                className={cn(
                                                    "w-full h-16 rounded-[1.5rem] font-bold text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 border shadow-sm",
                                                    hasBooking 
                                                        ? "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100" 
                                                        : "bg-white text-gray-900 border-gray-100 hover:bg-gray-50"
                                                )}
                                            >
                                                <WhatsAppIcon size={18} />
                                                {hasBooking ? "Chat with Manager" : "Inquire via WhatsApp"}
                                            </a>
                                        </ContentGate>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Platform Trust & Safety (Room Context) */}
                        <div className="bg-gray-50 rounded-[2.5rem] p-8 border border-gray-100 space-y-6">
                            <div className="flex items-center gap-3 text-blue-600">
                                <ShieldCheck size={20} />
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Platform Guarantee</span>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-5 h-5 bg-white rounded-md border border-gray-200 flex items-center justify-center shrink-0 mt-0.5">
                                        <CheckCircle2 size={12} className="text-emerald-500" />
                                    </div>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight leading-relaxed">Verified by HostelGH Inspectors</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-5 h-5 bg-white rounded-md border border-gray-200 flex items-center justify-center shrink-0 mt-0.5">
                                        <CheckCircle2 size={12} className="text-emerald-500" />
                                    </div>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight leading-relaxed">Secure Escrow Payment Protection</p>
                                </div>
                            </div>
                        </div>

                        {/* Manager Info Card */}
                        <div className="bg-gray-50 rounded-[2.5rem] p-8 border border-gray-100 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-white rounded-2xl border border-gray-200 flex items-center justify-center text-xl font-bold shadow-sm overflow-hidden">
                                    {room.hostel.owner.avatarUrl ? (
                                        <img src={room.hostel.owner.avatarUrl} className="w-full h-full object-cover" />
                                    ) : room.hostel.owner.firstName?.[0]}
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Listed By</p>
                                    <h4 className="font-bold text-gray-900 uppercase tracking-tight">{room.hostel.owner.firstName} {room.hostel.owner.lastName}</h4>
                                    {room.hostel.owner.isVerified && (
                                        <div className="flex items-center gap-1.5 text-emerald-600">
                                            <ShieldCheck size={12} />
                                            <span className="text-[9px] font-bold uppercase tracking-widest">Verified Partner</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="pt-4 border-t border-gray-200/50 grid grid-cols-2 gap-4">
                                <div className="text-center p-3 bg-white rounded-xl border border-gray-100">
                                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Response</p>
                                    <p className="text-[10px] font-bold text-gray-900 uppercase">&lt; 2 Hours</p>
                                </div>
                                <div className="text-center p-3 bg-white rounded-xl border border-gray-100">
                                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Trust Score</p>
                                    <p className="text-[10px] font-bold text-gray-900 uppercase">9.8/10</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
