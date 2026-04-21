"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
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

  return (
    <>
      <nav
        className="sticky top-0 z-50 w-full transition-all duration-300"
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
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Abrir menú de navegación"
              className="flex h-10 w-10 items-center justify-center rounded-2xl border transition-all lg:hidden"
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

            <Link href="/" className="hidden items-center gap-2.5 lg:flex">
              <span className="text-text-primary text-base font-extrabold tracking-tight">
                Lúpulos
                <span className="text-amber-primary/80 ml-1">App</span>
              </span>
            </Link>

            <div className="flex min-w-0 items-center gap-3 lg:hidden">
              <Link
                href="/"
                aria-label="Ir al inicio"
                className="flex h-10 w-10 items-center justify-center rounded-2xl border text-base font-black"
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
              <div className="min-w-0">
                <p
                  className="truncate text-sm font-bold"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {activeNavItem.text}
                </p>
                <p className="truncate text-[11px]" style={{ color: "var(--color-text-muted)" }}>
                  {activeNavItem.description}
                </p>
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-1 lg:flex">
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
              <>
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
              </>
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

      <div className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] lg:hidden">
        <div
          className="mx-auto flex max-w-3xl items-stretch gap-1 rounded-[1.8rem] border p-1.5"
          style={{
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--navbar-bg-scrolled) 94%, transparent), color-mix(in srgb, var(--color-surface-card-alt) 92%, transparent))",
            borderColor: "color-mix(in srgb, var(--color-border-light) 76%, transparent)",
            boxShadow: "0 18px 48px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.14)",
            backdropFilter: "blur(22px) saturate(180%)",
            WebkitBackdropFilter: "blur(22px) saturate(180%)",
          }}
        >
          {navItems.map((item) => {
            const isActive = isRouteActive(pathname, item.href);

            return (
              <Link
                key={item.text}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className="relative flex min-w-0 flex-1 flex-col items-center gap-1 rounded-[1.35rem] px-1.5 py-2 text-center transition-all duration-200"
                style={{
                  color: isActive ? "var(--color-text-primary)" : "var(--color-text-muted)",
                }}
              >
                {isActive && (
                  <motion.span
                    layoutId="mobile-app-nav-pill"
                    className="absolute inset-0 rounded-[1.35rem]"
                    style={{
                      background:
                        "linear-gradient(180deg, color-mix(in srgb, var(--color-border-subtle) 100%, transparent), color-mix(in srgb, var(--color-border-subtle) 68%, transparent))",
                      boxShadow:
                        "inset 0 0 0 1px color-mix(in srgb, var(--color-border-amber) 76%, transparent), 0 0 18px rgba(251,191,36,0.14)",
                    }}
                    transition={{ type: "spring", stiffness: 360, damping: 32 }}
                  />
                )}

                <span
                  className="relative z-10 flex h-9 w-9 items-center justify-center rounded-2xl transition-all"
                  style={{
                    color: isActive ? "var(--color-amber-primary)" : "var(--color-text-secondary)",
                    background: isActive ? "rgba(251,191,36,0.10)" : "transparent",
                  }}
                >
                  {item.icon}
                </span>
                <span className="relative z-10 block w-full truncate text-[10px] font-semibold">
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
