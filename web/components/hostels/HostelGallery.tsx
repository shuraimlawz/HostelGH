"use client";

import { AspectRatio } from "@/components/ui/aspect-ratio";

export default function HostelGallery({ images }: { images: string[] }) {
    const mainImage = images[0] || "https://images.unsplash.com/photo-1555854817-40e0742cd60f?w=1200&h=800&fit=crop";
    const gridImages = images.slice(1, 5);

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 rounded-2xl overflow-hidden mb-8">
            <div className="md:col-span-2">
                <AspectRatio ratio={3 / 2}>
                    <img src={mainImage} className="w-full h-full object-cover hover:opacity-90 transition-opacity cursor-pointer" alt="Main" />
                </AspectRatio>
            </div>
            <div className="hidden md:grid grid-cols-2 col-span-2 gap-2">
                {[0, 1, 2, 3].map((i) => (
                    <AspectRatio key={i} ratio={3 / 2}>
                        <img
                            src={gridImages[i] || "https://images.unsplash.com/photo-1590644365607-1c5a519a7a37?w=400&h=300&fit=crop"}
                            className="w-full h-full object-cover hover:opacity-90 transition-opacity cursor-pointer"
                            alt="Grid"
                        />
                    </AspectRatio>
                ))}
            </div>
        </div>
    );
}
