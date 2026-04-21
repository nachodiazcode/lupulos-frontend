"use client";

import dynamic from "next/dynamic";
import { CircularProgress } from "@mui/material";
import Navbar from "@/components/Navbar";
import HeroSection from "@/features/landing/components/HeroSection";
import useAuth from "@/hooks/useAuth";
import { HOME_FEED_MAX_WIDTH } from "./homeFeed.constants";

const LoggedInHome = dynamic(() => import("./LoggedInHome"), {
  loading: () => <HomeLoadingState />,
});

const Footer = dynamic(() => import("@/components/Footer"));
const CommunitySection = dynamic(() => import("@/features/landing/components/CommunitySection"));
const CtaSection = dynamic(() => import("@/features/landing/components/CtaSection"));
const NewsletterBanner = dynamic(() => import("@/features/landing/components/NewsletterBanner"));
const GoldenParticles = dynamic(() => import("@/features/landing/components/GoldenParticles"), {
  ssr: false,
});
const TrendsSidenav = dynamic(() => import("@/features/landing/components/TrendsSidenav"), {
  ssr: false,
});

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
      <main className="relative flex min-h-[70vh] items-center justify-center px-4 py-10 sm:px-6">
        <div
          className="flex w-full flex-col items-center gap-3 rounded-[2rem] border px-6 py-10 text-center sm:px-8"
          style={{
            maxWidth: HOME_FEED_MAX_WIDTH,
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--color-surface-card) 92%, transparent), color-mix(in srgb, var(--color-surface-card-alt) 88%, transparent))",
            borderColor: "color-mix(in srgb, var(--color-border-amber) 32%, transparent)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <CircularProgress
            size={34}
            sx={{ color: "var(--color-amber-primary)" }}
            aria-label="Cargando inicio"
          />
          <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
            Cargando inicio...
          </p>
          <p className="max-w-sm text-xs" style={{ color: "var(--color-text-muted)" }}>
            Estamos preparando tu experiencia en Lúpulos.
          </p>
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
