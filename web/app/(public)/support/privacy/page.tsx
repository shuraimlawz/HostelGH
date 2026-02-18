"use client";

import { Eye, ShieldCheck, Database, Share2, Mail, ExternalLink } from "lucide-react";

export default function PrivacyPage() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-20">
            {/* Header section with icon */}
            <div className="flex flex-col items-center text-center space-y-6 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
                    <Eye size={32} />
                </div>
                <div className="space-y-2">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">Privacy Policy</h1>
                    <div className="flex items-center justify-center gap-4 pt-2">
                        <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-black uppercase tracking-widest">
                            Updated: Feb 18, 2026
                        </span>
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest">
                            v1.8
                        </span>
                    </div>
                </div>
            </div>

            <div className="space-y-16">
                <section className="group animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center">
                            <Database size={20} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">Data Collection</h2>
                    </div>
                    <div className="bg-white border-2 border-gray-50 rounded-[2rem] p-8 hover:border-gray-100 shadow-sm transition-all leading-relaxed">
                        <p className="text-gray-600 text-lg font-medium">
                            We collect personal information that you provide directly to us when you create an account, make a booking, or communicate with support. This includes your name, email address, phone number, and payment information. We also collect usage data to improve our platform experience.
                        </p>
                    </div>
                </section>

                <section className="grid md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                    <div className="p-8 bg-blue-50/50 rounded-[2rem] border-2 border-transparent hover:border-blue-100 transition-all">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 mb-6 shadow-sm">
                            <ShieldCheck size={24} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-4 tracking-tight">How we use data</h3>
                        <p className="text-gray-600 font-medium leading-relaxed">
                            To process your bookings, verify your identity, and improve our services through sophisticated analytics. We use your location to find nearby hostels.
                        </p>
                    </div>
                    <div className="p-8 bg-green-50/50 rounded-[2rem] border-2 border-transparent hover:border-green-100 transition-all">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-green-600 mb-6 shadow-sm">
                            <Database size={24} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-4 tracking-tight">Your data rights</h3>
                        <p className="text-gray-600 font-medium leading-relaxed">
                            You have the absolute right to access, correct, or permanently delete your personal information at any time from your account settings.
                        </p>
                    </div>
                </section>

                <section className="group animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center">
                            <Share2 size={20} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">Third-Party Sharing</h2>
                    </div>
                    <div className="bg-white border-2 border-gray-50 rounded-[2rem] p-8 hover:border-gray-100 shadow-sm transition-all leading-relaxed">
                        <p className="text-gray-600 text-lg font-medium">
                            We share necessary information with hostel owners to facilitate your bookings. We also use third-party payment processors like <span className="text-blue-600 font-bold">Paystack</span> to securely handle financial transactions. We do not sell your personal data to advertisers.
                        </p>
                    </div>
                </section>

                <section className="group animate-in fade-in slide-in-from-bottom-8 duration-700 delay-400">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center">
                            <ShieldCheck size={20} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">Security Measures</h2>
                    </div>
                    <div className="bg-white border-2 border-gray-50 rounded-[2rem] p-8 hover:border-gray-100 shadow-sm transition-all flex flex-col md:flex-row items-center gap-6">
                        <div className="p-6 bg-gray-900 text-white rounded-2xl font-black text-center shrink-0">
                            SSL ENCRYPTED
                        </div>
                        <p className="text-gray-600 text-lg font-medium leading-relaxed">
                            We implement industry-standard security protocols, including 256-bit SSL encryption and secure server infrastructure, to protect your data from unauthorized access or disclosure.
                        </p>
                    </div>
                </section>

                {/* Contact Section */}
                <div className="mt-20 pt-16 border-t-2 border-gray-50 text-center space-y-8 animate-in fade-in duration-1000">
                    <div className="space-y-3">
                        <h3 className="text-3xl font-black text-gray-900">Have privacy concerns?</h3>
                        <p className="text-gray-500 font-medium max-w-lg mx-auto">
                            If you have any questions about our privacy practices, please reach out to our team.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a
                            href="mailto:privacy@hostelgh.com"
                            className="bg-gray-100 text-gray-900 px-8 py-4 rounded-2xl font-black hover:bg-gray-200 transition-all flex items-center gap-2"
                        >
                            <Mail size={18} />
                            privacy@hostelgh.com
                        </a>
                        <button className="text-blue-600 font-black flex items-center gap-2 px-8 py-4 hover:bg-blue-50 rounded-2xl transition-all">
                            View Data Report
                            <ExternalLink size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
