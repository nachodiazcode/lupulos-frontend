"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

/* ── Mock Feed Data ── */
const feedItems = [
  {
    id: "1",
    type: "beer" as const,
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800&auto=format&fit=crop",
    badge: "🔥 Tendencia",
    badgeColor: "#ef4444",
    title: "Hazy IPA Turbia",
    subtitle: "Cervecería Spoh · Santiago",
    description: "Explosión de lúpulos cítricos con cuerpo sedoso. Mango, maracuyá y final cremoso.",
    rating: 4.7,
    likes: 234,
    comments: 18,
    author: { name: "Spoh", avatar: "https://i.pravatar.cc/150?u=spoh" },
    timeAgo: "Hace 2h",
  },
  {
    id: "2",
    type: "checkin" as const,
    image: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?q=80&w=800&auto=format&fit=crop",
    badge: "📸 Check-in",
    badgeColor: "#8b5cf6",
    title: "Kross Stout Barrica",
    subtitle: "Kross Brewing · Curacaví",
    description: "Envejecida 6 meses en barricas de roble. Chocolate amargo, café y vainilla.",
    rating: 4.9,
    likes: 412,
    comments: 31,
    author: { name: "Loom", avatar: "https://i.pravatar.cc/150?u=loom" },
    timeAgo: "Hace 5 min",
  },
  {
    id: "3",
    type: "place" as const,
    image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=800&auto=format&fit=crop",
    badge: "📍 Lugar",
    badgeColor: "#10b981",
    title: "El Honesto Mike",
    subtitle: "Tap Takeover · Sábado 7pm",
    description: "12 canillas rotativas. Lanzamiento exclusivo session IPA de Tamango.",
    rating: 4.5,
    likes: 89,
    comments: 7,
    author: { name: "Honesto Mike", avatar: "https://i.pravatar.cc/150?u=mike" },
    timeAgo: "Hace 1h",
  },
  {
    id: "4",
    type: "beer" as const,
    image: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?q=80&w=800&auto=format&fit=crop",
    badge: "⭐ Top",
    badgeColor: "#f59e0b",
    title: "Doppelbock Premium",
    subtitle: "Kunstmann · Valdivia",
    description: "Maltosa con cuerpo robusto y caramelo quemado. Clásico del sur de Chile.",
    rating: 4.6,
    likes: 567,
    comments: 42,
    author: { name: "KrossBar", avatar: "https://i.pravatar.cc/150?u=kross" },
    timeAgo: "Hace 3h",
  },
  {
    id: "5",
    type: "checkin" as const,
    image: "https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?q=80&w=800&auto=format&fit=crop",
    badge: "🍻 Check-in",
    badgeColor: "#8b5cf6",
    title: "West Coast IPA",
    subtitle: "Tamango · Santiago",
    description: "West Coast con amargor pronunciado. Pino, pomelo, cristalina y seca.",
    rating: 4.3,
    likes: 156,
    comments: 11,
    author: { name: "Tamango", avatar: "https://i.pravatar.cc/150?u=tamango" },
    timeAgo: "Hace 45 min",
  },
];

/* ── Action Button ── */
function ActionButton({ icon, count, active, activeColor, onClick }: {
  icon: React.ReactNode;
  count?: number;
  active?: boolean;
  activeColor?: string;
  onClick?: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.8 }}
      onClick={onClick}
      className="flex flex-col items-center gap-0.5"
    >
      <div
        className="h-12 w-12 flex items-center justify-center rounded-full backdrop-blur-xl border transition-all duration-200"
        style={{
          background: active
            ? `color-mix(in srgb, ${activeColor || "var(--color-amber-primary)"} 25%, rgba(0,0,0,0.4))`
            : "rgba(0,0,0,0.35)",
          borderColor: active
            ? `color-mix(in srgb, ${activeColor || "var(--color-amber-primary)"} 50%, transparent)`
            : "rgba(255,255,255,0.15)",
          color: active ? (activeColor || "var(--color-amber-primary)") : "rgba(255,255,255,0.95)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
        }}
      >
        {icon}
      </div>
      {count !== undefined && (
        <span className="text-[11px] font-bold text-white/80 drop-shadow-lg">{count}</span>
      )}
    </motion.button>
  );
}

/* ── Star Rating ── */
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className="text-sm"
          style={{
            color: star <= Math.round(rating) ? "#fbbf24" : "rgba(255,255,255,0.25)",
            textShadow: star <= Math.round(rating) ? "0 0 8px rgba(251,191,36,0.5)" : "none",
          }}
        >
          ★
        </span>
      ))}
      <span className="text-xs font-bold text-white/80 ml-1">{rating}</span>
    </div>
  );
}

