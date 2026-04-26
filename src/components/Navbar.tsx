"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import {
  Drawer,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Tooltip,
  Menu,
  MenuItem,
  Collapse,
} from "@mui/material";
import {
  AccountCircle as AccountCircleIcon,
  ExpandLess,
  ExpandMore,
  Forum as ForumIcon,
  Group as GroupIcon,
  Home as HomeIcon,
  LocationOn as LocationOnIcon,
  Logout as LogoutIcon,
  MenuRounded as MenuRoundedIcon,
  SportsBar as SportsBarIcon,
} from "@mui/icons-material";
import { getImageUrl } from "@/lib/constants";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { useBeerTheme, BEER_THEMES } from "@/theme/ThemeContext";
import useAuth from "@/hooks/useAuth";

interface NavItem {
  text: string;
  href: string;
  description: string;
  icon: React.ReactElement;
}

interface Usuario {
  _id?: string;
  id?: string;
  username?: string;
  fotoPerfil?: string;
}

const navItems: NavItem[] = [
  {
    text: "Inicio",
    href: "/",
    description: "Tu home con el ruido cervecero más reciente.",
    icon: <HomeIcon fontSize="small" />,
  },
  {
    text: "Cervezas",
    href: "/cervezas",
    description: "Descubre botellas, estilos y hallazgos para guardar.",
    icon: <SportsBarIcon fontSize="small" />,
  },
  {
    text: "Lugares",
    href: "/lugares",
    description: "Encuentra pubs, taprooms y rutas para salir.",
    icon: <LocationOnIcon fontSize="small" />,
  },
  {
    text: "Comunidad",
    href: "/posts",
    description: "Mira, comenta y comparte lo que está subiendo.",
    icon: <ForumIcon fontSize="small" />,
  },
  {
    text: "Usuarios",
    href: "/usuarios",
    description: "Conecta con la gente detrás de cada pinta.",
    icon: <GroupIcon fontSize="small" />,
  },
];

function isRouteActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const { user, isAuthReady, logout } = useAuth();
  const { theme, setTheme } = useBeerTheme();
  const [sidebarThemeOpen, setSidebarThemeOpen] = useState(false);
  const activeBeerTheme = BEER_THEMES.find((t) => t.id === theme) ?? BEER_THEMES[0];
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [footerMenuOpen, setFooterMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const usuario = (user as Usuario | null) ?? null;

  const activeNavItem = useMemo(
    () => navItems.find((item) => isRouteActive(pathname, item.href)) ?? navItems[0],
    [pathname],
  );

  const getInitial = (u: Usuario | null) => (u?.username?.[0] ?? "U").toUpperCase();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
    setFooterMenuOpen(false);
    setAnchorEl(null);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    setAnchorEl(null);
    setDrawerOpen(false);
    router.push("/auth/login");
  };

  const getAvatarSrc = (foto?: string) => (foto ? getImageUrl(foto) : undefined);

  const showSidebar = Boolean(user);

  return (
    <>
      {showSidebar ? (
      <aside
        className="lupulos-sidebar fixed top-0 left-0 z-50 hidden h-screen w-[76px] flex-col items-center gap-1 border-r py-4 md:flex xl:w-[240px] xl:items-stretch xl:px-4"
        style={{
          background: "var(--navbar-bg-scrolled)",
          backdropFilter: "blur(16px) saturate(180%)",
          WebkitBackdropFilter: "blur(16px) saturate(180%)",
          borderColor: "color-mix(in srgb, var(--color-border-light) 60%, transparent)",
        }}
      >
        <div className="mb-4 flex w-full shrink-0 items-center justify-center gap-2 xl:mb-6 xl:justify-start xl:px-1">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Abrir menú"
            className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors xl:flex"
            style={{ color: "var(--color-text-secondary)" }}
          >
            <MenuRoundedIcon fontSize="medium" />
          </button>

        <Link
          href="/"
          aria-label="Ir al inicio"
          className="group flex shrink-0 items-center gap-2"
        >
          <motion.span
            className="lupulos-logo-text relative text-[1.25rem] font-black tracking-[-0.02em]"
            initial={{ backgroundPosition: "0% 50%" }}
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
            style={{
              backgroundImage:
                "linear-gradient(100deg, #b45309 0%, #f59e0b 30%, #fbbf24 50%, #d97706 75%, #92400e 100%)",
              backgroundSize: "220% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 1px 6px color-mix(in srgb, var(--color-amber-primary) 35%, transparent))",
            }}
          >
            Lúpulos
            <motion.span
              aria-hidden
              className="pointer-events-none absolute -top-1 -right-2 text-[0.6rem]"
              initial={{ opacity: 0, scale: 0, rotate: -20 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0.4, 1.1, 0.4],
                rotate: [-20, 15, 35],
              }}
              transition={{
                duration: 2.4,
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 4.5,
              }}
              style={{ color: "var(--color-amber-primary)" }}
            >
              ✦
            </motion.span>
          </motion.span>
        </Link>
        </div>

        <nav className="flex w-full flex-1 flex-col items-center gap-1 xl:items-stretch">
          {navItems.map((item) => {
            const isActive = isRouteActive(pathname, item.href);
            return (
              <Tooltip key={item.text} title={item.text} placement="right" disableHoverListener={false}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className="relative flex h-12 w-12 items-center justify-center rounded-[1.1rem] transition-all duration-200 xl:h-auto xl:w-full xl:justify-start xl:gap-3 xl:px-3 xl:py-2.5"
                  style={{
                    color: isActive ? "var(--color-amber-primary)" : "var(--color-text-secondary)",
                    background: isActive
                      ? "color-mix(in srgb, var(--color-amber-primary) 12%, transparent)"
                      : "transparent",
                  }}
                >
                  {isActive && (
                    <motion.span
                      layoutId="sidebar-active-pill"
                      className="absolute inset-0 rounded-[1.1rem]"
                      style={{
                        boxShadow:
                          "inset 0 0 0 1px color-mix(in srgb, var(--color-border-amber) 70%, transparent), 0 0 22px rgba(251,191,36,0.18)",
                      }}
                      transition={{ type: "spring", stiffness: 360, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center justify-center">{item.icon}</span>
                  <span className="relative z-10 hidden text-[14px] font-semibold xl:inline">{item.text}</span>
                </Link>
              </Tooltip>
            );
          })}
        </nav>

        <div className="relative mt-auto flex w-full flex-col items-center gap-2 xl:items-stretch">
          <Tooltip title="Cambiar tema" placement="right">
            <button
              type="button"
              onClick={() => setSidebarThemeOpen((v) => !v)}
              aria-expanded={sidebarThemeOpen}
              className="relative flex h-12 w-12 items-center justify-center rounded-[1.1rem] transition-all duration-200 xl:h-auto xl:w-full xl:justify-start xl:gap-3 xl:px-3 xl:py-2.5"
              style={{
                color: sidebarThemeOpen ? "var(--color-amber-primary)" : "var(--color-text-secondary)",
                background: sidebarThemeOpen
                  ? "color-mix(in srgb, var(--color-amber-primary) 12%, transparent)"
                  : "transparent",
                boxShadow: sidebarThemeOpen
                  ? "inset 0 0 0 1px color-mix(in srgb, var(--color-border-amber) 70%, transparent)"
                  : "none",
              }}
            >
              <span className="relative z-10 text-[20px] leading-none">{activeBeerTheme.icon}</span>
              <span className="relative z-10 hidden flex-1 text-left text-[14px] font-semibold xl:inline">Tema</span>
              <svg
                viewBox="0 0 24 24"
                className="relative z-10 hidden h-4 w-4 transition-transform xl:inline"
                style={{ transform: sidebarThemeOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          </Tooltip>

          <AnimatePresence>
            {sidebarThemeOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 420, damping: 28 }}
                className="absolute bottom-full left-full z-50 mb-0 ml-2 w-56 rounded-2xl border p-2 xl:static xl:mb-1 xl:ml-0 xl:w-full"
                style={{
                  background:
                    "linear-gradient(180deg, color-mix(in srgb, var(--color-surface-card) 96%, transparent), color-mix(in srgb, var(--color-surface-card-alt) 98%, transparent))",
                  borderColor: "color-mix(in srgb, var(--color-border-amber) 44%, transparent)",
                  boxShadow: "0 22px 48px -12px rgba(0,0,0,0.55)",
                  backdropFilter: "blur(20px) saturate(180%)",
                  WebkitBackdropFilter: "blur(20px) saturate(180%)",
                }}
              >
                <p
                  className="mb-2 px-2 text-[9px] font-bold tracking-[0.22em] uppercase"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Elige tu estilo
                </p>
                <div className="flex flex-col gap-1">
                  {BEER_THEMES.map((t, i) => {
                    const isActive = theme === t.id;
                    return (
                      <motion.button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setTheme(t.id);
                          setSidebarThemeOpen(false);
                        }}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-all"
                        style={{
                          background: isActive
                            ? "color-mix(in srgb, var(--color-amber-primary) 14%, transparent)"
                            : "transparent",
                          border: isActive
                            ? "1px solid color-mix(in srgb, var(--color-amber-primary) 32%, transparent)"
                            : "1px solid transparent",
                        }}
                      >
                        <span
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-[15px]"
                          style={{
                            background: isActive
                              ? "color-mix(in srgb, var(--color-amber-primary) 20%, transparent)"
                              : "color-mix(in srgb, var(--color-border-subtle) 60%, transparent)",
                          }}
                        >
                          {t.icon}
                        </span>
                        <span
                          className="flex-1 text-[12.5px] font-semibold"
                          style={{
                            color: isActive ? "var(--color-amber-primary)" : "var(--color-text-secondary)",
                          }}
                        >
                          {t.label}
                        </span>
                        {isActive && (
                          <motion.svg
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 22 }}
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="var(--color-amber-primary)"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M5 12l5 5L20 7" />
                          </motion.svg>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {user ? (
          <div className="flex w-full flex-col items-center gap-2 xl:items-stretch">
            <Link
              href="/auth/perfil"
              className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border xl:h-auto xl:w-full xl:justify-start xl:gap-3 xl:rounded-[1.1rem] xl:border-0 xl:px-2 xl:py-2"
              style={{
                borderColor: "color-mix(in srgb, var(--color-border-amber) 54%, transparent)",
              }}
            >
              {getAvatarSrc(user.fotoPerfil) ? (
                <Image
                  src={getAvatarSrc(user.fotoPerfil) as string}
                  alt={user.nombre || "Perfil"}
                  width={44}
                  height={44}
                  unoptimized
                  className="h-11 w-11 rounded-full object-cover xl:h-10 xl:w-10"
                />
              ) : (
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-black xl:h-10 xl:w-10"
                  style={{
                    background: "var(--gradient-button-primary)",
                    color: "var(--color-text-dark)",
                  }}
                >
                  {(user.nombre || "U").charAt(0).toUpperCase()}
                </span>
              )}
              <span className="hidden min-w-0 flex-1 truncate text-[13px] font-semibold xl:inline" style={{ color: "var(--color-text-primary)" }}>
                {user.nombre || "Tu perfil"}
              </span>
            </Link>
          </div>
        ) : null}
      </aside>
      ) : null}

      <nav
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${showSidebar ? "hidden" : "hidden md:block"}`}
        style={{
          paddingTop: "env(safe-area-inset-top)",
          background: scrolled ? "var(--navbar-bg-scrolled)" : "var(--navbar-bg)",
          backdropFilter: "blur(16px) saturate(180%)",
          WebkitBackdropFilter: "blur(16px) saturate(180%)",
          borderBottom: scrolled
            ? `1px solid var(--navbar-border-scrolled)`
            : `1px solid var(--navbar-border)`,
          boxShadow: scrolled ? "var(--navbar-shadow)" : "none",
        }}
      >
        <div className="mx-auto hidden h-16 max-w-7xl items-center justify-between gap-3 px-6 xl:flex">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/" className="hidden items-center gap-2.5 xl:flex">
              <span className="text-text-primary text-base font-extrabold tracking-tight">
                Lúpulos
                <span className="text-amber-primary/80 ml-1">App</span>
              </span>
            </Link>
          </div>

          <div className="hidden items-center gap-1 xl:flex">
            {navItems.map((item) => {
              const isActive = isRouteActive(pathname, item.href);

              return (
                <Link
                  key={item.text}
                  href={item.href}
                  prefetch
                  className={`group relative flex items-center gap-2 rounded-lg px-3.5 py-2 text-[13px] font-medium transition-all duration-200 ${
                    isActive ? "text-amber-primary" : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  <motion.span
                    className={
                      isActive
                        ? "text-amber-primary"
                        : "text-text-subtle group-hover:text-text-secondary transition-colors"
                    }
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 400, damping: 12 }}
                  >
                    {item.icon}
                  </motion.span>
                  <span className="relative z-10">{item.text}</span>

                  {isActive && (
                    <>
                      <motion.span
                        layoutId="navbar-active-pill"
                        className="absolute inset-0 rounded-lg"
                        style={{
                          background: "var(--color-border-subtle)",
                          boxShadow:
                            "inset 0 0 0 1px var(--color-border-amber), 0 0 12px var(--color-border-subtle)",
                        }}
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                      <motion.span
                        layoutId="navbar-active-dot"
                        className="absolute -bottom-0.5 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full"
                        style={{
                          background:
                            "linear-gradient(90deg, transparent, var(--color-amber-primary), transparent)",
                          boxShadow: "var(--shadow-amber-glow)",
                        }}
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    </>
                  )}

                  {!isActive && (
                    <span
                      className="absolute -bottom-0.5 left-1/2 h-0.5 w-0 -translate-x-1/2 rounded-full transition-all duration-300 group-hover:w-4"
                      style={{
                        background: "var(--color-text-ghost)",
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <ThemeSwitcher />

            {usuario ? (
              <Tooltip title={usuario.username ?? "Usuario"}>
                <button
                  type="button"
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  className="hover:ring-amber-primary/30 relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full transition-all hover:ring-2"
                  style={{
                    border: "2px solid var(--color-border-amber)",
                    boxShadow: "var(--shadow-amber-glow)",
                  }}
                >
                  {getAvatarSrc(usuario.fotoPerfil) ? (
                    <Image
                      src={getAvatarSrc(usuario.fotoPerfil)!}
                      alt={usuario.username ?? "usuario"}
                      width={40}
                      height={40}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-amber-primary text-xs font-bold">
                      {getInitial(usuario)}
                    </span>
                  )}
                </button>
              </Tooltip>
            ) : isAuthReady ? (
              <>
                <Link
                  href="/auth/login"
                  prefetch
                  className="group relative hidden overflow-hidden rounded-lg px-4 py-2 text-xs font-semibold transition-all hover:brightness-110 sm:inline-block"
                  style={{
                    background: "var(--gradient-button-primary)",
                    color: "var(--color-text-dark)",
                    boxShadow: "var(--shadow-amber-glow)",
                  }}
                >
                  <span className="relative z-10">Iniciar sesión</span>
                  <span
                    className="absolute inset-0 -translate-x-full skew-x-12 transition-transform duration-500 group-hover:translate-x-full"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                    }}
                  />
                </Link>

                <Link
                  href="/auth/login"
                  prefetch
                  aria-label="Iniciar sesión"
                  className="flex h-10 w-10 items-center justify-center rounded-full border sm:hidden"
                  style={{
                    borderColor: "var(--color-border-light)",
                    color: "var(--color-text-secondary)",
                    background: "rgba(255,255,255,0.04)",
                  }}
                >
                  <AccountCircleIcon fontSize="small" />
                </Link>
              </>
            ) : null}
          </div>
        </div>

        <div className="mx-auto hidden h-14 max-w-7xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-3.5 md:grid md:h-[3.75rem] md:px-4 xl:hidden">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Abrir menú de navegación"
              className="flex h-9 w-9 items-center justify-center rounded-[1.1rem] border transition-all md:hidden"
              style={{
                color: "var(--color-text-secondary)",
                borderColor: "color-mix(in srgb, var(--color-border-light) 72%, transparent)",
                background:
                  "linear-gradient(180deg, color-mix(in srgb, var(--color-surface-card) 92%, transparent), color-mix(in srgb, var(--color-surface-card-alt) 88%, transparent))",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
              }}
            >
              <MenuRoundedIcon fontSize="small" />
            </button>

            <Link
              href="/"
              aria-label="Ir al inicio"
              className="hidden h-9 w-9 items-center justify-center rounded-[1.1rem] border text-[15px] font-black md:flex"
              style={{
                borderColor: "color-mix(in srgb, var(--color-border-amber) 62%, transparent)",
                background:
                  "radial-gradient(circle at top, rgba(251,191,36,0.18), transparent 68%), color-mix(in srgb, var(--color-surface-card) 94%, transparent)",
                color: "var(--color-amber-primary)",
                boxShadow: "var(--shadow-amber-glow)",
              }}
            >
              L
            </Link>
          </div>

          <div className="min-w-0">
            <div className="mx-auto max-w-[17.5rem] text-center md:max-w-[24rem]">
              <p
                className="truncate text-[15px] font-bold md:text-[16px]"
                style={{ color: "var(--color-text-primary)" }}
              >
                {activeNavItem.text}
              </p>
              <p
                className="truncate text-[10px] md:text-[11px]"
                style={{ color: "var(--color-text-muted)" }}
              >
                {activeNavItem.description}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <div className="h-9 w-9 md:hidden" aria-hidden="true" />

            <div className="hidden items-center gap-2 md:flex">
              <div
                className="flex items-center gap-1 rounded-[1.2rem] border p-[4px]"
                style={{
                  background:
                    "linear-gradient(180deg, color-mix(in srgb, var(--navbar-bg-scrolled) 94%, transparent), color-mix(in srgb, var(--color-surface-card-alt) 92%, transparent))",
                  borderColor: "color-mix(in srgb, var(--color-border-light) 72%, transparent)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.14)",
                }}
              >
                {navItems.map((item) => {
                  const isActive = isRouteActive(pathname, item.href);

                  return (
                    <Tooltip key={item.text} title={item.text}>
                      <Link
                        href={item.href}
                        aria-current={isActive ? "page" : undefined}
                        className="relative flex h-9 w-9 items-center justify-center rounded-[0.95rem] transition-all duration-200"
                        style={{
                          color: isActive
                            ? "var(--color-amber-primary)"
                            : "var(--color-text-secondary)",
                        }}
                      >
                        {isActive ? (
                          <motion.span
                            layoutId="tablet-nav-active-pill"
                            className="absolute inset-0 rounded-[0.95rem]"
                            style={{
                              background:
                                "linear-gradient(180deg, color-mix(in srgb, var(--color-border-subtle) 100%, transparent), color-mix(in srgb, var(--color-border-subtle) 68%, transparent))",
                              boxShadow:
                                "inset 0 0 0 1px color-mix(in srgb, var(--color-border-amber) 76%, transparent), 0 0 18px rgba(251,191,36,0.14)",
                            }}
                            transition={{ type: "spring", stiffness: 360, damping: 32 }}
                          />
                        ) : null}

                        <span className="relative z-10 flex items-center justify-center">
                          {item.icon}
                        </span>
                      </Link>
                    </Tooltip>
                  );
                })}
              </div>

              <ThemeSwitcher />

              {usuario ? (
                <Tooltip title={usuario.username ?? "Usuario"}>
                  <button
                    type="button"
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    className="hover:ring-amber-primary/30 relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full transition-all hover:ring-2"
                    style={{
                      border: "2px solid var(--color-border-amber)",
                      boxShadow: "var(--shadow-amber-glow)",
                    }}
                  >
                    {getAvatarSrc(usuario.fotoPerfil) ? (
                      <Image
                        src={getAvatarSrc(usuario.fotoPerfil)!}
                        alt={usuario.username ?? "usuario"}
                        width={36}
                        height={36}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-amber-primary text-xs font-bold">
                        {getInitial(usuario)}
                      </span>
                    )}
                  </button>
                </Tooltip>
              ) : isAuthReady ? (
                <Link
                  href="/auth/login"
                  prefetch
                  aria-label="Iniciar sesión"
                  className="flex h-9 w-9 items-center justify-center rounded-full border"
                  style={{
                    borderColor: "var(--color-border-light)",
                    color: "var(--color-text-secondary)",
                    background: "rgba(255,255,255,0.04)",
                  }}
                >
                  <AccountCircleIcon fontSize="small" />
                </Link>
              ) : null}
            </div>
          </div>
        </div>

        {usuario ? (
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            slotProps={{
              paper: {
                sx: {
                  mt: 1,
                  backgroundColor: "var(--color-surface-card)",
                  border: "1px solid var(--color-border-amber)",
                  borderRadius: "12px",
                  boxShadow: "var(--shadow-elevated)",
                  minWidth: 180,
                },
              },
            }}
          >
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                router.push("/auth/perfil");
              }}
              sx={{
                color: "var(--color-text-primary)",
                fontSize: "0.85rem",
                py: 1.2,
                "&:hover": { backgroundColor: "var(--color-border-subtle)" },
              }}
            >
              <ListItemIcon>
                <AccountCircleIcon sx={{ color: "var(--color-amber-primary)", fontSize: 20 }} />
              </ListItemIcon>
              Mi perfil
            </MenuItem>
            <Divider sx={{ borderColor: "var(--color-border-subtle)" }} />
            <MenuItem
              onClick={handleLogout}
              sx={{
                color: "var(--color-text-muted)",
                fontSize: "0.85rem",
                py: 1.2,
                "&:hover": {
                  backgroundColor: "rgba(239,68,68,0.06)",
                  color: "#ef4444",
                },
              }}
            >
              <ListItemIcon>
                <LogoutIcon sx={{ color: "var(--color-text-subtle)", fontSize: 20 }} />
              </ListItemIcon>
              Cerrar sesión
            </MenuItem>
          </Menu>
        ) : null}
      </nav>

      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box
          sx={{
            width: { xs: "min(88vw, 340px)", sm: 360 },
            maxWidth: "100vw",
            height: "100%",
            background:
              "linear-gradient(180deg, var(--color-surface-card) 0%, var(--color-surface-deepest) 100%)",
            color: "var(--color-text-primary)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
          role="presentation"
        >
          <Box>
            <Box sx={{ px: 2.5, pt: 2.5, pb: 2 }}>
              <Box
                sx={{
                  borderRadius: "22px",
                  px: 2,
                  py: 2,
                  border:
                    "1px solid color-mix(in srgb, var(--color-border-amber) 62%, transparent)",
                  background:
                    "linear-gradient(180deg, color-mix(in srgb, var(--color-surface-card) 92%, transparent), color-mix(in srgb, var(--color-surface-card-alt) 88%, transparent))",
                  boxShadow: "var(--shadow-card)",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background:
                        "radial-gradient(circle at top, rgba(251,191,36,0.22), transparent 65%), rgba(255,255,255,0.04)",
                      border:
                        "1px solid color-mix(in srgb, var(--color-border-amber) 68%, transparent)",
                      color: "var(--color-amber-primary)",
                      fontWeight: 800,
                    }}
                  >
                    L
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Box
                      sx={{
                        fontSize: "0.95rem",
                        fontWeight: 800,
                        color: "var(--color-text-primary)",
                      }}
                    >
                      Lúpulos App
                    </Box>
                    <Box sx={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                      Navegación compacta para moverte como en app.
                    </Box>
                  </Box>
                </Box>

                <Box
                  sx={{
                    mt: 2,
                    borderRadius: "18px",
                    px: 1.75,
                    py: 1.5,
                    border: "1px solid var(--color-border-subtle)",
                    background: "rgba(255,255,255,0.03)",
                  }}
                >
                  <Box
                    sx={{
                      fontSize: "0.7rem",
                      fontWeight: 800,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "var(--color-amber-primary)",
                    }}
                  >
                    Ahora mismo
                  </Box>
                  <Box
                    sx={{
                      mt: 0.5,
                      fontSize: "1rem",
                      fontWeight: 800,
                      color: "var(--color-text-primary)",
                    }}
                  >
                    {activeNavItem.text}
                  </Box>
                  <Box
                    sx={{
                      mt: 0.5,
                      fontSize: "0.8rem",
                      lineHeight: 1.45,
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {activeNavItem.description}
                  </Box>
                </Box>

                <Box
                  sx={{
                    mt: 1.5,
                    display: { xs: "block", md: "none" },
                    borderRadius: "18px",
                    px: 1.5,
                    py: 1.35,
                    border: "1px solid var(--color-border-subtle)",
                    background: "rgba(255,255,255,0.03)",
                  }}
                >
                  <Box
                    sx={{
                      mb: 1,
                      fontSize: "0.68rem",
                      fontWeight: 800,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    Apariencia
                  </Box>
                  <ThemeSwitcher />
                </Box>
              </Box>
            </Box>

            <Divider sx={{ borderColor: "var(--color-border-subtle)" }} />

            <List sx={{ px: 1.25, py: 1.25 }}>
              {navItems.map((item) => {
                const isActive = isRouteActive(pathname, item.href);

                return (
                  <ListItemButton
                    key={item.text}
                    component={Link}
                    href={item.href}
                    onClick={() => setDrawerOpen(false)}
                    sx={{
                      borderRadius: "16px",
                      mb: 0.75,
                      alignItems: "flex-start",
                      color: isActive ? "var(--color-amber-primary)" : "var(--color-text-muted)",
                      backgroundColor: isActive ? "var(--color-border-subtle)" : "transparent",
                      "&:hover": {
                        backgroundColor: isActive
                          ? "var(--color-border-light)"
                          : "var(--color-border-subtle)",
                        color: isActive
                          ? "var(--color-amber-primary)"
                          : "var(--color-text-secondary)",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: isActive ? "var(--color-amber-primary)" : "var(--color-text-subtle)",
                        minWidth: 38,
                        mt: 0.2,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      secondary={item.description}
                      primaryTypographyProps={{
                        fontSize: "0.9rem",
                        fontWeight: isActive ? 700 : 500,
                      }}
                      secondaryTypographyProps={{
                        fontSize: "0.76rem",
                        lineHeight: 1.45,
                        sx: { mt: 0.35, color: "var(--color-text-muted)" },
                      }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Box>

          <Box>
            <Divider sx={{ borderColor: "var(--color-border-subtle)" }} />

            {usuario ? (
              <List sx={{ px: 1.25, py: 1.25 }}>
                <ListItemButton
                  onClick={() => setFooterMenuOpen((value) => !value)}
                  sx={{
                    borderRadius: "16px",
                    "&:hover": { backgroundColor: "var(--color-border-subtle)" },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 38 }}>
                    <Avatar
                      src={getAvatarSrc(usuario.fotoPerfil)}
                      alt={usuario.username ?? "usuario"}
                      sx={{
                        width: 30,
                        height: 30,
                        border: "1.5px solid var(--color-border-amber)",
                        fontSize: "0.78rem",
                      }}
                    >
                      {getInitial(usuario)}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={usuario.username ?? "Usuario"}
                    secondary="Perfil y sesión"
                    primaryTypographyProps={{
                      fontSize: "0.88rem",
                      color: "var(--color-text-primary)",
                      fontWeight: 700,
                    }}
                    secondaryTypographyProps={{
                      fontSize: "0.76rem",
                      color: "var(--color-text-muted)",
                    }}
                  />
                  {footerMenuOpen ? (
                    <ExpandLess sx={{ color: "var(--color-text-muted)", fontSize: 20 }} />
                  ) : (
                    <ExpandMore sx={{ color: "var(--color-text-muted)", fontSize: 20 }} />
                  )}
                </ListItemButton>

                <Collapse in={footerMenuOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    <ListItemButton
                      sx={{
                        pl: 4.25,
                        borderRadius: "14px",
                        "&:hover": { backgroundColor: "var(--color-border-subtle)" },
                      }}
                      onClick={() => {
                        setDrawerOpen(false);
                        router.push("/auth/perfil");
                      }}
                    >
                      <ListItemIcon sx={{ color: "var(--color-text-subtle)", minWidth: 36 }}>
                        <AccountCircleIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Mi perfil"
                        primaryTypographyProps={{
                          fontSize: "0.84rem",
                          color: "var(--color-text-secondary)",
                        }}
                      />
                    </ListItemButton>
                    <ListItemButton
                      sx={{
                        pl: 4.25,
                        borderRadius: "14px",
                        "&:hover": { backgroundColor: "rgba(239,68,68,0.06)" },
                      }}
                      onClick={handleLogout}
                    >
                      <ListItemIcon sx={{ color: "var(--color-text-subtle)", minWidth: 36 }}>
                        <LogoutIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Cerrar sesión"
                        primaryTypographyProps={{
                          fontSize: "0.84rem",
                          color: "var(--color-text-muted)",
                        }}
                      />
                    </ListItemButton>
                  </List>
                </Collapse>
              </List>
            ) : isAuthReady ? (
              <List sx={{ px: 1.25, py: 1.25 }}>
                <ListItemButton
                  component={Link}
                  href="/auth/login"
                  sx={{
                    borderRadius: "16px",
                    mb: 0.75,
                    background: "var(--gradient-button-primary)",
                    color: "var(--color-text-dark)",
                    boxShadow: "var(--shadow-amber-glow)",
                    "&:hover": { filter: "brightness(1.03)" },
                  }}
                >
                  <ListItemIcon sx={{ color: "var(--color-text-dark)", minWidth: 38 }}>
                    <AccountCircleIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Iniciar sesión"
                    secondary="Entra para publicar y reaccionar."
                    primaryTypographyProps={{ fontSize: "0.9rem", fontWeight: 800 }}
                    secondaryTypographyProps={{
                      fontSize: "0.76rem",
                      sx: { color: "rgba(28,24,20,0.72)" },
                    }}
                  />
                </ListItemButton>
                <ListItemButton
                  component={Link}
                  href="/auth/register"
                  sx={{
                    borderRadius: "16px",
                    border: "1px solid var(--color-border-light)",
                    color: "var(--color-text-secondary)",
                    "&:hover": { backgroundColor: "var(--color-border-subtle)" },
                  }}
                >
                  <ListItemText
                    primary="Crear cuenta"
                    secondary="Guarda tus hallazgos y súmate a la comunidad."
                    primaryTypographyProps={{ fontSize: "0.88rem", fontWeight: 700 }}
                    secondaryTypographyProps={{
                      fontSize: "0.76rem",
                      sx: { color: "var(--color-text-muted)" },
                    }}
                  />
                </ListItemButton>
              </List>
            ) : null}
          </Box>
        </Box>
      </Drawer>

      <div className="fixed inset-x-0 bottom-0 z-50 md:hidden">
        <div
          className="flex items-stretch border-t transition-all duration-300"
          style={{
            background: scrolled
              ? "color-mix(in srgb, var(--navbar-bg-scrolled) 82%, transparent)"
              : "color-mix(in srgb, var(--navbar-bg-scrolled) 55%, transparent)",
            borderColor: "color-mix(in srgb, var(--color-border-light) 60%, transparent)",
            backdropFilter: scrolled ? "blur(24px) saturate(200%)" : "blur(6px) saturate(140%)",
            WebkitBackdropFilter: scrolled ? "blur(24px) saturate(200%)" : "blur(6px) saturate(140%)",
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
        >
          {navItems.map((item) => {
            const isActive = isRouteActive(pathname, item.href);

            return (
              <Link
                key={item.text}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className="relative flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-2.5 text-center transition-all duration-200"
                style={{
                  color: isActive ? "var(--color-text-primary)" : "var(--color-text-muted)",
                }}
              >
                {isActive && (
                  <motion.span
                    layoutId="mobile-app-nav-pill"
                    className="absolute inset-x-2 top-1.5 h-0.5 rounded-full"
                    style={{ background: "var(--color-amber-primary)" }}
                    transition={{ type: "spring", stiffness: 360, damping: 32 }}
                  />
                )}

                <span
                  className="relative z-10 flex h-7 w-7 items-center justify-center transition-all"
                  style={{
                    color: isActive ? "var(--color-amber-primary)" : "var(--color-text-secondary)",
                  }}
                >
                  {item.icon}
                </span>
                <span className="relative z-10 block w-full truncate text-[9px] font-semibold md:text-[9.5px]">
                  {item.text}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
