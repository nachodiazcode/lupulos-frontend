"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import HomeComposer from "./HomeComposer";

/* ── Mock Data ── */
const trendingItems = [
  {
    id: "t1",
    title: "Hazy IPA Turbia",
    subtitle: "Cervecería Spoh",
    style: "NEIPA",
    abv: "6.2%",
    ibu: 45,
    city: "Santiago",
    image: "https://images.unsplash.com/photo-1584225065152-4a1454aa3d4e?q=80&w=600&auto=format&fit=crop",
    rating: 4.8,
    reviews: 312,
    trend: "+18%",
  },
  {
    id: "t2",
    title: "Doppelbock Premium",
    subtitle: "Kunstmann",
    style: "Doppelbock",
    abv: "7.5%",
    ibu: 28,
    city: "Valdivia",
    image: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?q=80&w=600&auto=format&fit=crop",
    rating: 4.6,
    reviews: 567,
    trend: "+12%",
  },
  {
    id: "t3",
    title: "West Coast IPA",
    subtitle: "Tamango",
    style: "WC IPA",
    abv: "6.8%",
    ibu: 65,
    city: "Recoleta",
    image: "https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?q=80&w=600&auto=format&fit=crop",
    rating: 4.7,
    reviews: 198,
    trend: "Nueva",
  },
  {
    id: "t4",
    title: "Kross Stout Barrica",
    subtitle: "Kross Brewing",
    style: "Barrel Aged Stout",
    abv: "9.2%",
    ibu: 42,
    city: "Curacaví",
    image: "https://images.unsplash.com/photo-1518176258769-f227c798150e?q=80&w=600&auto=format&fit=crop",
    rating: 4.9,
    reviews: 412,
    trend: "🔥 Hot",
  },
  {
    id: "t5",
    title: "Saison del Sur",
    subtitle: "Austral Brewing",
    style: "Saison",
    abv: "5.8%",
    ibu: 30,
    city: "Punta Arenas",
    image: "https://images.unsplash.com/photo-1567696911980-2eed69a46042?q=80&w=600&auto=format&fit=crop",
    rating: 4.5,
    reviews: 89,
    trend: "+8%",
  },
  {
    id: "t6",
    title: "Pilsner Volcán",
    subtitle: "Cervecería Volcanes",
    style: "Pilsner",
    abv: "4.8%",
    ibu: 35,
    city: "Pucón",
    image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?q=80&w=600&auto=format&fit=crop",
    rating: 4.4,
    reviews: 156,
    trend: "+5%",
  },
];

const communityItems = [
  {
    id: "c1",
    user: "Loom",
    avatar: "https://i.pravatar.cc/150?u=loom",
    action: "hizo check-in",
    target: "Kross Stout Barrica",
    time: "Hace 5 min",
    image: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "c2",
    user: "Honesto Mike",
    avatar: "https://i.pravatar.cc/150?u=mike",
    action: "anunció evento",
    target: "Tap Takeover",
    time: "Hace 1h",
    image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "c3",
    user: "Spoh",
    avatar: "https://i.pravatar.cc/150?u=spoh",
    action: "lanzó nueva cerveza",
    target: "Hazy IPA Turbia",
    time: "Hace 2h",
    image: "https://images.unsplash.com/photo-1600788886242-5c96aabe3757?q=80&w=600&auto=format&fit=crop",
  },
];

