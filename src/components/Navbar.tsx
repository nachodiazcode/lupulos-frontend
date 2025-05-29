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
  useTheme,
  useMediaQuery,
  Avatar,
  Tooltip,
  Menu,
  MenuItem,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import SportsBarIcon from "@mui/icons-material/SportsBar";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ForumIcon from "@mui/icons-material/Forum";
import GroupIcon from "@mui/icons-material/Group";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";

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
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3940";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
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

  return (
    <>
      <AppBar
        position="static"
        sx={{ background: "linear-gradient(to right, #5C3B1E, #8B5E3C)" }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          {isMobile ? (
            <>
              <IconButton edge="start" onClick={toggleDrawer(true)} sx={{ color: "white" }}>
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" sx={{ color: "white" }}>
                Lúpulos App 🍺
              </Typography>
            </>
          ) : (
            <>
              <Typography variant="h6" sx={{ color: "white", flexGrow: 1 }}>
                Lúpulos App 🍺
              </Typography>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                {[...navItems, { text: "Usuarios", href: "/usuarios", icon: <GroupIcon /> }].map(
                  (item) => {
                    const isActive = pathname === item.href;
                    return (
                      <ListItemButton
                        key={item.text}
                        component={Link}
                        href={item.href}
                        sx={{
                          position: "relative",
                          color: isActive ? "#FFD700" : "white",
                          transition: "color 0.3s ease-in-out",
                          "&:hover": {
                            color: "#FFD700",
                          },
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
                          "&:hover::after": {
                            width: "60%",
                          },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            color: isActive ? "#FFD700" : "white",
                            minWidth: 36,
                          }}
                        >
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText primary={item.text} />
                      </ListItemButton>
                    );
                  }
                )}
                {usuario && (
                  <>
                    <Tooltip title={usuario.username}>
                      <IconButton onClick={handleAvatarClick}>
                        <Avatar
                          src={
                            usuario.fotoPerfil
                              ? usuario.fotoPerfil.startsWith("http")
                                ? usuario.fotoPerfil
                                : `${API_URL}${usuario.fotoPerfil}`
                              : undefined
                          }
                          alt={usuario.username}
                          sx={{
                            width: 36,
                            height: 36,
                            border: "2px solid #FFD700",
                          }}
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
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* Drawer para mobile */}
      <Drawer anchor="left" open={open} onClose={toggleDrawer(false)}>
        <Box
          sx={{
            width: 250,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <Box>
            <List>
              {navItems.map((item) => (
                <ListItemButton key={item.text} component={Link} href={item.href}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              ))}
            </List>
            <Divider />
            <List>
              <ListItemButton component={Link} href="/usuarios">
                <ListItemIcon><GroupIcon /></ListItemIcon>
                <ListItemText primary="Usuarios" />
              </ListItemButton>
            </List>
          </Box>

          {/* Footer con usuario */}
          {usuario && (
            <Box
              sx={{
                p: 2,
                borderTop: "1px solid #ccc",
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Avatar
                src={
                  usuario.fotoPerfil
                    ? usuario.fotoPerfil.startsWith("http")
                      ? usuario.fotoPerfil
                      : `${API_URL}${usuario.fotoPerfil}`
                    : undefined
                }
                alt={usuario.username}
                sx={{ width: 40, height: 40 }}
              >
                {usuario.username[0]?.toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="body1" fontWeight="bold">
                  {usuario.username}
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                  <Typography
                    variant="body2"
                    sx={{ cursor: "pointer", color: "#fbbf24" }}
                    onClick={() => {
                      setOpen(false);
                      router.push("/auth/perfil");
                    }}
                  >
                    Mi cuenta
                  </Typography>
                  <Typography variant="body2">|</Typography>
                  <Typography
                    variant="body2"
                    sx={{ cursor: "pointer", color: "#f87171" }}
                    onClick={handleLogout}
                  >
                    Cerrar sesión
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Drawer>
    </>
  );
}
