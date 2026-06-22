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
  Home as HomeIcon,
  LocationOn as LocationOnIcon,
  Logout as LogoutIcon,
  MenuRounded as MenuRoundedIcon,
  SportsBar as SportsBarIcon,
  Favorite as FavoriteIcon,
  Chat as ChatIcon,
  MenuBook as MenuBookIcon,
} from "@mui/icons-material";
import { getImageUrl } from "@/lib/constants";
import NavbarSearch from "@/components/NavbarSearch";
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
    text: "La Guía",
    href: "/guia",
    description: "Descubre los estilos de cerveza.",
    icon: <MenuBookIcon fontSize="small" />,
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
    text: "Favoritos",
    href: "/favoritos",
    description: "Tus cervezas y lugares favoritos guardados.",
    icon: <FavoriteIcon fontSize="small" />,
  },
  {
    text: "Carrete",
    href: "/carrete",
    description: "Chatea con la comunidad, IA o B2B.",
    icon: <ChatIcon fontSize="small" />,
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
  const [quickMenuAnchor, setQuickMenuAnchor] = useState<null | HTMLElement>(null);
  const [isSidebarMenu, setIsSidebarMenu] = useState(false);
  const [footerMenuOpen, setFooterMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sidebar_collapsed");
    if (stored === "true") {
      setIsCollapsed(true);
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((v) => {
      const next = !v;
      localStorage.setItem("sidebar_collapsed", String(next));
      return next;
    });
  };

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
    const timer = setTimeout(() => {
      document.body.classList.add("sidebar-transition");
    }, 150);
    return () => {
      clearTimeout(timer);
      document.body.classList.remove("sidebar-transition");
    };
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

  const isPublicLanding = pathname === "/" && !user;
  const showSidebar = !pathname || (
    !(pathname.startsWith("/auth/") && pathname !== "/auth/perfil") &&
    !isPublicLanding
  );

  if (!showSidebar) {
    if (isPublicLanding) {
      return (
        <header
          className="sticky top-0 left-0 right-0 z-50 flex h-16 w-full items-center justify-between px-6 border-b border-[var(--color-border-subtle)] backdrop-blur-md"
          style={{
            background: scrolled ? "var(--navbar-bg-scrolled)" : "var(--navbar-bg)",
            borderColor: scrolled ? "var(--navbar-border-scrolled)" : "var(--navbar-border)",
            boxShadow: scrolled
              ? "var(--navbar-shadow)"
              : "0 8px 28px color-mix(in srgb, var(--color-amber-primary) 8%, transparent)",
            WebkitBackdropFilter: "blur(18px) saturate(190%)",
            backdropFilter: "blur(18px) saturate(190%)",
          }}
        >
          {/* Logo */}
          <Link href="/" aria-label="Ir al inicio" className="flex items-center">
            <span
              className="lupulos-logo-text relative text-[1.75rem] font-[900] tracking-[-0.05em]"
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
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden items-center gap-6 lg:flex">
            {navItems.map((item) => {
              const isActive = isRouteActive(pathname, item.href);
              return (
                <Link
                  key={item.text}
                  href={item.href}
                  className={`sidebar-cursive-text text-sm font-medium transition-colors hover:text-[var(--color-amber-primary)]`}
                  style={{
                    color: isActive ? "var(--color-amber-primary)" : "var(--color-text-secondary)",
                  }}
                >
                  {item.text}
                </Link>
              );
            })}
          </nav>

          {/* Right side: Theme + Social + Login */}
          <div className="flex items-center gap-3">
            {/* Theme Switcher */}
            <ThemeSwitcher />

            {/* Social Media Icons */}
            <div className="hidden items-center gap-2 md:flex">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="social-icon-neon group flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 hover:scale-[1.15]"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                className="social-icon-neon group flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 hover:scale-[1.15]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="social-icon-neon group flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 hover:scale-[1.15]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.51a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.05a8.27 8.27 0 0 0 4.76 1.51V7.12a4.83 4.83 0 0 1-1-.43z"/>
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="social-icon-neon group flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 hover:scale-[1.15]"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>

            {/* Divider */}
            <div
              className="hidden h-6 w-px md:block"
              style={{ background: "color-mix(in srgb, var(--color-border-light) 40%, transparent)" }}
            />

            {/* Action button */}
            <Link
              href="/auth/login"
              className="flex items-center justify-center px-4 py-2 rounded-full border text-xs font-bold transition-all hover:scale-[1.02]"
              style={{
                borderColor: "color-mix(in srgb, var(--color-border-amber) 54%, transparent)",
                background: "linear-gradient(135deg, var(--color-amber-primary) 0%, var(--color-amber-light) 50%, var(--color-amber-hover) 100%)",
                color: "var(--color-text-dark)",
                boxShadow: "var(--shadow-amber-glow)",
              }}
            >
              Iniciar sesión
            </Link>
          </div>
        </header>
      );
    }
    return null;
  }

  return (
    <>
      {/* ── Top utility bar (logged-in desktop only) ── */}
      <header
        className="lupulos-topbar fixed top-0 left-0 right-0 z-[60] hidden h-16 items-center border-b md:flex"
        style={{
          background: "var(--navbar-bg-scrolled)",
          backdropFilter: "blur(16px) saturate(180%)",
          WebkitBackdropFilter: "blur(16px) saturate(180%)",
          borderColor: "color-mix(in srgb, var(--color-border-light) 40%, transparent)",
        }}
      >
        {/* Content wrapper — centered to the FULL viewport so it lines up with page content */}
        <div className="w-full h-full px-4 lg:px-8 flex items-center justify-center">
          <div className="w-full max-w-[1140px] flex items-center justify-between gap-4 xl:grid xl:grid-cols-[minmax(0,1fr)_300px] xl:gap-10">

            {/* Search bar column — buscador premium con autocompletado IA + memoria */}
            <div className="flex-1 max-w-md xl:max-w-none flex items-center justify-start pl-6 xl:pl-0">
              <NavbarSearch />
            </div>

            {/* Right utilities column */}
            <div className="flex shrink-0 items-center justify-end gap-2 md:gap-3">
              {/* Notificaciones */}
              <button
                type="button"
                className="relative flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-white/6"
                aria-label="Notificaciones"
                style={{ color: "var(--color-text-secondary)" }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <span
                  className="absolute right-[6px] top-[6px] flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black"
                  style={{ background: "var(--color-amber-primary)", color: "var(--color-text-dark)" }}
                >3</span>
              </button>

              {/* Mensajes */}
              <Link
                href="/carrete"
                className="relative flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-white/6"
                aria-label="Mensajes"
                style={{ color: "var(--color-text-secondary)" }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <span
                  className="absolute right-[6px] top-[6px] flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black"
                  style={{ background: "var(--color-amber-primary)", color: "var(--color-text-dark)" }}
                >5</span>
              </Link>

              {/* Menú Rápido */}
              <button
                type="button"
                onClick={(e) => setQuickMenuAnchor(e.currentTarget)}
                className="relative flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-white/6"
                aria-label="Menú rápido"
                style={{ color: "var(--color-text-secondary)" }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1.5"/>
                  <rect x="14" y="3" width="7" height="7" rx="1.5"/>
                  <rect x="14" y="14" width="7" height="7" rx="1.5"/>
                  <rect x="3" y="14" width="7" height="7" rx="1.5"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <motion.aside
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={`lupulos-sidebar fixed top-16 left-0 z-50 hidden h-[calc(100vh-4rem)] w-[76px] flex-col items-center gap-1 border-r py-4 md:flex ${isCollapsed ? "is-collapsed" : ""} ${!isCollapsed ? "xl:w-[240px] xl:items-stretch xl:px-4" : ""}`}
        style={{
          background: "var(--navbar-bg-scrolled)",
          backdropFilter: "blur(16px) saturate(180%)",
          WebkitBackdropFilter: "blur(16px) saturate(180%)",
          borderColor: "color-mix(in srgb, var(--color-border-light) 60%, transparent)",
        }}
      >
        <div className={`mb-4 flex w-full shrink-0 items-center justify-center xl:mb-6 xl:px-1 ${isCollapsed ? "xl:justify-center gap-0" : "xl:justify-start gap-2"}`}>
          <button
            type="button"
            onClick={toggleCollapse}
            aria-label={isCollapsed ? "Expandir menú" : "Colapsar menú"}
            className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors xl:flex"
            style={{ color: "var(--color-text-secondary)" }}
          >
            <MenuRoundedIcon fontSize="medium" />
          </button>

          <Link
            href="/"
            aria-label="Ir al inicio"
            className={`group flex shrink-0 items-center ${isCollapsed ? "hidden" : ""}`}
          >
            <motion.div
              animate={{
                width: isCollapsed ? 0 : "auto",
                opacity: isCollapsed ? 0 : 1,
                marginLeft: isCollapsed ? 0 : 8
              }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden whitespace-nowrap flex items-center"
            >
              <motion.span
                className="lupulos-logo-text relative text-[1.75rem] font-[900] tracking-[-0.05em]"
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
            </motion.div>
          </Link>
        </div>

        {/* Spacer que empuja el nav hacia abajo */}
        <div className="hidden h-8 shrink-0 xl:block" />

        <nav className={`flex w-full flex-col items-center gap-1 ${!isCollapsed ? "xl:items-stretch" : "xl:items-center"}`}>
          {navItems.map((item) => {
            const isActive = isRouteActive(pathname, item.href);
            return (
              <Tooltip key={item.text} title={item.text} placement="right" disableHoverListener={false}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative flex h-12 w-12 items-center justify-center rounded-[1.1rem] transition-all duration-200 ${
                    !isCollapsed ? "xl:h-auto xl:w-full xl:justify-start xl:items-start xl:px-3 xl:py-2.5" : ""
                  }`}
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
                  <span className={`relative z-10 flex shrink-0 items-center justify-center ${!isCollapsed ? "xl:mt-[2px]" : ""}`}>{item.icon}</span>
                  <motion.div
                    animate={{
                      width: isCollapsed ? 0 : "auto",
                      opacity: isCollapsed ? 0 : 1,
                      marginLeft: isCollapsed ? 0 : 12,
                    }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    className="relative z-10 hidden flex-col min-w-0 xl:flex overflow-hidden max-h-[38px]"
                  >
                    <span className="sidebar-cursive-text text-[13.5px] font-bold leading-tight">{item.text}</span>
                    <span
                      className="text-[11px] font-normal leading-normal mt-0.5"
                      style={{
                        color: isActive
                          ? "color-mix(in srgb, var(--color-amber-primary) 55%, var(--color-text-muted))"
                          : "var(--color-text-muted)",
                      }}
                    >
                      {item.description}
                    </span>
                  </motion.div>
                </Link>
              </Tooltip>
            );
          })}
        </nav>

        <div className={`relative mt-auto flex w-full flex-1 flex-col items-end justify-end gap-2 ${!isCollapsed ? "xl:items-stretch" : "xl:items-center"}`}>
          <Tooltip title="Cambiar tema" placement="right">
            <button
              type="button"
              onClick={() => setSidebarThemeOpen((v) => !v)}
              aria-expanded={sidebarThemeOpen}
              className={`relative flex h-12 w-12 items-center justify-center rounded-[1.1rem] transition-all duration-200 ${
                !isCollapsed ? "xl:h-auto xl:w-full xl:justify-start xl:px-3 xl:py-2.5" : ""
              }`}
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
              <motion.span
                animate={{
                  width: isCollapsed ? 0 : "auto",
                  opacity: isCollapsed ? 0 : 1,
                  marginLeft: isCollapsed ? 0 : 12
                }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className={`relative z-10 flex-1 text-left text-[14px] font-semibold overflow-hidden whitespace-nowrap ${isCollapsed ? "hidden" : "hidden xl:inline"}`}
              >
                Tema
              </motion.span>
              <motion.svg
                animate={{
                  opacity: isCollapsed ? 0 : 1,
                  scale: isCollapsed ? 0 : 1
                }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                viewBox="0 0 24 24"
                className={`relative z-10 h-4 w-4 transition-transform ${isCollapsed ? "hidden" : "hidden xl:inline"}`}
                style={{ transform: sidebarThemeOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M6 9l6 6 6-6" />
              </motion.svg>
            </button>
          </Tooltip>

          <AnimatePresence>
            {sidebarThemeOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 420, damping: 28 }}
                className={`absolute z-50 mb-0 ml-2 w-56 rounded-2xl border p-2 ${
                  isCollapsed
                    ? "bottom-0 left-full"
                    : "bottom-full left-full xl:static xl:mb-1 xl:ml-0 xl:w-full"
                }`}
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

        {isAuthReady ? (
          user ? (
            <div className={`flex w-full flex-col items-center gap-2 ${!isCollapsed ? "xl:items-stretch" : "xl:items-center"}`}>
              <button
                type="button"
                onClick={(e) => {
                  setAnchorEl(e.currentTarget);
                  setIsSidebarMenu(true);
                }}
                className={`flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border text-left ${
                  !isCollapsed ? "xl:h-auto xl:w-full xl:justify-start xl:rounded-[1.1rem] xl:border-0 xl:px-2 xl:py-2" : ""
                }`}
                style={{
                  borderColor: "color-mix(in srgb, var(--color-border-amber) 54%, transparent)",
                  background: "transparent",
                  cursor: "pointer",
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
                    className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-extrabold xl:h-10 xl:w-10"
                    style={{
                      background: "var(--gradient-button-primary)",
                      color: "var(--color-text-dark)",
                    }}
                  >
                    {(user.nombre || "U").charAt(0).toUpperCase()}
                  </span>
                )}
                <motion.span
                  animate={{
                    width: isCollapsed ? 0 : "auto",
                    opacity: isCollapsed ? 0 : 1,
                    marginLeft: isCollapsed ? 0 : 12
                  }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  className={`hidden min-w-0 flex-1 truncate text-[13px] font-semibold xl:inline overflow-hidden whitespace-nowrap`}
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {user.nombre || "Tu perfil"}
                </motion.span>
              </button>
            </div>
          ) : (
            <div className={`flex w-full flex-col items-center gap-2 ${!isCollapsed ? "xl:items-stretch" : "xl:items-center"}`}>
              <Tooltip title="Iniciar sesión" placement="right">
                <Link
                  href="/auth/login"
                  className={`group relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border transition-all duration-200 ${
                    !isCollapsed ? "xl:h-auto xl:w-full xl:justify-start xl:rounded-[1.1rem] xl:border-0 xl:px-2.5 xl:py-2.5" : ""
                  }`}
                  style={{
                    borderColor: "color-mix(in srgb, var(--color-border-amber) 54%, transparent)",
                    background: "var(--gradient-button-primary)",
                    color: "var(--color-text-dark)",
                    boxShadow: "var(--shadow-amber-glow)",
                  }}
                >
                  <span className="relative z-10 flex shrink-0 items-center justify-center">
                    <AccountCircleIcon fontSize="medium" className="h-5 w-5" />
                  </span>
                  <motion.span
                    animate={{
                      width: isCollapsed ? 0 : "auto",
                      opacity: isCollapsed ? 0 : 1,
                      marginLeft: isCollapsed ? 0 : 12
                    }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    className={`hidden min-w-0 flex-1 truncate text-[13px] font-bold xl:inline overflow-hidden whitespace-nowrap`}
                  >
                    Iniciar sesión
                  </motion.span>
                  <span
                    className="absolute inset-0 -translate-x-full skew-x-12 transition-transform duration-500 group-hover:translate-x-full"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)",
                    }}
                  />
                </Link>
              </Tooltip>
            </div>
          )
        ) : (
          <div className={`flex w-full flex-col items-center gap-2 ${!isCollapsed ? "xl:items-stretch" : "xl:items-center"}`}>
            <div
              className={`h-11 w-11 rounded-full border border-dashed ${!isCollapsed ? "xl:h-10 xl:w-full xl:rounded-[1.1rem]" : ""}`}
              style={{ borderColor: "rgba(255,255,255,0.08)" }}
            />
          </div>
        )}
      </motion.aside>

      <nav
        className="sticky top-0 z-50 w-full transition-all duration-300 xl:hidden"
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
                  onClick={(e) => {
                    setAnchorEl(e.currentTarget);
                    setIsSidebarMenu(false);
                  }}
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

        <div className="mx-auto grid h-14 max-w-7xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-3.5 md:h-[3.75rem] md:px-4 xl:hidden">
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
              className="hidden h-9 w-9 items-center justify-center rounded-[1.1rem] border text-[15px] font-extrabold md:flex"
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
                className="hidden md:block truncate text-[10px] md:text-[11px]"
                style={{ color: "var(--color-text-muted)" }}
              >
                {activeNavItem.description}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-1.5 sm:gap-2">
            <ThemeSwitcher />

            {usuario ? (
              <Tooltip title={usuario.username ?? "Usuario"}>
                <button
                  type="button"
                  onClick={(e) => {
                    setAnchorEl(e.currentTarget);
                    setIsSidebarMenu(false);
                  }}
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

        {usuario ? (
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={
              isSidebarMenu
                ? { vertical: "top", horizontal: "right" }
                : { vertical: "bottom", horizontal: "right" }
            }
            transformOrigin={
              isSidebarMenu
                ? { vertical: "bottom", horizontal: "left" }
                : { vertical: "top", horizontal: "right" }
            }
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

        {/* Menú Rápido Dropdown */}
        <Menu
          anchorEl={quickMenuAnchor}
          open={Boolean(quickMenuAnchor)}
          onClose={() => setQuickMenuAnchor(null)}
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
                minWidth: 190,
              },
            },
          }}
        >
          <MenuItem
            onClick={() => {
              setQuickMenuAnchor(null);
              router.push("/cervezas/nueva");
            }}
            sx={{
              color: "var(--color-text-primary)",
              fontSize: "0.85rem",
              py: 1.2,
              "&:hover": { backgroundColor: "var(--color-border-subtle)" },
            }}
          >
            <ListItemIcon sx={{ fontSize: 18 }}>🍺</ListItemIcon>
            Agregar Cerveza
          </MenuItem>
          <MenuItem
            onClick={() => {
              setQuickMenuAnchor(null);
              router.push("/lugares/nueva");
            }}
            sx={{
              color: "var(--color-text-primary)",
              fontSize: "0.85rem",
              py: 1.2,
              "&:hover": { backgroundColor: "var(--color-border-subtle)" },
            }}
          >
            <ListItemIcon sx={{ fontSize: 18 }}>📍</ListItemIcon>
            Agregar Lugar
          </MenuItem>
        </Menu>
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

      <div 
        className="fixed z-50 md:hidden transition-all duration-300"
        style={{
          bottom: "calc(16px + env(safe-area-inset-bottom))",
          left: "50%",
          transform: "translateX(-50%)",
          width: "calc(100% - 32px)",
          maxWidth: "420px",
        }}
      >
        <div
          className="flex items-stretch border transition-all duration-300"
          style={{
            borderRadius: "32px",
            background: scrolled
              ? "color-mix(in srgb, var(--navbar-bg-scrolled) 92%, transparent)"
              : "color-mix(in srgb, var(--navbar-bg-scrolled) 78%, transparent)",
            borderColor: "color-mix(in srgb, var(--color-border-light) 40%, transparent)",
            boxShadow: "0 12px 35px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0,0,0,0.15)",
            backdropFilter: scrolled ? "blur(24px) saturate(200%)" : "blur(12px) saturate(140%)",
            WebkitBackdropFilter: scrolled ? "blur(24px) saturate(200%)" : "blur(12px) saturate(140%)",
          }}
        >
          {navItems.map((item) => {
            const isActive = isRouteActive(pathname, item.href);

            return (
              <Link
                key={item.text}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className="relative flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-3 text-center transition-all duration-200"
                style={{
                  color: isActive ? "var(--color-text-primary)" : "var(--color-text-muted)",
                }}
              >
                {isActive && (
                  <motion.span
                    layoutId="mobile-app-nav-pill"
                    className="absolute inset-x-4 top-1 h-0.5 rounded-full"
                    style={{ background: "var(--color-amber-primary)" }}
                    transition={{ type: "spring", stiffness: 360, damping: 32 }}
                  />
                )}

                <span
                  className="relative z-10 flex h-6 w-6 items-center justify-center transition-all"
                  style={{
                    color: isActive ? "var(--color-amber-primary)" : "var(--color-text-secondary)",
                  }}
                >
                  {item.icon}
                </span>
                <span className="relative z-10 block w-full truncate text-[9px] font-semibold">
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
