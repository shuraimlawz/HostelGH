import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReviewRatingProps {
  label: string;
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: number;
}

export const ReviewRating: React.FC<ReviewRatingProps> = ({
  label,
  value,
  onChange,
  readOnly = false,
  size = 20,
}) => {
  const [hovered, setHovered] = React.useState(0);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</span>
        {!readOnly && (
           <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{value > 0 ? value : '-'}</span>
        )}
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onMouseEnter={() => !readOnly && setHovered(star)}
            onMouseLeave={() => !readOnly && setHovered(0)}
            onClick={() => !readOnly && onChange?.(star)}
            className={cn(
              "transition-transform active:scale-90",
              readOnly ? "cursor-default" : "cursor-pointer"
            )}
          >
            <Star
              size={size}
              className={cn(
                "transition-colors",
                (hovered || value) >= star 
                  ? "text-orange-400 fill-current" 
                  : "text-gray-100"
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
};
