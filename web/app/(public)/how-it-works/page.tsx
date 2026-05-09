"use client";

import { CheckCircle2, Search, Calendar, CreditCard, Home, ArrowRight } from "lucide-react";
import Link from "next/link";

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
                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 italic uppercase leading-none">
                        How It <span className="text-blue-500 underline decoration-blue-500/20 underline-offset-[12px]">Works</span>
                    </h1>
                    <p className="text-zinc-400 text-xl md:text-2xl font-medium leading-relaxed max-w-2xl mx-auto">
                        A transparent, secure, and sophisticated workflow designed for the modern Ghanaian student ecosystem.
                    </p>
                </div>

                {/* Dual Journey Selector */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-32">
                    {/* For Students */}
                    <div className="bg-white/[0.03] border border-white/10 rounded-[3rem] p-12 hover:bg-white/[0.05] transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-12 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
                            <Search size={120} />
                        </div>
                        <h2 className="text-4xl font-black mb-8 italic uppercase tracking-tighter">For <span className="text-blue-500">Tenants</span></h2>
                        <ul className="space-y-6">
                            {[
                                { title: "Smart Discovery", text: "Filter by university proximity, price, and amenities including WiFi, water supply, and security." },
                                { title: "Virtual Tours", text: "View high-resolution galleries and verified facility lists before you even visit." },
                                { title: "Secure Reservation", text: "Book your room with a small commitment fee handled through our secure escrow." },
                                { title: "Verified Move-in", text: "Receive your digital receipt and check-in instructions instantly." }
                            ].map((item, i) => (
                                <li key={i} className="flex gap-4">
                                    <div className="w-6 h-6 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-500 shrink-0 mt-1">
                                        <CheckCircle2 size={14} />
                                    </div>
                                    <div>
                                        <p className="font-black uppercase tracking-widest text-[10px] text-white mb-1">{item.title}</p>
                                        <p className="text-sm text-zinc-500 font-medium leading-relaxed">{item.text}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* For Owners */}
                    <div className="bg-white/[0.03] border border-white/10 rounded-[3rem] p-12 hover:bg-white/[0.05] transition-all group overflow-hidden relative border-blue-500/20">
                        <div className="absolute top-0 right-0 p-12 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
                            <Home size={120} />
                        </div>
                        <h2 className="text-4xl font-black mb-8 italic uppercase tracking-tighter text-white">For <span className="text-emerald-500 text-blue-500">Owners</span></h2>
                        <ul className="space-y-6">
                            {[
                                { title: "Premium Listing", text: "Showcase your property to thousands of verified students with a few clicks." },
                                { title: "Tenant Screening", text: "We manage the initial inquiries, ensuring you only deal with serious, verified tenants." },
                                { title: "Automated Payouts", text: "Funds are settled directly into your mobile money or bank account." },
                                { title: "Inventory Management", text: "Live tracking of room availability and historical reservation data." }
                            ].map((item, i) => (
                                <li key={i} className="flex gap-4">
                                    <div className="w-6 h-6 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-500 shrink-0 mt-1">
                                        <CheckCircle2 size={14} />
                                    </div>
                                    <div>
                                        <p className="font-black uppercase tracking-widest text-[10px] text-white mb-1">{item.title}</p>
                                        <p className="text-sm text-zinc-500 font-medium leading-relaxed">{item.text}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Detailed Step Cards */}
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
                            </div>
                        </div>
                    ))}
                </div>

                {/* FAQ Style Placeholder Section */}
                <div className="mt-32 max-w-4xl mx-auto">
                    <h2 className="text-3xl font-black mb-12 italic uppercase tracking-tighter text-center">Frequently <span className="text-blue-500">Answered</span></h2>
                    <div className="space-y-4">
                        {[
                            { q: "How much does it cost?", a: "Listing is free for owners. Tenants pay a small platform fee upon successful booking." },
                            { q: "Is my payment secure?", a: "Yes. All payments are processed via Paystack and held in escrow until verification." },
                            { q: "What if the hostel is full?", a: "Our live inventory system prevents overbooking, showing you only available rooms." }
                        ].map((faq, i) => (
                            <div key={i} className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl">
                                <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-2">Question {i+1}</p>
                                <h4 className="text-lg font-bold mb-4 text-white uppercase italic tracking-tight">{faq.q}</h4>
                                <p className="text-zinc-500 text-sm leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-32 p-12 bg-white/[0.02] border border-white/5 rounded-[3rem] text-center max-w-4xl mx-auto backdrop-blur-md">
                    <h3 className="text-3xl font-black mb-6 italic uppercase tracking-tighter">Ready to find your perfect space?</h3>
                    <p className="text-zinc-500 text-lg mb-10 max-w-xl mx-auto font-medium">Join thousands of students who trust HostelGH for their accommodation needs.</p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Link href="/hostels" className="h-16 px-10 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-500 transition-all flex items-center gap-3 shadow-[0_10px_40px_rgba(37,99,235,0.3)] active:scale-95">
                            Start Searching <Search size={20} />
                        </Link>
                        <Link href="/support/help-center" className="h-16 px-10 bg-white/5 text-white rounded-2xl font-black uppercase tracking-widest border border-white/10 hover:bg-white/10 transition-all flex items-center gap-3 active:scale-95">
                            About Support <ArrowRight size={20} />
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
