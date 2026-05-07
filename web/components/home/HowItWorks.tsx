import { Search, ShieldCheck, Home, CheckCircle2 } from "lucide-react";

export default function HowItWorks() {
    const steps = [
        {
            title: "Search & Compare",
            description: "Find the perfect hostel near your university. Filter by price, amenities, and proximity to campus.",
            icon: Search,
            color: "text-blue-500",
            bg: "bg-blue-50",
        },
        {
            title: "Secure Your Spot",
            description: "Pay a small booking fee online using Mobile Money or Card to secure your room. The main rent is paid upon arrival.",
            icon: ShieldCheck,
            color: "text-emerald-500",
            bg: "bg-emerald-50",
        },
        {
            title: "Move In",
            description: "Get your digital receipt and head straight to your new hostel. It's that simple.",
            icon: Home,
            color: "text-indigo-500",
            bg: "bg-indigo-50",
        }
    ];

    return (
        <section className="py-20 bg-white dark:bg-gray-950 transition-colors duration-300">
            <div className="container mx-auto px-4 md:px-10">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                        Simple Process
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-4 tracking-tight">
                        How It Works
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm font-medium leading-relaxed">
                        Booking your hostel shouldn't be a hassle. We've streamlined the entire process so you can secure a room in just a few minutes.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
                    {/* Connecting Line */}
                    <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gray-100 dark:bg-gray-800 -translate-y-1/2 z-0 transition-colors" />

                    {steps.map((step, index) => (
                        <div key={index} className="relative z-10 flex flex-col items-center text-center bg-white dark:bg-gray-950 p-6 transition-colors">
                            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-${step.color.split('-')[1]}-500/10 ${step.bg} ${step.color} dark:bg-opacity-10 transform transition-transform hover:-translate-y-2`}>
                                <step.icon size={32} />
                            </div>
                            <div className="flex items-center justify-center gap-2 mb-3">
                                <span className="w-6 h-6 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 flex items-center justify-center text-[10px] font-bold transition-colors">
                                    {index + 1}
                                </span>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{step.title}</h3>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{step.description}</p>
                        </div>
                    ))}
                </div>
                
                <div className="mt-16 bg-gray-900 dark:bg-gray-900/50 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl dark:shadow-none border dark:border-gray-800 overflow-hidden relative transition-colors">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -mr-32 -mt-32" />
                    <div className="relative z-10 space-y-2 text-center md:text-left">
                        <h3 className="text-2xl font-bold text-white tracking-tight">Verified by students.</h3>
                        <p className="text-gray-400 text-sm">Join thousands of students who trust our platform for a secure stay.</p>
                    </div>
                    <div className="relative z-10 flex flex-wrap justify-center gap-4">
                        {["Verified Listings", "24/7 Support", "Secure Payments"].map((badge, i) => (
                            <div key={i} className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-white text-xs font-bold border border-white/10">
                                <CheckCircle2 className="text-blue-400" size={16} />
                                {badge}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
