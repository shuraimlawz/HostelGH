import React, { useState } from 'react';
import { Shield, ShieldCheck, ShieldAlert, Upload, Loader2, Info, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

export function VerificationCenter() {
    const { user, updateUser } = useAuth();
    const [isUploading, setIsUploading] = useState(false);
    const [ghanaCardId, setGhanaCardId] = useState(user?.verificationStatus === 'PENDING' ? '********' : '');
    const [cardUrl, setCardUrl] = useState<string | null>(null);

    const status = user?.verificationStatus || 'UNVERIFIED';

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const loadingToast = toast.loading("Uploading document...");
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await api.post("/upload/image", formData);
            setCardUrl(res.data.url);
            toast.success("Document uploaded successfully!", { id: loadingToast });
        } catch (error: any) {
            toast.error(error.message || "Upload failed", { id: loadingToast });
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async () => {
        if (!ghanaCardId || !cardUrl) {
            toast.error("Please provide both ID number and document photo.");
            return;
        }

        const loadingToast = toast.loading("Submitting for verification...");
        try {
            await api.post("/users/verify", {
                ghanaCardId,
                ghanaCardUrl: cardUrl
            });
            updateUser({ verificationStatus: 'PENDING' });
            toast.success("Verification request submitted!", { id: loadingToast });
        } catch (error: any) {
            toast.error(error.message || "Submission failed", { id: loadingToast });
        }
    };

    if (status === 'VERIFIED') {
        return (
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-8 space-y-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-125 transition-transform duration-1000" />
                <div className="flex items-start gap-6 relative z-10">
                    <div className="w-14 h-14 bg-white dark:bg-gray-950 rounded-2xl flex items-center justify-center border border-emerald-100 shadow-sm text-emerald-600">
                        <ShieldCheck size={32} />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-xl font-bold text-emerald-900 tracking-tight uppercase">Identity Verified</h3>
                        <p className="text-xs text-emerald-700 font-medium leading-relaxed max-w-sm">
                            Your account has been fully verified by our trust and safety team. You have full access to all premium features.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (status === 'PENDING') {
        return (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 space-y-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-125 transition-transform duration-1000" />
                <div className="flex items-start gap-6 relative z-10">
                    <div className="w-14 h-14 bg-white dark:bg-gray-950 rounded-2xl flex items-center justify-center border border-blue-100 shadow-sm text-blue-600">
                        <Loader2 className="animate-spin" size={32} />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-xl font-bold text-blue-900 tracking-tight uppercase">Review in Progress</h3>
                        <p className="text-xs text-blue-700 font-medium leading-relaxed max-w-sm">
                            Our team is currently reviewing your identity documents. This usually takes 24-48 hours. We'll notify you once complete.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-950 border border-gray-100 rounded-3xl p-8 shadow-sm space-y-8 group transition-all hover:border-blue-200">
            <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                <div className="space-y-0.5">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Identity Verification</h3>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Required for {user?.role === 'OWNER' ? 'Property Listings' : 'Priority Bookings'}</p>
                </div>
                <ShieldAlert size={20} className="text-amber-500" />
            </div>

            {status === 'REJECTED' && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-4 text-red-700">
                    <AlertCircle size={20} className="shrink-0" />
                    <p className="text-xs font-bold leading-tight">
                        Verification Rejected: {user?.verificationNote || "Invalid document provided. Please try again."}
                    </p>
                </div>
            )}

            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 dark:text-gray-500 ml-1 uppercase tracking-widest">Ghana Card ID Number</label>
                    <input 
                        type="text" 
                        placeholder="GHA-XXXXXXXXX-X"
                        className="w-full h-12 px-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 rounded-xl outline-none focus:bg-white dark:bg-gray-950 focus:border-blue-500 transition-all font-bold text-sm"
                        value={ghanaCardId}
                        onChange={(e) => setGhanaCardId(e.target.value)}
                    />
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 dark:text-gray-500 ml-1 uppercase tracking-widest">Ghana Card Photo (Front)</label>
                    <div 
                        className={cn(
                            "relative aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all cursor-pointer overflow-hidden group/upload",
                            cardUrl ? "bg-gray-50 dark:bg-gray-900 border-emerald-500/30" : "bg-gray-50 dark:bg-gray-900 border-gray-100 hover:bg-blue-50 hover:border-blue-200"
                        )}
                        onClick={() => !isUploading && document.getElementById('card-upload')?.click()}
                    >
                        {cardUrl ? (
                            <>
                                <img src={cardUrl} alt="Ghana Card" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/upload:opacity-100 transition-opacity">
                                    <p className="text-white text-[10px] font-bold uppercase tracking-widest">Change Photo</p>
                                </div>
                            </>
                        ) : (
                            <>
                                {isUploading ? (
                                    <Loader2 className="animate-spin text-blue-600" size={32} />
                                ) : (
                                    <>
                                        <div className="w-12 h-12 bg-white dark:bg-gray-950 rounded-xl flex items-center justify-center shadow-sm border border-gray-100 text-gray-400 dark:text-gray-500 group-hover/upload:text-blue-600 transition-colors">
                                            <Upload size={24} />
                                        </div>
                                        <div className="text-center px-6">
                                            <p className="text-xs font-bold text-gray-900 dark:text-white uppercase">Click to upload photo</p>
                                            <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">Clear JPG or PNG</p>
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                    <input id="card-upload" type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                </div>

                <div className="pt-4">
                    <button 
                        onClick={handleSubmit}
                        disabled={!ghanaCardId || !cardUrl || isUploading}
                        className="w-full h-12 bg-gray-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                        <ShieldCheck size={18} />
                        Submit for Verification
                    </button>
                    <p className="text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest text-center mt-6 flex items-center justify-center gap-2">
                        <Info size={12} /> Data is encrypted and stored securely
                    </p>
                </div>
            </div>
        </div>
    );
}
