import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/features/landing/components/HeroSection";
import BentoFeatures from "@/features/landing/components/BentoFeatures";
import StatsSection from "@/features/landing/components/StatsSection";
import StepsSection from "@/features/landing/components/StepsSection";
import CommunitySection from "@/features/landing/components/CommunitySection";
import CtaSection from "@/features/landing/components/CtaSection";
import NewsletterBanner from "@/features/landing/components/NewsletterBanner";
import GoldenParticles from "@/features/landing/components/GoldenParticles";
import TrendsSidenav from "@/features/landing/components/TrendsSidenav";

export default function HomePage() {
  return (
    <>
      <GoldenParticles count={25} />
      <Navbar />
      <TrendsSidenav />
      <HeroSection />
      <CommunitySection />
      <BentoFeatures />
      <StepsSection />
      <CtaSection />
      <NewsletterBanner />
      <Footer />
    </>
  );
}
