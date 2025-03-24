import Header from "./components/Header";
import Hero from "./components/Hero";
import AboutSection from "./components/AboutSection";
import AffiliatesSection from "./components/AffiliatesSection";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Hero />
        <AboutSection />
        <AffiliatesSection />
      </main>
      <Footer />
    </div>
  );
}
