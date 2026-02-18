"use client";

import { FileText, ShieldAlert, ArrowRight, Clock, Zap } from "lucide-react";

export default function TermsPage() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-20">
            {/* Header section with icon */}
            <div className="flex flex-col items-center text-center space-y-6 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
                    <FileText size={32} />
                </div>
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">Terms of Service</h1>
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                        <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
                            <Clock size={12} />
                            6 min read
                        </span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-black uppercase tracking-widest">
                            Effective: Feb 18, 2026
                        </span>
                        <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-black uppercase tracking-widest">
                            Standard v2.1
                        </span>
                    </div>
                </div>
            </div>

            {/* Quick Summary / Takeaways */}
            <div className="mb-20 p-8 md:p-10 bg-blue-600 rounded-[3rem] text-white overflow-hidden relative group animate-in fade-in zoom-in-95 duration-700 delay-100">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/20 transition-colors" />
                <div className="relative space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-widest">
                        <Zap size={14} className="fill-yellow-400 text-yellow-400" />
                        Key Takeaways
                    </div>
                    <div className="grid md:grid-cols-2 gap-6 lg:gap-12">
                        <div className="space-y-2">
                            <h3 className="text-xl font-black">We facilitate bookings</h3>
                            <p className="text-blue-100 font-medium">HostelGH is a platform that connects students with hostel owners. We don't own the hostels themselves.</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black">Accuracy is on you</h3>
                            <p className="text-blue-100 font-medium">Owners must provide honest listing info, and tenants must provide real ID and details.</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black">Secure Payments</h3>
                            <p className="text-blue-100 font-medium">All financial transactions happen via Paystack. We never store your full card details.</p>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black">Stay On-Platform</h3>
                            <p className="text-blue-100 font-medium">Booking outside our system voids all safety guarantees and refund protections.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-16">
                <section className="group animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center font-black text-lg">01</div>
                        <h2 className="text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">Acceptance of Terms</h2>
                    </div>
                    <div className="bg-white border-2 border-gray-50 rounded-[2rem] p-8 hover:border-gray-100 shadow-sm transition-all leading-relaxed">
                        <p className="text-gray-600 text-lg font-medium">
                            By accessing or using the HostelGH platform, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our services. We provide a platform connecting university students with verified accommodation providers.
                        </p>
                    </div>
                </section>

                <section className="group animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center font-black text-lg">02</div>
                        <h2 className="text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">User Obligations</h2>
                    </div>
                    <div className="bg-white border-2 border-gray-50 rounded-[2rem] p-8 hover:border-gray-100 shadow-sm transition-all space-y-6">
                        <p className="text-gray-600 text-lg font-medium leading-relaxed">
                            Users must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                            {[
                                "Minimum age of 18 years",
                                "No illegal or unauthorized use",
                                "Accurate listing information",
                                "Compliance with hostel rules"
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl group/item">
                                    <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-sm group-hover/item:bg-blue-600 group-hover/item:text-white transition-colors">
                                        <ArrowRight size={14} />
                                    </div>
                                    <span className="text-sm font-bold text-gray-700">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="group animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center font-black text-lg">03</div>
                        <h2 className="text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">Booking and Payments</h2>
                    </div>
                    <div className="bg-white border-2 border-gray-50 rounded-[2rem] p-8 hover:border-gray-100 shadow-sm transition-all leading-relaxed">
                        <p className="text-gray-600 text-lg font-medium">
                            All bookings made through HostelGH are subject to the specific hostel's availability and rules. Payments are processed via Paystack. HostelGH acts as a facilitator and is not responsible for the actual provision of accommodation. Fees may apply for certain platform services.
                        </p>
                    </div>
                </section>

                <section className="group animate-in fade-in slide-in-from-bottom-8 duration-700 delay-400">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center font-black text-lg">04</div>
                        <h2 className="text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">Limitation of Liability</h2>
                    </div>
                    <div className="bg-red-50/30 border-2 border-red-50 rounded-[2rem] p-8 hover:border-red-100 transition-all">
                        <div className="flex items-start gap-4">
                            <ShieldAlert className="text-red-600 shrink-0 mt-1" size={24} />
                            <p className="text-gray-700 text-lg font-medium leading-relaxed italic">
                                HostelGH shall not be liable for any direct, indirect, incidental, or consequential damages arising from your use of the platform or the services provided by hostel owners. Use the platform at your own risk.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Final Help/Contact Section */}
                <div className="mt-20 p-12 bg-gray-900 rounded-[3rem] text-center space-y-6">
                    <h3 className="text-2xl font-bold text-white">Questions about our Terms?</h3>
                    <p className="text-gray-400 font-medium max-w-lg mx-auto">
                        If you have any concerns regarding these terms, please contact our legal team for clarification.
                    </p>
                    <div className="pt-4">
                        <a
                            href="mailto:legal@hostelgh.com"
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl"
                        >
                            Contact Legal Team
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
