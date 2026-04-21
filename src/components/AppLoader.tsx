"use client";

import { useEffect, useMemo, useState } from "react";

const LOADER_SESSION_KEY = "lupulos-loader-seen";
const LOADER_BADGE_DURATION_MS = process.env.NODE_ENV === "development" ? 0 : 1100;
const LOADER_FADE_OUT_MS = 220;

const LOADER_MESSAGES = [
  { language: "Español", message: "Sirviendo algo especial..." },
  { language: "English", message: "Pouring something special..." },
  { language: "Français", message: "On prépare quelque chose de bon." },
  { language: "Italiano", message: "Sta arrivando qualcosa di buono." },
  { language: "Deutsch", message: "Etwas Gutes kommt gleich ins Glas." },
  { language: "Português", message: "Estamos servindo algo especial." },
] as const;

function getRandomMessageIndex() {
  return Math.floor(Math.random() * LOADER_MESSAGES.length);
}

export default function AppLoader({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const messageIndex = useMemo(getRandomMessageIndex, []);

  useEffect(() => {
    if (LOADER_BADGE_DURATION_MS === 0) return;

    try {
      if (sessionStorage.getItem(LOADER_SESSION_KEY) === "1") {
        return;
      }

      sessionStorage.setItem(LOADER_SESSION_KEY, "1");
    } catch {
      return;
    }

    setIsVisible(true);

    const hideTimer = window.setTimeout(() => {
      setIsLeaving(true);
    }, LOADER_BADGE_DURATION_MS);

    const unmountTimer = window.setTimeout(() => {
      setIsVisible(false);
      setIsLeaving(false);
    }, LOADER_BADGE_DURATION_MS + LOADER_FADE_OUT_MS);

    return () => {
      window.clearTimeout(hideTimer);
      window.clearTimeout(unmountTimer);
    };
  }, []);

  const activeMessage = LOADER_MESSAGES[messageIndex];

  return (
    <>
      {children}

      {isVisible ? (
        <div
          className={`pointer-events-none fixed inset-x-0 bottom-5 z-[99999] flex justify-center px-4 transition-all duration-200 ${
            isLeaving ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100"
          }`}
          aria-live="polite"
          role="status"
        >
          <div
            className="flex w-full max-w-sm items-center gap-4 rounded-[1.75rem] border px-4 py-3 shadow-2xl backdrop-blur-xl"
            style={{
              background: "color-mix(in srgb, var(--color-surface-card) 88%, transparent)",
              borderColor: "color-mix(in srgb, var(--color-border-light) 84%, transparent)",
              boxShadow:
                "0 24px 60px color-mix(in srgb, black 32%, transparent), inset 0 1px 0 color-mix(in srgb, white 12%, transparent)",
            }}
          >
            <span
              className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
              style={{
                background:
                  "radial-gradient(circle, color-mix(in srgb, var(--color-amber-primary) 24%, transparent) 0%, transparent 72%)",
              }}
            >
              <span
                className="absolute inset-0 animate-ping rounded-full"
                style={{
                  animationDuration: "1.6s",
                  border: "1px solid color-mix(in srgb, var(--color-amber-primary) 30%, transparent)",
                }}
              />
              <span
                className="block h-3.5 w-3.5 rounded-full"
                style={{
                  background: "var(--gradient-button-primary)",
                  boxShadow:
                    "0 0 18px color-mix(in srgb, var(--color-amber-primary) 66%, transparent)",
                }}
              />
            </span>

            <div className="min-w-0 flex-1">
              <p
                className="text-[0.7rem] font-black tracking-[0.28em] uppercase"
                style={{ color: "var(--color-text-muted)" }}
              >
                LUPULOS
              </p>
              <p
                className="mt-1 truncate text-sm font-semibold"
                style={{ color: "var(--color-text-primary)" }}
              >
                {activeMessage.message}
              </p>
            </div>

            <span
              className="hidden rounded-full px-2 py-1 text-[0.65rem] font-semibold tracking-[0.16em] uppercase sm:inline-flex"
              style={{
                background: "color-mix(in srgb, var(--color-amber-primary) 16%, transparent)",
                color: "var(--color-amber-primary)",
              }}
            >
              {activeMessage.language}
            </span>
          </div>
        </div>
      ) : null}
    </>
  );
}
