import HeroSearch from "@/components/home/HeroSearch";
import CityCarousel from "@/components/home/CityCarousel";
import FeaturedHostels from "@/components/home/FeaturedHostels";
import ListHostelAction from "@/components/home/ListHostelAction";

export default function LandingPage() {
    return (
        <div className="pb-20">
            <HeroSearch />

            <div className="container mx-auto px-6 md:px-10 space-y-12 mt-8">
                <CityCarousel />
                <FeaturedHostels />
            </div>
        </div>
    );
}
