"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import RoomTypeCard from "@/components/hostels/RoomTypeCard";
import { useState } from "react";
import BookingModal from "@/components/bookings/BookingModal";
import ContentGate from "@/components/auth/ContentGate";
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
    Flame,
    Loader2,
    ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

// WhatsApp SVG icon (not in lucide-react)
function WhatsAppIcon({ size = 20, className = "", style }: { size?: number; className?: string; style?: React.CSSProperties }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="currentColor"
            className={className}
            style={style}
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
    );
}

// Build a wa.me link with encoded pre-filled message
function buildWhatsAppUrl(whatsappNumber: string, message: string): string {
    // Normalize Ghana number: strip leading 0, add country code 233
    const normalized = whatsappNumber.startsWith("0")
        ? `233${whatsappNumber.slice(1)}`
        : whatsappNumber.startsWith("+")
        ? whatsappNumber.slice(1)
        : whatsappNumber;
    return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

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

    const [isRedirecting, setIsRedirecting] = useState(false);

    const handleWhatsAppClick = (number: string, message: string) => {
        setIsRedirecting(true);
        const url = buildWhatsAppUrl(number, message);
        
        // Short delay to show the nice "Connecting" UI before the browser handles the redirect
        setTimeout(() => {
            window.open(url, '_blank', 'noopener,noreferrer');
            setIsRedirecting(false);
        }, 800);
    };

    if (isLoading) return (
        <div className="container px-6 py-40 flex flex-col items-center justify-center gap-6">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-[10px] animate-pulse">Loading hostel details...</p>
        </div>
    );

    if (isError || !hostel) return (
        <div className="container px-6 py-40 text-center space-y-6">
            <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto text-red-600 border border-red-100">
                <ShieldAlert size={40} />
            </div>
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-tight">Hostel Not Found</h1>
                <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">We couldn't find this hostel. It might have been removed or moved.</p>
            </div>
            <Link href="/hostels" className="inline-flex h-12 px-8 items-center bg-gray-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-black transition-all">
                Back to Hostels
            </Link>
        </div>
    );

    return (
        <div className="pb-32 bg-white">
            {/* Header / Gallery Section */}
            <section className="bg-white pt-8 pb-12 border-b border-gray-50">
                <div className="container px-6">
                    <div className="flex items-center justify-between mb-10">
                        <Link href="/hostels" className="flex items-center gap-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-all group">
                            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Hostels
                        </Link>
                        <div className="flex gap-4">
                            <button className="w-12 h-12 flex items-center justify-center bg-white rounded-xl border border-gray-100 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm"><Share2 size={18} /></button>
                            <button className="w-12 h-12 flex items-center justify-center bg-white rounded-xl border border-gray-100 hover:border-red-500 hover:text-red-600 transition-all shadow-sm"><Heart size={18} /></button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 md:gap-6 aspect-[4/3] md:aspect-[21/8]">
                        {/* Main Large Image */}
                        <div className="md:col-span-2 md:row-span-2 rounded-[2.5rem] overflow-hidden bg-gray-50 shadow-2xl border border-gray-100 group relative">
                            {hostel.images?.[0] ? (
                                <img src={hostel.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt={hostel.name} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-200"><Building2 size={64} /></div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                        </div>

                        {/* Top Middle */}
                        <div className="hidden md:block rounded-[2rem] overflow-hidden bg-gray-50 shadow-xl border border-gray-100 group">
                            {hostel.images?.[1] ? (
                                <img src={hostel.images[1]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt={hostel.name} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-200 bg-gray-50"><Star size={40} /></div>
                            )}
                        </div>

                        {/* Top Right */}
                        <div className="hidden md:block rounded-[2rem] overflow-hidden bg-gray-50 shadow-xl border border-gray-100 group">
                            {hostel.images?.[2] ? (
                                <img src={hostel.images[2]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt={hostel.name} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-200 bg-gray-50"><Star size={40} /></div>
                            )}
                        </div>

                        {/* Bottom Middle */}
                        <div className="hidden md:block rounded-[2rem] overflow-hidden bg-gray-50 shadow-xl border border-gray-100 group">
                            {hostel.images?.[3] ? (
                                <img src={hostel.images[3]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt={hostel.name} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-200 bg-gray-50"><Star size={40} /></div>
                            )}
                        </div>

                        {/* Bottom Right with Counter */}
                        <div className="hidden md:block rounded-[2rem] overflow-hidden bg-gray-50 relative shadow-xl border border-gray-100 group">
                            {hostel.images?.[4] ? (
                                <img src={hostel.images[4]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt={hostel.name} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-200 bg-gray-50"><Star size={40} /></div>
                            )}
                            {hostel.images?.length > 5 && (
                                <div className="absolute inset-0 bg-gray-900/60 flex items-center justify-center text-white font-bold text-lg backdrop-blur-[6px] uppercase tracking-widest border-2 border-white/20 rounded-[2rem]">
                                    +{hostel.images.length - 5} More
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="container px-6 -mt-12 overflow-visible z-10 relative">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12">
                    {/* Main Details */}
                    <div className="space-y-12">
                        <div className="bg-white rounded-3xl border border-gray-100 p-8 md:p-12 shadow-2xl shadow-gray-100/50">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-10 pb-10 border-b border-gray-50">
                                <div className="space-y-6">
                                    <div className="flex flex-wrap items-center gap-3">
                                        {hostel.university && (
                                            <span className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 border border-white/10 shadow-lg shadow-blue-500/10">
                                                <School size={12} /> {hostel.university}
                                            </span>
                                        )}
                                        {hostel.isVerifiedHostel ? (
                                            <span className="bg-gray-900 text-white px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 border border-white/10 shadow-lg">
                                                <ShieldCheck size={12} className="text-blue-500" /> HG Verified
                                            </span>
                                        ) : (
                                            <span className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 border border-emerald-100">
                                                <CheckCircle2 size={12} /> Authenticated
                                            </span>
                                        )}
                                        {hostel.virtualTourUrl && (
                                            <a
                                                href={hostel.virtualTourUrl}
                                                target="_blank"
                                                className="bg-violet-50 text-violet-600 px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 border border-violet-100 hover:bg-violet-100 transition-all shadow-sm"
                                            >
                                                <Waves size={12} /> 360° Portal
                                            </a>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tighter uppercase leading-tight">{hostel.name}</h1>
                                        <div className="flex items-center gap-3 text-gray-400 text-[11px] font-bold uppercase tracking-widest">
                                            <MapPin size={16} className="text-red-500" />
                                            <span>{hostel.addressLine}, {hostel.city}</span>
                                        </div>
                                    </div>
                                    {hostel.distanceToCampus && (
                                        <div className="inline-flex items-center gap-3 bg-blue-50 text-blue-700 px-5 py-2.5 rounded-xl border border-blue-100">
                                            <Clock size={14} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">{hostel.distanceToCampus} from KNUST Main Gate</span>
                                        </div>
                                    )}
                                </div>
                                <div className="text-right flex flex-col items-end shrink-0">
                                    <div className="px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 mb-4">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Rent Starts From</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-bold text-gray-900 tracking-tight">
                                                ₵{(hostel.minPrice ? hostel.minPrice / 100 : (hostel.rooms?.length ? Math.min(...hostel.rooms.map((r: any) => r.pricePerTerm)) / 100 : 0)).toLocaleString()}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase">/ Term</span>
                                        </div>
                                    </div>
                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Per Academic Year</p>
                                </div>
                            </div>

                            <div className="space-y-12">
                                <div className="space-y-4">
                                    <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3">
                                        <Info size={16} className="text-blue-500" /> Hostel Details
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed text-lg font-medium">
                                        {hostel.description || "No description provided for this hostel."}
                                    </p>
                                </div>

                                <div className="pt-10 border-t border-gray-50 space-y-8">
                                    <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3">
                                        <Star size={16} className="text-orange-400" /> Amenities
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {/* Core Utilities */}
                                        {hostel.utilitiesIncluded?.map((u: string) => {
                                            const utilMap: Record<string, { label: string, icon: any, color: string, bg: string, border: string }> = {
                                                'water': { label: 'Aqua Int.', icon: Droplets, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
                                                'light': { label: 'Energy Int.', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
                                                'gas': { label: 'Fuel Int.', icon: Flame, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
                                            };
                                            const data = utilMap[u.toLowerCase()] || { label: u, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' };
                                            return (
                                                <div key={u} className={cn("flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all group", data.bg, data.border)}>
                                                    <data.icon size={28} className={cn("transition-transform group-hover:scale-110", data.color)} />
                                                    <span className="text-[9px] font-bold uppercase tracking-widest text-gray-900">{data.label}</span>
                                                </div>
                                            );
                                        })}
                                        {/* Standard Amenities */}
                                        {hostel.amenities?.map((a: string) => {
                                            const Icon = AMENITY_ICONS[a] || Info;
                                            return (
                                                <div key={a} className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white border border-gray-100 hover:border-blue-500/20 hover:shadow-xl hover:shadow-blue-500/5 transition-all group">
                                                    <Icon size={28} className="text-gray-300 group-hover:text-blue-600 transition-all group-hover:scale-110" />
                                                    <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-gray-900">{a}</span>
                                                </div>
                                            );
                                        })}
                                        {(!hostel.amenities || hostel.amenities.length === 0) && (!hostel.utilitiesIncluded || hostel.utilitiesIncluded.length === 0) && (
                                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest col-span-4 py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center">No amenities listed.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Room Types Section */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <h2 className="text-3xl font-bold tracking-tighter uppercase text-gray-900">Room Types</h2>
                                <div className="h-0.5 grow bg-gray-50 rounded-xl" />
                            </div>
                            {hostel.rooms.length === 0 ? (
                                <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-24 text-center space-y-4">
                                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto text-gray-300">
                                        <Building2 size={32} />
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No rooms currently available.</p>
                                </div>
                            ) : (
                                <div className="grid gap-6">
                                    {hostel.rooms.map((r: any) => (
                                        <div key={r.id} className="group bg-white rounded-3xl border border-gray-100 p-8 flex flex-col md:flex-row gap-10 items-center shadow-sm hover:shadow-2xl hover:border-blue-500/10 transition-all duration-700">
                                            <div className="w-full md:w-52 aspect-square rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-300 relative overflow-hidden shrink-0">
                                                {r.images?.[0] ? <img src={r.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" /> : <Building2 size={40} />}
                                                <div className="absolute top-4 left-4">
                                                     <span className={cn(
                                                        "px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 border shadow-lg backdrop-blur-md",
                                                        r.gender === 'MALE' ? "bg-blue-600 text-white border-white/20" :
                                                            r.gender === 'FEMALE' ? "bg-pink-600 text-white border-white/20" :
                                                                "bg-gray-900 text-white border-white/10"
                                                    )}>
                                                        {r.gender === 'MALE' ? <User size={12} /> :
                                                            r.gender === 'FEMALE' ? <UserCheck size={12} /> :
                                                                <Users size={12} />}
                                                        {r.gender} Tier
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex-1 space-y-6 text-center md:text-left">
                                                <div className="space-y-2">
                                                    <h4 className="text-2xl font-bold tracking-tight uppercase text-gray-900">{r.name}</h4>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{r.roomConfiguration || `${r.capacity} People`}</p>
                                                </div>
                                                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                                    <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                                                        <Users className="text-gray-400" size={14} />
                                                        <span className="text-[9px] font-bold uppercase tracking-widest text-gray-600">
                                                            {r.capacity} Capacity
                                                        </span>
                                                    </div>
                                                    {r.availableSlots !== undefined && (
                                                        <div className={cn(
                                                            "flex items-center gap-2 px-4 py-2 rounded-xl border transition-all shadow-sm",
                                                            r.availableSlots <= 3 ? "bg-red-50 border-red-200 text-red-600" : "bg-emerald-50 border-emerald-200 text-emerald-600"
                                                        )}>
                                                            <div className={cn("w-1.5 h-1.5 rounded-full", r.availableSlots <= 3 ? "bg-red-500 animate-pulse" : "bg-emerald-500")} />
                                                            <span className="text-[9px] font-bold uppercase tracking-widest">
                                                                {r.availableSlots <= 0 ? "Full" : `${r.availableSlots} Left`}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {r.hasAC && (
                                                        <div className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl border border-white/10 shadow-lg shadow-blue-500/10">
                                                            <Wind size={14} />
                                                            <span className="text-[9px] font-bold uppercase tracking-widest">Cooling Active</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="md:w-64 text-center md:text-right space-y-6 bg-gray-50/50 p-6 rounded-2xl border border-gray-100/50">
                                                <ContentGate
                                                    message="Sign in to see pricing & book this room"
                                                    className="rounded-xl"
                                                >
                                                    <div className="space-y-1">
                                                        <div className="flex items-baseline justify-center md:justify-end gap-1">
                                                            <span className="text-3xl font-bold text-gray-900 tracking-tight">₵{(r.pricePerTerm / 100).toLocaleString()}</span>
                                                            <span className="text-[10px] text-gray-400 font-bold uppercase">/ Term</span>
                                                        </div>
                                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">Full Academic Year</p>
                                                    </div>
                                                    <div className="flex flex-col gap-3">
                                                        <button
                                                            onClick={() => onBook(r.id, r)}
                                                            className="w-full h-14 bg-gray-900 text-white rounded-xl font-bold uppercase tracking-[0.2em] text-[10px] shadow-xl hover:bg-black active:scale-95 transition-all"
                                                        >
                                                            Book Now
                                                        </button>

                                                        {hostel.whatsappNumber && (
                                                            <button
                                                                onClick={() => handleWhatsAppClick(
                                                                    hostel.whatsappNumber,
                                                                    `Hello! I'm interested in the ${r.name} at ${hostel.name} on HostelGH. Price: ₵${(r.pricePerTerm/100).toLocaleString()}. Please provide more details.`
                                                                )}
                                                                disabled={isRedirecting}
                                                                className="w-full h-12 flex items-center justify-center gap-2 rounded-xl font-bold uppercase tracking-[0.15em] text-[9px] transition-all active:scale-95 group border-2 disabled:opacity-50"
                                                                style={{
                                                                    borderColor: "#25D366",
                                                                    color: "#128C7E",
                                                                    background: "rgba(37,211,102,0.06)",
                                                                }}
                                                            >
                                                                {isRedirecting ? (
                                                                    <Loader2 size={16} className="animate-spin text-[#25D366]" />
                                                                ) : (
                                                                    <WhatsAppIcon size={16} className="group-hover:scale-110 transition-transform duration-300" style={{ color: "#25D366" }} />
                                                                )}
                                                                <span>{isRedirecting ? "Connecting..." : "Enquire on WhatsApp"}</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </ContentGate>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Reviews Section */}
                        <div className="pt-16 border-t border-gray-50">
                            <div className="flex items-center justify-between mb-10">
                                <h2 className="text-3xl font-bold tracking-tighter uppercase text-gray-900 flex items-center gap-4">
                                    <Star size={32} className="text-orange-400" />
                                    Student Reviews
                                </h2>
                            </div>
                            <div className="grid md:grid-cols-2 gap-8">
                                {hostel.reviews?.length > 0 ? (
                                    hostel.reviews.map((r: any) => (
                                        <div key={r.id} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:border-blue-500/10 transition-all group">
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/10 overflow-hidden group-hover:scale-110 transition-transform">
                                                    {r.tenant?.avatarUrl ? <img src={r.tenant.avatarUrl} className="w-full h-full object-cover" /> : r.tenant?.firstName?.[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 uppercase tracking-tight text-sm">{r.tenant?.firstName} {r.tenant?.lastName}</p>
                                                    <div className="flex gap-0.5 text-orange-400">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={12} className={i < r.rating ? "fill-current" : "text-gray-100"} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <span className="ml-auto text-[9px] font-bold text-gray-300 uppercase tracking-widest">{new Date(r.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-gray-500 text-sm leading-relaxed font-medium uppercase tracking-tight">" {r.comment} "</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-2 text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200 space-y-3">
                                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center mx-auto text-gray-200">
                                            <MessageCircle size={24} />
                                        </div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No reviews yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar / Quick Actions */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-3xl border border-gray-100 p-10 h-fit sticky top-24 shadow-2xl shadow-gray-100/50 space-y-10 group">
                            <div className="space-y-8">
                                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20 group-hover:scale-110 transition-transform">
                                    <Building2 size={32} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-bold text-2xl uppercase tracking-tighter text-gray-900">Book Now</h3>
                                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest leading-relaxed">Book through our trusted platform for automated room allocation.</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-6 h-6 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center border border-emerald-100">
                                                <CheckCircle2 size={14} />
                                            </div>
                                            <p className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">Verified Manager</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-6 h-6 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center border border-emerald-100">
                                                <CheckCircle2 size={14} />
                                            </div>
                                            <p className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">Secure Payments</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-6 h-6 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center border border-emerald-100">
                                                <CheckCircle2 size={14} />
                                            </div>
                                            <p className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">Fast Confirmation</p>
                                        </div>
                                    </div>

                                    <ContentGate message="Sign in to contact the hostel manager" className="rounded-2xl">
                                        {hostel.whatsappNumber && (
                                            <button
                                                onClick={() => handleWhatsAppClick(
                                                    hostel.whatsappNumber,
                                                    `Hello! I'm interested in booking at ${hostel.name} on HostelGH. Please provide more details about availability and pricing.`
                                                )}
                                                disabled={isRedirecting}
                                                className="w-full h-16 flex items-center justify-center gap-3 rounded-2xl font-bold uppercase tracking-[0.15em] text-[10px] shadow-xl transition-all active:scale-95 group disabled:opacity-80"
                                                style={{
                                                    background: isRedirecting ? "gray" : "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
                                                    boxShadow: "0 8px 24px rgba(37, 211, 102, 0.25)",
                                                    color: "#fff",
                                                }}
                                            >
                                                {isRedirecting ? (
                                                    <Loader2 size={22} className="animate-spin" />
                                                ) : (
                                                    <WhatsAppIcon size={22} className="group-hover:scale-110 transition-transform duration-300" />
                                                )}
                                                <span>{isRedirecting ? "Connecting..." : "Book via WhatsApp"}</span>
                                            </button>
                                        )}

                                        {hostel.whatsappNumber && (
                                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest text-center leading-relaxed">
                                                Chat directly with the manager for instant confirmation
                                            </p>
                                        )}
                                    </ContentGate>
                                </div>
                            </div>

                            <div className="pt-10 border-t border-gray-50 space-y-6">
                                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400">Authorized Personnel</p>
                                <div className="flex items-center gap-4 group/owner cursor-pointer">
                                    <div className="w-16 h-16 bg-gray-900 text-white rounded-xl flex items-center justify-center font-bold text-2xl shadow-xl overflow-hidden transition-transform group-hover/owner:scale-110 border border-white/10">
                                        {hostel.owner?.avatarUrl ? (
                                            <img src={hostel.owner.avatarUrl} alt="Owner" className="w-full h-full object-cover" />
                                        ) : (
                                            hostel.owner?.firstName?.[0] || 'X'
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-bold text-gray-900 tracking-tight uppercase leading-none text-sm group-hover/owner:text-blue-600 transition-colors">
                                            {hostel.owner?.firstName} {hostel.owner?.lastName}
                                        </p>
                                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Verified Hostel Manager</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 bg-gray-900 text-white rounded-2xl border border-white/5 space-y-3 relative overflow-hidden">
                                <div className="flex items-center gap-2 text-blue-400">
                                    <ShieldAlert size={14} />
                                    <span className="text-[9px] font-bold uppercase tracking-widest">Important Advice</span>
                                </div>
                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed relative z-10">
                                   Only make payments through our secure gateway. Direct bank transfers are not protected by our security policy.
                                </p>
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
                hostelName={hostel.name}
                roomId={bookingRoomId ?? ""}
                room={bookingRoom}
            />
        </div>
    );
}