const newsItems = [
  {
    id: "n1",
    category: "Industria",
    categoryColor: "#16a34a",
    title: "Boom artesanal: Chile supera las 600 cervecerías independientes en 2026",
    summary: "Un nuevo reporte de ACECHI muestra el crecimiento sostenido del sector pese al alza del lúpulo importado.",
    source: "La Cerveza Chilena",
    readMinutes: 4,
    publishedAgo: "Hace 2h",
    image: "https://images.unsplash.com/photo-1559526324-c1f275fbfa32?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "n2",
    category: "Premios",
    categoryColor: "#f59e0b",
    title: "Kross arrasa en el South Beer Cup con 4 medallas de oro",
    summary: "La cervecería de Curacaví se llevó honores en stout, porter, IPA y golden ale en el certamen sudamericano.",
    source: "BeerAdvocate LATAM",
    readMinutes: 3,
    publishedAgo: "Hace 6h",
    image: "https://images.unsplash.com/photo-1471421298428-1513ab720a8e?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "n3",
    category: "Eventos",
    categoryColor: "#a855f7",
    title: "Vuelve el Festival Bierfest a Valdivia: 80 cervecerías confirmadas",
    summary: "Del 12 al 14 de julio en el Parque Saval. Entradas anticipadas con descuento hasta el 30 de junio.",
    source: "Diario Austral",
    readMinutes: 2,
    publishedAgo: "Hace 1d",
    image: "https://images.unsplash.com/photo-1436076863939-06870fe779c2?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "n4",
    category: "Ciencia",
    categoryColor: "#0ea5e9",
    title: "Investigadores UC desarrollan lúpulo resistente a la sequía",
    summary: "Una variedad nativa adaptada al clima central chileno promete reducir la dependencia de importaciones.",
    source: "Lúpulo Magazine",
    readMinutes: 5,
    publishedAgo: "Hace 2d",
    image: "https://images.unsplash.com/photo-1505075106905-fb052892c116?q=80&w=800&auto=format&fit=crop",
  },
];

/* Sample videos served from Google's public GTV bucket — stable CDN, no API key, CORS friendly.
   In production these should come from /api/vlogs (Mongo collection or external CMS). */
const VLOG_CDN = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample";

const vlogItems = [
  {
    id: "v1",
    title: "Cata a ciegas: la IPA que nadie esperaba ganara",
    creator: "Joaco Cerveza",
    creatorAvatar: "https://i.pravatar.cc/150?u=joacocerveza",
    duration: "0:58",
    views: "84K",
    publishedAgo: "Hace 3 días",
    thumbnail: `${VLOG_CDN}/images/ForBiggerBlazes.jpg`,
    videoUrl: `${VLOG_CDN}/ForBiggerBlazes.mp4`,
  },
  {
    id: "v2",
    title: "Cómo se sirve una stout perfecta en 45 segundos",
    creator: "Malta & Lúpulo",
    creatorAvatar: "https://i.pravatar.cc/150?u=maltaylupulo",
    duration: "0:47",
    views: "127K",
    publishedAgo: "Hace 1 semana",
    thumbnail: `${VLOG_CDN}/images/ElephantsDream.jpg`,
    videoUrl: `${VLOG_CDN}/ElephantsDream.mp4`,
  },
  {
    id: "v3",
    title: "El secreto de una NEIPA cremosa (en 1 minuto)",
    creator: "Casa Cervecera",
    creatorAvatar: "https://i.pravatar.cc/150?u=casacervecera",
    duration: "1:00",
    views: "203K",
    publishedAgo: "Hace 2 semanas",
    thumbnail: `${VLOG_CDN}/images/ForBiggerEscapes.jpg`,
    videoUrl: `${VLOG_CDN}/ForBiggerEscapes.mp4`,
  },
  {
    id: "v4",
    title: "Probé una cerveza con espina de cactus 🌵",
    creator: "La Ruta Cervecera",
    creatorAvatar: "https://i.pravatar.cc/150?u=rutacervecera",
    duration: "0:42",
    views: "56K",
    publishedAgo: "Hace 4 días",
    thumbnail: `${VLOG_CDN}/images/ForBiggerFun.jpg`,
    videoUrl: `${VLOG_CDN}/ForBiggerFun.mp4`,
  },
  {
    id: "v5",
    title: "La cerveza perfecta para tu asado 🔥",
    creator: "Sommelier de Cerveza",
    creatorAvatar: "https://i.pravatar.cc/150?u=sommeliercerveza",
    duration: "0:53",
    views: "92K",
    publishedAgo: "Hace 5 días",
    thumbnail: `${VLOG_CDN}/images/ForBiggerJoyrides.jpg`,
    videoUrl: `${VLOG_CDN}/ForBiggerJoyrides.mp4`,
  },
];

