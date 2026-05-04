'use client';

import React from 'react';
import { Star, ShieldCheck, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    cleanliness?: number;
    comfort?: number;
    value?: number;
    staff?: number;
    comment: string;
    isVerified: boolean;
    createdAt: string;
    tenant: {
      firstName: string;
      lastName?: string;
      avatarUrl?: string;
    };
    photos?: { url: string }[];
    ownerResponse?: {
      content: string;
      createdAt: string;
    };
  };
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  return (
    <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm hover:border-blue-500/10 transition-all group h-fit">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/10 overflow-hidden group-hover:scale-110 transition-transform">
            {review.tenant.avatarUrl ? (
              <img src={review.tenant.avatarUrl} className="w-full h-full object-cover" alt={review.tenant.firstName} />
            ) : (
              <span className="text-xl">{review.tenant.firstName?.[0]}</span>
            )}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="font-bold text-gray-900 uppercase tracking-tight text-sm">
                {review.tenant.firstName} {review.tenant.lastName || ''}
              </p>
              {review.isVerified && (
                <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest border border-emerald-100">
                  <ShieldCheck size={10} /> Verified Stay
                </div>
              )}
            </div>
            <div className="flex gap-0.5 text-orange-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} className={i < review.rating ? "fill-current" : "text-gray-100"} />
              ))}
            </div>
          </div>
        </div>
        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
          {format(new Date(review.createdAt), 'MMM d, yyyy')}
        </span>
      </div>

      <div className="space-y-6">
        <p className="text-gray-600 text-sm leading-relaxed font-medium">
          {review.comment}
        </p>

        {review.photos && review.photos.length > 0 && (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {review.photos.map((photo, i) => (
              <div key={i} className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 shadow-sm cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all">
                <img src={photo.url} className="w-full h-full object-cover" alt={`Review photo ${i + 1}`} />
              </div>
            ))}
          </div>
        )}

        {(review.cleanliness || review.comfort || review.value || review.staff) && (
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 py-4 border-t border-b border-gray-50">
            {review.cleanliness && <SubRating label="Cleanliness" value={review.cleanliness} />}
            {review.comfort && <SubRating label="Comfort" value={review.comfort} />}
            {review.value && <SubRating label="Value" value={review.value} />}
            {review.staff && <SubRating label="Staff" value={review.staff} />}
          </div>
        )}

        {review.ownerResponse && (
          <div className="bg-gray-50 rounded-2xl p-6 space-y-3 border border-gray-100">
            <div className="flex items-center gap-2 text-blue-600">
              <MessageCircle size={14} />
              <span className="text-[9px] font-bold uppercase tracking-widest">Owner Response</span>
            </div>
            <p className="text-gray-600 text-[11px] leading-relaxed italic">
              "{review.ownerResponse.content}"
            </p>
            <p className="text-[8px] font-bold text-gray-300 uppercase tracking-widest">
              {format(new Date(review.ownerResponse.createdAt), 'MMM d, yyyy')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const SubRating = ({ label, value }: { label: string; value: number }) => (
  <div className="flex items-center justify-between gap-4">
    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
    <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
      <div 
        className="h-full bg-blue-500 transition-all duration-1000" 
        style={{ width: `${(value / 5) * 100}%` }} 
      />
    </div>
    <span className="text-[9px] font-bold text-gray-900">{value.toFixed(1)}</span>
  </div>
);

export default ReviewCard;
