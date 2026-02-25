"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
  ExpandLess,
  ExpandMore,
  Home as HomeIcon,
  SportsBar as SportsBarIcon,
  LocationOn as LocationOnIcon,
  Forum as ForumIcon,
  Group as GroupIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { getImageUrl } from "@/lib/constants";
import ThemeSwitcher from "@/components/ThemeSwitcher";

/* ═══════════════════════════════════
   Config
   ═══════════════════════════════════ */

interface NavItem {
  text: string;
  href: string;
  icon: React.ReactElement;
}

interface Usuario {
  _id: string;
  username?: string;
  fotoPerfil?: string;
}

const parseStoredUser = (value: string | null): Usuario | null => {
  if (!value) return null;
  try {
    return JSON.parse(value) as Usuario;
  } catch {
    return null;
  }
};

const navItems: NavItem[] = [
  { text: "Inicio", href: "/", icon: <HomeIcon fontSize="small" /> },
  { text: "Cervezas", href: "/cervezas", icon: <SportsBarIcon fontSize="small" /> },
  { text: "Lugares", href: "/lugares", icon: <LocationOnIcon fontSize="small" /> },
  { text: "Comunidad", href: "/posts", icon: <ForumIcon fontSize="small" /> },
  { text: "Usuarios", href: "/usuarios", icon: <GroupIcon fontSize="small" /> },
];

