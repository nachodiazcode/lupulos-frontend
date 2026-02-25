import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSlideshow from "@/components/HeroSlideshow";
import StatsSection from "@/components/landing/StatsSection";
import StorySection from "@/components/landing/StorySection";
import StepsSection from "@/components/landing/StepsSection";
import CommunitySection from "@/components/landing/CommunitySection";
import CtaSection from "@/components/landing/CtaSection";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <HeroSlideshow />
      <StatsSection />
      <StorySection />
      <StepsSection />
      <CommunitySection />
      <CtaSection />
      <Footer />
    </>
  );
}
