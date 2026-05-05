"use client";

import { Shield, Search, CreditCard, Users, AlertTriangle, CheckCircle2, Phone } from "lucide-react";
import ReportForm from "@/components/support/ReportForm";

const SAFETY_TIPS = [
    {
        title: "Avoid scams",
        description: "Never pay a large sum to an agent you haven't met in person. The only upfront payment on HostelGH is our GHS 5 booking fee — processed safely through Paystack.",
        icon: Search,
        iconColor: "text-blue-600",
        iconBg: "bg-blue-100",
    },
    {
        title: "Check for the Verified badge",
        description: "The blue 'Verified' badge means our team has confirmed the hostel exists and photos match. Always prefer verified listings when choosing a room.",
        icon: CheckCircle2,
        iconColor: "text-green-600",
        iconBg: "bg-green-100",
    },
    {
        title: "Only pay through the platform",
        description: "Use our Paystack checkout for booking fees. Don't send money to a personal MoMo number or bank account before you've moved in — even if the owner insists.",
        icon: CreditCard,
        iconColor: "text-orange-600",
        iconBg: "bg-orange-100",
    },
    {
        title: "View properties safely",
        description: "When visiting a hostel for the first time, go during the day and bring a friend. Let someone know your location. Legitimate owners won't pressure you.",
        icon: Users,
        iconColor: "text-purple-600",
        iconBg: "bg-purple-100",
    },
    {
        title: "Don't share personal documents early",
        description: "Never send your Ghana Card or student ID before your booking is confirmed. Legitimate owners won't ask for documents before a visit.",
        icon: Shield,
        iconColor: "text-red-600",
        iconBg: "bg-red-100",
    },
    {
        title: "Call us if something feels off",
        description: "If anything feels wrong during a booking or viewing, stop and contact us. We respond within minutes during business hours.",
        icon: Phone,
        iconColor: "text-teal-600",
        iconBg: "bg-teal-100",
    }
];

export default function SafetyPage() {
    return (
        <div className="space-y-16 lg:space-y-24">
            {/* Header */}
            <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-primary text-[9px] font-black uppercase tracking-widest border border-primary/20">
                    <Shield size={10} />
                    Trust & Safety
                </div>
                <h1 className="text-3xl font-black tracking-tight text-foreground">Safety Guidelines</h1>
                <p className="text-sm font-medium max-w-xl leading-relaxed text-muted-foreground">
                    Student housing scams happen in Ghana. We've built these guidelines to help you find a safe room and spot red flags early.
                </p>
            </div>

            {/* Tips Grid */}
            <section className="space-y-6">
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                    What to watch out for
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {SAFETY_TIPS.map((tip) => (
                        <div
                            key={tip.title}
                            className="p-6 rounded-[2rem] border-2 border-border bg-card flex gap-5 hover:border-primary/20 hover:shadow-md transition-all"
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${tip.iconBg} ${tip.iconColor}`}>
                                <tip.icon size={22} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-base font-black text-foreground leading-tight">{tip.title}</h3>
                                <p className="text-xs text-muted-foreground font-medium leading-relaxed">{tip.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Report Section */}
            <section id="report" className="space-y-6">
                <div>
                    <h2 className="text-2xl font-black text-foreground">See something suspicious?</h2>
                    <p className="text-sm text-muted-foreground font-medium mt-1 max-w-lg">
                        If a listing looks fake, an owner is asking for offline payments, or you feel unsafe — report it. We act fast.
                    </p>
                </div>
                <ReportForm />
            </section>

            {/* Dispute Resolution */}
            <section className="space-y-5 p-8 md:p-10 bg-muted rounded-[2.5rem] border border-border">
                <div className="flex items-center gap-3">
                    <AlertTriangle className="text-orange-500" size={20} />
                    <h2 className="text-xl font-black text-foreground">Dispute Resolution</h2>
                </div>
                <p className="text-muted-foreground font-medium text-sm leading-relaxed">
                    If you arrive at a hostel and it doesn't match the verified listing:
                </p>
                <ol className="list-decimal pl-5 space-y-2 text-muted-foreground text-sm font-medium">
                    <li>Don't pay any remaining rent to the owner.</li>
                    <li>Take clear photos or video of the differences.</li>
                    <li>Report via the form above within 12 hours of arrival.</li>
                    <li>Our team investigates and issues a full refund of your booking fee if the claim is valid.</li>
                </ol>
                <p className="text-muted-foreground text-xs font-medium pt-2">
                    Emergency contact:{" "}
                    <a href="mailto:safety@hostelgh.com" className="text-primary font-bold hover:underline">safety@hostelgh.com</a>
                    {" "}or WhatsApp{" "}
                    <a href="https://wa.me/233598494617" className="text-primary font-bold hover:underline">+233 59 849 4617</a>
                </p>
            </section>
        </div>
    );
}
