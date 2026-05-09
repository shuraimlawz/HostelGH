import HeroSearch from "@/components/home/HeroSearch";
import CityCarousel from "@/components/home/CityCarousel";
import FeaturedHostels from "@/components/home/FeaturedHostels";
import HomeDiscovery from "@/components/home/HomeDiscovery";
import HowItWorks from "@/components/home/HowItWorks";
// import MarketLeaders from "@/components/home/MarketLeaders"; // TODO: re-enable when logos are finalised

export default function LandingPage() {
    return (
        <div className="pb-20">
            <HeroSearch />
            {/* <MarketLeaders /> */}
            <HowItWorks />

            <div className="container mx-auto px-4 md:px-10 mt-8">
                <CityCarousel />
                <FeaturedHostels />
                <HomeDiscovery />
            </div>
        </div>
    );
}
