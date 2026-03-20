"use client";

import Image from "next/image";
import { motion } from "framer-motion";

/* ═══════════════════════════════════
   Config
   ═══════════════════════════════════ */

const SIZE = 440;
const CENTER = SIZE / 2;
const INNER_RADIUS = 100;
const OUTER_RADIUS = 175;

interface OrbitAvatar {
  src: string;
  name: string;
  size: number;
  ring: "inner" | "outer";
  chatBubble?: string;
}

const avatars: OrbitAvatar[] = [
  // Outer ring
  { src: "/assets/avatars/ragnar.png", name: "Ragnar", size: 62, ring: "outer", chatBubble: "🍺 Salud!" },
  { src: "/assets/avatars/Lagertha.png", name: "Lagertha", size: 58, ring: "outer", chatBubble: "Increíble IPA" },
  { src: "/assets/avatars/bjorn.png", name: "Bjorn", size: 54, ring: "outer" },
  { src: "/assets/avatars/Kwenthrith.png", name: "Kwenthrith", size: 56, ring: "outer", chatBubble: "⭐⭐⭐⭐⭐" },
  // Inner ring
  { src: "/assets/avatars/Sigrun.png", name: "Sigrun", size: 50, ring: "inner", chatBubble: "Me encanta!" },
  { src: "/assets/avatars/ragnar.png", name: "Ragnar2", size: 46, ring: "inner" },
  { src: "/assets/avatars/Lagertha.png", name: "Lagertha2", size: 48, ring: "inner", chatBubble: "📍 Nuevo bar" },
];

const reactions = [
  { emoji: "🍺", x: -150, y: -80, delay: 0, size: 28 },
  { emoji: "❤️", x: 155, y: -55, delay: 0.6, size: 24 },
  { emoji: "⭐", x: -130, y: 100, delay: 1.2, size: 22 },
  { emoji: "🎉", x: 160, y: 90, delay: 1.8, size: 26 },
  { emoji: "🌿", x: -170, y: 15, delay: 2.4, size: 20 },
  { emoji: "📸", x: 130, y: -120, delay: 0.9, size: 22 },
  { emoji: "🔥", x: -50, y: 160, delay: 3.0, size: 20 },
  { emoji: "💬", x: 60, y: -160, delay: 1.5, size: 22 },
];

/* Sparkle particles */
const sparkles = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: (Math.random() - 0.5) * SIZE,
  y: (Math.random() - 0.5) * SIZE,
  size: 2 + Math.random() * 3,
  delay: Math.random() * 4,
  duration: 2 + Math.random() * 2,
}));

/* ═══════════════════════════════════
   Component
   ═══════════════════════════════════ */

