"use client";

import { Shield, Search, CreditCard, Users, AlertTriangle, CheckCircle2 } from "lucide-react";
import ReportForm from "@/components/support/ReportForm";

const SAFETY_TIPS = [
    {
        title: "How to avoid scams",
        description: "Never pay huge sums of money to agents you haven't met. Real owners on HostelGH only take booking fees through our platform.",
        icon: Search,
        color: "text-blue-600",
        bgColor: "bg-blue-50"
    },
    {
        title: "Verifying Listings",
        description: "Look for the blue 'Verified' badge. This means our team has visited the hostel and confirmed its existence.",
        icon: CheckCircle2,
        color: "text-green-600",
        bgColor: "bg-green-50"
    },
    {
        title: "Safe Payments",
        description: "Always use our Paystack-powered checkout. Do not send direct bank transfers or mobile money to personal numbers without our confirmation.",
        icon: CreditCard,
        color: "text-orange-600",
        bgColor: "bg-orange-50"
    },
    {
        title: "Meeting Agents",
        description: "Always meet hostel agents during daylight hours and try to bring a friend with you for property viewings.",
        icon: Users,
        color: "text-purple-600",
        bgColor: "bg-purple-50"
    }
];

export default function SafetyPage() {
    return (
        <div className="space-y-16 lg:space-y-24">
            {/* Header Section */}
            <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full text-blue-600 text-[9px] font-black uppercase tracking-widest border border-blue-100">
                    <Shield size={10} className="fill-blue-600" />
                    Trust & Safety
                </div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                    Safety Guidelines
                </h1>
                <p className="text-gray-500 text-base font-medium max-w-xl leading-relaxed">
                    Your security is our priority. We've built these guidelines specifically for the Ghana hostel market to help you avoid scams and find a safe home.
                </p>
            </div>

            {/* Quick Tips Grid */}
            <section className="space-y-8">
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                    Safety Essentials
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {SAFETY_TIPS.map((tip) => (
                        <div
                            key={tip.title}
                            className="p-6 rounded-[2rem] bg-white border-2 border-gray-50 flex gap-5 hover:shadow-lg transition-all"
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${tip.bgColor} ${tip.color}`}>
                                <tip.icon size={22} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-gray-900 leading-tight">{tip.title}</h3>
                                <p className="text-xs text-gray-500 font-medium leading-relaxed">{tip.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Report an Issue Section */}
            <section id="report" className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black text-gray-900">Spotted something suspicious?</h2>
                        <p className="text-sm text-gray-500 font-medium max-w-lg">If a listing seems too good to be true or an owner asks for offline payments, let us know immediately.</p>
                    </div>
                </div>

                <ReportForm />
            </section>

            {/* Dispute Resolution Section */}
            <section className="space-y-6 p-8 md:p-10 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                    <AlertTriangle className="text-orange-600" size={20} />
                    <h2 className="text-xl font-black text-gray-900">Dispute Resolution</h2>
                </div>
                <div className="space-y-3 text-gray-600 font-medium leading-relaxed text-sm">
                    <p>
                        HostelGH acts as a mediator for disputes related to booking fee refunds and misrepresentation. If you arrive at a hostel and it does not match the 'Verified' listing:
                    </p>
                    <ol className="list-decimal pl-6 space-y-2">
                        <li>Do not pay any remaining rent balance to the owner.</li>
                        <li>Take clear photos or videos of the discrepancies.</li>
                        <li>Report the hostel via the form above within 12 hours of arrival.</li>
                        <li>Our team will investigate and, if valid, process a full refund of your booking fee.</li>
                    </ol>
                </div>
            </section>
        </div>
    );
}