/* ═══════════════════════════════════
   Component
   ═══════════════════════════════════ */

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [footerMenuOpen, setFooterMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const getInitial = (u: Usuario | null) => (u?.username?.[0] ?? "U").toUpperCase();

  useEffect(() => {
    const storedUser = parseStoredUser(localStorage.getItem("user"));
    if (storedUser) setUsuario(storedUser);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    setAnchorEl(null);
    router.push("/auth/login");
  };

  const getAvatarSrc = (foto?: string) => (foto ? getImageUrl(foto) : undefined);

  return (
    <>
      {/* ─── Navbar ─── */}
      <nav
        className="sticky top-0 z-50 w-full transition-all duration-300"
        style={{
          background: scrolled ? "var(--navbar-bg-scrolled)" : "var(--navbar-bg)",
          backdropFilter: "blur(16px) saturate(180%)",
          WebkitBackdropFilter: "blur(16px) saturate(180%)",
          borderBottom: scrolled
            ? `1px solid var(--navbar-border-scrolled)`
            : `1px solid var(--navbar-border)`,
          boxShadow: scrolled ? "var(--navbar-shadow)" : "none",
        }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-6">
          {/* Left: Hamburger + Logo */}
          <div className="flex items-center gap-3">
            {/* Hamburger — mobile & always available */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-white/60 transition-all hover:bg-white/5 hover:text-white lg:hidden"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
            >
              <Image
                src="/assets/logo.gif"
                alt="Lúpulos"
                width={32}
                height={32}
                className="rounded-lg"
                style={{
                  filter: "drop-shadow(0 0 6px var(--color-border-amber))",
                }}
              />
              <span className="text-text-primary text-sm font-bold tracking-tight">
                Lúpulos
                <span className="text-amber-primary/80 ml-1">App</span>
              </span>
            </Link>
          </div>

          {/* Center: Nav links (desktop) */}
          <div className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.text}
                  href={item.href}
                  prefetch
                  className={`relative flex items-center gap-2 rounded-lg px-3.5 py-2 text-[13px] font-medium transition-all duration-200 ${
                    isActive
                      ? "text-amber-primary"
                      : "text-text-muted hover:bg-text-ghost hover:text-text-secondary"
                  }`}
                >
                  <span className={isActive ? "text-amber-primary" : "text-text-subtle"}>
                    {item.icon}
                  </span>
                  {item.text}

                  {/* Active indicator — pill glow */}
                  {isActive && (
                    <span
                      className="absolute inset-0 rounded-lg"
                      style={{
                        background: "var(--color-border-subtle)",
                        boxShadow:
                          "inset 0 0 0 1px var(--color-border-amber), 0 0 12px var(--color-border-subtle)",
                      }}
                    />
                  )}

                  {/* Active dot */}
                  {isActive && (
                    <span
                      className="absolute -bottom-0.5 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent, var(--color-amber-primary), transparent)",
                        boxShadow: "var(--shadow-amber-glow)",
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right: Theme switcher + Avatar or Login */}
          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            {usuario ? (
              <>
                <Tooltip title={usuario.username ?? "Usuario"}>
                  <button
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
                      <AccountCircleIcon
                        sx={{ color: "var(--color-amber-primary)", fontSize: 20 }}
                      />
                    </ListItemIcon>
                    Mi perfil
                  </MenuItem>
                  <Divider sx={{ borderColor: "rgba(255,255,255,0.05)" }} />
                  <MenuItem
                    onClick={handleLogout}
                    sx={{
                      color: "rgba(255,255,255,0.5)",
                      fontSize: "0.85rem",
                      py: 1.2,
                      "&:hover": { backgroundColor: "rgba(239,68,68,0.06)", color: "#ef4444" },
                    }}
                  >
                    <ListItemIcon>
                      <LogoutIcon sx={{ color: "rgba(255,255,255,0.3)", fontSize: 20 }} />
                    </ListItemIcon>
                    Cerrar sesión
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Link
                href="/auth/login"
                prefetch
                className="hidden rounded-lg px-4 py-2 text-xs font-semibold transition-all hover:brightness-110 sm:inline-block"
                style={{
                  background: "var(--gradient-button-primary)",
                  color: "var(--color-text-dark)",
                  boxShadow: "var(--shadow-amber-glow)",
                }}
              >
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* ─── Drawer (mobile) ─── */}
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box
          sx={{
            width: 280,
            height: "100%",
            background: `linear-gradient(180deg, var(--color-surface-card) 0%, var(--color-surface-deepest) 100%)`,
            color: "var(--color-text-primary)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
          role="presentation"
        >
          {/* Top */}
          <Box>
            {/* Drawer header */}
            <Box sx={{ px: 3, py: 2.5, display: "flex", alignItems: "center", gap: 1.5 }}>
              <Image
                src="/assets/logo.gif"
                alt="Lúpulos"
                width={28}
                height={28}
                className="rounded-md"
              />
              <span className="text-text-primary text-sm font-bold">
                Lúpulos <span className="text-amber-primary/80">App</span>
              </span>
            </Box>
            <Divider sx={{ borderColor: "var(--color-border-subtle)" }} />

            <List sx={{ px: 1, pt: 1 }}>
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <ListItemButton
                    key={item.text}
                    component={Link}
                    href={item.href}
                    onClick={() => setDrawerOpen(false)}
                    sx={{
                      borderRadius: "10px",
                      mb: 0.3,
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
                        minWidth: 36,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontSize: "0.875rem",
                        fontWeight: isActive ? 600 : 400,
                      }}
                    />
                    {isActive && (
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          backgroundColor: "var(--color-amber-primary)",
                          boxShadow: "var(--shadow-amber-glow)",
                        }}
                      />
                    )}
                  </ListItemButton>
                );
              })}
            </List>
          </Box>

          {/* Bottom: User */}
          {usuario && (
            <Box>
              <Divider sx={{ borderColor: "var(--color-border-subtle)" }} />
              <List sx={{ px: 1, pb: 1 }}>
                <ListItemButton
                  onClick={() => setFooterMenuOpen(!footerMenuOpen)}
                  sx={{
                    borderRadius: "10px",
                    "&:hover": { backgroundColor: "rgba(255,255,255,0.03)" },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Avatar
                      src={getAvatarSrc(usuario.fotoPerfil)}
                      alt={usuario.username ?? "usuario"}
                      sx={{
                        width: 28,
                        height: 28,
                        border: "1.5px solid var(--color-border-amber)",
                        fontSize: "0.75rem",
                      }}
                    >
                      {getInitial(usuario)}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={usuario.username ?? "Usuario"}
                    primaryTypographyProps={{ fontSize: "0.85rem", color: "white" }}
                  />
                  {footerMenuOpen ? (
                    <ExpandLess sx={{ color: "rgba(255,255,255,0.3)", fontSize: 20 }} />
                  ) : (
                    <ExpandMore sx={{ color: "rgba(255,255,255,0.3)", fontSize: 20 }} />
                  )}
                </ListItemButton>

                <Collapse in={footerMenuOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    <ListItemButton
                      sx={{
                        pl: 4,
                        borderRadius: "10px",
                        "&:hover": { backgroundColor: "rgba(255,255,255,0.03)" },
                      }}
                      onClick={() => {
                        setDrawerOpen(false);
                        router.push("/auth/perfil");
                      }}
                    >
                      <ListItemIcon sx={{ color: "rgba(255,255,255,0.3)", minWidth: 36 }}>
                        <AccountCircleIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Mi perfil"
                        primaryTypographyProps={{
                          fontSize: "0.85rem",
                          color: "rgba(255,255,255,0.6)",
                        }}
                      />
                    </ListItemButton>
                    <ListItemButton
                      sx={{
                        pl: 4,
                        borderRadius: "10px",
                        "&:hover": { backgroundColor: "rgba(239,68,68,0.05)" },
                      }}
                      onClick={handleLogout}
                    >
                      <ListItemIcon sx={{ color: "rgba(255,255,255,0.3)", minWidth: 36 }}>
                        <LogoutIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Cerrar sesión"
                        primaryTypographyProps={{
                          fontSize: "0.85rem",
                          color: "rgba(255,255,255,0.4)",
                        }}
                      />
                    </ListItemButton>
                  </List>
                </Collapse>
              </List>
            </Box>
          )}
        </Box>
      </Drawer>
    </>
  );
}
