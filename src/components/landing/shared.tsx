import type { Variants } from "framer-motion";
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

/* ─── Small Reusable Components ─── */

export function SectionBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded-full border border-amber-400/20 bg-amber-400/5 px-4 py-1.5 text-[11px] font-semibold tracking-[0.2em] text-amber-400/80 uppercase backdrop-blur-sm">
      {children}
    </span>
  );
}

export function GradientText({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="from-amber-primary via-amber-light to-orange-cta bg-gradient-to-r bg-clip-text text-transparent"
      style={{ fontFamily: "var(--font-outfit), var(--font-sans)" }}
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
        background:
          "linear-gradient(90deg, transparent, var(--color-border-amber), transparent)",
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
