"use client";

import SupportNav from "./SupportNav";

export default function SupportShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="container mx-auto px-6 py-12 md:py-20">
            <div className="flex flex-col md:flex-row gap-12 lg:gap-20">
                {/* Mobile Navigation (Top) */}
                <div className="md:hidden mb-8 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <SupportNav />
                </div>

                {/* Desktop Sidebar (Left) */}
                <aside className="hidden md:block w-64 shrink-0">
                    <div className="sticky top-32">
                        <SupportNav />
                    </div>
                </aside>

                {/* Content Area (Right) */}
                <main className="flex-1 max-w-4xl min-w-0">
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
