export default function HostelGrid({ children }: { children: React.ReactNode }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {children}
        </div>
    );
}
