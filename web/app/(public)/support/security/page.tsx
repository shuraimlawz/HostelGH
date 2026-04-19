"use client";

import { ShieldAlert, Lock, CreditCard, Landmark, CheckCircle2, ArrowRight } from "lucide-react";

export default function SecurityPage() {
    return (
        <main className="min-h-screen bg-[#020617] text-white pt-32 pb-24 overflow-hidden relative">
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[150px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-4xl mx-auto mb-24 text-center">
                    <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] flex items-center justify-center text-emerald-500 mb-8 mx-auto shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                        <Lock size={40} />
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 italic uppercase leading-none">
                        Payment <span className="text-emerald-500">Security</span>
                    </h1>
                    <p className="text-zinc-400 text-xl font-medium leading-relaxed max-w-2xl mx-auto">
                        Your financial safety is our top priority. We use world-class encryption and trusted payment partners to protect every transaction.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                    <div className="p-10 bg-white/[0.03] border border-white/10 rounded-[2.5rem] space-y-6 hover:bg-white/[0.05] transition-colors group">
                        <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <ShieldAlert size={28} />
                        </div>
                        <h3 className="text-xl font-black uppercase italic tracking-tight">End-to-End Encryption</h3>
                        <p className="text-zinc-500 text-sm leading-relaxed">
                            All data transmitted between your device and our servers is encrypted using industry-standard SSL/TLS protocols.
                        </p>
                    </div>

                    <div className="p-10 bg-white/[0.03] border border-white/10 rounded-[2.5rem] space-y-6 hover:bg-white/[0.05] transition-colors group">
                        <div className="w-12 h-12 rounded-xl bg-emerald-600/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                            <Landmark size={28} />
                        </div>
                        <h3 className="text-xl font-black uppercase italic tracking-tight">Regulated Partners</h3>
                        <p className="text-zinc-500 text-sm leading-relaxed">
                            We partner with **Paystack**, a globally recognized and regulated payment gateway, ensuring your card details never touch our servers.
                        </p>
                    </div>

                    <div className="p-10 bg-white/[0.03] border border-white/10 rounded-[2.5rem] space-y-6 hover:bg-white/[0.05] transition-colors group">
                        <div className="w-12 h-12 rounded-xl bg-violet-600/10 flex items-center justify-center text-violet-500 group-hover:bg-violet-600 group-hover:text-white transition-all">
                            <CreditCard size={28} />
                        </div>
                        <h3 className="text-xl font-black uppercase italic tracking-tight">Fraud Monitoring</h3>
                        <p className="text-zinc-500 text-sm leading-relaxed">
                            Our automated systems monitor for suspicious activity 24/7, providing an extra layer of protection for every booking.
                        </p>
                    </div>
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-12 flex flex-col items-center text-center">
                    <CheckCircle2 size={48} className="text-emerald-500 mb-8" />
                    <h3 className="text-3xl font-black mb-6 italic uppercase tracking-tighter">Verified & Secure Ecosystem</h3>
                    <p className="text-zinc-500 text-lg mb-10 max-w-xl mx-auto font-medium">
                        Rest easy knowing that HostelGH is built on a foundation of trust, security, and technological excellence.
                    </p>
                    <div className="flex items-center gap-6 grayscale opacity-50">
                        {/* Placeholder for legal/payment logos if needed */}
                        <div className="font-black text-xl tracking-tighter italic uppercase text-white">Verified by Paystack</div>
                    </div>
                </div>
            </div>
        </main>
    );
}