const tonightPlans = [
  {
    id: "p1",
    title: "Tap Takeover Tamango",
    venue: "El Honesto Mike",
    neighborhood: "Bellavista",
    time: "21:00",
    when: "Hoy",
    price: "$6.000",
    image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=800&auto=format&fit=crop",
    tag: "🍻 Tap Takeover",
    tagColor: "#16a34a",
  },
  {
    id: "p2",
    title: "Noche de Stouts",
    venue: "Kross Bar",
    neighborhood: "Providencia",
    time: "20:00",
    when: "Hoy",
    price: "Entrada libre",
    image: "https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?q=80&w=800&auto=format&fit=crop",
    tag: "🎶 Vivo + cervezas",
    tagColor: "#a855f7",
  },
  {
    id: "p3",
    title: "Trivia Cervecera",
    venue: "Spoh Taproom",
    neighborhood: "Ñuñoa",
    time: "22:00",
    when: "Hoy",
    price: "$3.000",
    image: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?q=80&w=800&auto=format&fit=crop",
    tag: "🧠 Trivia",
    tagColor: "#f59e0b",
  },
  {
    id: "p4",
    title: "Lanzamiento Hazy IPA",
    venue: "Tamango Brewing",
    neighborhood: "Recoleta",
    time: "19:30",
    when: "Hoy",
    price: "Gratis",
    image: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?q=80&w=800&auto=format&fit=crop",
    tag: "✨ Lanzamiento",
    tagColor: "#ef4444",
  },
];

/* ── Horizontal Scroll Row Container ── */
/* ── Circular scroll arrow (MercadoLibre style) ── */
function ScrollArrow({ direction, onClick }: { direction: "left" | "right"; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      aria-label={direction === "left" ? "Anterior" : "Siguiente"}
      className={`absolute top-[38%] z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full md:flex ${
        direction === "left" ? "left-0 -translate-x-1/2" : "right-0 translate-x-1/2"
      }`}
      style={{
        background: "var(--color-surface-card, #fff)",
        border: "1px solid color-mix(in srgb, var(--color-border-light) 60%, transparent)",
        boxShadow: "0 6px 20px rgba(0,0,0,0.18)",
        color: "var(--color-text-primary)",
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {direction === "left" ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 18 15 12 9 6" />}
      </svg>
    </motion.button>
  );
}

function Swimlane({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 8);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 8);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows]);

  const scrollByPage = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.85;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section className="mb-4 w-full px-4">
      <div className="flex items-end justify-between mb-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-none" style={{ color: "var(--color-text-primary)" }}>{title}</h2>
          {subtitle && <p className="text-sm font-semibold mt-0.5" style={{ color: "var(--color-text-muted)" }}>{subtitle}</p>}
        </div>
        <button className="text-xs font-bold uppercase tracking-wider text-[var(--color-amber-primary)] hover:opacity-70 transition-opacity">
          Ver todo
        </button>
      </div>

      <div className="relative">
        <AnimatePresence>
          {canScrollLeft && <ScrollArrow key="left" direction="left" onClick={() => scrollByPage("left")} />}
          {canScrollRight && <ScrollArrow key="right" direction="right" onClick={() => scrollByPage("right")} />}
        </AnimatePresence>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 pt-2 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {children}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        div[style*="scrollbar-width: none"]::-webkit-scrollbar { display: none; }
      `}} />
    </section>
  );
}

/* ── Vlog thumbnail with hover-preview (YouTube/Netflix pattern) ── */
function VlogThumbnail({
  thumbnail,
  videoUrl,
  title,
  duration,
}: {
  thumbnail: string;
  videoUrl: string;
  title: string;
  duration: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const startPreview = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    const playPromise = v.play();
    if (playPromise) {
      playPromise.then(() => setIsPlaying(true)).catch(() => { /* autoplay blocked, ignore */ });
    }
  }, []);

  const stopPreview = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    setIsPlaying(false);
  }, []);

  return (
    <div
      className="on-media relative aspect-video w-full overflow-hidden rounded-[1.2rem] mb-3 shadow-md transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl bg-black"
      onMouseEnter={startPreview}
      onMouseLeave={stopPreview}
    >
      {/* Poster (always visible underneath; fades when video is playing) */}
      <Image
        src={thumbnail}
        alt={title}
        fill
        className={`object-cover transition-opacity duration-300 ${isPlaying ? "opacity-0" : "opacity-100"}`}
        sizes="300px"
        unoptimized
      />

      {/* Video preview — muted, loop, no controls, no download */}
      <video
        ref={videoRef}
        src={videoUrl}
        muted
        loop
        playsInline
        preload="metadata"
        onLoadedData={() => setIsLoaded(true)}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${isPlaying ? "opacity-100" : "opacity-0"}`}
      />

      {/* Bottom gradient + play button (hide while playing) */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 transition-opacity duration-300 ${isPlaying ? "opacity-0" : "opacity-100"}`} />
      <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isPlaying ? "opacity-0" : "opacity-95"}`}>
        <div className="flex items-center justify-center h-14 w-14 rounded-full bg-white/95 shadow-2xl transition-transform duration-200 group-hover:scale-110">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#0a0a0a">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>

      {/* Duration chip — always visible */}
      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-[11px] font-black text-white tabular-nums z-10">
        {duration}
      </span>

      {/* LIVE-style indicator while previewing */}
      {isPlaying && (
        <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-600/90 backdrop-blur-sm text-[10px] font-black uppercase tracking-wider text-white z-10">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          Preview
        </span>
      )}

      {/* Subtle loading hint */}
      {!isLoaded && (
        <span className="absolute bottom-2 left-2 text-[10px] font-bold text-white/60 z-10">
          ●
        </span>
      )}
    </div>
  );
}

