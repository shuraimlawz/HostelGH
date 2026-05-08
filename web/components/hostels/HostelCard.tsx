import Link from "next/link";
import Image from "next/image";
import { Star, MapPin, ShieldCheck } from "lucide-react";

export default function HostelCard({ hostel, compact = false }: { hostel: any, compact?: boolean }) {
    const minPrice = hostel.minPrice
        ? hostel.minPrice / 100
        : (hostel.rooms?.length
            ? Math.min(...hostel.rooms.map((r: any) => r.pricePerTerm)) / 100
            : null);

    const isGuestFavorite = hostel.averageRating >= 4.5 && hostel.totalReviews >= 5;

    return (
        <Link href={`/hostels/${hostel.id}`} className="group block cursor-pointer">
            <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-200 mb-3">
                {hostel.images?.[0] ? (
                    <Image
                        src={hostel.images[0]}
                        alt={hostel.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <MapPin size={24} />
                    </div>
                )}

                {/* Guest Favorite Badge */}
                {isGuestFavorite && (
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 px-3 py-1 bg-white rounded-full text-xs font-bold text-gray-900 shadow-md">
                        Guest favorite
                    </div>
                )}

                {/* Heart Icon */}
                <button 
                    className="absolute top-3 right-3 z-10 p-1.5 hover:scale-110 transition-transform"
                    aria-label="Save"
                >
                    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style={{ display: "block", fill: "rgba(0, 0, 0, 0.5)", height: 24, width: 24, stroke: "#fff", strokeWidth: 2, overflow: "visible" }}><path d="m16 28c7-4.733 14-10 14-17 0-1.792-.683-3.583-2.05-4.95-1.367-1.366-3.158-2.05-4.95-2.05-1.791 0-3.583.684-4.949 2.05l-2.051 2.051-2.05-2.051c-1.367-1.366-3.158-2.05-4.95-2.05-1.791 0-3.583.684-4.949 2.05-1.367 1.367-2.051 3.158-2.051 4.95 0 7 7 12.267 14 17z"></path></svg>
                </button>
            </div>

            <div className="flex flex-col text-[15px] leading-snug">
                <div className="flex justify-between items-start gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate flex items-center gap-1.5">
                        {hostel.name}
                        {hostel.verificationStatus === 'APPROVED' && (
                            <ShieldCheck size={14} className="text-blue-500 fill-blue-50 shrink-0" aria-label="Verified Hostel" />
                        )}
                    </h3>
                    <div className="flex items-center gap-1 shrink-0">
                        <Star size={12} className="fill-current text-gray-900 dark:text-white" />
                        <span className="text-gray-900 dark:text-white">{hostel.averageRating > 0 ? hostel.averageRating.toFixed(2) : "New"}</span>
                    </div>
                </div>
                
                <p className="text-gray-500 dark:text-gray-400 truncate">
                    {hostel.distanceToCampus ? `${hostel.distanceToCampus} from campus` : `${hostel.city}, Ghana`}
                </p>
                <p className="text-gray-500 dark:text-gray-400 truncate">
                    {hostel.university || 'Student Accommodation'}
                </p>
                
                <div className="mt-1 flex items-baseline gap-1 text-gray-900 dark:text-white">
                    <span className="font-semibold">
                        {minPrice ? `₵${minPrice.toLocaleString()}` : "Price unlisted"}
                    </span>
                    <span className="text-gray-900 dark:text-white">for 1 academic year</span>
                </div>
            </div>
        </Link>
    );
}
