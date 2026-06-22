"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import useAuth from "@/hooks/useAuth";
import { useBeerTheme, BEER_THEMES } from "@/theme/ThemeContext";

/* ── Accent-insensitive normalize ── */
const norm = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

interface Command {
  id: string;
  label: string;
  hint?: string;
  icon: string;
  group: string;
  keywords?: string;
  run: () => void;
}

/**
 * Command Palette (⌘K / Ctrl+K)
 * Lanzador global: navegación, cambio de tema, cuenta y búsqueda rápida.
 * Sin dependencias extra — teclado completo (↑ ↓ Enter Esc).
 */
export default function CommandPalette() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useBeerTheme();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }, []);

  const go = useCallback(
    (href: string) => {
      router.push(href);
      close();
    },
    [router, close],
  );

  /* ── Global shortcut: ⌘K / Ctrl+K ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape" && open) {
        close();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  /* ── Focus input + lock scroll when open ── */
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 40);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = prev;
    };
  }, [open]);

  /* ── Command catalog ── */
  const commands = useMemo<Command[]>(() => {
    const nav: Command[] = [
      { id: "home", label: "Inicio", hint: "Tu home cervecero", icon: "🏠", group: "Navegación", run: () => go("/") },
      { id: "beers", label: "Cervezas", hint: "Botellas y estilos", icon: "🍺", group: "Navegación", keywords: "chelas botellas estilos", run: () => go("/cervezas") },
      { id: "places", label: "Lugares", hint: "Pubs y taprooms", icon: "📍", group: "Navegación", keywords: "pubs bares mapa", run: () => go("/lugares") },
      { id: "community", label: "Comunidad", hint: "Posts de la comunidad", icon: "💬", group: "Navegación", keywords: "posts feed", run: () => go("/posts") },
      { id: "favs", label: "Favoritos", hint: "Tus guardados", icon: "❤️", group: "Navegación", keywords: "guardados likes", run: () => go("/favoritos") },
      { id: "chat", label: "Carrete", hint: "Chat y comunidad IA", icon: "🗨️", group: "Navegación", keywords: "chat mensajes ia", run: () => go("/carrete") },
    ];

    if (user) {
      nav.push({ id: "profile", label: "Mi perfil", hint: "Editá tu perfil", icon: "👤", group: "Navegación", keywords: "cuenta perfil", run: () => go("/auth/perfil") });
    }

    const themeCmds: Command[] = BEER_THEMES.map((t) => ({
      id: `theme-${t.id}`,
      label: `Tema: ${t.label}`,
      hint: theme === t.id ? "Activo" : "Cambiar apariencia",
      icon: t.icon,
      group: "Tema",
      keywords: "color apariencia modo",
      run: () => {
        setTheme(t.id);
        close();
      },
    }));

    const account: Command[] = user
      ? [{ id: "logout", label: "Cerrar sesión", hint: "Salir de tu cuenta", icon: "🚪", group: "Cuenta", keywords: "salir logout", run: () => { logout(); close(); } }]
      : [{ id: "login", label: "Iniciar sesión", hint: "Entrá a tu cuenta", icon: "🔑", group: "Cuenta", keywords: "entrar acceder", run: () => go("/auth/login") }];

    const dynamic: Command[] = query.trim()
      ? [{ id: "search-beers", label: `Buscar “${query.trim()}” en Cervezas`, hint: "Búsqueda", icon: "🔎", group: "Búsqueda", run: () => go(`/cervezas?q=${encodeURIComponent(query.trim())}`) }]
      : [];

    return [...dynamic, ...nav, ...themeCmds, ...account];
  }, [user, theme, query, go, setTheme, logout, close]);

  /* ── Filter ── */
  const filtered = useMemo(() => {
    const q = norm(query);
    if (!q) return commands;
    return commands.filter((c) => {
      if (c.id === "search-beers") return true;
      return norm(`${c.label} ${c.hint ?? ""} ${c.keywords ?? ""}`).includes(q);
    });
  }, [commands, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  /* ── Keyboard nav within list ── */
  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      filtered[activeIndex]?.run();
    }
  };

  /* ── Keep active item in view ── */
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  /* ── Group filtered for rendering, preserving flat index ── */
  let flatIndex = -1;
  const groups = filtered.reduce<Record<string, { cmd: Command; idx: number }[]>>((acc, cmd) => {
    flatIndex += 1;
    (acc[cmd.group] ??= []).push({ cmd, idx: flatIndex });
    return acc;
  }, {});

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[200] flex items-start justify-center px-4 pt-[12vh]"
          style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
          onClick={close}
        >
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={onListKey}
            className="w-full max-w-[600px] overflow-hidden rounded-[1.25rem] border"
            style={{
              background: "var(--color-surface-card, #16110a)",
              borderColor: "color-mix(in srgb, var(--color-border-amber) 40%, transparent)",
              boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
            }}
          >
            {/* Search input */}
            <div
              className="flex items-center gap-3 px-4 py-3.5 border-b"
              style={{ borderColor: "color-mix(in srgb, var(--color-border-light) 35%, transparent)" }}
            >
              <span className="text-lg opacity-70">🔍</span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscá o ejecutá una acción…"
                className="w-full bg-transparent text-[15px] outline-none placeholder:opacity-50"
                style={{ color: "var(--color-text-primary)" }}
              />
              <kbd
                className="hidden shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold sm:block"
                style={{
                  borderColor: "color-mix(in srgb, var(--color-border-light) 50%, transparent)",
                  color: "var(--color-text-muted)",
                }}
              >
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div ref={listRef} className="max-h-[52vh] overflow-y-auto px-2 py-2">
              {filtered.length === 0 ? (
                <div className="px-3 py-8 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
                  Sin resultados para “{query}”.
                </div>
              ) : (
                Object.entries(groups).map(([group, items]) => (
                  <div key={group} className="mb-1">
                    <p
                      className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.14em]"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {group}
                    </p>
                    {items.map(({ cmd, idx }) => {
                      const active = idx === activeIndex;
                      return (
                        <button
                          key={cmd.id}
                          data-idx={idx}
                          type="button"
                          onMouseEnter={() => setActiveIndex(idx)}
                          onClick={() => cmd.run()}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors"
                          style={{
                            background: active ? "color-mix(in srgb, var(--color-amber-primary) 16%, transparent)" : "transparent",
                          }}
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base"
                            style={{ background: "color-mix(in srgb, var(--color-amber-primary) 10%, transparent)" }}>
                            {cmd.icon}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[14px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
                              {cmd.label}
                            </span>
                            {cmd.hint && (
                              <span className="block truncate text-[12px]" style={{ color: "var(--color-text-muted)" }}>
                                {cmd.hint}
                              </span>
                            )}
                          </span>
                          {active && (
                            <kbd
                              className="hidden shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold sm:block"
                              style={{
                                borderColor: "color-mix(in srgb, var(--color-border-amber) 50%, transparent)",
                                color: "var(--color-amber-primary)",
                              }}
                            >
                              ↵
                            </kbd>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-between gap-3 border-t px-4 py-2 text-[11px]"
              style={{
                borderColor: "color-mix(in srgb, var(--color-border-light) 35%, transparent)",
                color: "var(--color-text-muted)",
              }}
            >
              <span className="flex items-center gap-1.5">
                <span className="font-bold" style={{ color: "var(--color-amber-primary)" }}>Lúpulos</span> Command
              </span>
              <span className="hidden items-center gap-3 sm:flex">
                <span>↑↓ navegar</span>
                <span>↵ abrir</span>
                <span>esc cerrar</span>
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
