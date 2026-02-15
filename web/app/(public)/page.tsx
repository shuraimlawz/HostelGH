import HeroSearch from "@/components/home/HeroSearch";
import CityCarousel from "@/components/home/CityCarousel";
import FeaturedHostels from "@/components/home/FeaturedHostels";
import ListHostelAction from "@/components/home/ListHostelAction";

export default function LandingPage() {
    return (
        <div className="space-y-16 pb-20">
            <HeroSearch />

            <div className="container px-6 space-y-16">
                <CityCarousel />

                <div className="bg-blue-50 rounded-3xl p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="max-w-md">
                        <h3 className="text-3xl font-bold text-blue-900 mb-4 tracking-tight">Are you a Hostel Owner?</h3>
                        <p className="text-blue-800 text-lg opacity-90">Join thousands of owners managing their properties and bookings directly on HostelGH.</p>
                    </div>
                    <ListHostelAction />
                </div>

                <FeaturedHostels />
            </div>
        </div>
    );
}
