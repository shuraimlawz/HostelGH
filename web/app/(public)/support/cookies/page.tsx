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

                <div className="max-w-4xl mx-auto space-y-16">
                    <section className="space-y-6">
                        <h2 className="text-2xl font-black uppercase italic tracking-tight flex items-center gap-3">
                            <Shield size={24} className="text-blue-500" /> What are cookies?
                        </h2>
                        <p className="text-zinc-500 leading-loose">
                            Cookies are small text files stored on your device that help us provide a seamless experience. They allow us to remember your preferences, keep you logged in, and understand how you interact with our platform.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-black uppercase italic tracking-tight flex items-center gap-3">
                            <Eye size={24} className="text-blue-500" /> How we use them
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl">
                                <h3 className="text-lg font-bold mb-3 uppercase tracking-wider text-white">Essential Cookies</h3>
                                <p className="text-zinc-500 text-sm leading-relaxed">Necessary for the website to function, such as authentication and security features.</p>
                            </div>
                            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl">
                                <h3 className="text-lg font-bold mb-3 uppercase tracking-wider text-white">Performance Cookies</h3>
                                <p className="text-zinc-500 text-sm leading-relaxed">Help us understand how visitors interact with the site, helping us improve speed and layout.</p>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-black uppercase italic tracking-tight flex items-center gap-3">
                            <Settings size={24} className="text-blue-500" /> Your Choices
                        </h2>
                        <p className="text-zinc-500 leading-loose">
                            You can control and manage cookies through your browser settings. Please note that disabling certain cookies may affect the functionality of our services.
                        </p>
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
