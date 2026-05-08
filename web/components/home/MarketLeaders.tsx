"use client";

import Image from "next/image";

const partners = [
    { name: "Google Maps", logo: "https://upload.wikimedia.org/wikipedia/commons/b/bd/Google_Maps_Logo_2020.svg" },
    { name: "Supabase", logo: "https://supabase.com/brand-assets/supabase-logo-icon.png" },
    { name: "Vercel", logo: "https://assets.vercel.com/image/upload/front/favicon/vercel/57x57.png" },
    { name: "Next.js", logo: "https://assets.vercel.com/image/upload/v1662130559/nextjs/Icon_dark_background.png" },
    { name: "Prisma", logo: "https://avatars.githubusercontent.com/u/17219288?s=200&v=4" },
];

export default function MarketLeaders() {
    return (
        <section className="border-y border-border bg-muted/20 overflow-hidden relative">
            <div className="container mx-auto px-4 md:px-10 py-6 md:py-8 flex flex-col md:flex-row items-center gap-6 md:gap-10">
                <p className="text-xs md:text-sm font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap shrink-0">
                    Powered By Trusted Technologies:
                </p>
                
                {/* Marquee Container */}
                <div className="flex-1 overflow-hidden relative w-full flex items-center">
                    {/* Gradient Fades for Smooth Scroll Effect */}
                    <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10" />
                    <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10" />
                    
                    <div className="flex items-center gap-12 animate-marquee shrink-0">
                        {/* Duplicate lists to create an infinite scroll effect */}
                        {[...partners, ...partners].map((partner, index) => (
                            <div key={index} className="shrink-0 flex items-center justify-center opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                                <img
                                    src={partner.logo}
                                    alt={partner.name}
                                    className="h-6 md:h-8 object-contain object-left max-w-[120px]"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <style jsx>{`
                .animate-marquee {
                    animation: marquee 30s linear infinite;
                }
                @keyframes marquee {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </section>
    );
}
