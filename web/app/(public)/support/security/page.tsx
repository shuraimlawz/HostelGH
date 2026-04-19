"use client";

import { Lock, CreditCard, Landmark, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function SecurityPage() {
    return (
        <main className="min-h-screen bg-[#020617] text-white pt-32 pb-24 overflow-hidden relative">
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[150px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-3xl mx-auto mb-20 text-center">
                    <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] flex items-center justify-center text-emerald-500 mb-8 mx-auto shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                        <Lock size={40} />
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 italic uppercase leading-tight">
                        Payment <span className="text-emerald-500">Security</span>
                    </h1>
                    <p className="text-zinc-400 text-lg font-medium leading-relaxed max-w-xl mx-auto">
                        Your cash is safe. We use enterprise-grade encryption and trusted African payment giants.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
                    {[
                        { icon: Lock, title: "256-bit SSL", text: "Every transaction is encrypted using military-grade security protocols." },
                        { icon: Landmark, title: "Paystack Powered", text: "The same security used by the world's biggest companies to handle payments." },
                        { icon: CreditCard, title: "Escrow Protection", text: "Your funds are held safely until the hostel room check-in is verified." }
                    ].map((item, i) => (
                        <div key={i} className="p-10 bg-white/[0.03] border border-white/10 rounded-[2.5rem] space-y-6 hover:bg-white/[0.05] transition-all group overflow-hidden relative">
                            <div className="w-12 h-12 rounded-xl bg-emerald-600/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                <item.icon size={28} />
                            </div>
                            <h3 className="text-xl font-black uppercase italic tracking-tight">{item.title}</h3>
                            <p className="text-zinc-500 text-sm leading-relaxed">{item.text}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-12 flex flex-col items-center text-center max-w-4xl mx-auto">
                    <div className="flex items-center gap-6 mb-8 grayscale opacity-50">
                        <div className="font-black text-xl tracking-tighter italic uppercase text-white">Verified by Paystack</div>
                    </div>
                    <h3 className="text-3xl font-black mb-6 italic uppercase tracking-tighter">100% Secure Environment</h3>
                    <p className="text-zinc-500 text-md mb-10 max-w-lg mx-auto font-medium">
                        We prioritize financial integrity. If you encounter any billing issues, our finance team is available 24/7.
                    </p>
                    <Link href="/support/help-center" className="h-14 px-10 bg-emerald-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-emerald-500 transition-all flex items-center gap-2 shadow-xl shadow-emerald-600/20 active:scale-95">
                        Get Payment Help <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        </main>
    );
}
