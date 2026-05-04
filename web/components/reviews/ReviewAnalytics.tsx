'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReviewAnalyticsProps {
  averageRating: number;
  totalReviews: number;
  distribution?: Record<number, number>; // { 5: 10, 4: 5, ... }
}

export const ReviewAnalytics: React.FC<ReviewAnalyticsProps> = ({
  averageRating,
  totalReviews,
  distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
}) => {
  return (
    <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-2xl shadow-gray-100/50 flex flex-col md:flex-row items-center gap-12">
      <div className="text-center space-y-4">
        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.3em]">Overall Rating</h3>
        <div className="space-y-1">
           <p className="text-7xl font-black text-gray-900 tracking-tighter">
             {averageRating?.toFixed(1) || '0.0'}
           </p>
           <div className="flex justify-center gap-1 text-orange-400">
             {[...Array(5)].map((_, i) => (
               <Star key={i} size={20} className={i < Math.round(averageRating) ? "fill-current" : "text-gray-100"} />
             ))}
           </div>
        </div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Based on {totalReviews} Reviews
        </p>
      </div>

      <div className="flex-1 w-full space-y-3">
        {[5, 4, 3, 2, 1].map((stars) => {
          const count = distribution[stars] || 0;
          const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
          
          return (
            <div key={stars} className="flex items-center gap-4 group cursor-pointer">
              <span className="w-12 text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-gray-900 transition-colors">
                {stars} Stars
              </span>
              <div className="flex-1 h-2 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                <div 
                  className={cn(
                    "h-full transition-all duration-1000 ease-out rounded-full",
                    stars >= 4 ? "bg-emerald-500" : stars === 3 ? "bg-amber-400" : "bg-red-400"
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-10 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">
                {percentage.toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReviewAnalytics;
