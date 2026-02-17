export default function LandingPage() {
    return (
        <div className="pb-20">
            <HeroSearch />

            <div className="container mx-auto px-4 md:px-10 space-y-12 mt-8">
                <CityCarousel />
                <FeaturedHostels />
            </div>
        </div>
    );
}