export function HomeDesktopLayout() {
  return (
    <div className="w-full flex flex-col pb-12">
      
      {/* ── 1. Hero Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative w-full overflow-hidden rounded-[1.5rem] mb-6 mt-12 group cursor-pointer"
        style={{ minHeight: "320px" }}
      >
        {/* Background image */}
        <Image
          src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1200&auto=format&fit=crop"
          alt="Hero Event"
          fill
          priority
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
        {/* Strong left-to-right gradient so text is always legible */}
        <div className="absolute inset-0 z-[1]" style={{ background: "linear-gradient(100deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.65) 50%, rgba(0,0,0,0.15) 100%)" }} />
        {/* Bottom fade */}
        <div className="absolute inset-0 z-[1]" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 55%)" }} />

        {/* Hero Content */}
        <div className="on-media absolute inset-0 z-10 flex flex-col justify-end p-6 md:py-10 md:px-6 max-w-[560px]">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-white/20 text-white w-max mb-3 shadow-lg" style={{ background: "color-mix(in srgb, var(--color-amber-primary) 40%, rgba(0,0,0,0.5))" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Lanzamiento Exclusivo
          </span>
          <h1 className="text-3xl md:text-[2.25rem] font-black text-white leading-[1.15] tracking-tight mb-2.5 drop-shadow-xl">
            Tamango Session IPA<br />Tap Takeover
          </h1>
          <p className="text-sm font-medium mb-5 leading-relaxed line-clamp-2" style={{ color: "rgba(255,255,255,0.72)" }}>
            El Honesto Mike se toma las canillas este sábado con 12 variedades rotativas y el estreno nacional de su nueva West Coast.
          </p>
          <div className="flex gap-2.5">
            <button
              className="px-5 py-2.5 rounded-full text-sm font-bold text-black transition-transform hover:scale-105 active:scale-95"
              style={{ background: "var(--color-amber-primary)" }}
            >
              Anotarme al Evento
            </button>
            <button className="px-5 py-2.5 rounded-full text-sm font-semibold text-white border border-white/25 backdrop-blur-md transition-all hover:bg-white/10">
              Ver Detalles
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── 1.5 Composer (crear publicación) ── */}
      <div className="mb-8">
        <HomeComposer />
      </div>

      {/* ── 2. Swimlane: Tendencias (Movie Poster style) ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <Swimlane title="Tendencias de la Semana" subtitle="Las cervezas más valoradas por la comunidad">
          {trendingItems.map((item, idx) => (
            <div key={item.id} className="relative snap-start shrink-0 w-[200px] group cursor-pointer">
              <div className="on-media relative aspect-[3/4] w-full overflow-hidden rounded-[1.2rem] mb-3 shadow-lg transition-transform duration-300 group-hover:-translate-y-1">
                <Image src={item.image} alt={item.title} fill className="object-cover transition-transform duration-500 group-hover:scale-110" sizes="200px" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40 opacity-90 group-hover:opacity-100 transition-opacity" />

                {/* Top-left: rank + trend chip */}
                <div className="absolute top-2 left-2 flex items-center gap-1.5">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-black/55 backdrop-blur-md border border-white/15 text-[11px] font-black text-white">
                    {idx + 1}
                  </span>
                  <span className="px-1.5 py-0.5 rounded-md bg-black/55 backdrop-blur-md border border-white/15 text-[9px] font-black uppercase tracking-wider text-white">
                    {item.trend}
                  </span>
                </div>

                {/* Top-right: rating */}
                <div className="absolute top-2 right-2 px-2 py-1 rounded-md backdrop-blur-md bg-black/55 border border-white/15 text-[11px] font-bold text-white flex items-center gap-1">
                  <span className="text-[var(--color-amber-primary)]">★</span> {item.rating}
                </div>

                {/* Bottom overlay: style + ABV/IBU */}
                <div className="absolute bottom-0 left-0 right-0 p-2.5">
                  <span className="inline-block px-2 py-0.5 rounded-md bg-white/15 backdrop-blur-md border border-white/20 text-[10px] font-black uppercase tracking-wider text-white mb-1.5">
                    {item.style}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-white/90">
                    <span>🍺 {item.abv}</span>
                    <span className="text-white/40">·</span>
                    <span>{item.ibu} IBU</span>
                  </div>
                </div>
              </div>
              <h3 className="text-base font-bold truncate px-1 mt-3" style={{ color: "var(--color-text-primary)" }}>{item.title}</h3>
              <p className="text-sm font-semibold truncate px-1 mt-0.5" style={{ color: "var(--color-text-muted)" }}>{item.subtitle}</p>
              <p className="text-[11px] font-medium truncate px-1 mt-0.5 flex items-center gap-1" style={{ color: "var(--color-text-muted)" }}>
                <span>📍</span> {item.city} · {item.reviews} reseñas
              </p>
            </div>
          ))}
        </Swimlane>
      </motion.div>

      {/* ── 3. Swimlane: Comunidad (Landscape Cards) ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <Swimlane title="Actividad Reciente" subtitle="¿Qué están tomando tus amigos?">
          {communityItems.map((item) => (
            <div key={item.id} className="on-media relative snap-start shrink-0 w-[320px] h-[190px] rounded-[1.6rem] overflow-hidden group cursor-pointer shadow-md">
              <Image src={item.image} alt={item.target} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30" />

              <div className="absolute top-4 left-4 flex items-center gap-2.5">
                <Image src={item.avatar} alt={item.user} width={36} height={36} className="rounded-full border border-white/20 shadow-sm" />
                <div>
                  <p className="text-xs text-white/80 leading-tight">
                    <span className="font-bold text-white text-sm">{item.user}</span> {item.action}
                  </p>
                  <p className="text-[11px] font-medium text-white/60 mt-0.5">{item.time}</p>
                </div>
              </div>

              <div className="absolute bottom-5 left-5 right-5">
                <h3 className="text-xl font-black text-white leading-tight drop-shadow-md">{item.target}</h3>
              </div>
            </div>
          ))}
        </Swimlane>
      </motion.div>

      {/* ── 4. Swimlane: Panoramas de esta noche ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <Swimlane title="Panoramas de esta Noche" subtitle="Eventos cerveceros que pasan hoy cerca tuyo">
          {tonightPlans.map((plan) => (
            <div
              key={plan.id}
              className="on-media relative snap-start shrink-0 w-[280px] h-[360px] rounded-[1.6rem] overflow-hidden group cursor-pointer shadow-md"
            >
              <Image
                src={plan.image}
                alt={plan.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {/* Reading gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/15" />

              {/* Top: hour chip + tag */}
              <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-2">
                <div className="flex flex-col items-center justify-center px-3 py-1.5 rounded-xl backdrop-blur-xl bg-white/15 border border-white/25 shadow-lg min-w-[58px]">
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/70 leading-none">
                    {plan.when}
                  </span>
                  <span className="text-base font-black text-white leading-tight mt-0.5">
                    {plan.time}
                  </span>
                </div>
                <span
                  className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-xl border border-white/20 text-white shadow-lg"
                  style={{ background: `color-mix(in srgb, ${plan.tagColor} 65%, rgba(0,0,0,0.35))` }}
                >
                  {plan.tag}
                </span>
              </div>

              {/* Bottom: title, venue, footer */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="text-xl font-black text-white leading-tight drop-shadow-lg mb-1.5 line-clamp-2">
                  {plan.title}
                </h3>
                <p className="text-[13px] font-semibold text-white/85 leading-tight drop-shadow-md">
                  {plan.venue}
                </p>
                <p className="text-[11px] font-medium text-white/60 mt-0.5 drop-shadow-md flex items-center gap-1">
                  <span>📍</span> {plan.neighborhood}
                </p>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/15">
                  <span className="text-xs font-bold text-white/90">{plan.price}</span>
                  <button className="text-[11px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full bg-white text-black hover:bg-white/90 transition-colors">
                    Ir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </Swimlane>
      </motion.div>

      {/* ── 5. Swimlane: Noticias ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <Swimlane title="Noticias" subtitle="Lo que está pasando en el mundo cervecero chileno">
          {newsItems.map((news) => (
            <article
              key={news.id}
              className="relative snap-start shrink-0 w-[340px] rounded-[1.4rem] overflow-hidden group cursor-pointer shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              style={{
                background: "var(--color-surface-card, #fff)",
                border: "1px solid color-mix(in srgb, var(--color-border-light) 70%, transparent)",
              }}
            >
              {/* Cover */}
              <div className="on-media relative w-full h-[160px] overflow-hidden">
                <Image
                  src={news.image}
                  alt={news.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="340px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <span
                  className="absolute top-3 left-3 inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-md"
                  style={{ background: news.categoryColor }}
                >
                  {news.category}
                </span>
              </div>

              {/* Body */}
              <div className="p-4">
                <h3
                  className="text-[15px] font-black leading-snug line-clamp-2 mb-2"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {news.title}
                </h3>
                <p
                  className="text-[12px] font-medium leading-relaxed line-clamp-2 mb-3"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {news.summary}
                </p>
                <div
                  className="flex items-center justify-between text-[11px] font-semibold pt-3 border-t"
                  style={{
                    color: "var(--color-text-muted)",
                    borderColor: "color-mix(in srgb, var(--color-border-light) 60%, transparent)",
                  }}
                >
                  <span className="truncate flex-1">{news.source}</span>
                  <span className="shrink-0 ml-2">{news.readMinutes} min · {news.publishedAgo}</span>
                </div>
              </div>
            </article>
          ))}
        </Swimlane>
      </motion.div>

      {/* ── 6. Swimlane: Vlogs de Cerveceros ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        <Swimlane title="Vlogs de Cerveceros" subtitle="Catas, recorridos y tutoriales de la comunidad">
          {vlogItems.map((vlog) => (
            <div
              key={vlog.id}
              className="relative snap-start shrink-0 w-[300px] group cursor-pointer"
            >
              {/* Thumbnail: hover plays muted preview (YouTube/Netflix pattern) */}
              <VlogThumbnail
                thumbnail={vlog.thumbnail}
                videoUrl={vlog.videoUrl}
                title={vlog.title}
                duration={vlog.duration}
              />

              {/* Body */}
              <div className="flex gap-2.5 px-1">
                <Image
                  src={vlog.creatorAvatar}
                  alt={vlog.creator}
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-full shrink-0 mt-0.5"
                  style={{ border: "1px solid color-mix(in srgb, var(--color-border-light) 60%, transparent)" }}
                />
                <div className="min-w-0 flex-1">
                  <h3
                    className="text-[14px] font-bold leading-snug line-clamp-2"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {vlog.title}
                  </h3>
                  <p
                    className="text-[12px] font-semibold mt-0.5 truncate"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {vlog.creator}
                  </p>
                  <p
                    className="text-[11px] font-medium mt-0.5"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {vlog.views} vistas · {vlog.publishedAgo}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </Swimlane>
      </motion.div>

    </div>
  );
}
