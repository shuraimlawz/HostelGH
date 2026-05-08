"use client";
/* eslint-disable @next/next/no-img-element */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { useState } from "react";
import ContentGate from "@/components/auth/ContentGate";
import { useAuth } from "@/lib/auth-context";
import { useAuthModal } from "@/components/auth/AuthModalProvider";
import { toast } from "sonner";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { ReviewAnalytics } from "@/components/reviews/ReviewAnalytics";
import dynamic from "next/dynamic";
import {
    Share,
    Heart,
    Star,
    ShieldCheck,
    Wind,
    Utensils,
    Waves,
    Car,
    Coffee,
    Building2,
    Users,
    Clock,
    UserCheck,
    User,
    Droplets,
    Zap,
    Flame,
    Info,
    ChevronLeft,
    CheckCircle2,
    MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const HostelMap = dynamic(() => import("@/components/common/HostelMap"), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full bg-gray-100 animate-pulse rounded-2xl"></div>
    ),
});

const AMENITY_ICONS: Record<string, any> = {
    "WiFi": Zap,
    "AC": Wind,
    "Laundry": Utensils,
    "Swimming Pool": Waves,
    "Parking": Car,
    "Security": ShieldCheck,
    "Study Room": Coffee,
    "Generator": Building2,
};

