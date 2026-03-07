"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import RoomTypeCard from "@/components/hostels/RoomTypeCard";
import { useState } from "react";
import BookingModal from "@/components/bookings/BookingModal";
import { useAuth } from "@/lib/auth-context";
import { useAuthModal } from "@/components/auth/AuthModalProvider";
import {
    MapPin,
    School,
    Wifi,
    Wind,
    ShieldCheck,
    Star,
    Info,
    Share2,
    Heart,
    ChevronLeft,
    CheckCircle2,
    Utensils,
    Waves,
    Car,
    Coffee,
    Building2,
    Users,
    Clock,
    MessageCircle,
    UserCheck,
    User,
    Droplets,
    Zap,
    Flame
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const AMENITY_ICONS: Record<string, any> = {
    "WiFi": Wifi,
    "AC": Wind,
    "Laundry": Utensils,
    "Swimming Pool": Waves,
    "Parking": Car,
    "Security": ShieldCheck,
    "Study Room": Coffee,
    "Generator": Building2,
};

export default function HostelDetailsPage() {
    const params = useParams<{ id: string }>();
    const hostelId = params.id;

    const { open } = useAuthModal();
    const { user } = useAuth();

    const { data: hostel, isLoading, isError } = useQuery({
        queryKey: ["hostel", hostelId],
        queryFn: async () => {
            const res = await api.get(`/hostels/public/${hostelId}`);
            return res.data;
        },
        enabled: !!hostelId,
    });

    const [bookingRoomId, setBookingRoomId] = useState<string | null>(null);
    const [bookingRoom, setBookingRoom] = useState<any>(null);

    async function onBook(roomId: string, room: any) {
        if (!user) {
            const ok = await open("login");
            if (!ok) return;
        }
        setBookingRoomId(roomId);
        setBookingRoom(room);
    }

    if (isLoading) return (
        <div className="container px-6 py-20 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs animate-pulse">Loading property details...</p>
        </div>
    );

    if (isError || !hostel) return (
        <div className="container px-6 py-20 text-center">
            <h1 className="text-2xl font-bold text-red-600">Property not found</h1>
            <p className="text-gray-500 mt-2">The hostel you're looking for might have been removed or unpublished.</p>
            <Link href="/hostels" className="inline-block mt-6 text-blue-600 font-bold hover:underline">Back to listings</Link>
        </div>
    );

    return (
        <div className="pb-32">
            {/* Header / Gallery Section */}
            <section className="bg-gray-50 pt-8 pb-12">
                <div className="container px-6">
                    <div className="flex items-center justify-between mb-8">
                        <Link href="/hostels" className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors group">
                            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Back to results
                        </Link>
                        <div className="flex gap-2">
                            <button className="p-3 bg-white rounded-2xl border hover:bg-gray-50 transition-colors shadow-sm"><Share2 size={18} /></button>
                            <button className="p-3 bg-white rounded-2xl border hover:bg-gray-50 transition-colors shadow-sm text-red-500"><Heart size={18} /></button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 aspect-[21/9] md:aspect-[21/7]">
                        <div className="md:col-span-2 rounded-[2.5rem] overflow-hidden bg-gray-200 shadow-sm">
                            {hostel.images?.[0] ? (
                                <img src={hostel.images[0]} className="w-full h-full object-cover" alt={hostel.name} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400"><Building2 size={64} /></div>
                            )}
                        </div>
                        <div className="hidden md:block rounded-[2.5rem] overflow-hidden bg-gray-200 shadow-sm">
                            {hostel.images?.[1] ? (
                                <img src={hostel.images[1]} className="w-full h-full object-cover" alt={hostel.name} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-100"><Star size={48} /></div>
                            )}
                        </div>
                        <div className="hidden md:block rounded-[2.5rem] overflow-hidden bg-gray-200 relative shadow-sm">
                            {hostel.images?.[2] ? (
                                <img src={hostel.images[2]} className="w-full h-full object-cover" alt={hostel.name} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-100"><Star size={48} /></div>
                            )}
                            {hostel.images?.length > 3 && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-black text-xl backdrop-blur-[2px]">
                                    +{hostel.images.length - 3} More
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="container px-6 -mt-10 overflow-visible z-10 relative">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12">
                    {/* Main Details */}
                    <div className="space-y-12">
                        <div className="bg-white rounded-[3rem] border p-8 md:p-12 shadow-xl shadow-gray-200/20">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-8 border-b">
                                <div>
                                    <div className="flex items-center gap-3 mb-3">
                                        {hostel.university && (
                                            <span className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-blue-100">
                                                <School size={12} /> {hostel.university}
                                            </span>
                                        )}
                                        {hostel.isVerifiedHostel ? (
                                            <span className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-blue-400 shadow-sm">
                                                <CheckCircle2 size={12} /> Verified by HostelGH
                                            </span>
                                        ) : (
                                            <span className="bg-green-50 text-green-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-green-100">
                                                <CheckCircle2 size={12} /> Verified Listing
                                            </span>
                                        )}
                                        {hostel.virtualTourUrl && (
                                            <a
                                                href={hostel.virtualTourUrl}
                                                target="_blank"
                                                className="bg-purple-50 text-purple-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-purple-100 hover:bg-purple-100 transition-colors"
                                            >
                                                <Waves size={12} /> 360° Virtual Tour
                                            </a>
                                        )}
                                    </div>
                                    <h1 className="text-3xl font-black text-black tracking-tighter mb-2">{hostel.name}</h1>
                                    <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                                        <MapPin size={16} className="text-red-400" />
                                        <span>{hostel.addressLine}, {hostel.city}</span>
                                        {hostel.distanceToCampus && (
                                            <>
                                                <span className="text-gray-300">•</span>
                                                <span className="flex items-center gap-1 text-blue-600 font-bold uppercase text-[10px] tracking-widest bg-blue-50 px-2 py-0.5 rounded-md">
                                                    <Clock size={10} /> {hostel.distanceToCampus} from KNUST Main Gate
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Starting Price</p>
                                    <p className="text-3xl font-black text-black">
                                        ₵{(hostel.minPrice ? hostel.minPrice / 100 : (hostel.rooms?.length ? Math.min(...hostel.rooms.map((r: any) => r.pricePerTerm)) / 100 : 0)).toLocaleString()}
                                    </p>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">Per Academic Term</p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 uppercase tracking-tight">
                                        <Info size={20} className="text-blue-500" /> Description
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed text-lg font-light">
                                        {hostel.description || "No description provided for this property yet."}
                                    </p>
                                </div>

                                <div className="pt-8 border-t">
                                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2 uppercase tracking-tight">
                                        <Star size={20} className="text-orange-400" /> Top Amenities & Utilities
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        {/* Core Utilities */}
                                        {hostel.utilitiesIncluded?.map((u: string) => {
                                            const utilMap: Record<string, { label: string, icon: any, color: string }> = {
                                                'water': { label: 'Water Included', icon: Droplets, color: 'text-blue-500' },
                                                'light': { label: 'Light Included', icon: Zap, color: 'text-yellow-500' },
                                                'gas': { label: 'Gas Included', icon: Flame, color: 'text-orange-500' },
                                            };
                                            const data = utilMap[u.toLowerCase()] || { label: u, icon: CheckCircle2, color: 'text-green-500' };
                                            return (
                                                <div key={u} className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-blue-50/20 border border-blue-100/50 hover:border-blue-200 hover:bg-blue-50/50 transition-all group">
                                                    <data.icon size={28} className={cn("text-gray-400 group-hover:transition-colors", data.color)} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{data.label}</span>
                                                </div>
                                            );
                                        })}
                                        {/* Standard Amenities */}
                                        {hostel.amenities?.map((a: string) => {
                                            const Icon = AMENITY_ICONS[a] || Info;
                                            return (
                                                <div key={a} className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-gray-50 border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
                                                    <Icon size={28} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{a}</span>
                                                </div>
                                            );
                                        })}
                                        {(!hostel.amenities || hostel.amenities.length === 0) && (!hostel.utilitiesIncluded || hostel.utilitiesIncluded.length === 0) && (
                                            <p className="text-gray-400 text-sm italic">Amenities not listed.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Room Types Section */}
                        <div className="space-y-6">
                            <h2 className="text-3xl font-black tracking-tight flex items-center gap-3 decoration-blue-500 decoration-4 underline-offset-[12px]">
                                Available Room Types
                            </h2>
                            {hostel.rooms.length === 0 ? (
                                <div className="bg-white rounded-[2.5rem] border border-dashed p-20 text-center">
                                    <p className="text-gray-400 font-bold italic">No rooms currently available in this hostel.</p>
                                </div>
                            ) : (
                                <div className="grid gap-6">
                                    {hostel.rooms.map((r: any) => (
                                        <div key={r.id} className="group bg-white rounded-[2.5rem] border p-8 md:p-10 flex flex-col md:flex-row gap-8 items-center shadow-sm hover:shadow-xl transition-all duration-500">
                                            <div className="w-full md:w-48 aspect-square rounded-[2rem] bg-gray-50 border flex items-center justify-center text-gray-300 relative overflow-hidden">
                                                {r.images?.[0] ? <img src={r.images[0]} className="w-full h-full object-cover" /> : <Star size={40} />}
                                            </div>
                                            <div className="flex-1 space-y-4 text-center md:text-left">
                                                <div className="flex items-center justify-center md:justify-start gap-3">
                                                    <h4 className="text-2xl font-black tracking-tight uppercase">{r.name}</h4>
                                                    {r.gender && (
                                                        <span className={cn(
                                                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1",
                                                            r.gender === 'MALE' ? "bg-blue-50 text-blue-600 border border-blue-100" :
                                                                r.gender === 'FEMALE' ? "bg-pink-50 text-pink-600 border border-pink-100" :
                                                                    "bg-gray-50 text-gray-600 border border-gray-100"
                                                        )}>
                                                            {r.gender === 'MALE' ? <User size={10} /> :
                                                                r.gender === 'FEMALE' ? <UserCheck size={10} /> :
                                                                    <Users size={10} />}
                                                            {r.gender}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                                    <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                                                        <Users className="text-gray-400" size={16} />
                                                        <span className="text-xs font-bold uppercase tracking-widest">
                                                            {r.roomConfiguration || `${r.capacity} Per Room`}
                                                        </span>
                                                    </div>
                                                    {r.availableSlots !== undefined && (
                                                        <div className={cn(
                                                            "flex items-center gap-2 px-4 py-2 rounded-xl border transition-all",
                                                            r.availableSlots <= 3 ? "bg-red-50 border-red-100 text-red-600 animate-pulse" : "bg-green-50 border-green-100 text-green-600"
                                                        )}>
                                                            <div className={cn("w-2 h-2 rounded-full", r.availableSlots <= 3 ? "bg-red-500" : "bg-green-500")} />
                                                            <span className="text-xs font-black uppercase tracking-widest">
                                                                {r.availableSlots <= 0 ? "Full" : `${r.availableSlots} Slots Left`}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {r.hasAC && (
                                                        <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 text-blue-600">
                                                            <Wind size={16} />
                                                            <span className="text-xs font-bold uppercase tracking-widest">A/C Included</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="md:w-64 text-center md:text-right space-y-4">
                                                <div>
                                                    <p className="text-3xl font-black">₵{(r.pricePerTerm / 100).toLocaleString()}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Academic Year</p>
                                                </div>
                                                <button
                                                    onClick={() => onBook(r.id, r)}
                                                    className="w-full bg-black text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-black/10 hover:opacity-90 active:scale-95 transition-all"
                                                >
                                                    Select Room
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Reviews Section */}
                        <div className="pt-12 border-t">
                            <h2 className="text-3xl font-black tracking-tight mb-8 flex items-center gap-3">
                                <Star size={28} className="text-orange-400" />
                                Guest Reviews
                            </h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                {hostel.reviews?.length > 0 ? (
                                    hostel.reviews.map((r: any) => (
                                        <div key={r.id} className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                                    {r.tenant?.avatarUrl ? <img src={r.tenant.avatarUrl} className="rounded-full" /> : r.tenant?.firstName?.[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm tracking-tight">{r.tenant?.firstName}</p>
                                                    <div className="flex text-orange-400">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={10} className={i < r.rating ? "fill-current" : "text-gray-300"} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <span className="ml-auto text-[10px] font-bold text-gray-400 uppercase">{new Date(r.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-gray-600 text-sm leading-relaxed">{r.comment}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-2 text-center py-12 bg-gray-50 rounded-[2.5rem] border border-dashed text-gray-400 font-bold italic">
                                        No reviews yet. Be the first to stay and review!
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar / Quick Actions */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-[3rem] border p-8 h-fit sticky top-24 shadow-xl shadow-gray-200/20">
                            <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-200">
                                <Building2 size={32} />
                            </div>
                            <h3 className="font-bold text-2xl mb-2">Ready to move?</h3>
                            <p className="text-gray-500 mb-8 leading-relaxed font-medium">Select a room type to begin your reservation process or contact the owner directly for inquiries.</p>

                            <div className="space-y-4 mb-8">
                                {hostel.whatsappNumber && (
                                    <a
                                        href={`https://wa.me/233${hostel.whatsappNumber.replace(/^0/, '')}?text=Hi, I'm interested in ${hostel.name} on HostelGH. Is there availability?`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full bg-[#25D366] text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-green-500/20 hover:bg-[#128C7E] transition-all flex items-center justify-center gap-2"
                                    >
                                        <MessageCircle size={18} />
                                        Chat via WhatsApp
                                    </a>
                                )}
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 w-5 h-5 bg-green-50 rounded-full flex items-center justify-center text-green-600 shrink-0">
                                        <CheckCircle2 size={12} />
                                    </div>
                                    <p className="text-xs font-bold text-gray-600">Verified Ownership</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 w-5 h-5 bg-green-50 rounded-full flex items-center justify-center text-green-600 shrink-0">
                                        <CheckCircle2 size={12} />
                                    </div>
                                    <p className="text-xs font-bold text-gray-600">Secure Payment Support</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 w-5 h-5 bg-green-50 rounded-full flex items-center justify-center text-green-600 shrink-0">
                                        <CheckCircle2 size={12} />
                                    </div>
                                    <p className="text-xs font-bold text-gray-600">Instant Confirmations</p>
                                </div>
                            </div>

                            <div className="pt-8 border-t space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Property Manager</p>
                                <div className="flex items-center gap-4 group/owner cursor-pointer">
                                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black text-xl shadow-lg shadow-blue-50 overflow-hidden transition-transform group-hover/owner:scale-110">
                                        {hostel.owner?.avatarUrl ? (
                                            <img src={hostel.owner.avatarUrl} alt="Owner" className="w-full h-full object-cover" />
                                        ) : (
                                            hostel.owner?.firstName?.[0] || 'O'
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-black text-gray-950 italic tracking-tight uppercase leading-none mb-1 group-hover/owner:text-blue-600 transition-colors">
                                            {hostel.owner?.firstName} {hostel.owner?.lastName}
                                        </p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">HostelGH Verified Partner</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 p-4 bg-gray-50 rounded-2xl border text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                                <span className="text-gray-800">NOTICE:</span> Only make payments via the platform's Paystack portal after your booking has been approved.
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <BookingModal
                open={!!bookingRoomId}
                onClose={() => {
                    setBookingRoomId(null);
                    setBookingRoom(null);
                }}
                hostelId={hostel.id}
                roomId={bookingRoomId ?? ""}
                room={bookingRoom}
            />
        </div>
    );
}
