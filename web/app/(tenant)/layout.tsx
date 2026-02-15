import TenantSidebar from "@/components/tenant/TenantSidebar";

export default function TenantLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-gray-50/50">
            <TenantSidebar />
            <div className="flex-1 w-full max-w-[100vw] overflow-x-hidden">
                <div className="md:p-8 p-4 pb-24 md:pb-8">
                    {children}
                </div>
            </div>
        </div>
    );
}
