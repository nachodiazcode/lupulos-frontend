"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/features/landing/components/HeroSection";
import CommunitySection from "@/features/landing/components/CommunitySection";
import CtaSection from "@/features/landing/components/CtaSection";
import NewsletterBanner from "@/features/landing/components/NewsletterBanner";
import GoldenParticles from "@/features/landing/components/GoldenParticles";
import TrendsSidenav from "@/features/landing/components/TrendsSidenav";
import useAuth from "@/hooks/useAuth";
import LoggedInHome from "./LoggedInHome";

function PublicHome() {
  return (
    <>
      <GoldenParticles count={25} />
      <Navbar />
      <TrendsSidenav />
      <HeroSection />
      <CommunitySection />
      <CtaSection />
      <NewsletterBanner />
      <Footer />
    </>
  );
}

function HomeLoadingState() {
  return (
    <>
      <GoldenParticles count={16} />
      <Navbar />
      <main className="relative min-h-[70vh] px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div
            className="overflow-hidden rounded-[2rem] border p-6 sm:p-8"
            style={{
              background:
                "linear-gradient(180deg, color-mix(in srgb, var(--color-surface-card) 92%, transparent), color-mix(in srgb, var(--color-surface-card-alt) 88%, transparent))",
              borderColor: "color-mix(in srgb, var(--color-border-amber) 32%, transparent)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <div className="h-5 w-40 animate-pulse rounded-full bg-white/10" />
            <div className="mt-6 grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)_300px]">
              <div className="h-48 animate-pulse rounded-[1.5rem] bg-white/8" />
              <div className="h-[34rem] animate-pulse rounded-[2rem] bg-white/8" />
              <div className="h-56 animate-pulse rounded-[1.5rem] bg-white/8" />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default function HomePageClient() {
  const { user, isAuthReady } = useAuth();

  if (!isAuthReady) {
    return <HomeLoadingState />;
  }

  if (user) {
    return <LoggedInHome />;
  }

  return <PublicHome />;
}
