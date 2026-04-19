"use client";

import { Megaphone, Target, BarChart, Rocket, ArrowRight, Zap } from "lucide-react";

export default function AdvertisingPage() {
    return (
        <main className="min-h-screen bg-[#020617] text-white pt-32 pb-24 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-4xl mx-auto mb-24 text-center">
                    <div className="w-16 h-16 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-500 mb-8 mx-auto">
                        <Megaphone size={32} />
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 italic uppercase leading-none">
                        Grow Your <span className="text-blue-500">Brand</span>
                    </h1>
                    <p className="text-zinc-400 text-xl font-medium leading-relaxed max-w-2xl mx-auto">
                        Reach tens of thousands of students across Ghana at the exact moment they are making major living decisions.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                    <div className="p-10 bg-white/[0.03] border border-white/10 rounded-[2.5rem] space-y-6">
                        <Target size={32} className="text-blue-500" />
                        <h3 className="text-2xl font-black uppercase italic tracking-tight text-white">Targeted Reach</h3>
                        <p className="text-zinc-500 text-sm leading-relaxed">
                            Target students by university, city, or budget, ensuring your ads reach the most relevant audience.
                        </p>
                    </div>
                    <div className="p-10 bg-white/[0.03] border border-white/10 rounded-[2.5rem] space-y-6">
                        <BarChart size={32} className="text-emerald-500" />
                        <h3 className="text-2xl font-black uppercase italic tracking-tight text-white">Full Analytics</h3>
                        <p className="text-zinc-500 text-sm leading-relaxed">
                            Track impressions, clicks, and conversions in real-time with our sophisticated ad-tracking dashboard.
                        </p>
                    </div>
                    <div className="p-10 bg-white/[0.03] border border-white/10 rounded-[2.5rem] space-y-6">
                        <Zap size={32} className="text-yellow-500" />
                        <h3 className="text-2xl font-black uppercase italic tracking-tight text-white">Premium Placements</h3>
                        <p className="text-zinc-500 text-sm leading-relaxed">
                            Feature your property or service in our featured carousels and top search results for maximum visibility.
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-[3rem] p-12 md:p-20 text-center max-w-5xl mx-auto shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-5 transition-opacity duration-1000 pointer-events-none" />
                    <Rocket size={48} className="text-blue-600 mb-8 mx-auto" />
                    <h3 className="text-4xl font-black mb-6 italic uppercase tracking-tighter text-gray-900 leading-none">Ready to amplify your presence?</h3>
                    <p className="text-gray-500 text-lg mb-12 max-w-xl mx-auto font-medium">
                        Contact our media sales team today to learn about our customized advertising packages.
                    </p>
                    <button className="h-16 px-12 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-500 transition-all flex items-center gap-3 shadow-xl shadow-blue-600/30 mx-auto active:scale-95">
                        Inquire Now <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        </main>
    );
}
