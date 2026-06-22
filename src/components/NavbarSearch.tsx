"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";

type SuggestionType = "recent" | "beer" | "place" | "ai" | "tip";
type Suggestion = {
  type: SuggestionType;
  icon: string;
  label: string;
  sub?: string;
  href: string;
  /** término a guardar en historial (para recents y búsquedas de texto) */
  term?: string;
};

type BeerLite = { _id: string; name: string; brewery?: string; style?: string };
type PlaceLite = { _id: string; name: string; address?: { city?: string } };

const RECENTS_KEY = "lupulos_recent_searches";
const MAX_RECENTS = 6;

const DEFAULT_TIPS: Suggestion[] = [
  { type: "tip", icon: "🔥", label: "Mejores IPA", href: "/cervezas?q=IPA", term: "IPA" },
  { type: "tip", icon: "☀️", label: "Bares con terraza", href: "/lugares", term: "terraza" },
  { type: "tip", icon: "🚫🍺", label: "Cervezas sin alcohol", href: "/cervezas?q=sin%20alcohol", term: "sin alcohol" },
];

export default function NavbarSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [recents, setRecents] = useState<string[]>([]);
  const [beers, setBeers] = useState<BeerLite[]>([]);
  const [places, setPlaces] = useState<PlaceLite[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [active, setActive] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const r = JSON.parse(localStorage.getItem(RECENTS_KEY) || "[]");
      if (Array.isArray(r)) setRecents(r.filter((x) => typeof x === "string"));
    } catch {
      /* noop */
    }
  }, []);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const ensureData = async () => {
    if (loaded) return;
    setLoaded(true);
    try {
      const [b, p] = await Promise.all([api.get("/beer"), api.get("/location")]);
      setBeers(Array.isArray(b.data?.data) ? b.data.data : []);
      setPlaces(Array.isArray(p.data?.data) ? p.data.data : []);
    } catch {
      /* noop */
    }
  };

  const saveRecent = (q: string) => {
    const v = q.trim();
    if (!v) return;
    setRecents((prev) => {
      const next = [v, ...prev.filter((x) => x.toLowerCase() !== v.toLowerCase())].slice(0, MAX_RECENTS);
      try {
        localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
      } catch {
        /* noop */
      }
      return next;
    });
  };

  const clearRecents = () => {
    setRecents([]);
    try {
      localStorage.removeItem(RECENTS_KEY);
    } catch {
      /* noop */
    }
  };

  const q = query.trim().toLowerCase();

  const suggestions: Suggestion[] = useMemo(() => {
    if (!q) return [];
    const norm = (s?: string) => (s || "").toLowerCase();
    const out: Suggestion[] = [];

    beers
      .filter((b) => norm(b.name).includes(q) || norm(b.brewery).includes(q) || norm(b.style).includes(q))
      .slice(0, 4)
      .forEach((b) =>
        out.push({
          type: "beer",
          icon: "🍺",
          label: b.name,
          sub: [b.style, b.brewery].filter(Boolean).join(" · "),
          href: `/cervezas/${b._id}`,
        })
      );

    places
      .filter((p) => norm(p.name).includes(q) || norm(p.address?.city).includes(q))
      .slice(0, 3)
      .forEach((p) =>
        out.push({
          type: "place",
          icon: "📍",
          label: p.name,
          sub: p.address?.city,
          href: `/lugares?id=${p._id}`,
        })
      );

    // Sugerencia con IA (siempre al final)
    out.push({
      type: "ai",
      icon: "🤖",
      label: `Preguntar a la IA: “${query.trim()}”`,
      sub: "Maestro Cervecero",
      href: `/carrete?ai=${encodeURIComponent(query.trim())}`,
      term: query.trim(),
    });

    return out;
  }, [q, beers, places, query]);

  // Lista activa: sugerencias si escribes; recientes/tips si está vacío
  const items: Suggestion[] = useMemo(() => {
    if (q) return suggestions;
    const recentItems: Suggestion[] = recents.map((r) => ({
      type: "recent",
      icon: "🕘",
      label: r,
      href: `/cervezas?q=${encodeURIComponent(r)}`,
      term: r,
    }));
    return [...recentItems, ...DEFAULT_TIPS];
  }, [q, suggestions, recents]);

  useEffect(() => {
    setActive(-1);
  }, [query, open]);

  const select = (s: Suggestion) => {
    saveRecent(s.term || (s.type === "recent" || s.type === "tip" ? s.label : query));
    setOpen(false);
    router.push(s.href);
  };

  const runSearch = () => {
    const v = query.trim();
    if (!v) return;
    saveRecent(v);
    setOpen(false);
    router.push(`/cervezas?q=${encodeURIComponent(v)}`);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      if (active >= 0 && items[active]) select(items[active]);
      else runSearch();
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showAiHero = q.length > 0;

  return (
    <div ref={boxRef} className="relative w-full max-w-md xl:max-w-none">
      {/* ── Pill premium ── */}
      <div className="group relative flex h-10 w-full items-center gap-2.5 rounded-full px-4">
        {/* Borde neón animado */}
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 4, ease: "linear", repeat: Infinity }}
          style={{
            background:
              "linear-gradient(90deg, var(--color-amber-primary), var(--color-amber-light), var(--color-amber-hover), var(--color-amber-primary))",
            backgroundSize: "200% auto",
            padding: "1.5px",
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            opacity: open ? 1 : 0.85,
            boxShadow:
              "0 0 12px color-mix(in srgb, var(--color-amber-primary) 45%, transparent), inset 0 0 8px color-mix(in srgb, var(--color-amber-primary) 20%, transparent)",
          }}
        />
        <div
          className="absolute inset-[1.5px] rounded-full transition-colors duration-300 pointer-events-none"
          style={{ background: "color-mix(in srgb, var(--color-surface-card) 90%, transparent)" }}
        />
        <motion.div
          className="absolute inset-0 -z-10 rounded-full opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-60 group-focus-within:opacity-100 pointer-events-none"
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 4, ease: "linear", repeat: Infinity }}
          style={{
            background:
              "linear-gradient(90deg, var(--color-amber-primary), var(--color-amber-light), var(--color-amber-hover), var(--color-amber-primary))",
            backgroundSize: "200% auto",
          }}
        />

        <svg
          className="relative z-10 transition-colors duration-300 group-focus-within:text-[var(--color-amber-primary)]"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: "var(--color-text-muted)", flexShrink: 0 }}
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>

        <input
          type="text"
          value={query}
          placeholder="Buscar cervezas, lugares, personas…"
          className="relative z-10 w-full bg-transparent text-[13.5px] outline-none placeholder:transition-opacity placeholder:duration-300 focus:placeholder:opacity-40 placeholder:opacity-70"
          style={{ color: "var(--color-text-primary)" }}
          onFocus={() => {
            setOpen(true);
            void ensureData();
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            void ensureData();
          }}
          onKeyDown={onKeyDown}
        />

        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="relative z-10 text-[13px] transition-colors"
            style={{ color: "var(--color-text-muted)" }}
            aria-label="Limpiar"
          >
            ✕
          </button>
        )}

        {/* Badge IA */}
        <span
          className="relative z-10 hidden shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] sm:inline-flex"
          style={{
            color: "var(--color-amber-primary)",
            background: "color-mix(in srgb, var(--color-amber-primary) 12%, transparent)",
            border: "1px solid color-mix(in srgb, var(--color-border-amber) 35%, transparent)",
          }}
        >
          ✨ IA
        </span>
      </div>

      {/* ── Dropdown ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border"
            style={{
              background: "color-mix(in srgb, var(--color-surface-card) 97%, var(--color-surface-deepest) 3%)",
              borderColor: "color-mix(in srgb, var(--color-border-amber) 34%, var(--color-border-light))",
              backdropFilter: "blur(22px) saturate(1.2)",
              WebkitBackdropFilter: "blur(22px) saturate(1.2)",
              boxShadow:
                "inset 0 1px 0 color-mix(in srgb, white 14%, transparent), var(--shadow-elevated), 0 0 0 1px color-mix(in srgb, var(--color-amber-primary) 7%, transparent)",
            }}
          >
            {/* Header / contexto */}
            <div
              className="flex items-center justify-between px-4 py-2.5"
              style={{ borderBottom: "1px solid color-mix(in srgb, var(--color-border-amber) 24%, transparent)" }}
            >
              <span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--color-amber-primary)" }}>
                {q ? "Sugerencias" : recents.length ? "Búsquedas recientes" : "Sugeridos"}
              </span>
              {!q && recents.length > 0 && (
                <button
                  type="button"
                  onClick={clearRecents}
                  className="text-[10px] font-semibold transition-colors hover:text-[var(--color-amber-primary)]"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Limpiar
                </button>
              )}
            </div>

            <div className="max-h-[60vh] overflow-y-auto py-1.5">
              {items.length === 0 ? (
                <p className="px-4 py-6 text-center text-[12px]" style={{ color: "var(--color-text-muted)" }}>
                  Escribe para buscar cervezas, lugares o personas…
                </p>
              ) : (
                items.map((s, i) => (
                  <button
                    key={`${s.type}-${s.label}-${i}`}
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => select(s)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors"
                    style={{ background: active === i ? "color-mix(in srgb, var(--color-amber-primary) 10%, transparent)" : "transparent" }}
                  >
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-base"
                      style={{
                        background: s.type === "ai" ? "color-mix(in srgb, var(--color-amber-primary) 14%, transparent)" : "rgba(255,255,255,0.04)",
                        border: "1px solid color-mix(in srgb, var(--color-border-light) 60%, transparent)",
                      }}
                    >
                      {s.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className="block truncate text-[13px] font-bold"
                        style={{ color: s.type === "ai" ? "var(--color-amber-primary)" : "var(--color-text-primary)" }}
                      >
                        {s.label}
                      </span>
                      {s.sub && (
                        <span className="block truncate text-[11px]" style={{ color: "var(--color-text-muted)" }}>
                          {s.sub}
                        </span>
                      )}
                    </span>
                    {s.type === "recent" && <span className="shrink-0 text-[11px]" style={{ color: "var(--color-text-muted)" }}>↗</span>}
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-between px-4 py-2"
              style={{ borderTop: "1px solid color-mix(in srgb, var(--color-border-light) 40%, transparent)" }}
            >
              <span className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>
                <kbd className="rounded px-1 font-sans" style={{ background: "rgba(255,255,255,0.06)" }}>↑↓</kbd> navegar ·{" "}
                <kbd className="rounded px-1 font-sans" style={{ background: "rgba(255,255,255,0.06)" }}>Enter</kbd> abrir
              </span>
              {showAiHero && (
                <button
                  type="button"
                  onClick={() => select({ type: "ai", icon: "🤖", label: query, href: `/carrete?ai=${encodeURIComponent(query.trim())}`, term: query.trim() })}
                  className="text-[10.5px] font-bold transition-colors hover:brightness-110"
                  style={{ color: "var(--color-amber-primary)" }}
                >
                  ✨ Resolver con IA
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
