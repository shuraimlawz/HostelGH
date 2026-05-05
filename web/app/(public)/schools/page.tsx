"use client";

import { GraduationCap, ArrowRight, Building2, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SchoolsComingSoon() {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center py-20 px-6">
            <div className="container max-w-4xl mx-auto text-center space-y-12">
                
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-full">
                    <GraduationCap size={16} className="text-blue-600 dark:text-blue-400" />
                    <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-[0.2em]">Partner with HostelGH</span>
                </div>

                {/* Hero Section */}
                <div className="space-y-6">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-slate-900 dark:text-white uppercase leading-[0.9]">
                        Empowering <span className="text-blue-600">Institutions.</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                        We're building a dedicated portal for universities to manage student accommodation, verify off-campus listings, and ensure student safety.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mt-12">
                    <div className="p-8 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/50 rounded-[2.5rem] space-y-4">
                        <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 dark:border-slate-700">
                            <ShieldCheck className="text-blue-600" size={24} />
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white uppercase text-sm tracking-tight">Verified Listings</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">Ensure every hostel near your campus meets your safety and quality standards.</p>
                    </div>

                    <div className="p-8 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/50 rounded-[2.5rem] space-y-4">
                        <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 dark:border-slate-700">
                            <Building2 className="text-blue-600" size={24} />
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white uppercase text-sm tracking-tight">Analytics Dashboard</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">Monitor housing trends, price fluctuations, and student distribution in real-time.</p>
                    </div>

                    <div className="p-8 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/50 rounded-[2.5rem] space-y-4">
                        <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 dark:border-slate-700">
                            <Zap className="text-blue-600" size={24} />
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white uppercase text-sm tracking-tight">Direct Support</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">Collaborate directly with our team to resolve student housing disputes quickly.</p>
                    </div>
                </div>

                {/* CTA */}
                <div className="pt-10 flex flex-col md:flex-row items-center justify-center gap-4">
                    <Link href="/support">
                        <Button className="h-14 px-10 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-95 transition-all">
                            Register Interest
                        </Button>
                    </Link>
                    <Link href="/hostels">
                        <Button variant="ghost" className="h-14 px-10 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white font-bold text-[10px] uppercase tracking-widest transition-all">
                            Browse Current Listings <ArrowRight size={16} className="ml-2" />
                        </Button>
                    </Link>
                </div>

                {/* Footer Note */}
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-[0.3em] pt-10">
                    Launching Q3 2026 — Built for the Future of Student Housing
                </p>
            </div>
        </div>
    );
}