export default function CommunityAnimation() {
  const outerAvatars = avatars.filter((a) => a.ring === "outer");
  const innerAvatars = avatars.filter((a) => a.ring === "inner");

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: SIZE, height: SIZE }}
    >
      {/* ─── Orbit tracks ─── */}
      <div
        className="absolute rounded-full"
        style={{
          width: OUTER_RADIUS * 2,
          height: OUTER_RADIUS * 2,
          border: "1px solid var(--color-border-amber)",
          opacity: 0.15,
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: INNER_RADIUS * 2,
          height: INNER_RADIUS * 2,
          border: "1px dashed var(--color-border-amber)",
          opacity: 0.1,
        }}
      />

      {/* ─── Pulse waves ─── */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={`pulse-${i}`}
          className="absolute rounded-full"
          style={{ border: "1px solid var(--color-amber-primary)" }}
          initial={{ width: 90, height: 90, opacity: 0.3 }}
          animate={{
            width: [90, OUTER_RADIUS * 2 + 60],
            height: [90, OUTER_RADIUS * 2 + 60],
            opacity: [0.2, 0],
          }}
          transition={{ duration: 3.5, repeat: Infinity, delay: i * 1.2, ease: "easeOut" }}
        />
      ))}

      {/* ─── Center: Lupin character ─── */}
      <motion.div
        className="relative z-10"
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div
          className="relative flex items-center justify-center overflow-hidden rounded-full"
          style={{
            width: 100,
            height: 100,
            background: "var(--gradient-button-primary)",
            boxShadow:
              "0 0 50px rgba(251,191,36,0.35), 0 0 100px rgba(251,191,36,0.12), inset 0 -4px 12px rgba(0,0,0,0.2)",
          }}
        >
          <Image
            src="/assets/personajes/lupin.png"
            alt="Lupin"
            width={90}
            height={90}
            className="object-cover"
            style={{ marginTop: 10 }}
          />
        </div>
        {/* Online indicator */}
        <motion.div
          className="absolute -bottom-0.5 -right-0.5 rounded-full"
          style={{
            width: 18,
            height: 18,
            background: "var(--color-emerald)",
            border: "3px solid var(--color-surface-dark)",
            boxShadow: "0 0 8px rgba(52,211,153,0.5)",
          }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>

      {/* ─── Outer orbit avatars ─── */}
      {outerAvatars.map((avatar, i) => {
        const angle = (i / outerAvatars.length) * 360;
        const duration = 22 + i * 3;

        return (
          <motion.div
            key={avatar.name}
            className="absolute z-20"
            style={{ width: 0, height: 0 }}
            animate={{ rotate: [angle, angle + 360] }}
            transition={{ duration, repeat: Infinity, ease: "linear" }}
          >
            <motion.div
              style={{
                position: "absolute",
                top: -OUTER_RADIUS - avatar.size / 2,
                left: -(avatar.size / 2),
              }}
              animate={{ rotate: [-(angle), -(angle + 360)] }}
              transition={{ duration, repeat: Infinity, ease: "linear" }}
            >
              <div className="relative">
                <div
                  className="overflow-hidden rounded-full"
                  style={{
                    width: avatar.size,
                    height: avatar.size,
                    border: "2.5px solid var(--color-border-amber)",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.4), 0 0 12px rgba(251,191,36,0.15)",
                  }}
                >
                  <Image
                    src={avatar.src}
                    alt={avatar.name}
                    width={avatar.size}
                    height={avatar.size}
                    className="h-full w-full object-cover"
                  />
                </div>
                {/* Chat bubble */}
                {avatar.chatBubble && (
                  <motion.div
                    className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-medium"
                    style={{
                      background: "var(--color-surface-card)",
                      border: "1px solid var(--color-border-amber)",
                      color: "var(--color-text-secondary)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                    }}
                    initial={{ opacity: 0, y: 5, scale: 0.8 }}
                    animate={{ opacity: [0, 1, 1, 0], y: [5, 0, 0, -5], scale: [0.8, 1, 1, 0.9] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 2 + 1,
                      repeatDelay: 6,
                    }}
                  >
                    {avatar.chatBubble}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        );
      })}

      {/* ─── Inner orbit avatars (counter-clockwise) ─── */}
      {innerAvatars.map((avatar, i) => {
        const angle = (i / innerAvatars.length) * 360 + 30;
        const duration = 16 + i * 2;

        return (
          <motion.div
            key={avatar.name}
            className="absolute z-20"
            style={{ width: 0, height: 0 }}
            animate={{ rotate: [angle, angle - 360] }}
            transition={{ duration, repeat: Infinity, ease: "linear" }}
          >
            <motion.div
              style={{
                position: "absolute",
                top: -INNER_RADIUS - avatar.size / 2,
                left: -(avatar.size / 2),
              }}
              animate={{ rotate: [-(angle), -(angle - 360)] }}
              transition={{ duration, repeat: Infinity, ease: "linear" }}
            >
              <div className="relative">
                <div
                  className="overflow-hidden rounded-full"
                  style={{
                    width: avatar.size,
                    height: avatar.size,
                    border: "2px solid var(--color-border-amber)",
                    boxShadow: "0 3px 10px rgba(0,0,0,0.3), 0 0 6px rgba(251,191,36,0.1)",
                    opacity: 0.9,
                  }}
                >
                  <Image
                    src={avatar.src}
                    alt={avatar.name}
                    width={avatar.size}
                    height={avatar.size}
                    className="h-full w-full object-cover"
                  />
                </div>
                {avatar.chatBubble && (
                  <motion.div
                    className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[9px] font-medium"
                    style={{
                      background: "var(--color-surface-card)",
                      border: "1px solid var(--color-border-amber)",
                      color: "var(--color-text-secondary)",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: [0, 1, 1, 0], scale: [0.8, 1, 1, 0.9] }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      delay: i * 3 + 2,
                      repeatDelay: 8,
                    }}
                  >
                    {avatar.chatBubble}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        );
      })}

      {/* ─── Floating reactions ─── */}
      {reactions.map((r, i) => (
        <motion.div
          key={`reaction-${i}`}
          className="absolute z-30 select-none"
          style={{ fontSize: r.size }}
          initial={{ x: r.x, y: r.y, opacity: 0, scale: 0 }}
          animate={{
            x: r.x,
            y: [r.y, r.y - 20, r.y],
            opacity: [0, 1, 1, 0],
            scale: [0, 1.15, 1, 0.7],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: r.delay,
            repeatDelay: 3,
            ease: "easeInOut",
          }}
        >
          {r.emoji}
        </motion.div>
      ))}

      {/* ─── Sparkle particles ─── */}
      {sparkles.map((s) => (
        <motion.div
          key={`sparkle-${s.id}`}
          className="absolute rounded-full"
          style={{
            width: s.size,
            height: s.size,
            background: "var(--color-amber-primary)",
            left: CENTER + s.x,
            top: CENTER + s.y,
          }}
          animate={{ opacity: [0, 0.6, 0], scale: [0.5, 1.2, 0.5] }}
          transition={{
            duration: s.duration,
            repeat: Infinity,
            delay: s.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* ─── SVG connection web ─── */}
      <svg
        className="pointer-events-none absolute inset-0 z-0"
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
      >
        {/* Lines from center to outer orbit positions */}
        {outerAvatars.map((_, i) => {
          const a = (i / outerAvatars.length) * Math.PI * 2 - Math.PI / 2;
          const x = CENTER + Math.cos(a) * OUTER_RADIUS;
          const y = CENTER + Math.sin(a) * OUTER_RADIUS;
          return (
            <motion.line
              key={`outer-line-${i}`}
              x1={CENTER}
              y1={CENTER}
              x2={x}
              y2={y}
              stroke="var(--color-border-amber)"
              strokeWidth="0.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.12, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.5 }}
            />
          );
        })}
        {/* Cross-connections between outer avatars */}
        {outerAvatars.map((_, i) => {
          const next = (i + 1) % outerAvatars.length;
          const a1 = (i / outerAvatars.length) * Math.PI * 2 - Math.PI / 2;
          const a2 = (next / outerAvatars.length) * Math.PI * 2 - Math.PI / 2;
          return (
            <motion.line
              key={`cross-${i}`}
              x1={CENTER + Math.cos(a1) * OUTER_RADIUS}
              y1={CENTER + Math.sin(a1) * OUTER_RADIUS}
              x2={CENTER + Math.cos(a2) * OUTER_RADIUS}
              y2={CENTER + Math.sin(a2) * OUTER_RADIUS}
              stroke="var(--color-border-amber)"
              strokeWidth="0.3"
              strokeDasharray="4 4"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.08, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.7 + 0.5 }}
            />
          );
        })}
      </svg>
    </div>
  );
}
