'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useAuthModal } from '@/components/auth/AuthModalProvider';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, Send } from 'lucide-react';
import { ReviewRating } from './ReviewRating';
import ImageUpload from '../common/ImageUpload';

interface ReviewFormProps {
  hostelId: string;
  bookingId?: string;
  onSuccess?: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  hostelId,
  bookingId,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { open } = useAuthModal();

  const [rating, setRating] = useState(0);
  const [cleanliness, setCleanliness] = useState(0);
  const [comfort, setComfort] = useState(0);
  const [value, setValue] = useState(0);
  const [staff, setStaff] = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      open('login');
      return;
    }

    if (rating === 0) {
      toast.error('Please provide an overall rating');
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/reviews/${hostelId}`, {
        rating,
        cleanliness: cleanliness || undefined,
        comfort: comfort || undefined,
        value: value || undefined,
        staff: staff || undefined,
        comment,
        photos,
        bookingId
      });

      toast.success('Review submitted! Thank you for your feedback.');
      setRating(0);
      setCleanliness(0);
      setComfort(0);
      setValue(0);
      setStaff(0);
      setComment('');
      setPhotos([]);
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-8">
           <ReviewRating label="Overall Rating" value={rating} onChange={setRating} size={32} />
           <div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-100">
              <ReviewRating label="Cleanliness" value={cleanliness} onChange={setCleanliness} />
              <ReviewRating label="Comfort" value={comfort} onChange={setComfort} />
              <ReviewRating label="Value" value={value} onChange={setValue} />
              <ReviewRating label="Staff" value={staff} onChange={setStaff} />
           </div>
        </div>

        <div className="space-y-4">
           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Share Photos</span>
           <ImageUpload value={photos} onChange={setPhotos} maxImages={4} />
        </div>
      </div>

      <div className="space-y-4">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Your Experience</span>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What was your stay like? Mention facilities, neighborhood, or atmosphere..."
          className="w-full h-32 bg-white border border-gray-100 rounded-[1.5rem] p-6 outline-none focus:border-blue-500 transition-all font-medium text-gray-700 text-sm shadow-sm"
          required
          minLength={10}
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full h-16 bg-gray-900 text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] shadow-xl hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
      >
        {submitting ? (
          <Loader2 className="animate-spin" size={20} />
        ) : (
          <>
            <Send size={16} />
            Post My Review
          </>
        )}
      </button>
    </form>
  );
};

export default ReviewForm;
