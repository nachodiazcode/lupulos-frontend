"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
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
  useTheme,
  useMediaQuery
} from "@mui/material";
import {
  ExpandLess,
  ExpandMore,
  Menu as MenuIcon,
  Home as HomeIcon,
  SportsBar as SportsBarIcon,
  LocationOn as LocationOnIcon,
  Forum as ForumIcon,
  Group as GroupIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";

interface NavItem {
  text: string;
  href: string;
  icon: React.ReactElement;
}

interface Usuario {
  _id: string;
  username: string;
  fotoPerfil?: string;
}

const navItems: NavItem[] = [
  { text: "Inicio", href: "/", icon: <HomeIcon /> },
  { text: "Cervezas", href: "/cervezas", icon: <SportsBarIcon /> },
  { text: "Lugares", href: "/lugares", icon: <LocationOnIcon /> },
  { text: "Comunidad", href: "/posts", icon: <ForumIcon /> },
  { text: "Usuarios", href: "/usuarios", icon: <GroupIcon /> },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://lupulos.app";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [footerMenuOpen, setFooterMenuOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUsuario(JSON.parse(storedUser));
    }
  }, []);

  const toggleDrawer = (state: boolean) => () => setOpen(state);
  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    handleMenuClose();
    router.push("/auth/login");
  };

  const getAvatarSrc = (fotoPerfil?: string) => {
    if (!fotoPerfil) return undefined;
    return fotoPerfil.startsWith("http") ? fotoPerfil : `${API_URL}${fotoPerfil}`;
  };

  return (
    <>
      <AppBar position="static" sx={{ background: "linear-gradient(to right, #5C3B1E, #8B5E3C)" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <IconButton edge="start" onClick={toggleDrawer(true)} sx={{ color: "white", mr: 2 }}>
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" sx={{ color: "white", flexGrow: 1 }}>
            Lúpulos App 🍻
          </Typography>

          {!isMobile && (
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <ListItemButton
                    key={item.text}
                    component={Link}
                    href={item.href}
                    sx={{
                      position: "relative",
                      color: isActive ? "#FFD700" : "white",
                      "&:hover": { color: "#FFD700" },
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        bottom: 4,
                        left: 10,
                        width: isActive ? "60%" : "0%",
                        height: "2px",
                        backgroundColor: "#FFD700",
                        transition: "width 0.3s ease-in-out",
                      },
                      "&:hover::after": { width: "60%" },
                    }}
                  >
                    <ListItemIcon sx={{ color: isActive ? "#FFD700" : "white", minWidth: 36 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                );
              })}

              {usuario && (
                <>
                  <Tooltip title={usuario.username}>
                    <IconButton onClick={handleAvatarClick}>
                      <Avatar
                        src={getAvatarSrc(usuario.fotoPerfil)}
                        alt={usuario.username}
                        sx={{ width: 36, height: 36, border: "2px solid #FFD700" }}
                      >
                        {usuario.username[0]?.toUpperCase()}
                      </Avatar>
                    </IconButton>
                  </Tooltip>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    transformOrigin={{ vertical: "top", horizontal: "right" }}
                  >
                    <MenuItem onClick={() => {
                      handleMenuClose();
                      router.push(`/auth/perfil`);
                    }}>
                      <ListItemIcon><AccountCircleIcon /></ListItemIcon>
                      Mi cuenta
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                      <ListItemIcon><LogoutIcon /></ListItemIcon>
                      Cerrar sesión
                    </MenuItem>
                  </Menu>
                </>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Drawer con fondo café oscuro */}
      <Drawer anchor="left" open={open} onClose={toggleDrawer(false)}>
        <Box
          sx={{
            width: 250,
            height: "100%",
            backgroundColor: "#2E1A10", // Café oscuro
            color: "white",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
          role="presentation"
        >
          <Box>
            <List>
              {navItems.map((item) => (
                <ListItemButton key={item.text} component={Link} href={item.href}>
                  <ListItemIcon sx={{ color: "white" }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              ))}
            </List>
          </Box>

          {usuario && (
            <Box>
              <Divider sx={{ borderColor: "#FFD700" }} />
              <List>
                <ListItemButton onClick={() => setFooterMenuOpen(!footerMenuOpen)}>
                  <ListItemIcon sx={{ color: "white" }}>
                    <Avatar
                      src={getAvatarSrc(usuario.fotoPerfil)}
                      alt={usuario.username}
                      sx={{ width: 28, height: 28 }}
                    />
                  </ListItemIcon>
                  <ListItemText primary={usuario.username} />
                  {footerMenuOpen ? <ExpandLess sx={{ color: "white" }} /> : <ExpandMore sx={{ color: "white" }} />}
                </ListItemButton>

                <Collapse in={footerMenuOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    <ListItemButton sx={{ pl: 4 }} onClick={() => router.push("/auth/perfil")}>
                      <ListItemIcon sx={{ color: "white" }}><AccountCircleIcon /></ListItemIcon>
                      <ListItemText primary="Mi cuenta" />
                    </ListItemButton>
                    <ListItemButton sx={{ pl: 4 }} onClick={handleLogout}>
                      <ListItemIcon sx={{ color: "white" }}><LogoutIcon /></ListItemIcon>
                      <ListItemText primary="Cerrar sesión" />
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
