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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
                    <div className="p-10 bg-white/[0.03] border border-white/10 rounded-[2.5rem] space-y-6 hover:bg-white/[0.05] transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                            <ShieldAlert size={80} />
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all relative z-10">
                            <ShieldAlert size={28} />
                        </div>
                        <h3 className="text-2xl font-black uppercase italic tracking-tight relative z-10">AES-256 Encryption</h3>
                        <p className="text-zinc-500 text-sm leading-relaxed relative z-10">
                            Every byte of sensitive data is protected by military-grade AES-256 encryption, both at rest and in transit.
                        </p>
                    </div>

                    <div className="p-10 bg-white/[0.03] border border-white/10 rounded-[2.5rem] space-y-6 hover:bg-white/[0.05] transition-all group overflow-hidden relative border-emerald-500/10">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                            <Landmark size={80} />
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-emerald-600/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-all relative z-10">
                            <Landmark size={28} />
                        </div>
                        <h3 className="text-2xl font-black uppercase italic tracking-tight relative z-10">PCI-DSS Level 1</h3>
                        <p className="text-zinc-500 text-sm leading-relaxed relative z-10">
                            Our partner **Paystack** is PCI-DSS Level 1 certified. Your card credentials never touch our internal database.
                        </p>
                    </div>

                    <div className="p-10 bg-white/[0.03] border border-white/10 rounded-[2.5rem] space-y-6 hover:bg-white/[0.05] transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                            <CreditCard size={80} />
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-violet-600/10 flex items-center justify-center text-violet-400 group-hover:bg-violet-600 group-hover:text-white transition-all relative z-10">
                            <CreditCard size={28} />
                        </div>
                        <h3 className="text-2xl font-black uppercase italic tracking-tight relative z-10">Escrow Logic</h3>
                        <p className="text-zinc-500 text-sm leading-relaxed relative z-10">
                            Booking fees are held in a secure vault until the check-in is verified, protecting both students and owners.
                        </p>
                    </div>
                </div>

                {/* Additional Safety Clusters */}
                <div className="max-w-4xl mx-auto space-y-12 mb-32">
                    <div className="flex flex-col md:flex-row gap-12 items-start">
                        <div className="md:w-1/2 space-y-6">
                            <div className="px-4 py-1.5 bg-blue-600/10 text-blue-500 rounded-lg text-[9px] font-black uppercase tracking-widest w-fit">Infrastructure Security</div>
                            <h4 className="text-3xl font-black italic uppercase tracking-tighter text-white">Cloud Armor Isolation</h4>
                            <p className="text-zinc-500 leading-relaxed font-medium">
                                Our API architecture is isolated using private subnets and protected by Cloud Armor to mitigate DDoS attempts and malicious intrusion.
                            </p>
                        </div>
                        <div className="md:w-1/2 space-y-6">
                            <div className="px-4 py-1.5 bg-emerald-600/10 text-emerald-500 rounded-lg text-[9px] font-black uppercase tracking-widest w-fit">Audit Logs</div>
                            <h4 className="text-3xl font-black italic uppercase tracking-tighter text-white">Immutable Trail</h4>
                            <p className="text-zinc-500 leading-relaxed font-medium">
                                We maintain immutable system logs for every financial transaction, ensuring a clear audit trail in the event of any billing dispute.
                            </p>
                        </div>
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
