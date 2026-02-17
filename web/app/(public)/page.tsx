import HeroSearch from "@/components/home/HeroSearch";
import CityCarousel from "@/components/home/CityCarousel";
import FeaturedHostels from "@/components/home/FeaturedHostels";

export default function LandingPage() {
    return (
        <div className="pb-20">
            {/* Hero Section */}
            <div className="bg-[#1877F2] py-16 md:py-24 px-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 opacity-90" />
                <div className="relative z-10 container mx-auto text-center space-y-6">
                    <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
                        Find your perfect hostel
                    </h1>
                    <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto">
                        Secure, affordable, and comfortable student accommodation near your campus.
                    </p>
                    <div className="pt-4">
                        <HeroSearch />
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-10 space-y-12 mt-12">
                <CityCarousel />
                <FeaturedHostels />
            </div>
        </div>
    );
}
