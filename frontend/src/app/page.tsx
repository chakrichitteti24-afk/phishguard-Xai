import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import TrustBadges from "@/components/landing/TrustBadges";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Statistics from "@/components/landing/Statistics";
import Screenshots from "@/components/landing/Screenshots";
import Testimonials from "@/components/landing/Testimonials";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col overflow-hidden">
      <Navbar />
      <Hero />
      <TrustBadges />
      <Features />
      <HowItWorks />
      <Statistics />
      <Screenshots />
      <Testimonials />
      <FAQ />
      <Footer />
    </main>
  );
}
