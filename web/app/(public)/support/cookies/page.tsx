"use client";

import { Cookie, Shield, Eye, Settings, ArrowRight } from "lucide-react";

export default function CookiesPage() {
    return (
        <main className="min-h-screen bg-[#020617] text-white pt-32 pb-24 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-4xl mx-auto mb-24">
                    <div className="w-16 h-16 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-500 mb-8">
                        <Cookie size={32} />
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 italic uppercase leading-none">
                        Cookie <span className="text-blue-500">Policy</span>
                    </h1>
                    <p className="text-zinc-400 text-xl font-medium leading-relaxed max-w-2xl">
                        We use cookies to improve your experience and show you relevant content. Transparency is at the heart of our platform.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto space-y-16 mb-24">
                    <section className="space-y-6">
                        <h2 className="text-3xl font-black uppercase italic tracking-tight flex items-center gap-3">
                            <Shield size={28} className="text-blue-500" /> Defining Cookies
                        </h2>
                        <p className="text-zinc-500 leading-bold text-lg font-medium">
                            Cookies are sophisticated digital tokens stored on your device that allow the HostelGH platform to recognize your browser, maintain session integrity, and deliver a personalized search experience.
                        </p>
                    </section>

                    <section className="space-y-8">
                        <h2 className="text-3xl font-black uppercase italic tracking-tight flex items-center gap-3">
                            <Eye size={28} className="text-blue-500" /> Specialized Cookie Utility
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[2.5rem] group hover:bg-white/[0.04] transition-all">
                                <h3 className="text-xl font-black mb-4 uppercase tracking-tighter text-white italic">Strictly Necessary</h3>
                                <p className="text-zinc-500 text-sm leading-relaxed mb-6">Critical for core operations including secure authentication, CSRF protection, and booking state persistence. These cannot be disabled.</p>
                                <div className="px-3 py-1 bg-blue-600/10 border border-blue-500/20 rounded-lg w-fit text-[8px] font-black uppercase tracking-widest text-blue-500">Auto-Enabled</div>
                            </div>
                            <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[2.5rem] group hover:bg-white/[0.04] transition-all">
                                <h3 className="text-xl font-black mb-4 uppercase tracking-tighter text-white italic">Performance Metrics</h3>
                                <p className="text-zinc-500 text-sm leading-relaxed mb-6">Aggregated, anonymous data that helps us understand site performance, page load speeds, and user navigation patterns.</p>
                                <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg w-fit text-[8px] font-black uppercase tracking-widest text-zinc-500">Opt-out Available</div>
                            </div>
                            <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[2.5rem] group hover:bg-white/[0.04] transition-all">
                                <h3 className="text-xl font-black mb-4 uppercase tracking-tighter text-white italic">User Personalization</h3>
                                <p className="text-zinc-500 text-sm leading-relaxed mb-6">Remembers your preferred university region, currency, and search filters across different browsing sessions.</p>
                                <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg w-fit text-[8px] font-black uppercase tracking-widest text-zinc-500">Opt-out Available</div>
                            </div>
                            <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[2.5rem] group hover:bg-white/[0.04] transition-all border-blue-500/10">
                                <h3 className="text-xl font-black mb-4 uppercase tracking-tighter text-white italic">Marketing Logic</h3>
                                <p className="text-zinc-500 text-sm leading-relaxed mb-6">Used to deliver relevant advertising both on and off our platform based on your declared accommodation interests.</p>
                                <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg w-fit text-[8px] font-black uppercase tracking-widest text-zinc-500">Opt-out Available</div>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-3xl font-black uppercase italic tracking-tight flex items-center gap-3">
                            <Settings size={28} className="text-blue-500" /> Sovereignty Over Your Data
                        </h2>
                        <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[2.5rem] space-y-4">
                            <p className="text-zinc-500 leading-loose font-medium">
                                You retain full digital sovereignty. Beyond our platform&apos;s native settings, you can manage, delete, or block cookies through your primary browser interface (Chrome, Safari, Firefox). 
                            </p>
                            <p className="text-zinc-500 leading-loose font-medium">
                                Note directed toward Students: Disabling cookies entirely will log you out of your active session and prevent you from completing active hostel reservations.
                            </p>
                        </div>
                    </section>
                </div>

                <div className="max-w-4xl mx-auto mt-24 p-12 bg-blue-600 border border-blue-500 rounded-[2.5rem] shadow-[0_20px_50px_rgba(37,99,235,0.2)]">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <h3 className="text-2xl font-black uppercase italic tracking-tight text-white mb-2">Have questions?</h3>
                            <p className="text-white/70 font-medium">Our privacy team is here to help you understand your data.</p>
                        </div>
                        <button className="h-14 px-8 bg-white text-blue-600 rounded-xl font-black uppercase tracking-widest hover:bg-zinc-100 transition-all active:scale-95 flex items-center gap-2">
                            Contact Privacy <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}
