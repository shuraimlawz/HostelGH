export default function StatsCards() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="p-6 bg-white border rounded-lg shadow-sm">
                    <div className="text-sm text-gray-500">Statistic Title</div>
                    <div className="text-2xl font-bold mt-1">0,000</div>
                </div>
            ))}
        </div>
    );
}
