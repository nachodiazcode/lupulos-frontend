import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/features/landing/components/HeroSection";
import BentoFeatures from "@/features/landing/components/BentoFeatures";
import StatsSection from "@/features/landing/components/StatsSection";
import StorySection from "@/features/landing/components/StorySection";
import StepsSection from "@/features/landing/components/StepsSection";
import CommunitySection from "@/features/landing/components/CommunitySection";
import CtaSection from "@/features/landing/components/CtaSection";
import GoldenParticles from "@/features/landing/components/GoldenParticles";

export default function HomePage() {
  return (
    <>
      <GoldenParticles count={25} />
      <Navbar />
      <HeroSection />
      <BentoFeatures />
      <StorySection />
      <StepsSection />
      <CommunitySection />
      <CtaSection />
      <Footer />
    </>
  );
}