export default function HostelDetailsClient() {
    const params = useParams<{ id: string }>();
    const hostelId = params.id;
    const { open } = useAuthModal();
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { data: hostel, isLoading, isError } = useQuery({
        queryKey: ["hostel", hostelId],
        queryFn: async () => {
            const res = await api.get(`/hostels/public/${hostelId}`);
            return res.data;
        },
        enabled: !!hostelId,
    });

    const { data: favoriteStatus } = useQuery({
        queryKey: ["favorite-status", hostelId],
        queryFn: async () => {
            if (!user) return { favorited: false };
            const res = await api.get(`/favorites/${hostelId}/status`);
            return res.data;
        },
        enabled: !!hostelId && !!user,
    });

    const toggleFavorite = useMutation({
        mutationFn: async () => {
            if (!user) {
                const ok = await open("login");
                if (!ok) throw new Error("Unauthorized");
            }
            return api.post(`/favorites/${hostelId}`);
        },
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ["favorite-status", hostelId] });
            toast.success(res.data.favorited ? "Saved to favorites" : "Removed from favorites");
        },
    });

    const handleShare = () => {
        const url = window.location.href;
        if (navigator.share) {
            navigator.share({
                title: hostel?.name,
                text: `Check out this hostel: ${hostel?.name}`,
                url: url,
            });
        } else {
            navigator.clipboard.writeText(url);
            toast.success("Link copied to clipboard!");
        }
    };

    if (isLoading) return (
        <div className="container mx-auto px-4 md:px-10 py-10 max-w-7xl">
            <div className="animate-pulse space-y-6">
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-[50vh] bg-gray-200 rounded-xl"></div>
            </div>
        </div>
    );

    if (isError || !hostel) return (
        <div className="container mx-auto px-4 py-40 text-center max-w-xl">
            <h1 className="text-2xl font-semibold mb-4">Hostel Not Found</h1>
            <p className="text-gray-500 mb-8">We couldn't find this hostel. It might have been removed.</p>
            <Link href="/hostels" className="px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-black transition">
                Back to search
            </Link>
        </div>
    );

    const minPrice = hostel.minPrice ? hostel.minPrice / 100 : (hostel.rooms?.length ? Math.min(...hostel.rooms.map((r: any) => r.pricePerTerm)) / 100 : 0);

    return (
        <div className="bg-white pb-32 pt-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
                {/* Title and Top Actions */}
                <div className="mb-6">
                    <h1 className="text-[26px] font-semibold text-gray-900 leading-tight mb-2">
                        {hostel.name}
                    </h1>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-[15px] text-gray-900 font-medium">
                            <span className="flex items-center gap-1">
                                <Star size={14} className="fill-current" />
                                {hostel.averageRating?.toFixed(2) || "New"}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="underline cursor-pointer">{hostel.totalReviews || 0} reviews</span>
                            <span className="text-gray-400">•</span>
                            <span className="underline cursor-pointer">{hostel.city}, Ghana</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm font-medium underline">
                            <button onClick={handleShare} className="flex items-center gap-2 hover:bg-gray-50 px-2 py-1.5 rounded-lg transition-colors">
                                <Share size={16} /> Share
                            </button>
                            <button onClick={() => toggleFavorite.mutate()} className="flex items-center gap-2 hover:bg-gray-50 px-2 py-1.5 rounded-lg transition-colors">
                                <Heart size={16} className={favoriteStatus?.favorited ? "fill-red-500 text-red-500" : ""} /> 
                                {favoriteStatus?.favorited ? "Saved" : "Save"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bento Grid Photo Gallery */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 h-[300px] md:h-[400px] lg:h-[500px] rounded-2xl overflow-hidden relative group">
                    <div className="h-full w-full bg-gray-200 cursor-pointer hover:opacity-90 transition-opacity">
                        {hostel.images?.[0] ? (
                            <img src={hostel.images[0]} className="w-full h-full object-cover" alt="Main image" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400"><Building2 size={48} /></div>
                        )}
                    </div>
                    <div className="hidden md:grid grid-cols-2 grid-rows-2 gap-2 h-full">
                        {[1, 2, 3, 4].map((index) => (
                            <div key={index} className="w-full h-full bg-gray-200 cursor-pointer hover:opacity-90 transition-opacity">
                                {hostel.images?.[index] ? (
                                    <img src={hostel.images[index]} className="w-full h-full object-cover" alt={`Gallery ${index}`} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400"><Building2 size={24} /></div>
                                )}
                            </div>
                        ))}
                    </div>
                    {hostel.images?.length > 0 && (
                        <button className="absolute bottom-6 right-6 px-4 py-1.5 bg-white border border-black rounded-lg text-[14px] font-semibold flex items-center gap-2 hover:bg-gray-50 transition shadow-sm">
                            <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" style={{display:"block",height:"16px",width:"16px",fill:"currentColor"}}><path d="M3 3h2v2H3V3zm4 0h2v2H7V3zm4 0h2v2h-2V3zM3 7h2v2H3V7zm4 0h2v2H7V7zm4 0h2v2h-2V7zM3 11h2v2H3v-2zm4 0h2v2H7v-2zm4 0h2v2h-2v-2z"></path></svg>
                            Show all photos
                        </button>
                    )}
                </div>

                {/* Main Content Area */}
                <div className="mt-12 flex flex-col lg:flex-row gap-12 lg:gap-24">
                    
                    {/* Left Column (Details) */}
                    <div className="flex-1 w-full max-w-3xl">
                        {/* Subtitle & Stats */}
                        <div className="pb-6 border-b border-gray-200">
                            <h2 className="text-[22px] font-semibold text-gray-900 mb-1">
                                Entire accommodation in {hostel.city}, Ghana
                            </h2>
                            <p className="text-[15px] text-gray-900 mb-4">
                                {hostel.rooms?.reduce((acc: number, r: any) => acc + r.capacity, 0) || "Multiple"} guests • {hostel.rooms?.length || 1} bedrooms • Multiple baths
                            </p>
                            <div className="flex items-center gap-1 text-[15px] font-semibold">
                                <Star size={14} className="fill-current" />
                                {hostel.averageRating?.toFixed(2) || "New"} • <span className="underline">{hostel.totalReviews || 0} reviews</span>
                            </div>
                        </div>

                        {/* Host Profile Block */}
                        <div className="py-6 border-b border-gray-200 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden shrink-0 flex items-center justify-center font-bold text-gray-500">
                                {hostel.owner?.avatarUrl ? (
                                    <img src={hostel.owner.avatarUrl} className="w-full h-full object-cover" alt="Host" />
                                ) : (
                                    hostel.owner?.firstName?.[0]?.toUpperCase() || "H"
                                )}
                            </div>
                            <div>
                                <h3 className="text-[16px] font-semibold text-gray-900">Hosted by {hostel.owner?.firstName} {hostel.owner?.lastName}</h3>
                                <p className="text-[14px] text-gray-500">{hostel.owner?.isVerified ? "Superhost • Verified" : "Host"}</p>
                            </div>
                        </div>

                        {/* Features List */}
                        <div className="py-8 border-b border-gray-200 space-y-6">
                            <div className="flex gap-4">
                                <ShieldCheck size={28} className="text-gray-900 shrink-0" strokeWidth={1.5} />
                                <div>
                                    <h4 className="text-[16px] font-semibold text-gray-900">Verified Listing</h4>
                                    <p className="text-[14px] text-gray-500 text-gray-500 mt-1">This hostel has been physically verified by our team.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <Wind size={28} className="text-gray-900 shrink-0" strokeWidth={1.5} />
                                <div>
                                    <h4 className="text-[16px] font-semibold text-gray-900">Designed for staying cool</h4>
                                    <p className="text-[14px] text-gray-500 mt-1">Beat the heat with air conditioning options and ceiling fans.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <Car size={28} className="text-gray-900 shrink-0" strokeWidth={1.5} />
                                <div>
                                    <h4 className="text-[16px] font-semibold text-gray-900">Park for free</h4>
                                    <p className="text-[14px] text-gray-500 mt-1">This is one of the few places in the area with free parking.</p>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="py-8 border-b border-gray-200">
                            <div className="text-[16px] text-gray-900 leading-relaxed max-w-2xl whitespace-pre-line">
                                {hostel.description || "Experience comfortable student living in this well-appointed hostel. Conveniently located and designed with students in mind."}
                            </div>
                            <button className="mt-4 font-semibold underline text-[16px]">Show more &gt;</button>
                        </div>

                        {/* Rooms (Where you'll sleep) */}
                        <div className="py-12 border-b border-gray-200">
                            <h3 className="text-[22px] font-semibold text-gray-900 mb-6">Where you'll sleep</h3>
                            <div className="flex overflow-x-auto gap-4 pb-4 snap-x">
                                {hostel.rooms?.map((room: any, idx: number) => (
                                    <div key={room.id} className="min-w-[200px] w-[200px] sm:min-w-[300px] sm:w-[300px] shrink-0 snap-start">
                                        <div className="aspect-[4/3] bg-gray-200 rounded-xl mb-4 overflow-hidden">
                                            {room.images?.[0] ? (
                                                <img src={room.images[0]} className="w-full h-full object-cover" alt="Room" />
                                            ) : (
                                                <div className="w-full h-full flex justify-center items-center text-gray-400"><Building2 size={32} /></div>
                                            )}
                                        </div>
                                        <h4 className="text-[16px] font-semibold text-gray-900">{room.name}</h4>
                                        <p className="text-[14px] text-gray-500 mt-1">{room.capacity} beds • {room.gender} Tier</p>
                                    </div>
                                ))}
                                {(!hostel.rooms || hostel.rooms.length === 0) && (
                                    <div className="text-gray-500">Room details are currently unavailable.</div>
                                )}
                            </div>
                        </div>

                        {/* What this place offers (Amenities) */}
                        <div className="py-12 border-b border-gray-200">
                            <h3 className="text-[22px] font-semibold text-gray-900 mb-6">What this place offers</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-[16px] text-gray-900">
                                {hostel.amenities?.slice(0, 10).map((amenity: string) => {
                                    const Icon = AMENITY_ICONS[amenity] || CheckCircle2;
                                    return (
                                        <div key={amenity} className="flex items-center gap-4">
                                            <Icon size={24} strokeWidth={1.5} className="shrink-0" />
                                            <span className="truncate">{amenity}</span>
                                        </div>
                                    );
                                })}
                                {hostel.utilitiesIncluded?.slice(0, 5).map((util: string) => (
                                    <div key={util} className="flex items-center gap-4">
                                        <CheckCircle2 size={24} strokeWidth={1.5} className="shrink-0" />
                                        <span className="truncate">{util} Included</span>
                                    </div>
                                ))}
                            </div>
                            <button className="mt-8 px-6 py-3 border border-black rounded-lg text-[16px] font-semibold hover:bg-gray-50 transition">
                                Show all amenities
                            </button>
                        </div>
                    </div>

                    {/* Right Column (Sticky Booking Widget) */}
                    <div className="w-full lg:w-[33.333%] lg:max-w-[400px]">
                        <div className="sticky top-28 bg-white border border-gray-200 rounded-xl p-6 shadow-xl shadow-gray-200/50">
                            <div className="flex items-end justify-between mb-6">
                                <div className="text-[22px] font-semibold text-gray-900">
                                    ₵{minPrice.toLocaleString()} <span className="text-[16px] font-normal text-gray-500">for 1 term</span>
                                </div>
                            </div>
                            
                            <div className="border border-gray-400 rounded-lg overflow-hidden mb-4">
                                <div className="flex border-b border-gray-400">
                                    <div className="w-1/2 p-3 border-r border-gray-400">
                                        <div className="text-[10px] font-bold uppercase">Check-in</div>
                                        <div className="text-[14px]">Add date</div>
                                    </div>
                                    <div className="w-1/2 p-3">
                                        <div className="text-[10px] font-bold uppercase">Checkout</div>
                                        <div className="text-[14px]">Add date</div>
                                    </div>
                                </div>
                                <div className="p-3 flex justify-between items-center cursor-pointer">
                                    <div>
                                        <div className="text-[10px] font-bold uppercase">Guests</div>
                                        <div className="text-[14px]">1 guest</div>
                                    </div>
                                    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style={{display:"block",fill:"none",height:"16px",width:"16px",stroke:"currentColor",strokeWidth:4,overflow:"visible"}}><g fill="none"><path d="m28 12-11.2928932 11.2928932c-.3905243.3905243-1.0236893.3905243-1.4142136 0l-11.2928932-11.2928932"></path></g></svg>
                                </div>
                            </div>
                            
                            <Link 
                                href={`/hostels/${hostelId}/rooms`}
                                className="w-full block text-center py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[16px] transition-colors"
                            >
                                Reserve
                            </Link>
                            
                            <div className="text-center text-[14px] text-gray-500 mt-4">
                                You won't be charged yet
                            </div>
                        </div>
                        
                        <div className="mt-6 flex justify-center text-[14px] text-gray-500 font-medium">
                            <span className="flex items-center gap-2 cursor-pointer hover:underline">
                                <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" style={{display:"block",height:"16px",width:"16px",fill:"currentColor"}}><path d="M12.44 2.1l-.88 1.83 1.95.42a2.5 2.5 0 0 1 1.97 2.22l.02.23v6.7a2.5 2.5 0 0 1-2.29 2.49l-.21.01H3a2.5 2.5 0 0 1-2.49-2.29l-.01-.21v-6.7a2.5 2.5 0 0 1 2.05-2.43l1.87-.4-.88-1.84A1 1 0 0 1 4.44 1.1l7.12 1a1 1 0 0 1 .88 1zm-2.07 2.44L3.6 3.1 3 4.38l8.36 1.8 1.01-2.07-2 .43zm-7.37 1.45V13.5A1.5 1.5 0 0 0 4.35 15h9.15a1.5 1.5 0 0 0 1.49-1.35l.01-.15v-6.7a1.5 1.5 0 0 0-1.35-1.49L13.5 5.3 3 5.99z"></path></svg>
                                Report this listing
                            </span>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="py-12 border-t border-gray-200 mt-8">
                    <div className="flex items-center gap-2 text-[22px] font-semibold text-gray-900 mb-8">
                        <Star size={20} className="fill-current" />
                        {hostel.averageRating?.toFixed(2) || "New"} • {hostel.totalReviews || 0} reviews
                    </div>
                    
                    {/* Simplified Stats (Airbnb Style) */}
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-y-4 gap-x-2 text-[14px] mb-10 pb-8 border-b border-gray-200">
                         <div className="md:col-span-1 pr-6 border-r border-gray-200 space-y-1">
                             <div className="text-gray-900">Overall rating</div>
                             <div className="flex gap-1 items-end mt-2">
                                 <div className="flex-1 flex flex-col items-center"><div className="w-full h-1 bg-gray-900 rounded-full mb-1"></div><span className="text-[12px] font-medium">5</span></div>
                                 <div className="flex-1 flex flex-col items-center"><div className="w-full h-1 bg-gray-200 rounded-full mb-1"></div><span className="text-[12px] font-medium">4</span></div>
                                 <div className="flex-1 flex flex-col items-center"><div className="w-full h-1 bg-gray-200 rounded-full mb-1"></div><span className="text-[12px] font-medium">3</span></div>
                                 <div className="flex-1 flex flex-col items-center"><div className="w-full h-1 bg-gray-200 rounded-full mb-1"></div><span className="text-[12px] font-medium">2</span></div>
                                 <div className="flex-1 flex flex-col items-center"><div className="w-full h-1 bg-gray-200 rounded-full mb-1"></div><span className="text-[12px] font-medium">1</span></div>
                             </div>
                         </div>
                         <div className="md:col-span-1 pl-4 md:px-4 md:border-r border-gray-200">
                             <div className="text-gray-900 mb-2">Cleanliness</div>
                             <div className="text-[16px] font-semibold">4.8</div>
                         </div>
                         <div className="md:col-span-1 pr-4 md:px-4 md:border-r border-gray-200">
                             <div className="text-gray-900 mb-2">Accuracy</div>
                             <div className="text-[16px] font-semibold">4.7</div>
                         </div>
                         <div className="md:col-span-1 pl-4 md:px-4 md:border-r border-gray-200">
                             <div className="text-gray-900 mb-2">Location</div>
                             <div className="text-[16px] font-semibold">4.8</div>
                         </div>
                         <div className="md:col-span-1 pr-4 md:px-4 md:border-r border-gray-200">
                             <div className="text-gray-900 mb-2">Value</div>
                             <div className="text-[16px] font-semibold">4.6</div>
                         </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-12">
                        {hostel.reviews?.slice(0, 6).map((review: any) => (
                            <div key={review.id}>
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500 overflow-hidden shrink-0">
                                        {review.user?.avatarUrl ? (
                                            <img src={review.user.avatarUrl} className="w-full h-full object-cover" alt="Reviewer" />
                                        ) : (
                                            review.user?.firstName?.[0] || review.user?.email?.[0]?.toUpperCase() || "S"
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-[16px] text-gray-900">{review.user?.firstName || "Student"}</div>
                                        <div className="text-[14px] text-gray-500">{review.user?.university || "University Student"}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-[14px] text-gray-900 mb-2">
                                    <div className="flex items-center">
                                        {[...Array(review.rating)].map((_, i) => <Star key={i} size={10} className="fill-current text-gray-900" />)}
                                    </div>
                                    <span>•</span>
                                    <span className="font-medium">{new Date(review.createdAt).toLocaleDateString(undefined, {month: 'long', year: 'numeric'})}</span>
                                </div>
                                <p className="text-[16px] text-gray-900 leading-relaxed whitespace-pre-line">
                                    {review.comment}
                                </p>
                                <button className="mt-2 font-semibold underline text-[16px]">Show more</button>
                            </div>
                        ))}
                    </div>
                    {hostel.reviews?.length > 6 && (
                        <button className="mt-10 px-6 py-3 border border-black rounded-lg text-[16px] font-semibold hover:bg-gray-50 transition">
                            Show all {hostel.reviews.length} reviews
                        </button>
                    )}
                    {(!hostel.reviews || hostel.reviews.length === 0) && (
                        <div className="text-gray-500 text-[16px]">No reviews yet.</div>
                    )}
                </div>

                {/* Location Section */}
                <div className="py-12 border-t border-gray-200">
                    <h3 className="text-[22px] font-semibold text-gray-900 mb-6">Where you'll be</h3>
                    <p className="text-[16px] text-gray-900 mb-6">{hostel.addressLine}, {hostel.city}, {hostel.region}, Ghana</p>
                    
                    <div className="h-[480px] w-full rounded-2xl overflow-hidden bg-gray-200 relative mb-8">
                         {hostel.latitude && hostel.longitude ? (
                             <HostelMap
                                 markers={[{
                                     id: hostel.id,
                                     lat: hostel.latitude,
                                     lng: hostel.longitude,
                                     label: hostel.name,
                                     sublabel: hostel.addressLine,
                                     price: hostel.minPrice,
                                     isFeatured: hostel.isFeatured,
                                 }]}
                                 center={[hostel.latitude, hostel.longitude]}
                                 zoom={15}
                                 className="w-full h-full"
                                 singlePin
                             />
                         ) : (
                             <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-4">
                                 <MapPin size={48} />
                                 <p>Location map unavailable</p>
                             </div>
                         )}
                    </div>
                    <div className="text-[16px] text-gray-900 font-semibold mb-2">{hostel.city}, Ghana</div>
                    <p className="text-[16px] text-gray-900 leading-relaxed max-w-3xl">
                        The neighborhood is vibrant and largely populated by students. Very accessible transport networks with close proximity to the university campus.
                    </p>
                    <button className="mt-4 font-semibold underline text-[16px] flex items-center gap-1">
                        Show more <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" style={{display:"block",height:"12px",width:"12px",fill:"currentColor"}}><path d="M5.41 15.65 4 14.23l6.09-6.1L4 2.05 5.41.64l7.5 7.5z"></path></svg>
                    </button>
                </div>

                {/* Meet your host */}
                <div className="py-12 border-t border-gray-200">
                    <h3 className="text-[22px] font-semibold text-gray-900 mb-6">Meet your host</h3>
                    <div className="flex flex-col md:flex-row gap-12 lg:gap-24">
                        <div className="w-full md:w-[400px] bg-white rounded-3xl p-8 shadow-[0_6px_16px_rgba(0,0,0,0.12)] border border-gray-100 flex flex-col items-center">
                            <div className="flex items-center justify-between w-full">
                                <div className="flex flex-col items-center">
                                    <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden mb-3 relative">
                                        {hostel.owner?.avatarUrl ? (
                                            <img src={hostel.owner.avatarUrl} className="w-full h-full object-cover" alt="Host" />
                                        ) : (
                                            <div className="w-full h-full flex justify-center items-center font-bold text-gray-500 text-2xl">
                                                {hostel.owner?.firstName?.[0] || "H"}
                                            </div>
                                        )}
                                        {hostel.owner?.isVerified && (
                                            <div className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                                                <ShieldCheck size={14} />
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="text-[26px] font-bold text-gray-900">{hostel.owner?.firstName}</h3>
                                    <div className="text-[14px] text-gray-500 font-medium">Host</div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-[18px] font-bold">{hostel.totalReviews > 10 ? '10+' : (hostel.totalReviews || 0)}</div>
                                        <div className="text-[12px] text-gray-500 font-medium">Reviews</div>
                                    </div>
                                    <hr className="border-gray-200" />
                                    <div>
                                        <div className="text-[18px] font-bold flex items-center gap-1">
                                            {hostel.averageRating?.toFixed(2) || "New"} <Star size={12} className="fill-current" />
                                        </div>
                                        <div className="text-[12px] text-gray-500 font-medium">Rating</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex-1 space-y-6">
                            <div>
                                <h4 className="text-[18px] font-semibold text-gray-900 mb-2">Host details</h4>
                                <div className="text-[16px] text-gray-900 space-y-1">
                                    <p>Response rate: 100%</p>
                                    <p>Responds within an hour</p>
                                </div>
                            </div>
                            <ContentGate message="Sign in to message the host">
                                <a 
                                    href={hostel.whatsappNumber ? `https://wa.me/${hostel.whatsappNumber.startsWith('0') ? '233' + hostel.whatsappNumber.slice(1) : hostel.whatsappNumber}` : '#'}
                                    target="_blank"
                                    className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg text-[16px] font-semibold hover:bg-black transition-colors"
                                >
                                    Message host
                                </a>
                            </ContentGate>
                            <div className="pt-6 border-t border-gray-200 flex items-start gap-4 text-[12px] text-gray-500">
                                <ShieldCheck size={20} className="shrink-0 text-blue-600" />
                                <p>To help protect your payment, always use the HostelGH platform to send money and communicate securely with hosts.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Things to know */}
                <div className="py-12 border-t border-gray-200">
                    <h3 className="text-[22px] font-semibold text-gray-900 mb-6">Things to know</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-[16px] text-gray-900">
                        <div>
                            <h4 className="font-semibold mb-3">Hostel rules</h4>
                            <ul className="space-y-2 text-[15px]">
                                <li>Check-in: After 3:00 PM</li>
                                <li>Checkout: Before 12:00 PM</li>
                                <li>No smoking indoors</li>
                                <li>Quiet hours: 10 PM - 6 AM</li>
                            </ul>
                            <button className="mt-3 font-semibold underline text-[15px]">Show more</button>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-3">Safety & property</h4>
                            <ul className="space-y-2 text-[15px]">
                                <li>Security cameras on property</li>
                                <li>Smoke alarm installed</li>
                                <li>Gated compound</li>
                                <li>24/7 Security guard</li>
                            </ul>
                            <button className="mt-3 font-semibold underline text-[15px]">Show more</button>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-3">Cancellation policy</h4>
                            <p className="text-[15px] mb-2">Review this hostel's full policy for details on refunds and deadlines.</p>
                            <button className="font-semibold underline text-[15px]">Learn more</button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
