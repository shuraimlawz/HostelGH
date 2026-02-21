"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Plus, X, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
    value: string[];
    onChange: (urls: string[]) => void;
    maxImages?: number;
}

export default function ImageUpload({ value, onChange, maxImages = 10 }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (value.length + files.length > maxImages) {
            toast.error(`You can only upload up to ${maxImages} images`);
            return;
        }

        const formData = new FormData();
        Array.from(files).forEach((file) => {
            formData.append("files", file);
        });

        setUploading(true);
        try {
            const res = await api.post("/upload/images", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            const newUrls = res.data.urls;
            onChange([...value, ...newUrls]);
            toast.success("Images uploaded successfully!");
        } catch (error: any) {
            toast.error(error.message || "Failed to upload images");
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (urlToRemove: string) => {
        onChange(value.filter((url) => url !== urlToRemove));
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {value.map((url, index) => (
                    <div key={index} className="group relative aspect-square rounded-2xl overflow-hidden border bg-gray-50 transition-all hover:ring-2 hover:ring-black">
                        <img src={url} alt="Uploaded" className="w-full h-full object-cover" />
                        <button
                            type="button"
                            onClick={() => removeImage(url)}
                            className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}

                {value.length < maxImages && (
                    <label className={cn(
                        "relative aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all hover:border-black hover:bg-gray-50 active:scale-[0.98]",
                        uploading && "opacity-50 cursor-not-allowed pointer-events-none"
                    )}>
                        {uploading ? (
                            <>
                                <Loader2 className="animate-spin text-blue-600" size={24} />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Uploading...</span>
                            </>
                        ) : (
                            <>
                                <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 group-hover:text-black">
                                    <Plus size={24} />
                                </div>
                                <div className="text-center">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 block">Add Photos</span>
                                    <span className="text-[8px] text-gray-400">Up to {maxImages - value.length} more</span>
                                </div>
                            </>
                        )}
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleUpload}
                            className="hidden"
                            disabled={uploading}
                        />
                    </label>
                )}
            </div>

            {value.length === 0 && !uploading && (
                <div className="flex flex-col items-center justify-center py-12 px-4 rounded-[2rem] border-2 border-dashed border-gray-100 bg-gray-50/50">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-gray-300 mb-4">
                        <ImageIcon size={32} />
                    </div>
                    <p className="text-sm font-semibold text-gray-900">No photos yet</p>
                    <p className="text-xs text-gray-500 text-center mt-1">
                        High-quality photos increase your bookings by up to 40%.
                    </p>
                </div>
            )}
        </div>
    );
}
