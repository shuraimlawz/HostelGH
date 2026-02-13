export default function AdminSidebar() {
    return (
        <aside className="w-64 bg-dark h-screen text-white p-6">
            <h2 className="text-xl font-bold mb-8 text-primary">Admin Panel</h2>
            <nav className="space-y-4">
                <div className="font-medium">System Stats</div>
                <div className="font-medium text-gray-400">User Moderation</div>
                <div className="font-medium text-gray-400">Hostel Approval</div>
            </nav>
        </aside>
    );
}
