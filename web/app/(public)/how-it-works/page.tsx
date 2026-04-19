"use client";

import { CheckCircle2, Search, Calendar, CreditCard, Home, ArrowRight } from "lucide-react";

export default function HowItWorksPage() {
    const steps = [
        {
            icon: Search,
            title: "Discover",
            description: "Explore premium hostels and student apartments across Ghana's top university hubs using our advanced search filters.",
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        },
        {
            icon: Home,
            title: "Select Room",
            description: "Browse immersive photos, detailed amenities, and transparent pricing to find the perfect space that fits your lifestyle.",
            color: "text-indigo-500",
            bg: "bg-indigo-500/10"
        },
        {
            icon: Calendar,
            title: "Instant Booking",
            description: "Secure your room instantly. Our platform handles the reservation and connects you directly with the property owner.",
            color: "text-violet-500",
            bg: "bg-violet-500/10"
        },
        {
            icon: CreditCard,
            title: "Secure Payment",
            description: "Pay with confidence using our encrypted payment gateway. Your funds are protected and receipts are generated instantly.",
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
        }
    ];

    return (
        <main className="min-h-screen bg-[#020617] text-white pt-32 pb-24 overflow-hidden relative">
            {/* Mesh Gradients */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-4xl mx-auto text-center mb-24">
                    <span className="px-4 py-1.5 bg-blue-600/10 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-blue-500/20 mb-8 inline-block animate-pulse">
                        Platform Guide
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 italic uppercase leading-none">
                        How It <span className="text-blue-500">Works</span>
                    </h1>
                    <p className="text-zinc-400 text-xl font-medium leading-relaxed max-w-2xl mx-auto">
                        Experience a seamless, secure, and sophisticated way to find student accommodation in Ghana.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, idx) => (
                        <div key={idx} className="group relative">
                            <div className="absolute inset-0 bg-blue-600/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                            <div className="h-full bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 flex flex-col items-center text-center hover:bg-white/[0.05] hover:border-blue-500/30 transition-all duration-500">
                                <div className={`w-20 h-20 ${step.bg} ${step.color} rounded-2xl flex items-center justify-center mb-8 rotate-3 group-hover:rotate-0 transition-transform duration-500`}>
                                    <step.icon size={36} />
                                </div>
                                <h3 className="text-2xl font-black mb-4 uppercase italic tracking-tight">{step.title}</h3>
                                <p className="text-zinc-400 text-sm font-medium leading-relaxed mb-8">{step.description}</p>
                                <div className="mt-auto pt-4">
                                    <div className="w-10 h-1 bg-white/10 rounded-full overflow-hidden">
                                        <div className="w-0 group-hover:w-full h-full bg-blue-600 transition-all duration-700" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-32 p-12 bg-white/[0.02] border border-white/5 rounded-[3rem] text-center max-w-4xl mx-auto backdrop-blur-md">
                    <h3 className="text-3xl font-black mb-6 italic uppercase tracking-tighter">Ready to find your perfect space?</h3>
                    <p className="text-zinc-500 text-lg mb-10 max-w-xl mx-auto font-medium">Join thousands of students who trust HostelGH for their accommodation needs.</p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <button className="h-16 px-10 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-500 transition-all flex items-center gap-3 shadow-[0_10px_40px_rgba(37,99,235,0.3)] active:scale-95">
                            Start Searching <Search size={20} />
                        </button>
                        <button className="h-16 px-10 bg-white/5 text-white rounded-2xl font-black uppercase tracking-widest border border-white/10 hover:bg-white/10 transition-all flex items-center gap-3 active:scale-95">
                            Learn More <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}
