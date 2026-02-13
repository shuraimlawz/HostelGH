export default function OwnerSidebar() {
    return (
        <aside className="w-64 bg-gray-50 h-screen border-r p-6">
            <h2 className="text-xl font-bold mb-8">Dashboard</h2>
            <nav className="space-y-4">
                <div className="font-medium text-gray-900">Overview</div>
                <div className="font-medium text-gray-600">My Hostels</div>
                <div className="font-medium text-gray-600">Room Management</div>
                <div className="font-medium text-gray-600">Booking Requests</div>
            </nav>
        </aside>
    );
}
