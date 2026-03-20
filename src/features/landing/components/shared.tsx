"use client";

import { useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { motion, type Variants } from "framer-motion";
import type { StepIconName } from "./data";

/* ─── Animation Variants ─── */

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.11, ease: "easeOut" },
  }),
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.93 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, delay: i * 0.09, ease: "easeOut" },
  }),
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
};

/* ─── TiltCard (Discord-style 3D hover) ─── */

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  tiltDeg?: number;
  glowColor?: string;
}

export function TiltCard({
  children,
  className = "",
  style,
  tiltDeg = 6,
  glowColor = "rgba(251,191,36,0.08)",
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("perspective(600px) rotateX(0deg) rotateY(0deg)");
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });

  const handleMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rotY = (x - 0.5) * tiltDeg * 2;
    const rotX = (0.5 - y) * tiltDeg * 2;
    setTransform(`perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02,1.02,1.02)`);
    setGlowPos({ x: x * 100, y: y * 100 });
  };

  const handleLeave = () => {
    setTransform("perspective(600px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)");
    setGlowPos({ x: 50, y: 50 });
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        transform,
        transition: "transform 0.2s ease-out",
        willChange: "transform",
      }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {/* Mouse-following glow overlay */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%, ${glowColor}, transparent 60%)`,
          opacity: transform.includes("scale3d(1.02") ? 1 : 0,
        }}
      />
      {children}
    </div>
  );
}

/* ─── ShimmerButton ─── */

export function ShimmerButton({
  children,
  className = "",
  style,
  onClick,
  disabled,
  type,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className={`group relative overflow-hidden ${className}`}
      style={style}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      <span className="relative z-10">{children}</span>
      {/* Shimmer sweep */}
      <div
        className="absolute inset-0 -translate-x-full skew-x-12 transition-transform duration-700 group-hover:translate-x-full"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)" }}
      />
    </motion.button>
  );
}

/* ─── Small Reusable Components ─── */

export function SectionBadge({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-block rounded-full border px-4 py-1.5 text-[11px] font-semibold tracking-[0.2em] uppercase backdrop-blur-sm"
      style={{
        borderColor: "color-mix(in srgb, var(--color-amber-primary) 22%, transparent)",
        background: "color-mix(in srgb, var(--color-amber-primary) 8%, transparent)",
        color: "var(--color-amber-primary)",
      }}
    >
      {children}
    </span>
  );
}

export function GradientText({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        background:
          "var(--gradient-heading, linear-gradient(135deg, var(--color-amber-primary), var(--color-orange-cta)))",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        fontFamily: "var(--font-outfit), var(--font-sans)",
      }}
    >
      {children}
    </span>
  );
}

export function AmberDivider({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none h-px opacity-50 ${className}`}
      style={{
        background: "linear-gradient(90deg, transparent, var(--color-border-amber), transparent)",
      }}
      aria-hidden="true"
    />
  );
}

export function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {direction === "left" ? (
        <path d="M19 12H5M12 19l-7-7 7-7" />
      ) : (
        <path d="M5 12h14M12 5l7 7-7 7" />
      )}
    </svg>
  );
}

const SVG_DEFAULTS = {
  width: 28,
  height: 28,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const STEP_ICON_PATHS: Record<StepIconName, React.ReactNode> = {
  user: (
    <>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </>
  ),
  chat: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
};

export function StepIcon({ name }: { name: StepIconName }) {
  return <svg {...SVG_DEFAULTS}>{STEP_ICON_PATHS[name]}</svg>;
}
