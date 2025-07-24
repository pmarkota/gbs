import Header from "./components/Header";
import Hero from "./components/Hero";
import AboutSection from "./components/AboutSection";
import AffiliatesSection from "./components/AffiliatesSection";
import Footer from "./components/Footer";
import ActivePolls from "@/components/ActivePolls";
import { AuthProvider } from "@/lib/authClient";

export default function Home() {
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Hero />
          <ActivePolls />
          {/* <AboutSection /> */}
          <AffiliatesSection />
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}
