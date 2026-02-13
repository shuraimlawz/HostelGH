import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Shell({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-dvh flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    );
}