/* ── Full-Screen Feed Card ── */
function FeedCard({ item }: { item: typeof feedItems[0] }) {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  return (
    <div
      className="on-media relative w-full h-full snap-start snap-always shrink-0"
    >
      {/* Background Image — fills entire card */}
      <Image
        src={item.image}
        alt={item.title}
        fill
        className="object-cover"
        sizes="100vw"
      />

      {/* Gradient Overlays — stronger for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent via-40% to-black/90 z-[1]" />

      {/* Top: Author + Badge */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center gap-2.5">
        <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-white/40 shrink-0 shadow-lg">
          <Image
            src={item.author.avatar}
            alt={item.author.name}
            width={40}
            height={40}
            className="object-cover h-full w-full"
          />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-sm font-bold text-white truncate drop-shadow-lg">
            {item.author.name}
          </span>
          <span className="text-[10px] font-medium text-white/60 drop-shadow-md">{item.timeAgo}</span>
        </div>
        <span
          className="shrink-0 inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-xl border border-white/20 text-white shadow-lg"
          style={{ background: `color-mix(in srgb, ${item.badgeColor} 60%, rgba(0,0,0,0.3))` }}
        >
          {item.badge}
        </span>
      </div>

      {/* Right: Action Buttons (TikTok style) */}
      <div className="absolute right-3 z-10 flex flex-col gap-5" style={{ bottom: "120px" }}>
        <ActionButton
          icon={
            <motion.span
              className="text-[24px] leading-none"
              animate={liked ? { scale: [1, 1.5, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              {liked ? "❤️" : "🤍"}
            </motion.span>
          }
          count={liked ? item.likes + 1 : item.likes}
          active={liked}
          activeColor="#ef4444"
          onClick={() => setLiked(!liked)}
        />
        <ActionButton
          icon={<span className="text-[22px] leading-none">💬</span>}
          count={item.comments}
        />
        <ActionButton
          icon={
            <motion.span
              className="text-[22px] leading-none"
              animate={bookmarked ? { y: [0, -5, 0] } : {}}
              transition={{ duration: 0.25 }}
            >
              {bookmarked ? "🔖" : "📌"}
            </motion.span>
          }
          active={bookmarked}
          activeColor="#f59e0b"
          onClick={() => setBookmarked(!bookmarked)}
        />
        <ActionButton
          icon={<span className="text-[22px] leading-none">↗️</span>}
        />
      </div>

      {/* Bottom: Content Info */}
      <div className="absolute bottom-0 left-0 right-[68px] z-10 p-5 pb-6">
        <StarRating rating={item.rating} />
        <h3 className="text-2xl font-black text-white leading-tight mt-1.5 drop-shadow-lg">
          {item.title}
        </h3>
        <p className="text-[13px] font-semibold text-white/60 mt-0.5 drop-shadow-md">
          {item.subtitle}
        </p>
        <p className="text-[13px] font-medium text-white/70 mt-2 line-clamp-2 leading-relaxed drop-shadow-md">
          {item.description}
        </p>
      </div>

      {/* Scroll indicator dot */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10">
        <motion.div
          className="w-1 h-1 rounded-full bg-white/40"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
    </div>
  );
}

/* ── Main Feed Component ── */
export function HomeFeed() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Mobile: fixed full-screen overlay
  if (isMobile) {
    return (
      <>
        <div
          ref={scrollRef}
          className="feed-scroll-container fixed inset-0 z-30 w-full overflow-y-auto bg-black"
          style={{
            top: "0",
            scrollSnapType: "y mandatory",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {feedItems.map((item) => (
            <FeedCard key={item.id} item={item} />
          ))}
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          .feed-scroll-container::-webkit-scrollbar { display: none; }
          .feed-scroll-container { scrollbar-width: none; -ms-overflow-style: none; }
          .feed-scroll-container > div { height: 100dvh; }
        `}} />
      </>
    );
  }

  // Desktop: normal flow inside the layout
  return (
    <div className="flex flex-col gap-4 w-full max-w-[600px] mx-auto mt-4 pb-8">
      {feedItems.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08, type: "spring", stiffness: 260, damping: 26 }}
          className="relative w-full overflow-hidden rounded-[1.6rem]"
          style={{ aspectRatio: "3/4", maxHeight: "520px" }}
        >
          <FeedCard item={item} />
        </motion.div>
      ))}
    </div>
  );
}
