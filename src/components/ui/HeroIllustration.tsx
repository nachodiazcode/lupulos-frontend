"use client";

import { motion } from "framer-motion";

const floatAnimation = {
  y: [0, -15, 0],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: "easeInOut" as const,
  },
};

const pulseAnimation = {
  scale: [1, 1.05, 1],
  opacity: [0.8, 1, 0.8],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut" as const,
  },
};

// Hop icon SVG
const HopIcon = ({ size = 60, delay = 0 }: { size?: number; delay?: number }) => (
  <motion.svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
    transition={{
      opacity: { duration: 0.5, delay },
      scale: { duration: 0.5, delay },
      y: { duration: 3 + delay, repeat: Infinity, ease: "easeInOut", delay },
    }}
  >
    <ellipse cx="32" cy="16" rx="8" ry="12" fill="#84cc16" opacity="0.9" />
    <ellipse cx="20" cy="26" rx="8" ry="12" fill="#65a30d" transform="rotate(-30 20 26)" />
    <ellipse cx="44" cy="26" rx="8" ry="12" fill="#65a30d" transform="rotate(30 44 26)" />
    <ellipse cx="18" cy="42" rx="8" ry="12" fill="#4d7c0f" transform="rotate(-45 18 42)" />
    <ellipse cx="46" cy="42" rx="8" ry="12" fill="#4d7c0f" transform="rotate(45 46 42)" />
    <ellipse cx="32" cy="36" rx="9" ry="14" fill="#84cc16" />
    <ellipse cx="32" cy="52" rx="7" ry="10" fill="#65a30d" />
  </motion.svg>
);

// Beer mug SVG
const BeerMug = ({ size = 120 }: { size?: number }) => (
  <motion.svg
    width={size}
    height={size * 1.2}
    viewBox="0 0 100 120"
    fill="none"
    animate={floatAnimation}
  >
    {/* Mug body */}
    <rect x="15" y="30" width="50" height="75" rx="8" fill="url(#beerGradient)" />
    {/* Glass effect */}
    <rect x="20" y="35" width="8" height="60" rx="4" fill="rgba(255,255,255,0.2)" />
    {/* Handle */}
    <path
      d="M65 45 Q85 45 85 65 Q85 85 65 85"
      stroke="#d97706"
      strokeWidth="8"
      fill="none"
      strokeLinecap="round"
    />
    {/* Foam */}
    <ellipse cx="40" cy="30" rx="28" ry="10" fill="#fef3c7" />
    <circle cx="25" cy="25" r="8" fill="#fef9c3" />
    <circle cx="40" cy="22" r="10" fill="#fefce8" />
    <circle cx="55" cy="25" r="7" fill="#fef9c3" />
    <circle cx="32" cy="18" r="6" fill="white" opacity="0.8" />
    {/* Bubbles inside */}
    <motion.circle
      cx="30"
      cy="80"
      r="3"
      fill="rgba(255,255,255,0.4)"
      animate={{ y: [0, -40], opacity: [0.6, 0] }}
      transition={{ duration: 2, repeat: Infinity, delay: 0 }}
    />
    <motion.circle
      cx="45"
      cy="90"
      r="2"
      fill="rgba(255,255,255,0.4)"
      animate={{ y: [0, -50], opacity: [0.6, 0] }}
      transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
    />
    <motion.circle
      cx="38"
      cy="85"
      r="2.5"
      fill="rgba(255,255,255,0.4)"
      animate={{ y: [0, -45], opacity: [0.6, 0] }}
      transition={{ duration: 2.2, repeat: Infinity, delay: 1 }}
    />
    <defs>
      <linearGradient id="beerGradient" x1="15" y1="30" x2="65" y2="105" gradientUnits="userSpaceOnUse">
        <stop stopColor="#fbbf24" />
        <stop offset="1" stopColor="#d97706" />
      </linearGradient>
    </defs>
  </motion.svg>
);

// Decorative circles
const FloatingCircle = ({
  size,
  color,
  x,
  y,
  delay = 0,
}: {
  size: number;
  color: string;
  x: string;
  y: string;
  delay?: number;
}) => (
  <motion.div
    className="absolute rounded-full"
    style={{
      width: size,
      height: size,
      left: x,
      top: y,
      background: color,
      filter: "blur(1px)",
    }}
    animate={{
      y: [0, -20, 0],
      scale: [1, 1.1, 1],
      opacity: [0.6, 0.9, 0.6],
    }}
    transition={{
      duration: 4 + delay,
      repeat: Infinity,
      ease: "easeInOut",
      delay,
    }}
  />
);

// Main component
export default function HeroIllustration() {
  return (
    <div className="relative flex h-[500px] w-full items-center justify-center">
      {/* Background glow */}
      <motion.div
        className="absolute h-80 w-80 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(251,191,36,0.3) 0%, transparent 70%)",
        }}
        animate={pulseAnimation}
      />

      {/* Floating decorative circles */}
      <FloatingCircle size={20} color="rgba(132,204,22,0.5)" x="10%" y="20%" delay={0} />
      <FloatingCircle size={15} color="rgba(251,191,36,0.5)" x="80%" y="15%" delay={0.5} />
      <FloatingCircle size={25} color="rgba(217,119,6,0.4)" x="75%" y="70%" delay={1} />
      <FloatingCircle size={12} color="rgba(132,204,22,0.6)" x="15%" y="75%" delay={1.5} />
      <FloatingCircle size={18} color="rgba(254,243,199,0.5)" x="85%" y="45%" delay={0.8} />
      <FloatingCircle size={14} color="rgba(101,163,13,0.5)" x="5%" y="50%" delay={1.2} />

      {/* Main composition */}
      <div className="relative flex items-center justify-center">
        {/* Left hops */}
        <div className="absolute -left-16 top-0">
          <HopIcon size={50} delay={0.2} />
        </div>
        <div className="absolute -left-24 top-32">
          <HopIcon size={40} delay={0.6} />
        </div>

        {/* Center beer mug with glassmorphism card */}
        <motion.div
          className="relative rounded-3xl p-8"
          style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 25px 50px rgba(0,0,0,0.3)",
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <BeerMug size={140} />

          {/* Tagline */}
          <motion.p
            className="mt-4 text-center text-lg font-semibold text-amber-200/80"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            ¡Salud! 🍻
          </motion.p>
        </motion.div>

        {/* Right hops */}
        <div className="absolute -right-16 top-8">
          <HopIcon size={55} delay={0.4} />
        </div>
        <div className="absolute -right-20 bottom-16">
          <HopIcon size={35} delay={0.8} />
        </div>

        {/* Additional small hops */}
        <div className="absolute -bottom-8 left-4">
          <HopIcon size={30} delay={1} />
        </div>
        <div className="absolute -top-8 right-8">
          <HopIcon size={28} delay={1.2} />
        </div>
      </div>

      {/* Sparkles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full bg-amber-300"
          style={{
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1.5, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
