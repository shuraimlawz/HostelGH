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
    Clock
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

    async function onBook(roomId: string) {
        if (!user) {
            const ok = await open("login");
            if (!ok) return;
        }
        setBookingRoomId(roomId);
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
                                        <span className="bg-green-50 text-green-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-green-100">
                                            <CheckCircle2 size={12} /> Verified Listing
                                        </span>
                                    </div>
                                    <h1 className="text-4xl md:text-5xl font-black text-black tracking-tight mb-2">{hostel.name}</h1>
                                    <div className="flex items-center gap-2 text-gray-500 font-medium">
                                        <MapPin size={16} className="text-red-400" />
                                        <span>{hostel.addressLine}, {hostel.city}</span>
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
                                        <Star size={20} className="text-orange-400" /> Top Amenities
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        {hostel.amenities?.map((a: string) => {
                                            const Icon = AMENITY_ICONS[a] || Info;
                                            return (
                                                <div key={a} className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-gray-50 border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
                                                    <Icon size={28} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{a}</span>
                                                </div>
                                            );
                                        })}
                                        {(!hostel.amenities || hostel.amenities.length === 0) && <p className="text-gray-400 text-sm italic">Amenities not listed.</p>}
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
                                                <h4 className="text-2xl font-black tracking-tight uppercase">{r.name}</h4>
                                                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                                    <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                                                        <Users className="text-gray-400" size={16} />
                                                        <span className="text-xs font-bold uppercase tracking-widest">{r.capacity} Per Room</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                                                        <Clock className="text-gray-400" size={16} />
                                                        <span className="text-xs font-bold uppercase tracking-widest">Instant Booking</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="md:w-64 text-center md:text-right space-y-4">
                                                <div>
                                                    <p className="text-3xl font-black">₵{(r.pricePerTerm / 100).toLocaleString()}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Academic Year</p>
                                                </div>
                                                <button
                                                    onClick={() => onBook(r.id)}
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
                    </div>

                    {/* Sidebar / Quick Actions */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-[3rem] border p-8 h-fit sticky top-24 shadow-xl shadow-gray-200/20">
                            <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-200">
                                <Building2 size={32} />
                            </div>
                            <h3 className="font-bold text-2xl mb-2">Ready to move?</h3>
                            <p className="text-gray-500 mb-8 leading-relaxed font-medium">Select a room type to begin your reservation process. Your request will be sent directly to the owner.</p>

                            <div className="space-y-4 mb-8">
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

                            <div className="p-4 bg-gray-50 rounded-2xl border text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                                <span className="text-gray-800">NOTICE:</span> Only make payments via the platform's Paystack portal after your booking has been approved.
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <BookingModal
                open={!!bookingRoomId}
                onClose={() => setBookingRoomId(null)}
                hostelId={hostel.id}
                roomId={bookingRoomId ?? ""}
            />
        </div>
    );
}
